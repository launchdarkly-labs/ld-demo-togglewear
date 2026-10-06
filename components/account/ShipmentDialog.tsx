import { createPortal } from "react-dom";

import { useDialog } from "@/components/ui/useDialog";
import type { PastOrder } from "@/lib/account";

// Opened by the one button on an order card, which says "Track package
// delivery" on a live shipment and "View delivery summary" on a delivered
// one. Both land here: what differs between them is how far down the list of
// events goes, not what the panel is.
//
// Same chrome as the size guide, which is the app's dialog precedent.
export default function ShipmentDialog({
  order,
  onClose,
}: {
  order: PastOrder;
  onClose: () => void;
}) {
  useDialog(onClose);

  // Every event listed has already happened, so the last one is where the
  // parcel is now and the only one worth drawing attention to.
  const latest = order.events.length - 1;

  return createPortal(
    <div
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-grays-ld-black/60 p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipment-heading"
        onClick={(event) => event.stopPropagation()}
        className="animate-drop-in flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-[30px] bg-grays-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 bg-grays-ld-black px-6 py-4">
          <span
            id="shipment-heading"
            className="font-geist text-[12px] font-semibold uppercase tracking-[1.2px] text-grays-01"
          >
            {order.ref}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shipment details"
            className="text-grays-03 transition-colors hover:text-grays-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </header>

        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-2">
            <p className="font-sohne text-xsmall-caps font-medium uppercase text-grays-04">
              {order.carrier}
            </p>
            {/* Mono, because a tracking number is a string to be read a
                character at a time rather than a phrase. */}
            <p className="font-sohne-mono text-xsmall-mono text-grays-ld-black">
              {order.tracking}
            </p>
          </div>

          <div className="h-px w-full bg-grays-hairline" />

          <ol className="flex flex-col">
            {order.events.map(({ label, on, where }, i) => (
              <li key={label} className="flex gap-4">
                {/* The rail: a dot per event and a line joining it to the
                    next, skipped on the last so the timeline ends rather
                    than trailing off. */}
                <div className="flex flex-col items-center">
                  <span
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                      i === latest ? "bg-accent-purple" : "bg-grays-02"
                    }`}
                  />
                  {i !== latest && (
                    <span className="w-px flex-1 bg-grays-02" />
                  )}
                </div>

                <div
                  className={`flex flex-col gap-1 ${
                    i === latest ? "" : "pb-6"
                  }`}
                >
                  <p
                    className={`font-sohne text-small ${
                      i === latest
                        ? "font-medium text-grays-ld-black"
                        : "text-grays-04"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="font-sohne text-xsmall text-grays-04">
                    {on} · {where}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>,
    document.body,
  );
}
