import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PlacedOrder } from "@/lib/order";

// Holds the order that was just placed, so the confirmation page has
// something to show after checkout navigates to it.
//
// sessionStorage rather than localStorage: a receipt should survive a refresh
// but not come back tomorrow as though it were new.
const STORAGE_KEY = "togglewear.order";

type OrderApi = {
  order: PlacedOrder | null;
  // Null until the page has read storage, which matters on the confirmation
  // page — it has to tell "no order was placed" apart from "not checked yet"
  // or it flashes the empty state on every load.
  ready: boolean;
  place: (order: PlacedOrder) => void;
};

const OrderContext = createContext<OrderApi | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) setOrder(JSON.parse(saved) as PlacedOrder);
    } catch {
      // A corrupt entry just means no order to show.
    }
    setReady(true);
  }, []);

  const place = useCallback((placed: PlacedOrder) => {
    setOrder(placed);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(placed));
    } catch {
      // Private browsing throws; the order still works for this navigation.
    }
  }, []);

  return (
    <OrderContext.Provider value={{ order, ready, place }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const api = useContext(OrderContext);
  if (!api) throw new Error("useOrder must be used inside OrderProvider");
  return api;
}
