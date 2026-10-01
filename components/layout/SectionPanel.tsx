import { type ReactNode } from "react";

// The repeating page device in Jen's designs: a rounded content card inset
// 10px inside a full-bleed LD Black section. Measured off the "item block"
// frame — black at x=9, white at x=10 on all four sides, 30px corner radius.
// The hero's image panel uses the same 10px / 30px pairing.
//
// The 10px of black between two stacked panels is what reads as the gap
// separating the hero from the content below it.
// flushTop drops the top inset. The drop promo sits directly beneath the
// quote break, which is already full-bleed black with 120px of its own bottom
// padding, so Jen omits the 10px there.
export default function SectionPanel({
  children,
  className = "bg-grays-white",
  flushTop = false,
}: {
  children: ReactNode;
  className?: string;
  flushTop?: boolean;
}) {
  return (
    <section className="w-full bg-grays-ld-black">
      <div
        className={`mx-auto max-w-[1440px] px-2.5 pb-2.5 ${
          flushTop ? "" : "pt-2.5"
        }`}
      >
        <div className={`overflow-hidden rounded-[30px] ${className}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
