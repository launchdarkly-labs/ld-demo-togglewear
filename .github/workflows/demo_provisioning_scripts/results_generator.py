"""Synthetic demo traffic for ToggleWear's guarded releases.

ToggleWear has no backend, and a guarded release is a story about a service
degrading, so the metric data is generated here rather than produced by the
storefront.  This is how core-demo does it too: a server-side SDK client
invents shopper contexts, evaluates the flag for each one, and tracks the
metric events the release guardian watches.

Two scenarios, one per flag:

    04 Live Inventory Service  -> the new service is simply better, so the
                                  rollout advances to 100% untouched.
    05 Order Pipeline v2       -> the new pipeline degrades, slowly at first
                                  and then sharply, until LaunchDarkly detects
                                  the regression and rolls the flag back.

Both loops poll the flag and exit once its measured rollout is over, whether
that happened by completing or by being rolled back.

The ToggleBank, Investment, Galaxy Marketplace and public-sector generators
that used to live here were removed with the rest of those resources; they
are in git history and in ld-core-demo.  Experiment and AI Config generators
come back with the capabilities that need them.
"""

import logging
import math
import os
import random
import threading
import time
import uuid

import ldclient
import requests
from dotenv import load_dotenv
from ldclient.config import Config
from ldclient.context import Context

load_dotenv()

LD_API_KEY = os.getenv("LD_API_KEY")
PROJECT_KEY = os.getenv("LD_PROJECT_KEY")
LD_API_URL = os.getenv("LD_API_URL", "https://app.launchdarkly.com/api/v2")
DEMO_NAMESPACE = os.getenv("DEMO_NAMESPACE")
ENVIRONMENT_KEY = "production"

HEADERS = {
    "Authorization": LD_API_KEY,
    "Content-Type": "application/json",
}

# 04 — Live Inventory Service, the healthy scenario
INVENTORY_FLAG_KEY = "inventoryServiceV2"
INVENTORY_SUCCESS_KEY = "inventory-lookup-success"
INVENTORY_LATENCY_KEY = "inventory-lookup-latency"
INVENTORY_ERRORS_KEY = "inventory-lookup-errors"
INVENTORY_SERVED_KEY = "inventory-lookups-served"

# 05 — Order Pipeline v2, the failing scenario
ORDER_FLAG_KEY = "orderPipelineV2"
ORDER_SUCCESS_KEY = "order-pipeline-success-rate"
ORDER_LATENCY_KEY = "order-pipeline-latency"
ORDER_ERROR_KEY = "order-pipeline-error-rate"
ORDERS_PROCESSED_KEY = "orders-processed"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
# The SDK's event sender keeps a small connection pool to
# events.launchdarkly.com; concurrent flushes from the generator threads
# make urllib3 discard and reopen connections, which is harmless churn but
# floods the log with "Connection pool is full" warnings.
logging.getLogger("urllib3.connectionpool").setLevel(logging.ERROR)


# ---------------------------------------------------------------- helpers

def _get_json(url, retries=3):
    for attempt in range(retries):
        try:
            res = requests.get(url, headers=HEADERS, timeout=10)
            if res.status_code == 200:
                return res.json()
            logging.warning(f"GET {url} returned {res.status_code}")
        except requests.RequestException as e:
            logging.warning(f"GET {url} failed ({attempt + 1}/{retries}): {e}")
        time.sleep(1)
    return None


def get_all_flags_by_tag(tag):
    data = _get_json(f"{LD_API_URL}/flags/{PROJECT_KEY}?tag={tag}")
    if not data:
        return []
    return [item["key"] for item in data.get("items", [])]


def get_flag_details(flag_key):
    return _get_json(f"{LD_API_URL}/flags/{PROJECT_KEY}/{flag_key}")


def is_measured_rollout(flag_details):
    """True while the flag still has a rollout on its default rule.

    This is how both generators know when to stop. A guarded release that
    completes, and one that gets rolled back, both end up without a
    fallthrough rollout — so either way the loop exits.
    """
    try:
        env = flag_details["environments"][ENVIRONMENT_KEY]
        return env.get("fallthrough", {}).get("rollout") is not None
    except Exception as e:
        logging.error(f"Error checking measured rollout: {e}")
        return False


