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

The tables started empty on purpose.  What was here described five products —
ToggleBank, Investment, Galaxy Marketplace, Public Sector and LaunchAirways —
and ToggleWear is one.  Rather than rename 49 flags and 41 metrics into retail
clothing, the resources are being rebuilt a capability at a time, so the flag
list in LaunchDarkly always says exactly which capabilities are covered.  The
originals are in git history and in ld-core-demo if any of them are wanted
back.

Flags are numbered rather than lettered: core-demo's A/B/D/P prefixes separate
its verticals, and ToggleWear has none to separate.  The number is the build
order and the name carries the capability, so the flag list reads as the demo
script.  Numbers are not reused if a flag is dropped.

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
FLAGS = [
    # ---- Capability 1: targeting, segmentation and flag prerequisites ----
    #
    # Gates the Swag Tier Status card on /account.  Exposure runs staff, then
    # testers, then a half-and-half rollout of everyone else.  Note that this
    # decides *whether* a shopper sees the card at all, while loyaltyTier
    # decides what the card then says — lib/shopper.ts keeps those two axes
    # separate on purpose, and this flag only touches the first one.
    #
    # Unlike core-demo, the segment rules live here in the table rather than in
    # a hand-written add_targeting_rules method, so the whole flag is one spec.
    {'flag': {'flag_key': 'swagTierProgram',
              'flag_name': '01 - Swag Tier Program - Targeting & Segmentation',
              'description': 'Shows the Swag Tier Status card on the account page. Released '
                             'to developers and beta testers first, then to half of all '
                             'other shoppers.',
              'variations': [{'value': True, 'name': 'Show Swag Tier Program'},
                             {'value': False, 'name': 'Hide Swag Tier Program'}],
              'tags': ['targeting', 'segments', 'loyalty', 'togglewear'],
              'on_variation': 0},
     'post': [['add_segment_to_flag',
               ['swagTierProgram', 'developers', 'production'],
               {}],
              ['add_segment_to_flag',
               ['swagTierProgram', 'beta-testers', 'production'],
               {}],
              ['set_default_percentage_rollout',
               ['swagTierProgram', 'production'],
               {'weights': {True: 50000, False: 50000}}],
              ['toggle_flag',
               ['swagTierProgram', 'on', 'production'],
               {}]]},

    # The gift strip inside that card.  Prerequisite-gated rather than given
    # its own copy of the targeting above, which is the point of the pair: it
    # cannot appear for a shopper who has no card to put it in, and turning 01
    # off makes it vanish while it still reads On in the flag list.
    {'flag': {'flag_key': 'giftUnlockTeaser',
              'flag_name': '02 - Gift Unlock Teaser - Flag Prerequisite',
              'description': 'The "points away from your next exclusive gift" strip inside '
                             'the Swag Tier Status card. Requires 01 to be serving Show, so '
                             'it inherits that rollout instead of repeating it.',
              'variations': [{'value': True, 'name': 'Show Gift Unlock Teaser'},
                             {'value': False, 'name': 'Hide Gift Unlock Teaser'}],
              'tags': ['prerequisite', 'loyalty', 'togglewear'],
              'on_variation': 0},
     'post': [['add_prerequisite_to_flag',
               ['giftUnlockTeaser', 'swagTierProgram', 0, 'production'],
               {}],
              ['toggle_flag',
               ['giftUnlockTeaser', 'on', 'production'],
               {}]]},

    # ---- Capability 2: progressive rollout ----
    #
    # The "Recommended for you" row on a product page — a new recommendation
    # engine being eased out rather than switched on, which is the realistic
    # shape for something that costs a call per page view.
    #
    # add_progressive_rollout steps 1% -> 5% -> 10% -> 25% -> 50% and turns the
    # flag on itself, so no toggle_flag is needed here.
    #
    # timeout is the duration of each stage and has to be passed: LaunchDarkly
    # caps a progressive rollout at 30 days in total, and the helper's five
    # stages at its default of a week each come to 35, which fails the whole
    # patch with invalid_patch — including the turnFlagOn in the same request,
    # so the flag silently stays off. Five days gives 25 days in total.
    #
    # The rollout starts at 1%, which is the point of the Beta Testers rule:
    # rules are evaluated before the default rule, so testers see the row
    # immediately while everyone else waits for the schedule. Without that rule
    # the feature would be invisible to everyone during a demo.
    {'flag': {'flag_key': 'swagRecommendations',
              'flag_name': '03 - Swag Recommendations - Progressive Rollout',
              'description': 'Shows the "Recommended for you" row on the product page. Beta '
                             'testers get it straight away; everyone else arrives through a '
                             'five-stage progressive rollout.',
              'variations': [{'value': True, 'name': 'Show Swag Recommendations'},
                             {'value': False, 'name': 'Hide Swag Recommendations'}],
              'tags': ['progressive-rollout', 'recommendations', 'togglewear'],
              'on_variation': 0},
     'post': [['add_segment_to_flag',
               ['swagRecommendations', 'beta-testers', 'production'],
               {}],
              ['add_progressive_rollout',
               ['swagRecommendations', 'production'],
               {'timeout': 432000000}]]},
]

# Segments — created in every environment listed, with shared rules
#
# The values are lowercase because that is what ShopperRole in lib/shopper.ts
# actually emits; core-demo's equivalents are capitalised and would never match.
SEGMENTS = [
    {'key': 'developers',
     'name': 'Developers',
     'description': 'ToggleWear engineers, who see storefront changes before anyone else',
     'environments': ['test', 'production', 'template-env'],
     'rules': [['user', 'role', 'in', ['developer']]]},
    {'key': 'beta-testers',
     'name': 'Beta Testers',
     'description': 'Shoppers who opted in to trying storefront features early',
     'environments': ['test', 'production', 'template-env'],
     'rules': [['user', 'role', 'in', ['beta']]]},
]

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
