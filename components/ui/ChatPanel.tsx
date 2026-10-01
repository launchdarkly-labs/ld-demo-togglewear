import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatPrice, memberPriceUsd, type Product } from "@/lib/products";
import {
  SUGGESTED_PROMPTS,
  type ChatMessage,
} from "@/lib/swagAssistant";

// A compact version of the product card for use inside a chat bubble. The
// full ProductCard is built for a 305px grid column and is too tall here.
function ChatProduct({
  product,
  memberPricing,
}: {
  product: Product;
  memberPricing: boolean;
}) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 rounded-[12px] border border-grays-02 bg-grays-white p-2 transition-colors hover:border-grays-04"
    >
      {/* 40x56 rather than square, so the portrait photos are not cropped. */}
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-[2px] bg-grays-02">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-sohne text-small font-medium text-grays-ld-black">
          {product.name}
        </p>
        {memberPricing ? (
          <p className="font-sohne text-xsmall">
            <span className="text-grays-04 line-through">
              {formatPrice(product.priceUsd)}
            </span>{" "}
            <span className="font-bold text-grays-ld-black">
              {formatPrice(memberPriceUsd(product.priceUsd))}
            </span>
          </p>
        ) : (
          <p className="font-sohne text-xsmall text-grays-04">
            {formatPrice(product.priceUsd)}
          </p>
        )}
      </div>
    </a>
  );
}

// The expanded swag assistant. Jen designed only the collapsed launcher, so
// this panel is a proposal built from her tokens: the 30px panel radius, the
// 12px radius she uses on buttons, LD Black chrome, Base/Blue for the
// customer's own messages, and Geist for the uppercase label.
export default function ChatPanel({
  messages,
  memberPricing,
  onSend,
  onClose,
}: {
  messages: ChatMessage[];
  memberPricing: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  }

  return (
    <div
      role="dialog"
      aria-label="Swag Assistant"
      className="fixed bottom-[25px] right-[30px] z-40 flex h-[600px] max-h-[calc(100vh-50px)] w-[calc(100vw-60px)] max-w-[400px] flex-col overflow-hidden rounded-[30px] bg-grays-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 bg-grays-ld-black px-5 py-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/icons/ld-logo.svg"
            alt=""
            className="size-4 max-w-none brightness-0 invert"
          />
          <span className="font-geist text-[12px] font-semibold uppercase tracking-[1.2px] text-grays-01">
            Swag Assistant
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close swag assistant"
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

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4"
      >
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-2">
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] self-end rounded-[12px] bg-base-blue px-3 py-2 font-sohne text-small text-grays-white"
                  : "max-w-[85%] self-start rounded-[12px] bg-grays-01 px-3 py-2 font-sohne text-small text-grays-ld-black"
              }
            >
              {m.text}
            </div>

            {m.products && m.products.length > 0 && (
              <div className="flex max-w-[85%] flex-col gap-2 self-start">
                {m.products.map((p) => (
                  <ChatProduct
                    key={p.slug}
                    product={p}
                    memberPricing={memberPricing}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => submit(p)}
                className="rounded-full border border-grays-02 px-3 py-1.5 font-sohne text-xsmall text-grays-04 transition-colors hover:border-grays-ld-black hover:text-grays-ld-black"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        className="flex shrink-0 items-center gap-2 border-t border-grays-02 p-4"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about sizing, shipping, anything"
          aria-label="Message the swag assistant"
          className="h-10 min-w-0 flex-1 rounded-[10px] border border-grays-02 bg-grays-white px-3 font-sohne text-small text-grays-ld-black placeholder:text-grays-03 focus:border-grays-ld-black focus:outline-none"
        />

        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-grays-ld-black bg-base-lime text-grays-ld-black transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black focus-visible:ring-offset-2"
        >
          <img
            src="/icons/arrow-link.svg"
            alt=""
            width={15.619}
            height={11.714}
            className="max-w-none"
          />
        </button>
      </form>
    </div>
  );
}
