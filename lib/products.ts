export type Product = {
  slug: string;
  name: string;
  priceUsd: number;
  description: string;
  image: string;
  isNew?: boolean;
};

// The Figma file repeats "ToggleWear Crewneck / $48 USD / Heavyweight
// cotton-blend fleece" on all eight cards as placeholder text, so the names,
// prices and descriptions here are written to match the photography instead.
// The images and isNew flags are taken from the design.
//
// These prices feed cart and checkout totals, so this file is the single
// source of truth for them.
export const BEST_SELLERS: Product[] = [
  {
    slug: "togglewear-cap",
    name: "ToggleWear Cap",
    priceUsd: 32,
    description: "Embroidered six-panel, adjustable strap",
    image: "/images/products/cap-white-product.png",
  },
  {
    slug: "enamel-mug-set",
    name: "Enamel Mug Set",
    priceUsd: 28,
    description: "Two 12oz enamel mugs, black and white",
    image: "/images/products/mug-pair.png",
  },
  {
    slug: "checkerboard-socks",
    name: "Checkerboard Socks",
    priceUsd: 18,
    description: "Mid-calf knit with cushioned sole",
    image: "/images/products/socks-worn.png",
    isNew: true,
  },
  {
    slug: "togglewear-hoodie",
    name: "ToggleWear Hoodie",
    priceUsd: 68,
    description: "Heavyweight cotton-blend fleece",
    image: "/images/products/hoodie-blue-model.png",
    isNew: true,
  },
  {
    slug: "sticker-pack",
    name: "Sticker Pack",
    priceUsd: 12,
    description: "Five weatherproof vinyl stickers",
    image: "/images/products/stickers-laptop.png",
  },
  {
    slug: "canvas-tote",
    name: "Canvas Tote",
    priceUsd: 24,
    description: "Heavy cotton canvas, 15L capacity",
    image: "/images/products/tote-canvas.png",
  },
  {
    slug: "bucket-hat",
    name: "Bucket Hat",
    priceUsd: 34,
    description: "Tie-dye cotton twill, one size",
    image: "/images/products/bucket-hat-model-1.png",
    isNew: true,
  },
  {
    slug: "water-bottle",
    name: "Water Bottle",
    priceUsd: 29,
    description: "32oz insulated with carry loop",
    image: "/images/products/bottle-black.png",
  },
];

export type PricingVariant = "default" | "loyaltyGold";

// Loyalty Gold members see a lower price. Jen's design shows the mechanic
// (original struck through, member price in bold) but both numbers are the
// same $48 placeholder, so the depth is set here as a single rate.
//
// This is the natural knob for a flag or experiment to turn, which is why it
// is a rate rather than eight separate member prices.
export const LOYALTY_DISCOUNT = 0.15;

export function memberPriceUsd(priceUsd: number) {
  return Math.round(priceUsd * (1 - LOYALTY_DISCOUNT));
}

export function formatPrice(priceUsd: number) {
  return `$${priceUsd} USD`;
}

// The loyalty variant leads with the hoodie, one of the NEW items, instead of
// the cap. The rest of the order is unchanged.
const LOYALTY_LEAD_SLUG = "togglewear-hoodie";

export function bestSellersFor(variant: PricingVariant): Product[] {
  if (variant === "default") return BEST_SELLERS;

  const lead = BEST_SELLERS.find((p) => p.slug === LOYALTY_LEAD_SLUG);
  if (!lead) return BEST_SELLERS;

  return [lead, ...BEST_SELLERS.filter((p) => p.slug !== LOYALTY_LEAD_SLUG)];
}
