import { useState } from "react";
import AnnouncementBar, { type AnnouncementPersona } from "./AnnouncementBar";

// Figma component "Top nav" (19:1783), instanced on all eight screens. The
// announcement bar is nested inside it in the design, so it composes here too.
// Jen designed desktop only; below lg the links move into a menu panel.
const NAV_LINKS = [
  { label: "New Drops", href: "#", active: true },
  { label: "Apparel", href: "#", active: false },
  { label: "Tech", href: "#", active: false },
];

export default function Header({
  persona = "default",
  cartCount = 0,
}: {
  persona?: AnnouncementPersona;
  cartCount?: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full">
      <AnnouncementBar persona={persona} />

      <div className="w-full bg-grays-black-01">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:px-10 xl:px-16">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="text-grays-white lg:hidden"
            >
              {/* The design has no menu icon, since it stops at desktop width. */}
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d={menuOpen ? "M4 4l12 12M16 4L4 16" : "M3 6h14M3 10h14M3 14h14"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>

            <p className="font-sora text-[24px] font-bold leading-[1.1] tracking-[-0.48px] text-grays-white">
              ToggleWear
            </p>
          </div>

          <nav className="hidden items-center gap-8 font-sohne text-small font-medium lg:flex">
            {NAV_LINKS.map(({ label, href, active }) => (
              <a
                key={label}
                href={href}
                className={active ? "text-grays-white" : "text-grays-02"}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5 md:gap-[25px]">
            <button type="button" aria-label="Search">
              <img src="/icons/magnify.svg" alt="" width={17.2632} height={17.2632} />
            </button>
            <button type="button" aria-label="Account">
              <img src="/icons/person.svg" alt="" width={19.8947} height={19.8947} />
            </button>
            <button
              type="button"
              aria-label={`Cart, ${cartCount} items`}
              className="flex items-center"
            >
              <img
                src="/icons/shopping-cart.svg"
                alt=""
                width={19.8947}
                height={19.8947}
              />
              <span className="font-sohne text-small font-medium text-grays-white">
                ({cartCount})
              </span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-grays-04 lg:hidden">
            <div className="mx-auto flex max-w-[1440px] flex-col px-6 py-2 font-sohne text-small font-medium md:px-10">
              {NAV_LINKS.map(({ label, href, active }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-3 ${active ? "text-grays-white" : "text-grays-02"}`}
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
