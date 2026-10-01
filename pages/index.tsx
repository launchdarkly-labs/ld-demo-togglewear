import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import BestSellers from "@/components/sections/BestSellers";
import { type PricingVariant } from "@/lib/products";
import { type AnnouncementPersona } from "@/components/layout/AnnouncementBar";

const PERSONAS: { id: AnnouncementPersona; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "cartAbandon", label: "Cart Abandoner" },
  { id: "newCustomer", label: "New Customer" },
  { id: "loyaltyGold", label: "Loyalty Gold Member" },
];

// Jen designed two variants of the hero and the item block: default and
// Loyal Gold Member. Cart Abandoner and New Customer have no art of their own
// yet, so they fall back to default while keeping their own announcement bar.
const VARIANT_BY_PERSONA: Record<AnnouncementPersona, PricingVariant> = {
  default: "default",
  cartAbandon: "default",
  newCustomer: "default",
  loyaltyGold: "loyaltyGold",
};

export default function Home() {
  const [persona, setPersona] = useState<AnnouncementPersona>("default");

  return (
    <>
      <Header persona={persona} />
      <Hero variant={VARIANT_BY_PERSONA[persona]} />
      <BestSellers variant={VARIANT_BY_PERSONA[persona]} />
      <Footer />

      {/* Temporary stand-in for flag evaluation so the personas are reviewable
          before the LaunchDarkly project is wired up. */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-grays-04 bg-grays-black-01 px-2 py-2 shadow-lg">
        <div className="flex items-center gap-1">
          <span className="px-3 font-sohne-mono text-xsmall-mono uppercase text-grays-03">
            Persona
          </span>
          {PERSONAS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPersona(id)}
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
    </>
  );
}
