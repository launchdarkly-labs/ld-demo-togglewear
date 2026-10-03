import Link from "next/link";

import { useCart } from "./CartProvider";
import SummaryLines from "./SummaryLines";
import { type PricingVariant } from "@/lib/products";
import { cartTotals, resolveLines } from "@/lib/cart";

// Figma "summary-panel" (70:1448). The purple on the checkout button, the
// discount row and the FREE value is #A34FDE, which is not one of Jen's
// published colour variables — the cart is the only untokenized screen in her
// file. Kept as drawn pending her review.
//
// Only two things here are persona-driven: whether the discount row appears
// at all, and the figures it changes. The button is the same for everyone.
export default function OrderSummary({
  variant = "default",
}: {
  variant?: PricingVariant;
}) {
  const { lines } = useCart();
  const totals = cartTotals(resolveLines(lines), variant);

  return (
    <section className="flex flex-col gap-6 rounded-[2px] border border-grays-hairline bg-grays-white p-8">
      <h2 className="font-sohne text-h6 font-medium text-grays-ld-black">
        Order Summary
      </h2>

      <SummaryLines totals={totals} variant={variant} />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="cart-promo"
          className="font-sohne text-xsmall-caps font-medium uppercase text-grays-04"
        >
          Promo Code
        </label>
        <div className="flex h-10 items-center justify-between gap-2 rounded-[4px] border border-grays-hairline pl-3 pr-2">
          <input
            id="cart-promo"
            placeholder="Enter code"
            className="min-w-0 flex-1 bg-transparent font-sohne text-small text-grays-ld-black placeholder:text-grays-04 focus-visible:outline-none"
          />
          <button
            type="button"
            className="h-7 shrink-0 rounded-[2px] bg-grays-ld-black px-3 font-sohne text-xsmall-caps font-medium uppercase text-grays-white"
          >
            Apply
          </button>
        </div>
      </div>

      <Link
        href="/checkout"
        className="w-full rounded-[2px] bg-accent-purple py-4 text-center font-sohne text-large-medium font-medium text-grays-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2"
      >
        Continue to Checkout
      </Link>

      <div className="flex items-center justify-center gap-2">
        <img
          src="/icons/lock.svg"
          alt=""
          width={12}
          height={12}
          className="shrink-0 max-w-none"
        />
        <p className="font-sohne text-xsmall text-grays-04">
          Secure 256-bit SSL encrypted checkout
        </p>
      </div>
    </section>
  );
}
