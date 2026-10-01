export type ProductColor = { name: string; hex: string };

// Taken from the fills of Jen's swatch SVGs on the two product detail pages.
// Everything except pink maps to one of her published colour variables.
export const COLORS: Record<string, ProductColor> = {
  black: { name: "Black", hex: "#191919" },
  blue: { name: "Blue", hex: "#405BFF" },
  orange: { name: "Orange", hex: "#FF9D29" },
  cyan: { name: "Cyan", hex: "#3DD6F5" },
  pink: { name: "Pink", hex: "#F98FC9" },
  grey: { name: "Grey", hex: "#6D6E71" },
};

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const ONE_SIZE = ["One size"];

export type Product = {
  slug: string;
  name: string;
  priceUsd: number;
  description: string;
  image: string;
  isNew?: boolean;
  // Loyalty Gold members get early access to these; they are absent from the
  // default catalogue entirely.
  membersOnly?: boolean;

  // Product detail page fields.
  badge: string;
  gallery: string[];
  sizes: string[];
  defaultSize: string;
  detail: string;
  features: string[];
  // Omitted where a colourway choice would be meaningless, such as the
  // tie-dyed bucket hat or the two-tone mug set. The Color block is hidden
  // when there are fewer than two.
  colors?: ProductColor[];
};

