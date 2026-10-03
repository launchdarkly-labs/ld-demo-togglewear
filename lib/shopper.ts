import type { AnnouncementPersona } from "@/components/layout/AnnouncementBar";
import type { PricingVariant } from "./products";

// The labels a ToggleWear shopper carries, modelled on core-demo's user
// context (utils/contexts/StarterUserPersonas.ts over in ld-core-demo).
//
// Components ask about these rather than about persona names, because this is
// the shape LaunchDarkly supplies: client.identify() can tell us a shopper's
// tier, but it can never tell us which demo button is pressed. Writing the
// conditions against the labels now means they survive the switch.
//
// core-demo carries a third label, launchclub, which is a ToggleBank concept.
// loyaltyTier does that job here.

// Who sees things early — the "staff first, then testers, then everyone" axis.
// Deliberately independent of what a shopper has spent, which is the whole
// reason it is a separate label: a gold member is not necessarily a tester,
// and a tester is not necessarily a paying customer.
export type ShopperRole = "shopper" | "beta" | "developer";

// What a shopper has earned. Drives pricing and the members-only products.
export type LoyaltyTier = "none" | "gold";

export type Shopper = {
  role: ShopperRole;
  loyaltyTier: LoyaltyTier;
};

export const ROLES: { id: ShopperRole; label: string }[] = [
  { id: "shopper", label: "Shopper" },
  { id: "beta", label: "Beta" },
  { id: "developer", label: "Developer" },
];

// One copy of what used to be an identical VARIANT_BY_PERSONA table in four
// separate pages.
export function variantFor(tier: LoyaltyTier): PricingVariant {
  return tier === "gold" ? "loyaltyGold" : "default";
}

// The throwaway piece. Jen designed two variants of the hero and the item
// block, default and Loyalty Gold, so the persona buttons stand in for the
// tier LaunchDarkly will eventually hand us. Cart Abandoner and New Customer
// are behaviours rather than entitlements, so neither earns a tier — they
// keep their own announcement bar and shop at list price.
export function tierForPersona(persona: AnnouncementPersona): LoyaltyTier {
  return persona === "loyaltyGold" ? "gold" : "none";
}
