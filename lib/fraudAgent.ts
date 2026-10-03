// The fraud triage agent that sits in front of Place Order.
//
// This is a scripted stand-in, the same shape as the swag assistant: real
// inputs, deterministic reasoning, no model call yet. When the LaunchDarkly
// project exists the scoring below gets replaced by an AI Config, and the
// four knobs marked FLAG become the demo — change the threshold and watch a
// clean order start getting held, or kill the agent outright and watch every
// order sail through.
//
// Deterministic on purpose. An SE has to be able to produce any outcome on
// stage on the first try, so each one has its own lever and each lever works
// on its own:
//
//   approve  — the prefilled form, untouched
//   review   — push the cart over $250, or raise any line to quantity 5
//   decline  — change the ZIP to 99999, or do both of the review levers at
//              once, since two soft signals together clear the hard bar

export type FraudDecision = "approve" | "review" | "decline";

export type RiskSignal = {
  label: string;
  points: number;
};

export type FraudAssessment = {
  decision: FraudDecision;
  score: number;
  signals: RiskSignal[];
  summary: string;
};

export type OrderUnderReview = {
  zip: string;
  total: number;
  maxLineQuantity: number;
};

// FLAG: both thresholds. Sliding REVIEW_AT down to 30 holds the ordinary
// order, which is the fastest way to show a config change landing without a
// deploy.
//
// The two soft signals are weighted at 45 each so that either one on its own
// clears REVIEW_AT, and the two together clear DECLINE_AT. Anything less and
// a lever looks broken on stage: the signal shows up in the panel but the
// order sails through anyway.
const REVIEW_AT = 40;
const DECLINE_AT = 70;
const SOFT_SIGNAL_POINTS = 45;

// FLAG: the value above which an order is worth a second look.
const HIGH_VALUE_USD = 250;

// FLAG: the quantity that reads as resale rather than a personal order.
const BULK_QUANTITY = 5;

// FLAG: the blocklist. One entry, because it only exists to be the lever.
const BLOCKED_ZIPS = ["99999"];

// How long the agent appears to think. Long enough that an audience sees it
// happen, short enough that nobody waits.
export const ASSESS_MS = 1400;

export function assessOrder(order: OrderUnderReview): FraudAssessment {
  const signals: RiskSignal[] = [];

  if (BLOCKED_ZIPS.includes(order.zip.trim())) {
    signals.push({
      label: `Shipping ZIP ${order.zip.trim()} matches a known reshipping address`,
      points: 80,
    });
  }

  if (order.total > HIGH_VALUE_USD) {
    signals.push({
      label: `Order value is above the $${HIGH_VALUE_USD} review threshold`,
      points: SOFT_SIGNAL_POINTS,
    });
  }

  if (order.maxLineQuantity >= BULK_QUANTITY) {
    signals.push({
      label: `A single item is ordered ${order.maxLineQuantity} times, consistent with resale`,
      points: SOFT_SIGNAL_POINTS,
    });
  }

  const score = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.points, 0),
  );

  const decision: FraudDecision =
    score >= DECLINE_AT ? "decline" : score >= REVIEW_AT ? "review" : "approve";

  return { decision, score, signals, summary: SUMMARIES[decision] };
}

const SUMMARIES: Record<FraudDecision, string> = {
  approve:
    "Nothing on this order looks unusual. Payment captured and the order is on its way to fulfilment.",
  review:
    "This order is going to a human reviewer before it ships. Nothing has been charged yet.",
  decline:
    "This order has been stopped. No payment was taken and nothing will ship.",
};

// Order numbers are demo props, not records, so they only have to look right
// and not repeat within a session. Shaped like Jen's #TW-2026-98741.
export function orderNumber(now = new Date()) {
  const serial = Math.floor(10000 + Math.random() * 90000);
  return `TW-${now.getFullYear()}-${serial}`;
}
