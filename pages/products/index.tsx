import { type GetServerSideProps } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionPanel from "@/components/layout/SectionPanel";
import ProductCard from "@/components/ui/ProductCard";
import SwagAssistant from "@/components/ui/SwagAssistant";
import PersonaSwitcher from "@/components/ui/PersonaSwitcher";
import { useShopper } from "@/components/ui/ShopperProvider";
import {
  CATEGORIES,
  categoryHref,
  filterLabel,
  parseFilter,
  productsFor,
  type ProductFilter,
} from "@/lib/products";

// The swag listing, which is where every Shop link in the header and the
// footer lands. Jen did not design it — there is no listing frame in the file
// — so it is assembled from the devices she did design: the inset white panel
// from SectionPanel, the four-column card grid and padding from the best
// sellers block, and the same type scale. Nothing new is introduced.
//
// All Swag first, then New Drops, then the three categories in the footer's
// order. New Drops is not a category; it reads isNew, which products in both
// categories carry.
const TABS: { filter?: ProductFilter; label: string }[] = [
  { label: "All Swag" },
  { filter: "new", label: "New Drops" },
  ...CATEGORIES.map(({ slug, label }) => ({ filter: slug, label })),
];

export default function ProductsPage({
  filter,
}: {
  filter: ProductFilter | null;
}) {
  const { persona, variant } = useShopper();

  const active = filter ?? undefined;
  const products = productsFor(variant, active);

  return (
    <>
      <Header persona={persona} />

      <SectionPanel>
        <div className="px-6 pb-16 pt-12 md:px-10 md:pb-20 md:pt-16 xl:px-16 xl:pb-[100px] xl:pt-[75px]">
          <header className="mb-12 flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
              <h1 className="font-sora text-h3 font-semibold text-grays-ld-black">
                {filterLabel(active)}
              </h1>
              <p className="shrink-0 font-sohne text-small text-grays-04">
                {products.length === 1 ? "1 item" : `${products.length} items`}
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-3 font-sohne text-small font-medium">
              {TABS.map(({ filter: tab, label }) => (
                <Link
                  key={label}
                  href={categoryHref(tab)}
                  aria-current={tab === active ? "page" : undefined}
                  className={
                    tab === active
                      ? "text-grays-ld-black underline decoration-2 underline-offset-[6px]"
                      : "text-grays-04"
                  }
                >
                  {label}
                </Link>
              ))}
            </nav>
          </header>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  memberPricing={variant === "loyaltyGold"}
                />
              ))}
            </div>
          ) : (
            // Tech has no products until the photography exists. Saying so is
            // better than hiding the link, which appears in both the header
            // and the footer and would otherwise go nowhere.
            <div className="flex flex-col items-start gap-4 py-16">
              <p className="font-sora text-h5 font-semibold text-grays-ld-black">
                Nothing here yet
              </p>
              <p className="max-w-[480px] font-sohne text-main text-grays-04">
                This drop is still in production. New swag lands every season —
                in the meantime, there is plenty else to wear.
              </p>
              <Link
                href={categoryHref()}
                className="mt-2 flex items-center gap-2 font-sohne text-small font-medium text-grays-ld-black"
              >
                Browse all swag
                <img
                  src="/icons/arrow-link.svg"
                  alt=""
                  width={15.619}
                  height={11.714}
                  className="max-w-none"
                />
              </Link>
            </div>
          )}
        </div>
      </SectionPanel>

      <Footer />

      <SwagAssistant />
      <PersonaSwitcher />
    </>
  );
}

// Server-rendered rather than static so the category is known on the first
// paint. Statically optimised, router.query is empty until hydration, which
// would show every product for a frame before narrowing to the category.
//
// Only the filter comes from the server. Which products that filter returns
// depends on the shopper's persona, which lives in client context, so the
// list itself is still worked out in the browser.
export const getServerSideProps: GetServerSideProps<{
  filter: ProductFilter | null;
}> = async ({ query }) => ({
  props: { filter: parseFilter(query.category) ?? null },
});
