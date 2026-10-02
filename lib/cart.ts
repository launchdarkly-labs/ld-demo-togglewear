import {
  BEST_SELLERS,
  LOYALTY_DISCOUNT,
  productBySlug,
  type PricingVariant,
  type Product,
} from "./products";

// A line is stored by slug rather than by product object so the cart survives
// a catalogue edit, and keyed by slug plus size because the same product in
// two sizes is two lines.
export type CartLine = {
  slug: string;
  size: string;
  quantity: number;
};

export type ResolvedLine = CartLine & { product: Product };

export function lineId(slug: string, size: string) {
  return `${slug}__${size}`;
}

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((line) => {
    const product = productBySlug(line.slug);
    return product ? [{ ...line, product }] : [];
  });
}

// Jen's summary applies tax to the discounted subtotal rather than the gross:
// her $6.62 is 8% of $82.80, not of $92.00.
const TAX_RATE = 0.08;

export type CartTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};

export function cartTotals(
  lines: ResolvedLine[],
  variant: PricingVariant
): CartTotals {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.product.priceUsd * line.quantity,
    0
  );

  // The same 15% the product pages apply, so a member sees one rate across
  // the whole site rather than a per-item saving that stops adding up here.
  const discount = variant === "loyaltyGold" ? subtotal * LOYALTY_DISCOUNT : 0;

  // Jen shows FREE for both personas and leaves the "for Gold Members" caveat
  // to the estimator copy. Kept as a value rather than a literal zero because
  // it is a flag surface — the free-shipping threshold is the same kind of
  // knob as the free-gift threshold.
  const shipping = 0;

  const tax = (subtotal - discount) * TAX_RATE;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: subtotal - discount + shipping + tax,
  };
}

// formatPrice in products.ts omits cents because the catalogue is whole
// dollars. Cart arithmetic is not, so totals need their own formatter.
export function formatMoney(usd: number) {
  return `$${usd.toFixed(2)} USD`;
}

// The three slots in Jen's "Complete your look". This is the next flag
// surface after the free gift: an experiment can rotate which products fill
// the slots and measure what actually gets added. Holding it as one ordered
// list rather than three separate values means the slots cannot collide with
// each other or come back empty.
export const UPSELL_SLUGS = [
  "sticker-pack",
  "checkerboard-socks",
  "canvas-tote",
];

export function upsellsFor(
  inCart: string[],
  slugs: string[] = UPSELL_SLUGS
): Product[] {
  const held = new Set(inCart);
  const picked: Product[] = [];

  const consider = (product?: Product) => {
    if (!product) return;
    if (held.has(product.slug)) return;
    if (picked.some((p) => p.slug === product.slug)) return;
    picked.push(product);
  };

  slugs.forEach((slug) => consider(productBySlug(slug)));

  // Backfill cheapest-first so the row is always full. It will not be as soon
  // as a customer adds one of the named upsells, and a two-card row in a
  // three-column grid reads as a bug rather than a choice.
  [...BEST_SELLERS]
    .sort((a, b) => a.priceUsd - b.priceUsd)
    .forEach((product) => {
      if (picked.length < 3) consider(product);
    });

  return picked.slice(0, 3);
}
