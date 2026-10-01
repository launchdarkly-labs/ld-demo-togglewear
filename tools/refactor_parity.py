#!/usr/bin/env python3
"""Refactor parity check for the demo provisioning scripts.

Replaces LDPlatform with a recorder that captures every call and its
normalized arguments instead of hitting the LaunchDarkly API, then drives
DemoBuilder's orchestrators and writes the resulting call sequence to disk.

Splitting LDPlatform.py into ld/ and demo_resources.py into resources/ is
meant to be move-only, so that sequence must be byte-identical afterwards.
Anything that moved wrong -- a dropped method, a reordered table, a changed
default -- shows up here as a diff.

    python3 tools/refactor_parity.py snapshot   # before touching anything
    python3 tools/refactor_parity.py check      # after each refactor commit

Adapted from test_demobuilder_equivalence.py in ld-core-demo, which used the
same recorder to compare DemoBuilderv1 against DemoBuilder.
"""
import argparse
import importlib
import importlib.util
import inspect
import io
import json
import random
import re
import sys
import time
import uuid
from contextlib import redirect_stdout
from pathlib import Path
from types import SimpleNamespace

REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = REPO_ROOT / ".github" / "workflows" / "demo_provisioning_scripts"
DEFAULT_BASELINE = Path(__file__).resolve().parent / ".refactor-baseline.json"

# Every orchestrator build() drives, minus the LDGeneratorsRunner subprocess.
ORCHESTRATORS = [
    "create_project",
    "create_segments",
    "create_metrics",
    "create_metric_groups",
    "create_flags",
    "update_add_userid_to_flags",
    "create_contexts",
    "create_ai_config",
    "enable_csa_shadow_ai_feature_flags",
    "create_and_run_experiments",
    "create_and_run_layer",
    "create_and_run_holdout",
    "project_settings",
    "setup_template_environment",
    "setup_release_pipeline",
]

# Recorded reprs must not carry anything that varies between runs, or every
# comparison would be a false positive.
_ADDR = re.compile(r"0x[0-9a-fA-F]{6,}")


def _scrub(text):
    return _ADDR.sub("0xADDR", text)


def _force_determinism():
    """Pin every source of per-run variation the builders draw from."""
    random.seed(0)
    counter = iter(range(1, 10_000))
    uuid.uuid4 = lambda: uuid.UUID(int=next(counter))
    # DemoBuilder sleeps ~32 times to pace real API calls; nothing is being
    # paced here and it costs the better part of a minute.
    time.sleep = lambda *args, **kwargs: None


class Recorder:
    """Stands in for LDPlatform; records calls instead of making them."""

    def __init__(self, *args, **kwargs):
        object.__setattr__(self, "calls", [])
        object.__setattr__(self, "project_key", None)

    def __setattr__(self, key, value):
        object.__setattr__(self, key, value)

    def __getattr__(self, name):
        def call(*args, **kwargs):
            try:
                sig = inspect.signature(getattr(Recorder._real, name))
                bound = sig.bind(None, *args, **kwargs)
                bound.apply_defaults()
                norm = {k: v for k, v in bound.arguments.items() if k != "self"}
            except (AttributeError, TypeError):
                norm = {"args": args, "kwargs": kwargs}
            self.calls.append([name, _scrub(repr(norm))])

            # A few methods have return values the builders branch on. These
            # mirror the real shapes so the callers take their normal path.
            if name == "get_pipeline_phase_ids":
                return {"test": "T", "guard": "G", "ga": "GA"}
            if name == "exp_metric":
                is_group = args[1] if len(args) > 1 else kwargs.get("is_group", True)
                return {"key": args[0], "isGroup": is_group}
            if name == "get_flag_variation_values":
                # Must be non-empty: several builders gate their real work on
                # having found both a control and a test variation, and would
                # skip the interesting payload entirely if this came back empty.
                return (
                    [
                        {"ordinal": 0, "value": True, "id": "var-id-true"},
                        {"ordinal": 1, "value": False, "id": "var-id-false"},
                    ],
                    {"onVariation": 0, "offVariation": 1},
                )
            if name == "project_exists":
                return False
            return SimpleNamespace(status_code=201, text="{}", headers={})

        return call


# Held across calls so a second capture() in the same process doesn't mistake
# the Recorder it installed last time for the real class.
_REAL_LDPLATFORM = None


def _resolve_ldplatform():
    """Find the LDPlatform module and class before or after the ld/ split."""
    global _REAL_LDPLATFORM
    for module_name in ("LDPlatform", "ld"):
        try:
            module = importlib.import_module(module_name)
        except ImportError:
            continue
        cls = getattr(module, "LDPlatform", None)
        if not isinstance(cls, type):
            continue
        if cls is Recorder:
            if _REAL_LDPLATFORM is None:
                continue
            return module, _REAL_LDPLATFORM
        _REAL_LDPLATFORM = cls
        return module, cls
    sys.exit("Could not locate the LDPlatform class in LDPlatform.py or ld/.")