def generate_shopper_context():
    """A plausible ToggleWear shopper.

    role carries the same lowercase values as ShopperRole in lib/shopper.ts so
    these contexts match the Developers and Beta Testers segments, weighted so
    the overwhelming majority are ordinary shoppers.
    """
    key = f"shopper-{uuid.uuid4()}"
    builder = Context.builder(key)
    builder.set("role", random.choices(
        ["shopper", "beta", "developer"], weights=[94, 5, 1])[0])
    builder.set("loyaltyTier", random.choices(["none", "gold"], weights=[80, 20])[0])
    builder.set("device", random.choices(
        ["Mobile", "Desktop", "Tablet"], weights=[58, 36, 6])[0])
    builder.set("location", random.choice([
        "America/New_York", "America/Chicago", "America/Los_Angeles",
        "Europe/London", "Europe/Berlin",
    ]))
    builder.set("referrer", random.choice(
        ["google", "direct", "social", "email", "partner"]))
    return builder.build()


def evaluate_flags_by_tag(client, tag, evaluations=500):
    """Put evaluation traffic through every flag carrying a tag.

    Without this the flag list shows zero evaluations and looks untouched,
    which undersells a demo project more than it sounds like it would.
    """
    flag_keys = get_all_flags_by_tag(tag)
    if not flag_keys:
        logging.warning(f"No flags found with tag '{tag}' to evaluate.")
        return

    logging.info(f"Evaluating {len(flag_keys)} '{tag}' flag(s)...")
    for flag_key in flag_keys:
        for _ in range(evaluations):
            try:
                client.variation(flag_key, generate_shopper_context(), False)
            except Exception as e:
                logging.error(f"Error evaluating {flag_key}: {e}")
                break
    client.flush()
    logging.info("Flag evaluation complete.")


def _wait_for_rollout(flag_key, label, max_retries=6):
    """Block until the flag's rollout is live.

    create_flag and the rollout patch land moments before this runs, and the
    rollout takes a beat to become visible on the API. Tracking events before
    then are attributed to no release at all and quietly do nothing.
    """
    logging.info(f"Waiting for the {label} rollout to be ready...")
    for attempt in range(1, max_retries + 1):
        time.sleep(5)
        details = get_flag_details(flag_key)
        if details and is_measured_rollout(details):
            logging.info(f"{label} rollout is ready.")
            return True
        logging.info(f"  not ready yet ({attempt}/{max_retries})")
    logging.error(f"{label} rollout never became ready. Giving up.")
    return False


# ------------------------------------------------- 04 healthy scenario

def inventory_service_healthy_generator(client, stop_event):
    """Live inventory beats nightly snapshots on every monitored metric.

    Nothing clever here on purpose — the treatment is given better numbers
    than the control and the release guardian finds no regression, so the
    rollout walks its full ramp and reaches 100% in about ten minutes.
    """
    if not client.is_initialized():
        logging.error("LaunchDarkly client is not initialized.")
        return

    if not _wait_for_rollout(INVENTORY_FLAG_KEY, "Live Inventory Service"):
        return

    logging.info("Live Inventory Service generator running.")
    status_check_counter = 0

    while True:
        # Polling every iteration would mean an API call per event, so the
        # check is amortised over a few hundred of them.
        if status_check_counter >= 100:
            details = get_flag_details(INVENTORY_FLAG_KEY)
            if not details or not is_measured_rollout(details):
                logging.info("Live Inventory Service rollout finished.")
                stop_event.set()
                break
            status_check_counter = 0

        try:
            ctx = generate_shopper_context()
            on_new_service = client.variation(INVENTORY_FLAG_KEY, ctx, False)

            if on_new_service:
                if random.random() < 0.04:
                    client.track(INVENTORY_ERRORS_KEY, ctx)
                if random.random() < 0.94:
                    client.track(INVENTORY_SUCCESS_KEY, ctx)
                client.track(INVENTORY_LATENCY_KEY, ctx, None, random.randint(40, 130))
            else:
                if random.random() < 0.14:
                    client.track(INVENTORY_ERRORS_KEY, ctx)
                if random.random() < 0.83:
                    client.track(INVENTORY_SUCCESS_KEY, ctx)
                client.track(INVENTORY_LATENCY_KEY, ctx, None, random.randint(210, 420))

            client.track(INVENTORY_SERVED_KEY, ctx, None, 1)

            status_check_counter += 1
            time.sleep(0.03)
        except Exception as e:
            logging.error(f"Error generating inventory metrics: {e}")
            continue

    logging.info("Live Inventory Service generator finished.")


# -------------------------------------------------- 05 failed scenario

