import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useShopper } from "@/components/ui/ShopperProvider";
import { savedSlugsFor } from "@/lib/account";

// The wishlist, shared between the product page's Add to Wishlist button and
// the account page's Saved Items list. Saved Items used to own the list in
// local state, which meant the button had nowhere to write to.
//
// Seeded for the same reason the cart is: Jen draws the saved list with two
// items in it, and an empty list is a poor first impression in a demo.
//
// One list per shopper, stored under each one's own key, so switching to
// Diane and saving something does not leave it on Alex's list.
const storageKey = (personId: string) => `togglewear.saved.${personId}`;

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
  const { shopperId } = useShopper();
  // The list remembers whose it is, so the effect that saves it writes to
  // that person's key and never to whoever has just been switched to.
  const [list, setList] = useState(() => ({
    owner: shopperId,
    slugs: savedSlugsFor(shopperId),
  }));

  // Every page is prerendered, so localStorage can only be read after mount —
  // reading it during render would make the server and client markup disagree.
  useEffect(() => {
    let slugs = savedSlugsFor(shopperId);
    try {
      const saved = window.localStorage.getItem(storageKey(shopperId));
      if (saved) slugs = JSON.parse(saved) as string[];
    } catch {
      // A corrupt or unavailable store just leaves the seed in place.
    }
    setList({ owner: shopperId, slugs });
  }, [shopperId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey(list.owner),
        JSON.stringify(list.slugs),
      );
    } catch {
      // Private browsing and full quotas both throw here; the list still
      // works for the session.
    }
  }, [list]);

  // For the one render between a switch and the effect above catching up,
  // show the new person's seed rather than the last person's list.
  const slugs =
    list.owner === shopperId ? list.slugs : savedSlugsFor(shopperId);

  const toggle = useCallback((slug: string) => {
    setList((prev) => ({
      ...prev,
      slugs: prev.slugs.includes(slug)
        ? prev.slugs.filter((s) => s !== slug)
        : // Prepended rather than appended, so whatever was just saved is at
          // the top of the account page instead of below Jen's two seeds.
          [slug, ...prev.slugs],
    }));
  }, []);

  const remove = useCallback((slug: string) => {
    setList((prev) => ({
      ...prev,
      slugs: prev.slugs.filter((s) => s !== slug),
    }));
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
