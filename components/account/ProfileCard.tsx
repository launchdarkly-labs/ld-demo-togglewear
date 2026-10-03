import { PROFILE } from "@/lib/account";
import type { LoyaltyTier } from "@/lib/shopper";

// Figma "Profile Overview Card" (78:1512). This page uses a 12px radius
// throughout, not the 2px of the cart and checkout cards.
export default function ProfileCard({ tier }: { tier: LoyaltyTier }) {
  return (
    <section className="flex flex-col gap-5 rounded-[12px] bg-grays-white p-6">
      <div className="flex flex-col gap-[11px]">
        <p className="font-sohne text-h6 font-medium text-grays-ld-black">
          {PROFILE.name}
        </p>
        <p className="font-sohne text-xsmall text-grays-04">{PROFILE.email}</p>
      </div>

      {/* The badge is the one entitlement-driven thing in this card. A
          shopper without the tier has nothing to put here, so it goes rather
          than greying out. */}
      {tier === "gold" && (
        <div className="flex items-center gap-2 rounded-[6px] border border-grays-ld-black bg-base-lime px-3 py-2">
          <img
            src="/icons/shield-check.svg"
            alt=""
            width={16}
            height={16}
            className="shrink-0 max-w-none"
          />
          <p className="font-sohne text-xsmall-caps font-medium uppercase text-grays-ld-black">
            Loyal Gold Member
          </p>
        </div>
      )}

      <div className="h-px w-full bg-grays-hairline" />

      <div className="flex flex-col gap-3">
        {[
          ["Joined", PROFILE.joined],
          ["Region", PROFILE.region],
        ].map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <p className="font-sohne text-xsmall-caps font-medium uppercase text-grays-04">
              {label}
            </p>
            <p className="font-sohne text-small font-medium text-grays-ld-black">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