def order_pipeline_failed_generator(client, stop_event):
    """Order Pipeline v2 degrades until LaunchDarkly rolls it back.

    The shape of the data matters as much as the direction of it. Three things
    are layered on top of each other so the chart reads as a real service
    rather than a step function:

      * a drifting random walk, so consecutive buckets are related
      * three sine waves at different periods, which gives organic wobble
        without any single visible rhythm
      * per-event gaussian noise

    Two phases. For the first nine minutes the regression is real but mild —
    enough to be visible, not enough to be conclusive. Then it turns sharply
    over the following four, which is what takes the error rate past the point
    the guardian will tolerate.

    Success and error rates are tracked as 100 or 0 against numeric metrics
    rather than as conversions, so each chart bucket averages to a smooth mean.
    core-demo found that as conversion metrics the same data drew a flat
    stepped chart and the rollback never looked convincing.
    """
    if not client.is_initialized():
        logging.error("LaunchDarkly client is not initialized.")
        return

    if not _wait_for_rollout(ORDER_FLAG_KEY, "Order Pipeline v2"):
        return

    logging.info("Order Pipeline v2 generator running.")

    SUSTAIN_END = 540.0       # mild regression for the first nine minutes
    CATASTROPHE_END = 780.0   # then four minutes of collapse

    status_check_counter = 0
    iteration = 0
    start_time = time.time()

    walk_test_lat = 0.0
    walk_ctrl_lat = 0.0
    walk_test_err = 0.0
    walk_test_suc = 0.0

    while True:
        if status_check_counter >= 80:
            details = get_flag_details(ORDER_FLAG_KEY)
            if not details or not is_measured_rollout(details):
                logging.info("Order Pipeline v2 rollout is over — rolled back or completed.")
                stop_event.set()
                break
            status_check_counter = 0

        try:
            ctx = generate_shopper_context()
            on_v2 = client.variation(ORDER_FLAG_KEY, ctx, False)
            elapsed = time.time() - start_time

            walk_test_lat = max(-15, min(15, walk_test_lat + random.uniform(-3, 3)))
            walk_ctrl_lat = max(-12, min(12, walk_ctrl_lat + random.uniform(-3, 3)))
            walk_test_err = max(-3, min(3, walk_test_err + random.uniform(-0.8, 0.8)))
            walk_test_suc = max(-3, min(3, walk_test_suc + random.uniform(-0.8, 0.8)))

            if on_v2:
                osc_lat = (10 * math.sin(elapsed / 45)
                           + 7 * math.sin(elapsed / 19)
                           + 4 * math.sin(elapsed / 8))
                osc_err = (2.0 * math.sin(elapsed / 40)
                           + 1.5 * math.sin(elapsed / 17)
                           + 1.0 * math.sin(elapsed / 7))
                osc_suc = (2.0 * math.sin(elapsed / 36)
                           + 1.5 * math.sin(elapsed / 15)
                           + 1.0 * math.sin(elapsed / 6))

                if elapsed < SUSTAIN_END:
                    progress = elapsed / SUSTAIN_END

                    error_pct = 11 + (5 * progress) + osc_err + walk_test_err + random.uniform(-1.2, 1.2)
                    error_pct = max(6, min(22, error_pct))

                    success_pct = 84 - (5 * progress) + osc_suc + walk_test_suc + random.uniform(-1.2, 1.2)
                    success_pct = max(74, min(90, success_pct))

                    latency = int(random.gauss(148 + (25 * progress) + osc_lat + walk_test_lat, 26))
                    latency = max(90, min(280, latency))
                else:
                    # Ease-in rather than linear, so the collapse accelerates.
                    cat_progress = min((elapsed - SUSTAIN_END) / (CATASTROPHE_END - SUSTAIN_END), 1.0)
                    curve = 1.0 - ((1.0 - cat_progress) ** 2.2)

                    error_pct = 18 + (48 * curve) + 2 * math.sin(elapsed / 20) + random.uniform(-1.5, 1.5)
                    error_pct = max(16, min(80, error_pct))

                    success_pct = 78 - (48 * curve) + 1.5 * math.sin(elapsed / 22) + random.uniform(-1.5, 1.5)
                    success_pct = max(18, min(82, success_pct))

                    latency = int(random.gauss(
                        175 + (340 * curve) + osc_lat * 0.5 + walk_test_lat, 40 + 30 * curve))
                    latency = max(120, min(750, latency))

                error_val = 100 if random.random() * 100 < error_pct else 0
                success_val = 100 if random.random() * 100 < success_pct else 0

                client.track(ORDER_ERROR_KEY, ctx, None, error_val)
                client.track(ORDER_SUCCESS_KEY, ctx, None, success_val)
                client.track(ORDER_LATENCY_KEY, ctx, None, latency)
                client.track(ORDERS_PROCESSED_KEY, ctx, None, 1)

                # Also surfaces the failure as a frontend error, which is what
                # the Observability SDK would emit for real. Harmless until
                # those packages land, and the data is waiting when they do.
                if error_val == 100:
                    failures = [
                        ("OrderPipelineTimeout", "Order pipeline timed out after 30 seconds"),
                        ("StockReservationError", "Could not reserve stock for one or more line items"),
                        ("AddressValidationError", "Shipping address failed validation"),
                        ("PaymentAuthorisationError", "Payment authorisation returned 500"),
                        ("OrderPersistenceError", "Order write failed: connection pool exhausted"),
                    ]
                    kind, message = random.choice(failures)
                    client.track("$ld:telemetry:error", ctx, {
                        "error.kind": kind,
                        "error.message": message,
                        "service.name": "order-pipeline-v2",
                        "component": "OrderPipeline",
                        "order.id": f"order-{iteration}",
                        "user.id": ctx.key,
                        "flag.key": ORDER_FLAG_KEY,
                        "severity": "high",
                    }, 1)
            else:
                osc = (10 * math.sin(elapsed / 50)
                       + 6 * math.sin(elapsed / 22)
                       + 3 * math.sin(elapsed / 10))

                ctrl_latency = int(random.gauss(110 + osc + walk_ctrl_lat, 25))
                ctrl_latency = max(55, min(200, ctrl_latency))

                ctrl_error_pct = 4 + 1.5 * math.sin(elapsed / 28) + random.uniform(-1.5, 1.5)
                ctrl_error_pct = max(1, min(9, ctrl_error_pct))

                ctrl_success_pct = 93 + 1.2 * math.sin(elapsed / 24) + random.uniform(-1.2, 1.2)
                ctrl_success_pct = max(88, min(97, ctrl_success_pct))

                client.track(ORDER_ERROR_KEY, ctx, None,
                             100 if random.random() * 100 < ctrl_error_pct else 0)
                client.track(ORDER_SUCCESS_KEY, ctx, None,
                             100 if random.random() * 100 < ctrl_success_pct else 0)
                client.track(ORDER_LATENCY_KEY, ctx, None, ctrl_latency)
                client.track(ORDERS_PROCESSED_KEY, ctx, None, 1)

            iteration += 1
            status_check_counter += 1
            time.sleep(0.12)
        except Exception as e:
            logging.error(f"Error generating order pipeline metrics: {e}")
            continue

    logging.info("Order Pipeline v2 generator finished.")


