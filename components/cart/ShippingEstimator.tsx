// Figma "shipping-estimator" (70:1399). The fields are real inputs so the
// panel is usable in a demo, but nothing recalculates from them yet — the
// estimate line is the same copy Jen wrote.
export default function ShippingEstimator() {
  return (
    <section className="flex flex-col gap-5 rounded-[2px] border border-grays-hairline bg-grays-white p-8">
      <h2 className="font-sohne text-h6 font-medium text-grays-ld-black">
        Delivery Estimates
      </h2>

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label
            htmlFor="cart-country"
            className="font-sohne text-xsmall-caps font-medium uppercase text-grays-04"
          >
            Country
          </label>
          <input
            id="cart-country"
            defaultValue="United States"
            className="h-11 w-full rounded-[4px] border border-grays-hairline px-4 font-sohne text-small text-grays-ld-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label
            htmlFor="cart-zip"
            className="font-sohne text-xsmall-caps font-medium uppercase text-grays-04"
          >
            Postal / ZIP Code
          </label>
          <input
            id="cart-zip"
            defaultValue="10001"
            inputMode="numeric"
            className="h-11 w-full rounded-[4px] border border-grays-hairline px-4 font-sohne text-small text-grays-ld-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-[4px] bg-grays-01 p-3">
        <img
          src="/icons/truck.svg"
          alt=""
          width={24}
          height={24}
          className="shrink-0 max-w-none"
        />
        <p className="font-sohne text-small text-grays-ld-black">
          Standard shipping (3-5 business days):{" "}
          <span className="font-semibold text-accent-purple">FREE</span> for
          Gold Members
        </p>
      </div>
    </section>
  );
}
