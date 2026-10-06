import {
  filterLabel,
  productsFor,
  type PricingVariant,
  type Product,
} from "./products";

// Matches the things a shopper would actually type: the product name, the
// one-line description under it, and the category label — so "accessories"
// finds the mug set even though no product's own copy contains that word.
// "new" is folded in for anything carrying the New badge, since New Drops is
// a menu item people will type.
function haystack(product: Product) {
  return [
    product.name,
    product.description,
    filterLabel(product.category),
    product.isNew ? "new drops" : "",
  ]
    .join(" ")
    .toLowerCase();
}

// Starts from the persona's catalogue rather than the whole of it, so a
// non-member cannot find the members-only crewneck by typing its name. The
// listing page and the saved items list hold to the same rule.
export function searchProducts(
  variant: PricingVariant,
  query: string,
): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return productsFor(variant).filter((product) => {
    const text = haystack(product);
    // Every term has to match, so a second word narrows the results instead
    // of widening them — "new socks" should not return everything new.
    return terms.every((term) => text.includes(term));
  });
}
