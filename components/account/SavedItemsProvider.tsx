import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SAVED_SLUGS } from "@/lib/account";

// The wishlist, shared between the product page's Add to Wishlist button and
// the account page's Saved Items list. Saved Items used to own the list in
// local state, which meant the button had nowhere to write to.
//
// Seeded for the same reason the cart is: Jen draws the saved list with two
// items in it, and an empty list is a poor first impression in a demo.
const STORAGE_KEY = "togglewear.saved";

type SavedItemsApi = {
  slugs: string[];
  has: (slug: string) => boolean;
  // One call for the product page, where the same button both saves and
  // unsaves, and aria-pressed carries the state.
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
};

const SavedItemsContext = createContext<SavedItemsApi | null>(null);

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>(SAVED_SLUGS);

  // Every page is prerendered, so localStorage can only be read after mount —
  // reading it during render would make the server and client markup disagree.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setSlugs(JSON.parse(saved) as string[]);
    } catch {
      // A corrupt or unavailable store just leaves the seed in place.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      // Private browsing and full quotas both throw here; the list still
      // works for the session.
    }
  }, [slugs]);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : // Prepended rather than appended, so whatever was just saved is at
          // the top of the account page instead of below Jen's two seeds.
          [slug, ...prev],
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return (
    <SavedItemsContext.Provider value={{ slugs, has, toggle, remove }}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const saved = useContext(SavedItemsContext);
  if (!saved)
    throw new Error("useSavedItems must be used inside SavedItemsProvider");
  return saved;
}
