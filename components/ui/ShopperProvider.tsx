import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AnnouncementPersona } from "@/components/layout/AnnouncementBar";
import type { PricingVariant } from "@/lib/products";
import {
  tierForPersona,
  variantFor,
  type Shopper,
  type ShopperRole,
} from "@/lib/shopper";

// Who is shopping, held above the pages.
//
// Each page used to own this in its own useState, which meant the selection
// silently reset to Default on every navigation — pick Loyalty Gold on the
// homepage, click a product, and you were back to list prices. Owning it here
// is also what lets the switcher offer the two labels independently.
//
// This whole provider is scaffolding. When the LaunchDarkly client lands it
// becomes a thin wrapper over useLDClient and the setters go away.
const STORAGE_KEY = "togglewear.shopper";

type ShopperApi = {
  persona: AnnouncementPersona;
  setPersona: (persona: AnnouncementPersona) => void;
  role: ShopperRole;
  setRole: (role: ShopperRole) => void;
  shopper: Shopper;
  variant: PricingVariant;
};

const ShopperContext = createContext<ShopperApi | null>(null);

export function ShopperProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<AnnouncementPersona>("default");
  const [role, setRole] = useState<ShopperRole>("shopper");

  // Pages are prerendered, so storage can only be read after mount. Session
  // rather than local storage: a demo should open in a known state tomorrow.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        persona?: AnnouncementPersona;
        role?: ShopperRole;
      };
      if (parsed.persona) setPersona(parsed.persona);
      if (parsed.role) setRole(parsed.role);
    } catch {
      // A corrupt entry just leaves the defaults in place.
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ persona, role }),
      );
    } catch {
      // Private browsing throws; the selection still holds for the session.
    }
  }, [persona, role]);

  const loyaltyTier = tierForPersona(persona);

  return (
    <ShopperContext.Provider
      value={{
        persona,
        setPersona,
        role,
        setRole,
        shopper: { role, loyaltyTier },
        variant: variantFor(loyaltyTier),
      }}
    >
      {children}
    </ShopperContext.Provider>
  );
}

export function useShopper() {
  const api = useContext(ShopperContext);
  if (!api) throw new Error("useShopper must be used inside ShopperProvider");
  return api;
}
