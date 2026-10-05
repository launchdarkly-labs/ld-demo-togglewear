import { useFlags } from "launchdarkly-react-client-sdk";

import { TIER } from "@/lib/account";

// Figma "Loyalty Progress Card" (78:1529).
//
// The fill below is lime, which is a decision rather than a reading of the
// design: Jen's "Progress Fill" layer is sized correctly at 249 of 332px —
// exactly the 75% that 750 of 1000 points comes to — but she never gave it a
// colour, so her bar renders as a flat grey track. Lime is what the badge
// above it and the gift icon below it both use.
export default function TierStatusCard() {
  const { giftUnlockTeaser } = useFlags();
  const pct = Math.min(100, Math.round((TIER.points / TIER.target) * 100));
  const remaining = Math.max(0, TIER.target - TIER.points);

  return (
    <section className="flex flex-col gap-[29px] overflow-hidden rounded-[12px] bg-grays-ld-black p-6">
      <h2 className="font-sohne text-xsmall-caps font-medium uppercase text-grays-white">
        Swag Tier Status
      </h2>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          {/* Not one of Jen's named type styles, so it stays a literal. */}
          <p className="font-sora text-[48px] font-bold leading-[normal] text-grays-white">
            {TIER.points}
          </p>
          <p className="font-sohne text-main font-medium text-grays-03">
            / {TIER.target} pts
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div
            role="progressbar"
            aria-valuenow={TIER.points}
            aria-valuemin={0}
            aria-valuemax={TIER.target}
            aria-label={`${TIER.points} of ${TIER.target} points toward ${TIER.next}`}
            className="h-2 w-full overflow-hidden rounded-[4px] bg-grays-06"
          >
            {/* Driven off the points rather than Jen's fixed 249px, so
                changing the target moves the bar. */}
            <div
              className="h-full rounded-[4px] bg-base-lime"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-start justify-between gap-4 font-sohne text-xsmall">
            <p className="text-grays-03">{TIER.current}</p>
            <p className="text-grays-white">{TIER.next}</p>
          </div>
        </div>
      </div>

      {/* Prerequisite-gated on the Swag Tier Program flag, so it cannot be
          reached unless the card around it is live.
          #222222 is not a published variable — it sits between LD Black and
          Gray 06, and this strip is the only place Jen uses it. */}
      {giftUnlockTeaser && (
        <div className="flex items-center gap-2 rounded-[6px] bg-[#222222] p-3">
          <img
            src="/icons/gift.svg"
            alt=""
            width={24}
            height={24}
            className="shrink-0 max-w-none"
          />
          <p className="font-sohne text-xsmall text-grays-white">
            You&rsquo;re {remaining} points away from unlocking your next
            exclusive gift!
          </p>
        </div>
      )}
    </section>
  );
}
