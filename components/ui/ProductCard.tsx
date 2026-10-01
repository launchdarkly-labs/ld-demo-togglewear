import Image from "next/image";
import { formatPrice, memberPriceUsd, type Product } from "@/lib/products";

// Figma "product-card" (19:1447) plus its "Item info" instance (19:1726).
// The image container is 305x440 in the design; the aspect ratio is kept so
// the card can narrow without distorting the photography.
export default function ProductCard({
  product,
  memberPricing = false,
}: {
  product: Product;
  memberPricing?: boolean;
}) {
  const { name, priceUsd, description, image, isNew } = product;

  return (
    <article className="flex flex-col gap-4">
      <div className="relative aspect-[305/440] w-full overflow-hidden rounded-[2px] bg-grays-02">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1280px) 305px, (min-width: 1024px) 33vw, 50vw"
          className="object-cover"
        />

        {isNew && (
          <span className="absolute left-4 top-4 rounded-[2px] border border-grays-ld-black bg-base-lime px-2.5 py-1.5 font-geist text-[10px] font-semibold uppercase tracking-[1px] text-grays-ld-black">
            New
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex w-full items-start justify-between gap-3 text-small">
          <p className="min-w-0 flex-1 truncate font-sohne font-medium text-grays-ld-black">
            {name}
          </p>

          {memberPricing ? (
            // Figma 67:4719 — original struck through in Gray 04, member price
            // in Sohne Dreiviertelfett (700), 4px apart.
            <div className="flex shrink-0 items-center gap-1">
              <p className="font-sohne text-grays-04 line-through">
                {formatPrice(priceUsd)}
              </p>
              <p className="font-sohne font-bold text-grays-ld-black">
                {formatPrice(memberPriceUsd(priceUsd))}
              </p>
            </div>
          ) : (
            <p className="shrink-0 font-sohne text-grays-ld-black">
              {formatPrice(priceUsd)}
            </p>
          )}
        </div>
        <p className="font-sohne text-xsmall text-grays-04">{description}</p>
      </div>
    </article>
  );
}