def _load_demobuilder():
    spec = importlib.util.spec_from_file_location(
        "demobuilder_under_test", SCRIPTS_DIR / "DemoBuilder.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _fresh_builder(module):
    builder = module.DemoBuilder("api-key", "e@x.com", "user-key", "proj", "Proj Name")
    for flag in (
        "project_created",
        "metrics_created",
        "metric_groups_created",
        "flags_created",
        "segments_created",
    ):
        setattr(builder, flag, True)
    return builder


def capture():
    """Drive every orchestrator and return its recorded call sequence."""
    sys.path.insert(0, str(SCRIPTS_DIR))
    ldp_module, real_cls = _resolve_ldplatform()
    Recorder._real = real_cls
    ldp_module.LDPlatform = Recorder

    _force_determinism()
    builder_module = _load_demobuilder()
    # DemoBuilder may hold its own reference from `import LDPlatform`.
    if hasattr(builder_module, "LDPlatform"):
        target = builder_module.LDPlatform
        if inspect.ismodule(target):
            target.LDPlatform = Recorder
        else:
            builder_module.LDPlatform = Recorder

    recorded = {}
    for name in ORCHESTRATORS:
        builder = _fresh_builder(builder_module)
        if not hasattr(builder, name):
            recorded[name] = {"status": "absent"}
            continue
        try:
            with redirect_stdout(io.StringIO()):
                getattr(builder, name)()
            recorded[name] = {"status": "ok", "calls": list(builder.ldproject.calls)}
        except Exception as exc:  # noqa: BLE001 - parity cares that it matches
            recorded[name] = {
                "status": "raised",
                "error": _scrub(f"{type(exc).__name__}: {exc}"),
                "calls": list(builder.ldproject.calls),
            }
    return recorded


def _summarize(recorded):
    total = sum(len(v.get("calls", [])) for v in recorded.values())
    ok = sum(1 for v in recorded.values() if v["status"] == "ok")
    raised = [k for k, v in recorded.items() if v["status"] == "raised"]
    absent = [k for k, v in recorded.items() if v["status"] == "absent"]
    print(f"{ok}/{len(recorded)} orchestrators ran clean, {total} LD API calls recorded")
    if raised:
        print(f"  raised (recorded as-is, must match after refactor): {', '.join(raised)}")
    if absent:
        print(f"  not present on DemoBuilder: {', '.join(absent)}")


def _diff(baseline, current):
    failures = 0
    for name in sorted(set(baseline) | set(current)):
        before, after = baseline.get(name), current.get(name)
        if before is None:
            failures += 1
            print(f"NEW    {name}: not in baseline")
            continue
        if after is None:
            failures += 1
            print(f"LOST   {name}: orchestrator disappeared")
            continue
        if before.get("status") != after.get("status"):
            failures += 1
            print(f"STATUS {name}: {before.get('status')} -> {after.get('status')}")
            if after.get("status") == "raised":
                print(f"         now raises: {after.get('error')}")
            continue
        if before.get("error") != after.get("error"):
            failures += 1
            print(f"ERROR  {name}: error text changed")
            print(f"         before: {before.get('error')}")
            print(f"         after:  {after.get('error')}")
            continue

        c1 = [tuple(c) for c in before.get("calls", [])]
        c2 = [tuple(c) for c in after.get("calls", [])]
        if c1 == c2:
            print(f"MATCH  {name}: {len(c1)} identical LD API calls")
            continue

        failures += 1
        print(f"DIFF   {name}: before={len(c1)} calls, after={len(c2)} calls")
        for i, (a, b) in enumerate(zip(c1, c2)):
            if a != b:
                print(f"         first diff at call {i}:")
                print(f"           before: {a}")
                print(f"           after:  {b}")
                break
        if len(c1) != len(c2):
            longer, shorter = (c1, c2) if len(c1) > len(c2) else (c2, c1)
            side = "before" if len(c1) > len(c2) else "after"
            print(f"         extra call only in {side}: {longer[len(shorter)]}")
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=["snapshot", "check"])
    parser.add_argument("--baseline", type=Path, default=DEFAULT_BASELINE)
    args = parser.parse_args()

    recorded = capture()

    if args.mode == "snapshot":
        args.baseline.parent.mkdir(parents=True, exist_ok=True)
        args.baseline.write_text(json.dumps(recorded, indent=2, sort_keys=True))
        _summarize(recorded)
        print(f"\nBaseline written to {args.baseline.relative_to(REPO_ROOT)}")
        return 0

    if not args.baseline.exists():
        sys.exit(f"No baseline at {args.baseline}. Run 'snapshot' first.")
    failures = _diff(json.loads(args.baseline.read_text()), recorded)
    print()
    if failures:
        print(f"FAIL: {failures} orchestrator(s) changed. This refactor was not move-only.")
        return 1
    print("PASS: LD API call sequence is identical to the baseline.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
