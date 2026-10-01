import SectionPanel from "@/components/layout/SectionPanel";
import ProductCard from "@/components/ui/ProductCard";
import { bestSellersFor, type PricingVariant } from "@/lib/products";

// Figma "item block" (63:3644 default, 67:4402 loyalty). Inside the panel the
// design uses 64px side padding, 75px top, 100px bottom, a 48px gap below the
// header, and a 4-column grid of 305px cards with 24px gutters
// (4*305 + 3*24 = 1292).
//
// Jen splits the eight cards across two frames with 48px between them; they
// render as one grid. The two variants differ only in card order and in
// whether member pricing is shown.
export default function BestSellers({
  variant = "default",
}: {
  variant?: PricingVariant;
}) {
  const products = bestSellersFor(variant);

  return (
    <SectionPanel>
      <div className="px-6 pb-16 pt-12 md:px-10 md:pb-20 md:pt-16 xl:px-16 xl:pb-[100px] xl:pt-[75px]">
        <header className="mb-12 flex items-end justify-between gap-6">
          <h2 className="font-sora text-h3 font-semibold text-grays-ld-black">
            Best sellers
          </h2>

          <a
            href="#"
            className="flex shrink-0 items-center gap-2 font-sohne text-small font-medium text-grays-ld-black"
          >
            View All Swag
            <img
              src="/icons/arrow-link.svg"
              alt=""
              width={15.619}
              height={11.714}
              className="max-w-none"
            />
          </a>
        </header>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              memberPricing={variant === "loyaltyGold"}
            />
          ))}
        </div>
      </div>
    </SectionPanel>
  );
}
