import { addressLine, formatDeliveryDate, type ShipTo } from "@/lib/order";

// Figma "delivery-info-card" (75:1565). The grey strip is the same one the
// cart's estimator uses, with a second line for the date.
export default function DeliveryCard({
  shipTo,
  deliveryBy,
}: {
  shipTo: ShipTo;
  deliveryBy: string;
}) {
  return (
    <section className="flex flex-col gap-6 rounded-[2px] border border-grays-hairline bg-grays-white p-8">
      <h2 className="font-sohne text-h6 font-medium text-grays-ld-black">
        Delivery Estimate &amp; Destination
      </h2>

      <div className="flex items-center gap-4 rounded-[4px] bg-grays-01 p-3">
        <img
          src="/icons/truck.svg"
          alt=""
          width={24}
          height={24}
          className="shrink-0 max-w-none"
        />
        <div className="flex flex-col gap-1">
          <p className="font-sohne text-small text-grays-ld-black">
            <span className="font-semibold">
              Standard shipping (3-5 business days):
            </span>{" "}
            <span className="font-semibold text-accent-purple">FREE</span>{" "}
            <span className="font-semibold">for Gold Members</span>
          </p>
          <p className="font-sohne text-small text-grays-04">
            Estimated Delivery: {formatDeliveryDate(deliveryBy)}
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-grays-hairline" />

      <div className="flex flex-col gap-2">
        <p className="font-sohne text-xsmall-caps font-medium uppercase text-grays-04">
          Ship to
        </p>
        <p className="font-sohne text-small font-medium text-grays-ld-black">
          {shipTo.name}
        </p>
        <p className="font-sohne text-small text-grays-04">
          {addressLine(shipTo)}
        </p>
      </div>
    </section>
  );
}
