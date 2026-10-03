import { useCart } from "@/components/cart/CartProvider";
import { useShopper } from "@/components/ui/ShopperProvider";
import { ROLES } from "@/lib/shopper";
import { type AnnouncementPersona } from "@/components/layout/AnnouncementBar";

const PERSONAS: { id: AnnouncementPersona; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "cartAbandon", label: "Cart Abandoner" },
  { id: "newCustomer", label: "New Customer" },
  { id: "loyaltyGold", label: "Loyalty Gold Member" },
];

// Temporary stand-in for flag evaluation so the shopper is reviewable before
// the LaunchDarkly project is wired up. Shared by every page so the switch is
// reachable wherever you land, and it reads the provider rather than taking
// props so no page has to thread it through.
//
// Two rows because they are two independent things: the top row is what a
// shopper is doing, the bottom row is what they are allowed to see. Picking
// across both is how you get a gold member who is also a beta tester.
export default function PersonaSwitcher() {
  const { persona, setPersona, role, setRole } = useShopper();
  const { reset } = useCart();

  const pill = (selected: boolean) =>
    `rounded-full px-3 py-1.5 font-sohne text-xsmall font-medium transition-colors ${
      selected
        ? "bg-base-lime text-grays-ld-black"
        : "text-grays-02 hover:bg-grays-04"
    }`;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-1 rounded-3xl border border-grays-04 bg-grays-black-01 p-2 shadow-lg">
      <div className="flex items-center gap-1">
        <span className="w-16 px-3 font-sohne-mono text-xsmall-mono uppercase text-grays-03">
          Doing
        </span>
        {PERSONAS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPersona(id)}
            className={pill(persona === id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <span className="w-16 px-3 font-sohne-mono text-xsmall-mono uppercase text-grays-03">
          Access
        </span>
        {ROLES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setRole(id)}
            className={pill(role === id)}
          >
            {label}
          </button>
        ))}

        {/* Placing an order empties the cart, which would otherwise leave the
            flow undemoable a second time. This puts the two seeded items
            back. */}
        <button
          type="button"
          onClick={reset}
          className="ml-auto rounded-full border border-grays-04 px-3 py-1.5 font-sohne text-xsmall font-medium text-grays-02 transition-colors hover:bg-grays-04"
        >
          Reset cart
        </button>
      </div>
    </div>
  );
}
