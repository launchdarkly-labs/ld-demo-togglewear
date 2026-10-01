// Figma component "footer" (63:3649).
const LINK_COLUMNS = [
  {
    heading: "Shop",
    links: ["All Swag", "Apparel", "Accessories", "Tech"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Wholesale", "Contact"],
  },
];

export default function Footer() {
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
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="font-sohne text-small text-grays-04"
                >
                  {link}
                </a>
              ))}
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

            <form
              className="flex h-11 w-full items-center justify-between rounded-[10px] border border-grays-ld-black px-4 focus-within:ring-2 focus-within:ring-grays-ld-black focus-within:ring-offset-2 focus-within:ring-offset-base-lime"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="w-full bg-transparent font-sohne text-small text-grays-ld-black placeholder:text-grays-04 focus:outline-none"
              />
              <button type="submit" aria-label="Subscribe" className="shrink-0">
                <img src="/icons/arrow-right.svg" alt="" width={16} height={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
