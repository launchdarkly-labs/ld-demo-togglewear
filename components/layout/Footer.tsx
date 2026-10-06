import { useState } from "react";
import Link from "next/link";

import { categoryHref } from "@/lib/products";

// Figma component "footer" (63:3649).
//
// The Shop column points at the listing page. In the Company column, Careers
// and Contact go to the real LaunchDarkly pages, since ToggleWear is a
// LaunchDarkly store and those are LaunchDarkly's to answer. About is ours and
// gets its own page; until it exists, a label with no href renders as plain
// text rather than as a link that does nothing.
//
// Jen's design has a fourth link, Wholesale, which is dropped: bulk and
// corporate swag has no page and no obvious owner, and the cart's help card
// already speaks to it. Three Company links reads as deliberate.
const LINK_COLUMNS: { heading: string; links: { label: string; href?: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "All Swag", href: categoryHref() },
      { label: "Apparel", href: categoryHref("apparel") },
      { label: "Accessories", href: categoryHref("accessories") },
      { label: "Tech", href: categoryHref("tech") },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About" },
      { label: "Careers", href: "https://launchdarkly.com/careers/" },
      { label: "Contact", href: "https://launchdarkly.com/contact-us/" },
    ],
  },
];

export default function Footer() {
  // Deliberately not persisted. Signing up again is how the demo gets shown
  // twice, and a reload is a cheaper way back to the form than a button that
  // unsubscribes you.
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="w-full border-t border-grays-02 bg-base-lime">
      <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-20 xl:px-16 xl:pb-[137px] xl:pt-[100px]">
        {/* The xl track widths are Jen's exact column widths; space-between then
            reproduces her 1440 gaps. Below xl the columns stack instead. */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-[280px_160px_160px_340px] xl:justify-between xl:gap-y-0">
          <div className="flex flex-col gap-9">
            <p className="font-sora text-h3 font-semibold text-grays-ld-black">
              ToggleWear
            </p>
            <p className="font-sohne text-small text-grays-04">
              Official swag for the ToggleWear community — sweatshirts, hats, tech
              accessories, and everyday merchandise.
            </p>
          </div>

          {LINK_COLUMNS.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-[19px]">
              <p className="font-sohne text-small font-medium text-grays-ld-black">
                {heading}
              </p>
              {links.map(({ label, href }) => {
                const className =
                  "font-sohne text-small text-grays-04 hover:text-grays-ld-black";

                if (!href) {
                  return (
                    <p key={label} className="font-sohne text-small text-grays-04">
                      {label}
                    </p>
                  );
                }

                // Off-site links open in a new tab on purpose: in a demo,
                // navigating the browser away from ToggleWear loses the thread
                // and costs a click to get back.
                return href.startsWith("http") ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    {label}
                  </a>
                ) : (
                  <Link key={label} href={href} className={className}>
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="flex flex-col gap-[30px]">
            <div className="flex flex-col gap-4">
              <p className="font-sohne text-small font-medium text-grays-ld-black">
                Newsletter
              </p>
              <p className="font-sohne text-small text-grays-04">
                Get new drops, restocks, and promo codes delivered to your inbox.
              </p>
            </div>

            {/* The confirmation takes the form's place and keeps its height,
                so the footer does not shift when it appears. type="email"
                plus required leaves the validation to the browser rather than
                inventing an error state Jen never drew. */}
            {subscribed ? (
              // min-h rather than h, and wrapping rather than truncating: the
              // column is 340px at its widest and a real address cut off
              // mid-domain reads as a bug rather than as a long email. The
              // check sits at the top so it stays level with the first line.
              <div className="flex min-h-11 w-full items-start gap-2">
                <img
                  src="/icons/check.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="mt-0.5 shrink-0 max-w-none"
                />
                <p className="min-w-0 break-words font-sohne text-small text-grays-ld-black">
                  You’re on the list — new drops go to {email} first.
                </p>
              </div>
            ) : (
              <form
                className="flex h-11 w-full items-center justify-between rounded-[10px] border border-grays-ld-black px-4 focus-within:ring-2 focus-within:ring-grays-ld-black focus-within:ring-offset-2 focus-within:ring-offset-base-lime"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubscribed(true);
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  aria-label="Email address"
                  className="w-full bg-transparent font-sohne text-small text-grays-ld-black placeholder:text-grays-04 focus:outline-none"
                />
                <button type="submit" aria-label="Subscribe" className="shrink-0">
                  <img src="/icons/arrow-right.svg" alt="" width={16} height={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
