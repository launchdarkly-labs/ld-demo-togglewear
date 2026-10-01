import { BEST_SELLERS, type Product } from "@/lib/products";
import { type AnnouncementPersona } from "@/components/layout/AnnouncementBar";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  products?: Product[];
};

// Everything below is scripted. It stands in for the swag assistant's AI
// Config (`ai-config--swag-assistant`), which controls the model, prompt and
// tool set once the LaunchDarkly project is provisioned. The shape is what
// matters: a reply is text plus an optional set of recommended products, which
// is what a catalog tool call would return.

const GREETINGS: Record<AnnouncementPersona, string> = {
  default:
    "Hey — I'm the ToggleWear swag assistant. Tell me what you're after, or I can show you what's moving right now.",
  cartAbandon:
    "Welcome back. You left a few things in your cart — want me to pick up where you left off, or find you something better?",
  newCustomer:
    "First time here? Good timing. I can help you find your first fit, and your 15% off code is WELCOME.",
  loyaltyGold:
    "Good to see you again. Member pricing is already applied, and I can show you the new drops before they go public.",
};

export const SUGGESTED_PROMPTS = [
  "What's new this week?",
  "Help me pick a hoodie",
  "What's good under $30?",
];

export function greetingFor(persona: AnnouncementPersona): ChatMessage {
  return { id: "greeting", role: "assistant", text: GREETINGS[persona] };
}

function bySlug(...slugs: string[]) {
  return slugs
    .map((s) => BEST_SELLERS.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p));
}

// Matched in order, so the narrower intents come first. "new" is broad
// enough to swallow a question like "I'm new here, got hoodies?", which is
// why it sits last.
//
// Every pattern is anchored with \b. Without it the short words match inside
// unrelated ones — "hat" inside "what", "cap" inside "capacity", "ship"
// inside "relationship" — which made almost any question starting with
// "what" come back with hats.
const REPLIES: { match: RegExp; text: string; products: Product[] }[] = [
  {
    match: /\b(hoodies?|sweatshirts?|crewnecks?|warm)\b/i,
    text: "The hoodie is heavyweight cotton-blend fleece and runs true to size. If you want something lighter, the crewneck is the same fabric without the hood.",
    products: bySlug("togglewear-hoodie"),
  },
  {
    match: /\b(hats?|caps?|beanie|head)\b/i,
    text: "Two options depending on how much sun you're dealing with.",
    products: bySlug("togglewear-cap", "bucket-hat"),
  },
  {
    // "small" is deliberately absent — it is a sizing word, not a budget one.
    match: /\b(under \$?(30|25|20)|cheap|budget|gift)\b/i,
    text: "Here's what's under $30 — the sticker pack is the usual add-to-cart.",
    products: BEST_SELLERS.filter((p) => p.priceUsd < 30).slice(0, 3),
  },
  {
    match: /\b(ship\w*|deliver\w*|returns?|exchanges?)\b/i,
    text: "Shipping is free on orders over $75, and anything unworn can go back within 30 days.",
    products: [],
  },
  {
    match: /\b(new|newest|drops?|dropped|latest|just in)\b/i,
    text: "These just landed. The socks and the bucket hat are moving fastest.",
    products: BEST_SELLERS.filter((p) => p.isNew),
  },
];

export function replyTo(input: string): ChatMessage {
  const hit = REPLIES.find((r) => r.match.test(input));

  return {
    id: `reply-${Date.now()}`,
    role: "assistant",
    text:
      hit?.text ??
      "I can help with sizing, shipping, or finding something specific. In the meantime, these two are our best sellers.",
    products: hit ? hit.products : bySlug("togglewear-hoodie", "togglewear-cap"),
  };
}
