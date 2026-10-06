import { useEffect } from "react";

// The behaviour every dialog in the app needs, shared so the size guide and
// the search overlay cannot drift apart: Escape closes it, the page behind
// does not scroll under it, and focus returns to whatever opened it so a
// keyboard user is not dropped at the top of the page.
//
// What to focus on open is left to each dialog, because they want different
// things — the search overlay wants its input, the size guide wants the panel.
export function useDialog(onClose: () => void) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [onClose]);
}