# ------------------------------------------------------------ entrypoint

def generate_results(project_key, api_key):
    sdk_key = os.getenv("LD_SDK_KEY")
    if not sdk_key:
        print("LD_SDK_KEY not set in environment. Skipping result generation.")
        return

    # Both generator threads track events on this one client, so the queue has
    # to absorb their combined burst rate between flushes or the SDK drops
    # events ("Exceeded event queue capacity") and thins the demo data.
    #
    # But keep events_max_pending modest: the SDK posts the ENTIRE queue as one
    # request, and if the events endpoint rejects it as too large (HTTP 413) the
    # SDK permanently disables event delivery — which also leaves the guarded
    # rollout generators looping forever, because the release guardian never
    # receives the metric events it needs to finish the rollout. Compression
    # shrinks payloads around tenfold; the small queue caps the worst case on
    # older SDKs that lack it.
    config_kwargs = dict(sdk_key=sdk_key, events_max_pending=2000, flush_interval=1)
    try:
        ldclient.set_config(Config(enable_event_compression=True, **config_kwargs))
    except TypeError:
        ldclient.set_config(Config(**config_kwargs))

    client = ldclient.get()

    evaluate_flags_by_tag(client, "togglewear")

    inventory_stop = threading.Event()
    order_stop = threading.Event()

    inventory_thread = threading.Thread(
        target=inventory_service_healthy_generator, args=(client, inventory_stop))
    order_thread = threading.Thread(
        target=order_pipeline_failed_generator, args=(client, order_stop))

    inventory_thread.start()
    order_thread.start()

    logging.info("Guarded release generators running.")
    logging.info("  04 Live Inventory Service should reach 100% in about 10 minutes.")
    logging.info("  05 Order Pipeline v2 should be rolled back around minute 11 to 13.")

    # Safety cap. The failed scenario needs roughly thirteen minutes to reach
    # the point of being rolled back, so this has to comfortably exceed that or
    # provisioning would abandon the thread mid-story.
    MAX_GENERATOR_WAIT = 1200

    inventory_thread.join(timeout=MAX_GENERATOR_WAIT)
    order_thread.join(timeout=MAX_GENERATOR_WAIT)

    still_running = [t for t in (inventory_thread, order_thread) if t.is_alive()]
    if still_running:
        logging.warning(
            f"{len(still_running)} generator(s) still running after the cap — proceeding anyway.")
    else:
        logging.info("All guarded release generators completed.")

    client.flush()
    client.close()
