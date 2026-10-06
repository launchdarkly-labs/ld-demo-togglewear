import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { useSavedItems } from "@/components/account/SavedItemsProvider";
import { useShopper } from "@/components/ui/ShopperProvider";
import { formatPrice, productBySlug, type Product } from "@/lib/products";

// Figma "Saved Items Section" (78:1613).
//
// Jen's image wells are 390x280 landscape, because the photos she dropped in
// are landscape stock shots. Every real product photo we have is 620x880
// portrait, so a landscape well would either crop the garment in half or
// leave the product tiny between two wide grey margins. The wells here are
// 390x440 instead: taller than she drew, but the product fills them.
function SavedCard({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: () => void;
}) {
  const { add } = useCart();

  return (
    <article className="flex flex-col gap-4 rounded-[12px] bg-grays-white p-5">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[390/440] w-full overflow-hidden rounded-[8px] bg-grays-01 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 390px, 100vw"
          className="object-contain"
        />
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-[2px] border border-grays-ld-black bg-base-lime px-2.5 py-1.5 font-geist text-[10px] font-semibold uppercase tracking-[1px] text-grays-ld-black">
            New
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <p className="min-w-0 truncate font-sohne text-small font-medium text-grays-ld-black">
            {product.name}
          </p>
          <p className="shrink-0 font-sohne text-small font-medium text-grays-ld-black">
            {formatPrice(product.priceUsd)}
          </p>
        </div>
        <p className="font-sohne text-xsmall text-grays-04">
          {product.description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => add(product.slug, product.defaultSize)}
          className="flex flex-1 items-center justify-center gap-2 rounded-[4px] bg-grays-ld-black py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black focus-visible:ring-offset-2"
        >
          <img
            src="/icons/shopping-cart.svg"
            alt=""
            width={16}
            height={16}
            className="shrink-0 max-w-none brightness-0 invert"
          />
          <span className="font-sohne text-small font-medium text-grays-white">
            Add to cart
          </span>
        </button>
        <button
          type="button"
          aria-label={`Remove ${product.name} from saved items`}
          onClick={onRemove}
          className="shrink-0 rounded-[4px] border border-grays-hairline p-3"
        >
          <img
            src="/icons/trash.svg"
            alt=""
            width={16}
            height={16}
            className="max-w-none"
          />
        </button>
      </div>
    </article>
  );
}

export default function SavedItems() {
  const { slugs, remove } = useSavedItems();
  const { variant } = useShopper();

  // Hidden rather than removed, the same way the product page treats one
  // reached by slug: a members-only item saved while Gold stays on the list
  // and comes back when the persona does, but a non-member never sees it.
  const products = slugs.flatMap((slug) => {
    const product = productBySlug(slug);
    if (!product) return [];
    if (product.membersOnly && variant !== "loyaltyGold") return [];
    return product;
  });

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-sohne text-h6 font-medium text-grays-ld-black">
          Saved Items
        </h2>
        <p className="shrink-0 font-sohne text-xsmall text-grays-04">
          {products.length} {products.length === 1 ? "item" : "items"} in list
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((product) => (
            <SavedCard
              key={product.slug}
              product={product}
              onRemove={() => remove(product.slug)}
            />
          ))}
        </div>
      ) : (
        // Jen drew the list full. Removing both items is one click away, so
        // it needs something to land on.
        <div className="rounded-[12px] bg-grays-white p-6">
          <p className="font-sohne text-small text-grays-04">
            Nothing saved yet.{" "}
            <Link href="/" className="font-medium text-grays-ld-black underline">
              Browse the drop
            </Link>
            .
          </p>
        </div>
      )}
    </section>
  );
}
