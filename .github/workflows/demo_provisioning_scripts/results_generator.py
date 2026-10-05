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

Flag 05 additionally reports real telemetry through the observability plugin,
so its Monitoring tab fills with the errors, logs and traces underneath the
regression instead of only the metric charts.  That plugin needs Python 3.10
or newer; on anything older the metrics and the rollback still happen, just
without the telemetry beside them.

The ToggleBank, Investment, Galaxy Marketplace and public-sector generators
that used to live here were removed with the rest of those resources; they
are in git history and in ld-core-demo.  Experiment and AI Config generators
come back with the capabilities that need them.
"""

import contextlib
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

# The observability plugin is what fills in the Errors, Logs and Traces panels
# on flag 05's Monitoring tab.  It needs Python 3.10 or newer, so an older
# interpreter still produces every metric and both rollouts — it just does so
# without the telemetry that sits alongside them.
try:
    from ldobserve import ObservabilityConfig, ObservabilityPlugin, observe

    OBSERVABILITY_AVAILABLE = True
except ImportError:
    OBSERVABILITY_AVAILABLE = False

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
ORDER_SERVICE_NAME = "togglewear-order-pipeline"

# Every failure is reported.  An earlier version sampled 30% of them, on the
# assumption that the run would be long enough for that to still be hundreds
# of records; in practice the rollout is rolled back within minutes of the
# collapse starting, so sampling left the Errors panel with single digits and
# only half the failure modes represented at all.

# Healthy orders are logged sparingly, though.  The generator places roughly
# eight orders a second, and logging all of them would bury the failures that
# the Logs panel is there to show.
SUCCESS_LOG_SAMPLE_RATE = 0.05

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
# The SDK's event sender keeps a small connection pool to
# events.launchdarkly.com; concurrent flushes from the generator threads
# make urllib3 discard and reopen connections, which is harmless churn but
# floods the log with "Connection pool is full" warnings.
logging.getLogger("urllib3.connectionpool").setLevel(logging.ERROR)


# -------------------------------------------------------- observability

class OrderPipelineError(Exception):
    """Base class for the synthetic Order Pipeline v2 failures.

    Each subclass is raised for real rather than merely described, so that the
    Errors panel gets a genuine stack trace and groups failures by type the
    way it would for a service that was actually breaking.
    """


class OrderPipelineTimeout(OrderPipelineError):
    """The pipeline did not return within its deadline."""


class StockReservationError(OrderPipelineError):
    """Stock could not be held for one or more line items."""


class AddressValidationError(OrderPipelineError):
    """The shipping address was rejected downstream."""


class TaxCalculationError(OrderPipelineError):
    """No tax rate came back for the destination."""


class ShippingRateError(OrderPipelineError):
    """No carrier returned a rate for the parcel."""


class PaymentAuthorisationError(OrderPipelineError):
    """The payment processor refused the authorisation."""


class OrderPersistenceError(OrderPipelineError):
    """The order could not be written to its store."""


class OrderConfirmationError(OrderPipelineError):
    """The order was taken but the confirmation could not be handed off."""


# Each failure is raised from its own function, which is what gets eight
# separate groups into the Errors panel rather than one.  Grouping keys on the
# stack trace, so raising every failure from a single shared line would
# collapse them together however many types there were.
#
# The messages are deliberately constant.  Interpolating an order id or a SKU
# would make every instance its own group and the list unreadable, so the
# per-order detail travels in the span attributes instead.

def _fail_submit():
    raise OrderPipelineTimeout("Order pipeline timed out after 30s")


def _fail_reserve_stock():
    raise StockReservationError("Could not reserve stock for one or more line items")


def _fail_validate_address():
    raise AddressValidationError("Shipping address failed validation")


def _fail_calculate_tax():
    raise TaxCalculationError("Tax service returned no rate for the destination")


def _fail_rate_shipping():
    raise ShippingRateError("No shipping rates returned for the parcel")


def _fail_authorise_payment():
    raise PaymentAuthorisationError("Payment authorisation returned 500")


def _fail_persist():
    raise OrderPersistenceError("Order write failed: connection pool exhausted")


def _fail_confirm():
    raise OrderConfirmationError("Confirmation handoff rejected by the notifier")


# Pairing each failure with its step means the trace shows where an order died
# rather than only that it did.
ORDER_FAILURES = [
    ("order-pipeline.submit", _fail_submit),
    ("order-pipeline.reserve-stock", _fail_reserve_stock),
    ("order-pipeline.validate-address", _fail_validate_address),
    ("order-pipeline.calculate-tax", _fail_calculate_tax),
    ("order-pipeline.rate-shipping", _fail_rate_shipping),
    ("order-pipeline.authorise-payment", _fail_authorise_payment),
    ("order-pipeline.persist", _fail_persist),
    ("order-pipeline.confirm", _fail_confirm),
]


def observe_span(name, attributes=None):
    """A span when the plugin loaded, otherwise something that does nothing.

    Flag evaluations have to happen inside one of these.  The plugin records
    each evaluation onto whichever span is current, and that is the link that
    files the resulting telemetry under the flag in LaunchDarkly.

    The span deliberately does not record exceptions itself; observe_error
    does that, because it is the documented route to the Errors panel and
    doing both would report every failure twice.
    """
    if OBSERVABILITY_AVAILABLE:
        return observe.start_span(name, attributes or {}, record_exception=False)
    return contextlib.nullcontext()


def observe_error(error, attributes=None):
    if OBSERVABILITY_AVAILABLE:
        observe.record_exception(error, attributes or {})


def observe_log(message, level, attributes=None):
    if OBSERVABILITY_AVAILABLE:
        observe.record_log(message, level, attributes or {})


def report_order_failure(order_id, ctx, latency, version):
    """Raise, catch and report one order failure.

    The exception is raised rather than constructed so that the Errors panel
    gets a real stack trace.

    It is recorded against the caller's span rather than a child span of its
    own.  A child named for the failing step read better in the trace, but the
    flag evaluation lives on the parent span, and errors appear to be
    attributed to a flag per span rather than per trace — which left these
    showing under Observability while flag 05's own Errors tab stayed empty.
    The step still travels as an attribute.
    """
    step, raise_failure = random.choice(ORDER_FAILURES)
    attributes = {
        "order.id": order_id,
        "shopper.key": ctx.key,
        "service.name": ORDER_SERVICE_NAME,
        "pipeline.step": step,
        "pipeline.version": version,
        "order.latency_ms": latency,
    }

    try:
        raise_failure()
    except OrderPipelineError as error:
        observe_error(error, attributes)
        observe_log(f"{order_id} failed at {step}: {error}",
                    logging.ERROR, attributes)


def report_order_success(order_id, ctx, latency, version):
    """Log a completed order, sparsely.

    Slow orders are always logged, because rising latency is part of what the
    rollout is supposed to reveal; ordinary ones are sampled.
    """
    if latency > 300:
        level, message = logging.WARNING, f"{order_id} completed slowly in {latency}ms"
    elif random.random() < SUCCESS_LOG_SAMPLE_RATE:
        level, message = logging.INFO, f"{order_id} completed in {latency}ms"
    else:
        return

    observe_log(message, level, {
        "order.id": order_id,
        "shopper.key": ctx.key,
        "service.name": ORDER_SERVICE_NAME,
        "pipeline.version": version,
        "order.latency_ms": latency,
    })


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
        # Flush per flag, not once at the end. Five flags at 500 evaluations
        # overflows the 2000-event queue before anything is sent, and the
        # dropped events come out of the warm-up the flag list depends on.
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

    Two phases. For the first six minutes v2 draws from the same distributions
    as the control, so there is genuinely nothing to find. Then it collapses.

    That first phase used to be a mild regression instead — 11% errors against
    the control's 4%, latency 148ms against 110ms — on the theory that it was
    too small to be conclusive. It was not. LaunchDarkly rolled the flag back
    61 seconds in, on a sample of 36 users, because a 35% latency increase is
    so far outside the noise that sequential testing needs almost no data to
    be certain of it. Nothing about the story got a chance to happen.
    Sustained differences cannot merely be small, either: a small true gap
    still reaches significance once enough events pile up, and six minutes is
    plenty. So the phase has to be noise, and all the divergence has to live
    in the collapse.

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

    SUSTAIN_END = 360.0       # six minutes indistinguishable from control
    CATASTROPHE_END = 540.0   # then three minutes of collapse, though the
                              # rollback usually lands in the first one

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
            elapsed = time.time() - start_time
            order_id = f"order-{iteration:06d}"

            walk_test_lat = max(-15, min(15, walk_test_lat + random.uniform(-3, 3)))
            walk_ctrl_lat = max(-12, min(12, walk_ctrl_lat + random.uniform(-3, 3)))
            walk_test_err = max(-3, min(3, walk_test_err + random.uniform(-0.8, 0.8)))
            walk_test_suc = max(-3, min(3, walk_test_suc + random.uniform(-0.8, 0.8)))

            # The evaluation happens inside the span deliberately.  The plugin
            # attaches it to whichever span is current, and that is the link
            # that files this order's telemetry under flag 05.
            with observe_span("order-pipeline.submit", {
                "order.id": order_id,
                "shopper.key": ctx.key,
                "service.name": ORDER_SERVICE_NAME,
            }):
                on_v2 = client.variation(ORDER_FLAG_KEY, ctx, False)

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
                        # Centred on exactly the same numbers as the control
                        # arm below. v2 keeps its own oscillators and its own
                        # walk, so the two lines are not the identical trace,
                        # but the means match — and the mean is all the
                        # regression detector compares.
                        error_pct = 4 + (osc_err * 0.6) + (walk_test_err * 0.3) + random.uniform(-1.5, 1.5)
                        error_pct = max(1, min(9, error_pct))

                        success_pct = 93 + (osc_suc * 0.5) + (walk_test_suc * 0.3) + random.uniform(-1.2, 1.2)
                        success_pct = max(88, min(97, success_pct))

                        # The oscillator and walk are scaled down to match the
                        # control arm's spread exactly, which matters more than
                        # it looks. Both arms clamp to 55-200 around a mean of
                        # 110, so the lower bound is nearer than the upper and
                        # clamping lifts the mean; a wider distribution gets
                        # clipped more often and ends up measurably slower
                        # while looking like it was centred the same. That
                        # alone was worth a couple of milliseconds.
                        latency = int(random.gauss(
                            110 + (osc_lat * 0.9) + (walk_test_lat * 0.8), 25))
                        latency = max(55, min(200, latency))
                    else:
                        # Steep at first and flattening after, so that the
                        # line has visibly jumped by the time the detector
                        # reacts. The detector is sensitive — last time it
                        # caught a 44ms gap — so a collapse that accelerated
                        # slowly would be rolled back while the chart still
                        # looked almost flat, which is the opposite of the
                        # point. curve is 0 at the handover, so the numbers
                        # continue from the healthy phase without a step.
                        cat_progress = min((elapsed - SUSTAIN_END) / (CATASTROPHE_END - SUSTAIN_END), 1.0)
                        curve = 1.0 - ((1.0 - cat_progress) ** 2.2)

                        error_pct = 4 + (62 * curve) + 2 * math.sin(elapsed / 20) + random.uniform(-1.5, 1.5)
                        error_pct = max(1, min(80, error_pct))

                        success_pct = 93 - (62 * curve) + 1.5 * math.sin(elapsed / 22) + random.uniform(-1.5, 1.5)
                        success_pct = max(18, min(97, success_pct))

                        latency = int(random.gauss(
                            110 + (410 * curve) + (osc_lat * 0.5) + walk_test_lat, 25 + 35 * curve))
                        latency = max(55, min(750, latency))

                    error_val = 100 if random.random() * 100 < error_pct else 0
                    success_val = 100 if random.random() * 100 < success_pct else 0

                    client.track(ORDER_ERROR_KEY, ctx, None, error_val)
                    client.track(ORDER_SUCCESS_KEY, ctx, None, success_val)
                    client.track(ORDER_LATENCY_KEY, ctx, None, latency)
                    client.track(ORDERS_PROCESSED_KEY, ctx, None, 1)

                    if error_val == 100:
                        report_order_failure(order_id, ctx, latency, "v2")
                    else:
                        report_order_success(order_id, ctx, latency, "v2")
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

                    ctrl_error_val = 100 if random.random() * 100 < ctrl_error_pct else 0

                    client.track(ORDER_ERROR_KEY, ctx, None, ctrl_error_val)
                    client.track(ORDER_SUCCESS_KEY, ctx, None,
                                 100 if random.random() * 100 < ctrl_success_pct else 0)
                    client.track(ORDER_LATENCY_KEY, ctx, None, ctrl_latency)
                    client.track(ORDERS_PROCESSED_KEY, ctx, None, 1)

                    # The control arm reports too, so the panels have a quiet
                    # baseline to contrast v2's spike against rather than
                    # making it look as though only one pipeline is monitored.
                    if ctrl_error_val == 100:
                        report_order_failure(order_id, ctx, ctrl_latency, "v1")
                    else:
                        report_order_success(order_id, ctx, ctrl_latency, "v1")

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

    if OBSERVABILITY_AVAILABLE:
        config_kwargs["plugins"] = [ObservabilityPlugin(ObservabilityConfig(
            service_name=ORDER_SERVICE_NAME,
            service_version=os.getenv("GITHUB_SHA", "local"),
            environment=ENVIRONMENT_KEY,
        ))]
    else:
        logging.warning(
            "Observability plugin unavailable, so flag 05's Monitoring tab will "
            "have no errors, logs or traces. It needs Python 3.10 or newer.")

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
    logging.info("  05 Order Pipeline v2 should be rolled back around minute 6 to 8.")

    # Safety cap. The healthy scenario is the slower of the two at about ten
    # minutes, so this has to comfortably exceed that or provisioning would
    # abandon the thread mid-story.
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
