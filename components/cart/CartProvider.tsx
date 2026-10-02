import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { lineId, type CartLine } from "@/lib/cart";

// Jen's cart is drawn with two items in it, and an empty cart is a poor first
// impression in a demo, so the cart starts seeded. Once persona comes from
// LaunchDarkly rather than page state this is what Cart Abandoner should key
// off — a pre-filled cart is that persona's whole premise.
const SEED: CartLine[] = [
  { slug: "togglewear-hoodie", size: "M", quantity: 1 },
  { slug: "enamel-mug-set", size: "One size", quantity: 1 },
];

const STORAGE_KEY = "togglewear.cart";

type CartApi = {
  lines: CartLine[];
  count: number;
  add: (slug: string, size: string, quantity?: number) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  remove: (slug: string, size: string) => void;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(SEED);

  // Every page is prerendered, so localStorage can only be read after mount —
  // reading it during render would make the server and client markup disagree.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setLines(JSON.parse(saved) as CartLine[]);
    } catch {
      // A corrupt or unavailable store just leaves the seed in place.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private browsing and full quotas both throw here; the cart still
      // works for the session.
    }
  }, [lines]);

  const add = useCallback((slug: string, size: string, quantity = 1) => {
    setLines((prev) => {
      const id = lineId(slug, size);
      const existing = prev.find((l) => lineId(l.slug, l.size) === id);
      if (existing) {
        return prev.map((l) =>
          lineId(l.slug, l.size) === id
            ? { ...l, quantity: l.quantity + quantity }
            : l
        );
      }
      return [...prev, { slug, size, quantity }];
    });
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    const id = lineId(slug, size);
    setLines((prev) => prev.filter((l) => lineId(l.slug, l.size) !== id));
  }, []);

  const setQuantity = useCallback(
    (slug: string, size: string, quantity: number) => {
      if (quantity < 1) {
        remove(slug, size);
        return;
      }
      const id = lineId(slug, size);
      setLines((prev) =>
        prev.map((l) =>
          lineId(l.slug, l.size) === id ? { ...l, quantity } : l
        )
      );
    },
    [remove]
  );

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, count, add, setQuantity, remove }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
