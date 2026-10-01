// Figma component set "announcement-bar" (67:4838), one variant per persona.
// Jen's variant is spelled "Cart abondon"; the key here is corrected.
export type AnnouncementPersona =
  | "default"
  | "cartAbandon"
  | "newCustomer"
  | "loyaltyGold";

type Variant = {
  surface: string;
  message: string;
};

const VARIANTS: Record<AnnouncementPersona, Variant> = {
  default: {
    surface: "bg-base-lime text-grays-ld-black",
    message: "Free shipping on swag orders over $75 USD",
  },
  cartAbandon: {
    surface: "bg-base-orange text-grays-ld-black",
    message: "Good taste doesn't ship itself! Finish checking out.",
  },
  newCustomer: {
    surface: "bg-base-cyan text-grays-ld-black",
    message: "New customer, new perks: 15% off your first order. Use code WELCOME",
  },
  loyaltyGold: {
    surface: "bg-base-blue text-grays-white",
    message: "Loyalty status: activated. Enjoy early access and member-only pricing.",
  },
};

export default function AnnouncementBar({
  persona = "default",
}: {
  persona?: AnnouncementPersona;
}) {
  const { surface, message } = VARIANTS[persona];

  return (
    <div
      className={`flex w-full items-center justify-center px-6 py-[10px] ${surface}`}
      data-persona={persona}
    >
      <p className="text-center font-sohne-mono text-xsmall-mono">{message}</p>
    </div>
  );
}
