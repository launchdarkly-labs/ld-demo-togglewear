import type { ShopperRole } from "./shopper";

// The LaunchDarkly context a shopper is evaluated against.
//
// role is the attribute the Developers and Beta Testers segments match on, so
// the values have to stay exactly as ShopperRole spells them — the segment
// rules in demo_resources.py match the same lowercase strings, and a
// capitalised "Developer" would simply never match.
//
// loyaltyTier is deliberately absent. It is an entitlement rather than an
// exposure ring, so it arrives with the capability that targets on it.

const KEY_STORAGE = "togglewear.ldkey";

function randomKey(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID().slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

// The key is what a percentage rollout buckets by, so it is held for the
// session rather than regenerated per render: reloading the account page
// should not reshuffle which side of the Swag Tier Program rollout you are on.
// A new session gets a new key, which is how the 50/50 split is demonstrated.
export function shopperKey(): string {
  if (typeof window === "undefined") return "anonymous";

  try {
    const saved = window.sessionStorage.getItem(KEY_STORAGE);
    if (saved) return saved;

    const key = randomKey();
    window.sessionStorage.setItem(KEY_STORAGE, key);
    return key;
  } catch {
    // Private browsing denies storage. An unstable key still evaluates, it
    // just rebuckets on every reload.
    return randomKey();
  }
}

export function contextFor(role: ShopperRole) {
  return {
    kind: "user" as const,
    key: shopperKey(),
    role,
  };
}
