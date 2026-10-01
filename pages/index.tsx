import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import BestSellers from "@/components/sections/BestSellers";
import QuoteBreak from "@/components/sections/QuoteBreak";
import DropPromo from "@/components/sections/DropPromo";
import SwagAssistant from "@/components/ui/SwagAssistant";
import PersonaSwitcher from "@/components/ui/PersonaSwitcher";
import { type PricingVariant } from "@/lib/products";
import { type AnnouncementPersona } from "@/components/layout/AnnouncementBar";

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
      <QuoteBreak />
      <DropPromo />
      <Footer />

      <SwagAssistant persona={persona} />
      <PersonaSwitcher persona={persona} onChange={setPersona} />
    </>
  );
}
