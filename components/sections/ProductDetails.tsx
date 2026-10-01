import { useState } from "react";
import Image from "next/image";
import SectionPanel from "@/components/layout/SectionPanel";
import {
  formatPrice,
  memberPriceUsd,
  type PricingVariant,
  type Product,
} from "@/lib/products";

// Figma "product details" (70:1837 default, 70:1540 loyalty), which Jen
// annotated "personalized product details" in the file.
//
// Her two screens show different products, so almost everything that differs
// between them is product data. Only three things are actually persona-driven
// and they are handled here: the eyebrow label, the member price, and the
// Size Guide link.
//
// At 1440 the white panel uses 64px sides, 82px top, 100px bottom, a 64px
// column gap, and a fixed 610px details column with the gallery taking the
// rest. Below xl the two columns stack.
export default function ProductDetails({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: PricingVariant;
}) {
  const [size, setSize] = useState(product.defaultSize);
  const [colorIndex, setColorIndex] = useState(0);

  const isMember = variant === "loyaltyGold";
  const hasColors = (product.colors?.length ?? 0) > 1;

  return (
    <SectionPanel
      flushBottom
      className="bg-grays-white flex flex-col gap-10 px-6 pb-16 pt-12 md:px-10 md:pb-20 md:pt-16 xl:flex-row xl:gap-16 xl:px-16 xl:pb-[100px] xl:pt-[82px]"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {product.gallery.map((src, i) => (
          <div
            key={src}
            // The wells take the photos' own 620x880 shape rather than Jen's
            // 618x600, so the whole garment is visible. Her shorter well
            // forces a cover crop to discard a third of every frame, which
            // cuts heads off the model shots and zooms into the flat lays.
            // The tradeoff is a taller gallery — worth raising with her.
            //
            // The well colour is #e5e8e8, slightly lighter than her Gray 02
            // token. Kept literal so the panels match the file.
            className="relative aspect-[620/880] w-full shrink-0 overflow-hidden rounded-[4px] bg-[#e5e8e8]"
          >
            <Image
              src={src}
              alt={`${product.name}, view ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(min-width: 1280px) 618px, 100vw"
              // contain rather than cover: identical while the photos match
              // the well, but it letterboxes instead of cropping if one ever
              // does not.
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-10 xl:w-[610px] xl:shrink-0">
        <div className="flex flex-col gap-[35px]">
          <div className="flex items-center justify-between gap-4 text-small">
            <p className="font-sohne font-medium text-base-blue">
              {isMember ? "Members Only Swag Drop" : "Official Swag Drop"}
            </p>
            <p className="shrink-0 font-sohne text-grays-04">{product.badge}</p>
          </div>

          <h1 className="font-sora text-[32px] font-semibold leading-[1.05] tracking-[-1.6px] text-grays-ld-black md:text-h3">
            {product.name}
          </h1>

          {isMember ? (
            // Jen renders the member price in Base/Blue here, where the
            // homepage item block uses bold LD Black. Both are reproduced as
            // drawn rather than unified.
            <div className="flex items-start gap-[13px] font-sohne text-h6">
              <p className="text-grays-04 line-through">
                {formatPrice(product.priceUsd)}
              </p>
              <p className="font-medium text-base-blue">
                {formatPrice(memberPriceUsd(product.priceUsd))}
              </p>
            </div>
          ) : (
            <p className="font-sohne text-h6 font-medium text-grays-ld-black">
              {formatPrice(product.priceUsd)}
            </p>
          )}

          <div className="h-px w-full bg-grays-02" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="font-sohne text-small font-medium text-grays-ld-black">
              Select Size
            </p>
            {isMember && (
              <a
                href="#"
                className="shrink-0 font-sohne text-xsmall text-grays-04 underline"
              >
                Size Guide
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={s === size}
                className={`rounded-[2px] border px-5 py-3 font-sohne text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black focus-visible:ring-offset-2 ${
                  s === size
                    ? "border-grays-ld-black bg-grays-ld-black text-grays-white"
                    : "border-grays-02 text-grays-ld-black hover:border-grays-04"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {hasColors && (
          <div className="flex flex-col gap-3">
            <p className="font-sohne text-small font-medium text-grays-ld-black">
              Color
            </p>
            <div className="flex items-center gap-3">
              {product.colors?.map((c, i) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColorIndex(i)}
                  aria-label={c.name}
                  aria-pressed={i === colorIndex}
                  // The selected swatch gains an LD Black ring, which Jen
                  // draws as a stroke outside the circle.
                  className={`size-7 rounded-full transition-shadow ${
                    i === colorIndex
                      ? "ring-1 ring-grays-ld-black ring-offset-2"
                      : ""
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-04 focus-visible:ring-offset-2`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="w-full rounded-[2px] bg-grays-ld-black py-[18px] font-sohne text-large-medium font-medium text-grays-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black focus-visible:ring-offset-2"
          >
            Add to Cart
          </button>
          <button
            type="button"
            className="w-full rounded-[2px] border border-grays-02 py-[18px] font-sohne text-large-medium font-medium text-grays-ld-black transition-colors hover:border-grays-04 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black focus-visible:ring-offset-2"
          >
            Add to Wishlist
          </button>
        </div>

        <div className="flex flex-col gap-5 border-t border-grays-02 pt-6">
          <p className="font-sohne text-small font-medium text-grays-ld-black">
            Product Details
          </p>

          <div className="flex flex-col gap-6 font-sohne text-small text-grays-04">
            {product.detail.split("\n\n").map((para) => (
              <p key={para} className="whitespace-pre-line">
                {para}
              </p>
            ))}
            {product.features.map((f) => (
              <p key={f}>{`• ${f}`}</p>
            ))}
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
