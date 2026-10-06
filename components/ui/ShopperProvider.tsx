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
  DEFAULT_SHOPPER_ID,
  isNewCustomer,
  shopperById,
  variantFor,
  type LoyaltyTier,
  type Person,
  type Shopper,
  type ShopperRole,
} from "@/lib/shopper";

// Who is shopping, held above the pages.
//
// Each page used to own this in its own useState, which meant the selection
// silently reset to Default on every navigation — pick Loyalty Gold on the
// homepage, click a product, and you were back to list prices.
//
// What is held is now a person's id rather than a loose set of labels. The
// labels are derived from the person instead of being picked beside them,
// which is what stops the app from being able to represent a shopper who does
// not exist: there is no longer a way to be a gold member with no order
// history unless someone in SHOPPERS is one.
const STORAGE_KEY = "togglewear.shopper";

type ShopperApi = {
  person: Person;
  shopperId: string;
  setShopperId: (id: string) => void;
  // Normally the person's own role. The setter is the escape hatch for
  // demonstrating a combination the roster does not contain — Diane as a beta
  // tester, say — and it is where the account page's control writes to.
  role: ShopperRole;
  setRole: (role: ShopperRole) => void;
  tier: LoyaltyTier;
  shopper: Shopper;
  variant: PricingVariant;
  // Which announcement bar to show. Derived rather than chosen, because the
  // two state-shaped bars describe something true about a shopper rather than
  // a mode the demo is in.
  persona: AnnouncementPersona;
};

const ShopperContext = createContext<ShopperApi | null>(null);

export function ShopperProvider({ children }: { children: ReactNode }) {
  const [shopperId, setShopperIdState] = useState(DEFAULT_SHOPPER_ID);
  const [roleOverride, setRoleOverride] = useState<ShopperRole | null>(null);

  // Pages are prerendered, so storage can only be read after mount. Session
  // rather than local storage: a demo should open in a known state tomorrow.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        shopperId?: string;
        roleOverride?: ShopperRole | null;
      };
      if (parsed.shopperId) setShopperIdState(parsed.shopperId);
      if (parsed.roleOverride) setRoleOverride(parsed.roleOverride);
    } catch {
      // A corrupt entry just leaves the defaults in place.
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ shopperId, roleOverride }),
      );
    } catch {
      // Private browsing throws; the selection still holds for the session.
    }
  }, [shopperId, roleOverride]);

  // Switching person drops any override. Carrying it across would make
  // picking Chris and then Diane quietly leave you shopping as a developer,
  // which is the kind of thing nobody notices until a flag behaves oddly.
  function setShopperId(id: string) {
    setShopperIdState(id);
    setRoleOverride(null);
  }

  const person = shopperById(shopperId);
  const role = roleOverride ?? person.role;
  const tier = person.tier;

  const persona: AnnouncementPersona =
    tier !== "none"
      ? "loyaltyGold"
      : isNewCustomer(person)
        ? "newCustomer"
        : "default";

  return (
    <ShopperContext.Provider
      value={{
        person,
        shopperId,
        setShopperId,
        role,
        setRole: setRoleOverride,
        tier,
        shopper: { role, loyaltyTier: tier },
        variant: variantFor(tier),
        persona,
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
