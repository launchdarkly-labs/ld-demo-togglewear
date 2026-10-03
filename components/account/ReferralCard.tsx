import { useState } from "react";

import { REFERRAL } from "@/lib/account";

// Figma "Referrals Container" (78:1649).
//
// The left panel in Jen's file is a stock photo of two people in white tees
// over a purple gradient. The photo is a Pexels placeholder rather than
// ToggleWear art, so only the gradient is reproduced here — sampled from her
// render at #855ee7 to #5b67f5. Real art for this panel is a Jen ask.
export default function ReferralCard() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(REFERRAL.link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access needs a secure context and can be denied outright;
      // the link is on screen and selectable either way.
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-sohne text-h6 font-medium text-grays-ld-black">
        Share the Swag
      </h2>

      <div className="flex flex-col overflow-hidden rounded-[12px] bg-grays-ld-black lg:flex-row">
        <div className="h-40 shrink-0 bg-gradient-to-br from-[#855ee7] to-[#5b67f5] lg:h-auto lg:w-[320px]" />

        <div className="flex flex-1 flex-col justify-between gap-10 p-10">
          <div className="flex flex-col gap-5">
            <p className="font-sohne text-h4 font-medium text-grays-white">
              {REFERRAL.headline}
            </p>
            <p className="font-sohne text-small text-grays-03">
              {REFERRAL.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="min-w-0 flex-1 truncate rounded-[6px] bg-grays-06 px-4 py-3 font-sohne text-small text-grays-03">
              {REFERRAL.link}
            </p>
            <button
              type="button"
              onClick={copyLink}
              className="flex shrink-0 items-center justify-center gap-2 rounded-[6px] bg-base-lime px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-lime focus-visible:ring-offset-2 focus-visible:ring-offset-grays-ld-black"
            >
              <img
                src="/icons/copy.svg"
                alt=""
                width={16}
                height={16}
                className="shrink-0 max-w-none"
              />
              <span className="font-sohne text-small font-medium text-grays-ld-black">
                {copied ? "Copied" : "Copy Link"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
