import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ShipmentDialog from "@/components/account/ShipmentDialog";
import { PAST_ORDERS, type PastOrder } from "@/lib/account";
import { formatMoney, resolveLines } from "@/lib/cart";

// Figma "Order History Section" (78:1555). The status and the action are the
// only things that differ between Jen's two cards, so one component covers
// both.
function OrderCard({ order }: { order: PastOrder }) {
  const lines = resolveLines(order.lines);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <article className="flex flex-col gap-5 rounded-[12px] bg-grays-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-6">
          <p className="font-sohne text-small font-medium text-grays-ld-black">
            {order.ref}
          </p>
          <p className="font-sohne text-xsmall text-grays-04">
            {order.placedOn}
          </p>
        </div>
        <p className="shrink-0 font-sohne text-xsmall-caps font-medium uppercase text-grays-04">
          {order.status}
        </p>
      </div>

      <div className="h-px w-full bg-grays-hairline" />

      <div className="flex flex-col gap-4">
        {lines.map((line) => (
          <div
            key={`${line.slug}__${line.size}`}
            className="flex items-center gap-4"
          >
            {/* 64x80 against a 620x880 photo, so contain rather than cover —
                same reason as the product detail gallery. */}
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[4px] bg-grays-01">
              <Image
                src={line.product.image}
                alt={line.product.name}
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link
                href={`/products/${line.slug}`}
                className="truncate font-sohne text-small font-medium text-grays-ld-black hover:underline"
              >
                {line.product.name}
              </Link>
              <p className="font-sohne text-xsmall text-grays-04">
                {line.product.description} / {line.size}
              </p>
            </div>

            <p className="shrink-0 font-sohne text-small font-medium text-grays-ld-black">
              {formatMoney(line.product.priceUsd * line.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-grays-hairline" />

      {/* Jen sets this in Base Blue rather than the cart's purple, which is
          the only blue link on the site. */}
      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        className="flex items-center gap-2 self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grays-ld-black focus-visible:ring-offset-2"
      >
        <img
          src="/icons/truck.svg"
          alt=""
          width={24}
          height={24}
          className="shrink-0 max-w-none"
        />
        <span className="font-sohne text-small text-base-blue hover:underline">
          {order.action}
        </span>
      </button>

      {detailOpen && (
        <ShipmentDialog order={order} onClose={() => setDetailOpen(false)} />
      )}
    </article>
  );
}

export default function OrderHistory() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-sohne text-h6 font-medium text-grays-ld-black">
        Order History
      </h2>
      {PAST_ORDERS.map((order) => (
        <OrderCard key={order.ref} order={order} />
      ))}
    </section>
  );
}
