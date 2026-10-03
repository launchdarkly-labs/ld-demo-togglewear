// Figma "success-header" (75:1555). The one place in the whole build that
// uses the mono token for anything other than a label — Jen sets the order
// number in Söhne Mono and the cart purple, which reads as a receipt rather
// than body copy.
export default function SuccessHeader({
  firstName,
  orderRef,
}: {
  firstName: string;
  orderRef: string;
}) {
  return (
    <header className="flex flex-col items-center gap-6 border-b border-grays-hairline bg-grays-white px-6 pb-10 pt-[60px] md:px-10 xl:px-16">
      <div className="flex items-center justify-center rounded-full border border-grays-ld-black bg-base-lime p-2">
        <img
          src="/icons/check-large.svg"
          alt=""
          width={42}
          height={42}
          className="max-w-none"
        />
      </div>

      <div className="flex w-full max-w-[600px] flex-col items-center gap-[26px] text-center">
        <h1 className="font-sora text-h3 font-semibold text-grays-ld-black">
          Order Confirmed!
        </h1>
        <p className="font-sohne text-main text-grays-04">
          Thank you, {firstName}. Your ToggleWear pack is officially locked in.
        </p>
        <p className="font-sohne-mono text-xsmall-mono text-accent-purple">
          Order Number: #{orderRef}
        </p>
      </div>
    </header>
  );
}
