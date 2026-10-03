import { LOYALTY_DISCOUNT, type PricingVariant } from "@/lib/products";
import { formatMoney, type CartTotals } from "@/lib/cart";

// The four money rows and the total, drawn identically in the cart summary
// (70:1448) and the checkout summary (75:1471). Shared so the discount row
// cannot appear on one screen and not the other, and so the purple only has
// one home.
export default function SummaryLines({
  totals,
  variant,
  // "Total" while you can still change your mind, "Total Paid" on the
  // receipt.
  totalLabel = "Total",
}: {
  totals: CartTotals;
  variant: PricingVariant;
  totalLabel?: string;
}) {
  const isMember = variant === "loyaltyGold";

  return (
    <>
      <div className="flex w-full flex-col gap-4 font-sohne text-small">
        <div className="flex items-start justify-between gap-4">
          <p className="text-grays-04">Subtotal</p>
          <p className="font-medium text-grays-ld-black">
            {formatMoney(totals.subtotal)}
          </p>
        </div>

        {isMember && (
          <div className="flex items-start justify-between gap-4 text-accent-purple">
            <p>Loyalty Discount ({Math.round(LOYALTY_DISCOUNT * 100)}%)</p>
            <p className="font-medium">-{formatMoney(totals.discount)}</p>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <p className="text-grays-04">Shipping</p>
          <p className="font-medium text-accent-purple">FREE</p>
        </div>

        <div className="flex items-start justify-between gap-4">
          <p className="text-grays-04">Estimated Tax</p>
          <p className="font-medium text-grays-ld-black">
            {formatMoney(totals.tax)}
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-grays-hairline" />

      <div className="flex items-center justify-between gap-4">
        <p className="font-sohne text-main font-medium text-grays-ld-black">
          {totalLabel}
        </p>
        <p className="font-sohne text-h6 font-medium text-grays-ld-black">
          {formatMoney(totals.total)}
        </p>
      </div>
    </>
  );
}