// The Figma file repeats "ToggleWear Crewneck / $48 USD / Heavyweight
// cotton-blend fleece" on all eight cards as placeholder text, so the names,
// prices and descriptions here are written to match the photography instead.
// The images and isNew flags are taken from the design.
//
// These prices feed cart and checkout totals, so this file is the single
// source of truth for them.
// The cap and the hoodie carry Jen's copy verbatim from the two product
// detail pages she designed. The other seven are written to match it: a short
// line that plays on shipping or flags, then the concrete product facts.
//
// Product names stay in our own house style (ToggleWear Cap, ToggleWear
// Hoodie) rather than Jen's, because her two are inconsistent with each other
// — "Two-tone LaunchDarkly Trucker Hat" next to plain "Hooded sweatshirt".
// Her product *facts* are kept, which is why the cap is a 5-panel here.
export const BEST_SELLERS: Product[] = [
  {
    slug: "togglewear-cap",
    name: "ToggleWear Cap",
    priceUsd: 32,
    description: "Structured 5-panel, adjustable snapback",
    image: "/images/products/cap-white-product.png",
    badge: "Limited Run",
    gallery: [
      "/images/products/cap-white-model-1.png",
      "/images/products/cap-white-model-2.png",
      "/images/products/cap-white-product.png",
    ],
    sizes: ONE_SIZE,
    defaultSize: "One size",
    colors: [COLORS.black, COLORS.blue, COLORS.orange, COLORS.cyan],
    detail:
      "Some releases you gate. This one you just wear. Our classic black-and-white trucker hat features a breathable mesh back, structured front panel, and the LaunchDarkly logo embroidered front and center — because good taste shouldn’t be feature-flagged.\n\nAdjustable snapback closure fits most heads.",
    features: [
      "Structured 5-panel front",
      "Breathable mesh back panels",
      "Embroidered LaunchDarkly logo",
      "Adjustable snapback closure",
    ],
  },
  {
    slug: "enamel-mug-set",
    name: "Enamel Mug Set",
    priceUsd: 28,
    description: "Two 12oz enamel mugs, black and white",
    image: "/images/products/mug-pair.png",
    badge: "Limited Run",
    gallery: [
      "/images/products/mug-pair.png",
      "/images/products/mug-black.png",
    ],
    sizes: ONE_SIZE,
    defaultSize: "One size",
    detail:
      "Two mugs, one for each environment. Heavy enamel over a steel core with a rolled rim, in matte black and off-white, each carrying the mark on the side. Chip-resistant enough for a desk that doubles as a workbench.\n\nHolds 12oz. Hand wash recommended.",
    features: [
      "12oz enamel over steel core",
      "Set of two, black and white",
      "Rolled rim, chip resistant",
      "Hand wash recommended",
    ],
  },
  {
    slug: "checkerboard-socks",
    name: "Checkerboard Socks",
    priceUsd: 18,
    description: "Mid-calf knit with cushioned sole",
    image: "/images/products/socks-worn.png",
    isNew: true,
    badge: "Limited Run",
    gallery: [
      "/images/products/socks-worn.png",
      "/images/products/socks-flat.png",
      "/images/products/socks-sandals.png",
    ],
    sizes: ["S/M", "L/XL"],
    defaultSize: "L/XL",
    detail:
      "Flags, but for your feet. A mid-calf checkerboard knit with a cushioned footbed and a ribbed cuff that actually stays up. Loud enough to notice, subtle enough for standup.\n\nTwo sizes cover most feet.",
    features: [
      "Mid-calf with ribbed cuff",
      "Cushioned footbed",
      "Combed cotton blend",
      "Checkerboard knit pattern",
    ],
  },
  {
    slug: "togglewear-hoodie",
    name: "ToggleWear Hoodie",
    priceUsd: 68,
    description: "Heavyweight cotton-blend fleece",
    image: "/images/products/hoodie-blue-model.png",
    isNew: true,
    badge: "Limited Run",
    gallery: [
      "/images/products/hoodie-blue-model.png",
      "/images/products/hoodie-rack.png",
      "/images/products/hoodie-colors.png",
    ],
    sizes: APPAREL_SIZES,
    defaultSize: "M",
    colors: [
      COLORS.blue,
      COLORS.black,
      COLORS.orange,
      COLORS.cyan,
      COLORS.pink,
      COLORS.grey,
    ],
    detail:
      "Comfort you can deploy anywhere. This midweight hoodie features a subtly embroidered LaunchDarkly logo on the front chest, a fleece-lined hood, and a fit that’s just as good for late-night ships as it is for lazy Sundays. Soft on the inside, sharp on the outside — no rollback needed.",
    features: [
      "Midweight fleece construction",
      "Embroidered LaunchDarkly logo on front chest",
      "Ribbed cuffs and hem",
      "Available in 6 colors",
    ],
  },
  {
    slug: "sticker-pack",
    name: "Sticker Pack",
    priceUsd: 12,
    description: "Five weatherproof vinyl stickers",
    image: "/images/products/stickers-laptop.png",
    badge: "Limited Run",
    gallery: [
      "/images/products/stickers-laptop.png",
      "/images/products/stickers-sheet.png",
    ],
    sizes: ONE_SIZE,
    defaultSize: "One size",
    detail:
      "Five stickers, zero config. Weatherproof vinyl with a matte laminate, sized for a laptop lid, a water bottle, or whatever else needs labelling. Peel, place, ship.\n\nDie-cut, two to three inches each.",
    features: [
      "Five weatherproof vinyl stickers",
      "Matte laminate finish",
      "Dishwasher and laptop safe",
      "Die-cut, 2 to 3 inches each",
    ],
  },
  {
    slug: "canvas-tote",
    name: "Canvas Tote",
    priceUsd: 24,
    description: "Heavy cotton canvas, 15L capacity",
    image: "/images/products/tote-canvas.png",
    badge: "Limited Run",
    gallery: ["/images/products/tote-canvas.png"],
    sizes: ONE_SIZE,
    defaultSize: "One size",
    detail:
      "Carries more than your dependencies. Heavy cotton canvas with reinforced straps and a boxed base that stands up on its own. Fits a 16-inch laptop, a change of clothes, and the rest of it.\n\n15L capacity with an interior slip pocket.",
    features: [
      "16oz cotton canvas",
      "Reinforced shoulder straps",
      "Boxed base, 15L capacity",
      "Interior slip pocket",
    ],
  },
  {
    slug: "bucket-hat",
    name: "Bucket Hat",
    priceUsd: 34,
    description: "Tie-dye cotton twill, one size",
    image: "/images/products/bucket-hat-model-1.png",
    isNew: true,
    badge: "Limited Run",
    gallery: [
      "/images/products/bucket-hat-model-1.png",
      "/images/products/bucket-hat-model-2.png",
    ],
    sizes: ONE_SIZE,
    defaultSize: "One size",
    detail:
      "A rollout you can wear. Tie-dyed cotton twill with a structured brim and an embroidered mark on the front panel. No two are dyed exactly alike, which is either a feature or a bug depending on your appetite for variance.\n\nAdjustable inner band fits most heads.",
    features: [
      "Tie-dyed cotton twill",
      "Structured 2.5-inch brim",
      "Embroidered front panel",
      "Adjustable inner band",
    ],
  },
  {
    slug: "water-bottle",
    name: "Water Bottle",
    priceUsd: 29,
    description: "32oz insulated with carry loop",
    image: "/images/products/bottle-black.png",
    badge: "Limited Run",
    gallery: [
      "/images/products/bottle-black.png",
      "/images/products/bottle-hand.png",
      "/images/products/bottle-model.png",
    ],
    sizes: ONE_SIZE,
    defaultSize: "One size",
    detail:
      "Stays cold through the longest incident. Double-walled stainless steel with a matte finish, a leakproof threaded lid, and a carry loop that clips to a bag. Thirty-two ounces, which is roughly one postmortem.\n\nCold for 24 hours, hot for 12.",
    features: [
      "32oz double-walled stainless steel",
      "Vacuum insulated, cold 24 hours",
      "Leakproof threaded lid",
      "Integrated carry loop",
    ],
  },
  {
    slug: "pool-float",
    name: "Pool Float",
    priceUsd: 42,
    description: "Oversized inflatable, ships flat",
    image: "/images/products/pool-float.png",
    badge: "Limited Run",
    gallery: ["/images/products/pool-float.png"],
    sizes: ONE_SIZE,
    defaultSize: "One size",
    detail:
      "Ship it straight to the deep end. An oversized inflatable in the shape of the mark, rated for one adult and welded to survive a whole summer of poolside standups.\n\nInflates in about two minutes and packs back down flat.",
    features: [
      "Oversized inflatable, 5 feet across",
      "Heavy-gauge welded seams",
      "Rapid-inflation valve",
      "Packs flat into a reusable bag",
    ],
  },
];

