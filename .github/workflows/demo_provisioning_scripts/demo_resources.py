"""Demo resource definitions for DemoBuilder-v2.

Each table below declares one family of LaunchDarkly resources created for
the demo environment.  To add or change a resource, edit the relevant table —
DemoBuilder.py contains the generic creation loops that consume them.

Tables:
    METRICS         -> LDPlatform.create_metric(**spec)
    METRIC_GROUPS   -> LDPlatform.create_metric_group(**spec)
    FLAGS           -> create_flag(**spec["flag"]) + optional "post" follow-up calls
    SEGMENTS        -> created per environment listed, with shared rules
    CONTEXT_KINDS   -> [context_key, for_experiment]
    EXPERIMENTS     -> toggled flag, metrics, create_experiment kwargs

Entries with {"custom": "<method name>"} defer to a hand-written method on
DemoBuilder for cases that don't fit the generic shape.

The tables are empty on purpose.  What was here described five products —
ToggleBank, Investment, Galaxy Marketplace, Public Sector and LaunchAirways —
and ToggleWear is one.  Rather than rename 49 flags and 41 metrics into retail
clothing, the resources are being rebuilt a capability at a time, so the flag
list in LaunchDarkly always says exactly which capabilities are covered.  The
originals are in git history and in ld-core-demo if any of them are wanted
back.

PIPELINE_FLAGS is gone outright: LaunchDarkly has deprecated release
pipelines, so there is nothing for that table to build.
"""

# ==========================================================================
# Resource definition tables
# ==========================================================================

# Metrics — passed straight to LDPlatform.create_metric(**spec)
METRICS = []

# Metric groups — funnels, passed to LDPlatform.create_metric_group(**spec)
METRIC_GROUPS = []

# Flags — create_flag(**spec["flag"]), plus any "post" follow-up calls
FLAGS = []

# Segments — created in every environment listed, with shared rules
SEGMENTS = []

# Context kinds — [key, for_experiment]
#
# device and location survive the clear-out because ToggleWear targets on both;
# core-demo's 'audience' and 'experience' kinds do not apply here.  organization
# and account arrive with the capability that needs them.
CONTEXT_KINDS = [
    ['device', True],
    ['location', True],
]

# Experiments — toggled flag, metrics, and create_experiment kwargs
EXPERIMENTS = []
