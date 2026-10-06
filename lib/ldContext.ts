import type { Person, ShopperRole } from "./shopper";

// The LaunchDarkly context a shopper is evaluated against.
//
// role and tier are the attributes the segments match on, so the values have
// to stay exactly as ShopperRole and LoyaltyTier spell them — the segment
// rules in demo_resources.py match the same lowercase strings, and a
// capitalised "Developer" would simply never match.
//
// orderCount is here because "new customer" is a reading taken off an order
// history rather than a kind of shopper, so the New Customers segment is a
// rule on this number (is 0) rather than a name in a list.
//
// What is still missing is the cart: a Cart Abandoners segment wants
// cartItemCount, and the cart lives in a provider mounted below the one that
// identifies, so it cannot be read from here yet.

// The key is what a percentage rollout buckets by, and it is the person's own
// id so that a given shopper lands on the same side of a rollout every time.
// It used to be random per session, which demonstrated a 50/50 split by
// re-bucketing on reload but meant nobody could say what Diane would see
// before clicking her. A scripted demo needs the second property more than
// the first, and a split is still showable by switching between people,
// because five fixed keys spread across the buckets.
export function contextFor(person: Person, role: ShopperRole) {
  return {
    kind: "user" as const,
    key: person.id,
    // Shown in LaunchDarkly's own context list, which is where you go to
    // prove to a prospect that the attributes really arrived.
    name: person.name,
    email: person.email,
    role,
    tier: person.tier,
    orderCount: person.orderCount,
  };
}