// Early access for Loyalty Gold members, which is the promise Jen's loyalty
// hero already makes: "first dibs on new merch — before it drops for everyone
// else." Her designs show the same catalogue to both personas, so this tier
// is ours rather than hers, built from product photography she shot but did
// not place on any screen.
export const MEMBERS_ONLY: Product[] = [
  {
    slug: "togglewear-crewneck",
    name: "ToggleWear Crewneck",
    priceUsd: 58,
    description: "Midweight fleece, no hood",
    image: "/images/products/crewneck-black-front.png",
    isNew: true,
    membersOnly: true,
    badge: "Early Access",
    gallery: [
      "/images/products/crewneck-black-front.png",
      "/images/products/crewneck-black-side.png",
    ],
    sizes: APPAREL_SIZES,
    defaultSize: "M",
    colors: [COLORS.black, COLORS.blue, COLORS.grey],
    detail:
      "The hoodie, shipped without the hood. Same midweight fleece and embroidered mark, cut a little cleaner for the days you need to look like you have it together.\n\nMembers see this one first.",
    features: [
      "Midweight fleece construction",
      "Embroidered LaunchDarkly logo on front chest",
      "Ribbed cuffs and hem",
      "Members-only colourway",
    ],
  },
];

export const ALL_PRODUCTS: Product[] = [...BEST_SELLERS, ...MEMBERS_ONLY];

export function productBySlug(slug: string) {
  return ALL_PRODUCTS.find((p) => p.slug === slug);
}

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

// Jen's loyalty variant leads with the hoodie, one of the NEW items, instead
// of the cap. The rest of her order is unchanged.
const LOYALTY_LEAD_SLUG = "togglewear-hoodie";

export function bestSellersFor(variant: PricingVariant): Product[] {
  if (variant === "default") return BEST_SELLERS;

  const lead = BEST_SELLERS.find((p) => p.slug === LOYALTY_LEAD_SLUG);
  const rest = lead
    ? [lead, ...BEST_SELLERS.filter((p) => p.slug !== LOYALTY_LEAD_SLUG)]
    : BEST_SELLERS;

  // Members-only items come first, ahead of Jen's lead item, so the early
  // access is the first thing a member sees.
  return [...MEMBERS_ONLY, ...rest];
}
