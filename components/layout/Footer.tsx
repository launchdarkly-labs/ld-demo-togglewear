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
      <div className="mx-auto max-w-[1440px] px-16 pb-[137px] pt-[100px]">
        <div className="flex items-start justify-between">
          <div className="flex w-[280px] flex-col gap-9">
            <p className="font-sora text-h3 font-semibold text-grays-ld-black">
              ToggleWear
            </p>
            <p className="font-sohne text-small text-grays-04">
              Official swag for the ToggleWear community — sweatshirts, hats, tech
              accessories, and everyday merchandise.
            </p>
          </div>

          {LINK_COLUMNS.map(({ heading, links }) => (
            <div key={heading} className="flex w-40 flex-col gap-[19px]">
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

          <div className="flex w-[340px] flex-col gap-[30px]">
            <div className="flex flex-col gap-4">
              <p className="font-sohne text-small font-medium text-grays-ld-black">
                Newsletter
              </p>
              <p className="font-sohne text-small text-grays-04">
                Get new drops, restocks, and promo codes delivered to your inbox.
              </p>
            </div>

            <form
              className="flex h-11 w-full items-center justify-between rounded-[10px] border border-grays-ld-black px-4"
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
