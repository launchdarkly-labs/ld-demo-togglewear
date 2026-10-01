import { type AnnouncementPersona } from "@/components/layout/AnnouncementBar";

const PERSONAS: { id: AnnouncementPersona; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "cartAbandon", label: "Cart Abandoner" },
  { id: "newCustomer", label: "New Customer" },
  { id: "loyaltyGold", label: "Loyalty Gold Member" },
];

// Temporary stand-in for flag evaluation so the personas are reviewable
// before the LaunchDarkly project is wired up. Shared by every page so the
// switch is reachable wherever you land.
export default function PersonaSwitcher({
  persona,
  onChange,
}: {
  persona: AnnouncementPersona;
  onChange: (persona: AnnouncementPersona) => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-grays-04 bg-grays-black-01 px-2 py-2 shadow-lg">
      <div className="flex items-center gap-1">
        <span className="px-3 font-sohne-mono text-xsmall-mono uppercase text-grays-03">
          Persona
        </span>
        {PERSONAS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-full px-3 py-1.5 font-sohne text-xsmall font-medium transition-colors ${
              persona === id
                ? "bg-base-lime text-grays-ld-black"
                : "text-grays-02 hover:bg-grays-04"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
