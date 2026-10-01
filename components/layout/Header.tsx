import AnnouncementBar, { type AnnouncementPersona } from "./AnnouncementBar";

// Figma component "Top nav" (19:1783), instanced on all eight screens. The
// announcement bar is nested inside it in the design, so it composes here too.
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
  return (
    <header className="w-full">
      <AnnouncementBar persona={persona} />

      <div className="w-full bg-grays-black-01">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-16">
          <p className="font-sora text-[24px] font-bold leading-[1.1] tracking-[-0.48px] text-grays-white">
            ToggleWear
          </p>

          <nav className="flex items-center gap-8 font-sohne text-small font-medium">
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

          <div className="flex items-center gap-[25px]">
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
      </div>
    </header>
  );
}
