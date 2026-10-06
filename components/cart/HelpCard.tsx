import { useSwagAssistant } from "@/components/ui/SwagAssistantProvider";

// Figma "help-card" (70:1481). Jen's heading reads "Need Help with your
// Build?", which is leftover copy from a non-retail context — the body text
// below it is about bulk sizes and swag deployments. Reworded to match.
export default function HelpCard() {
  const { open } = useSwagAssistant();

  return (
    <section className="flex flex-col gap-[18px] rounded-[2px] border border-grays-hairline p-6">
      <h2 className="font-sohne text-small font-medium text-grays-ld-black">
        Need help with your order?
      </h2>

      <p className="font-sohne text-xsmall text-grays-04">
        Our support engineers can assist with custom bulk sizes, corporate swag
        deployments, and member account inquiries.
      </p>

      {/* Support is the swag assistant — there is no ticket queue behind a
          demo — so this opens it rather than pointing at a contact page. */}
      <button
        type="button"
        onClick={open}
        className="flex w-fit items-center gap-1 font-sohne text-xsmall-caps font-medium uppercase text-accent-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2"
      >
        Contact Swag Support
        <img
          src="/icons/chevron-right.svg"
          alt=""
          width={12}
          height={12}
          className="shrink-0 max-w-none"
        />
      </button>
    </section>
  );
}
