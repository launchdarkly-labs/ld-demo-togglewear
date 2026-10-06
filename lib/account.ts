import type { CartLine } from "./cart";

// The account page's data. Jen drew it for one person, Alex Rivera, a gold
// member, so these are her values with the products swapped for ones that
// actually exist in our catalogue — her order history lists a Two-tone
// Trucker Hat and prices the crewneck at $68 and the mug set at $32, none of
// which match what we sell.
export const PROFILE = {
  name: "Alex Rivera",
  email: "alex.rivera@launchdarkly.com",
  joined: "October 2024",
  region: "North America",
};

// FLAG: the tier ladder. The target is the obvious knob — dropping it to 800
// puts a member within reach of the next tier and changes the nudge copy
// underneath, without touching the points they have actually earned.
export const TIER = {
  points: 750,
  target: 1000,
  current: "Gold Member Drop",
  next: "Platinum Early Access",
};

// Every stage a parcel moves through, in order. Named once here rather than
// per order, so two orders cannot disagree about what the journey is and so
// the panel can show the stages an order has not reached yet without each
// order having to list the ones it is still waiting on.
export const SHIPMENT_STAGES = [
  "Order placed",
  "Packed at the warehouse",
  "In transit",
  "Delivered",
];

// One stage a parcel has already cleared, in stage order and starting from
// the first. A cleared stage knows its date and place; the stages still to
// come are filled in from SHIPMENT_STAGES and carry neither, which is how
// the panel shows the distance left without inventing a date for it.
export type ShipmentEvent = {
  label: string;
  on: string;
  where: string;
};

export type PastOrder = {
  ref: string;
  placedOn: string;
  status: string;
  lines: CartLine[];
  // Jen writes a different action per order: a live shipment gets tracking,
  // a delivered one gets a summary. Both open the same panel — the content
  // differs because the shipment does, not because the label does.
  action: string;
  carrier: string;
  tracking: string;
  // Where it is going. The waypoints in between only mean something once you
  // know the destination — Reno is either most of the way there or nowhere
  // near it, depending on where the parcel is headed.
  destination: string;
  // The estimate while a parcel is moving, the date it landed once it has
  // arrived. Carries a midday time rather than a bare date: a bare "2026-01-22"
  // parses as UTC midnight and then renders as the 21st anywhere west of
  // Greenwich, which is every machine this demo runs on.
  arrivesOn: string;
  events: ShipmentEvent[];
};

export const PAST_ORDERS: PastOrder[] = [
  {
    ref: "LD-928104",
    placedOn: "Placed on Mar 12, 2026",
    status: "In transit",
    lines: [{ slug: "togglewear-crewneck", size: "M", quantity: 1 }],
    action: "Track package delivery",
    carrier: "ToggleShip Standard",
    tracking: "TS4820193847US",
    destination: "Austin, TX",
    arrivesOn: "2026-03-17T12:00:00",
    events: [
      { label: "Order placed", on: "Mar 12", where: "Oakland, CA" },
      { label: "Packed at the warehouse", on: "Mar 13", where: "Oakland, CA" },
      { label: "In transit", on: "Mar 14", where: "Reno, NV" },
    ],
  },
  {
    ref: "LD-890312",
    placedOn: "Placed on Jan 18, 2026",
    status: "Delivered",
    lines: [
      { slug: "bucket-hat", size: "One size", quantity: 1 },
      { slug: "enamel-mug-set", size: "One size", quantity: 1 },
    ],
    action: "View delivery summary",
    carrier: "ToggleShip Standard",
    tracking: "TS4820188211US",
    destination: "Austin, TX",
    arrivesOn: "2026-01-22T12:00:00",
    events: [
      { label: "Order placed", on: "Jan 18", where: "Oakland, CA" },
      { label: "Packed at the warehouse", on: "Jan 19", where: "Oakland, CA" },
      { label: "In transit", on: "Jan 20", where: "Denver, CO" },
      { label: "Delivered, left at front door", on: "Jan 22", where: "Austin, TX" },
    ],
  },
];

// Jen's two saved items are a trucker hat we do not sell and the sticker
// pack, which we do. The bucket hat stands in for the hat.
export const SAVED_SLUGS = ["bucket-hat", "sticker-pack"];

export const REFERRAL = {
  link: "https://togglewear.com/refer/alex-rivera-ld-92",
  headline: "Give $20, Get $20",
  description:
    "Invite your team members to join ToggleWear. They'll get $20 USD off their first order, and you'll earn 150 loyalty points plus $20 USD credit once they checkout.",
};

export type Preference = {
  id: string;
  title: string;
  description: string;
  defaultOn: boolean;
  // The middle preference is the beta role under another name, so it drives
  // the shopper rather than a checkbox of its own. Flagged here so the
  // component does not have to special-case it by title.
  drivesBetaRole?: boolean;
};

export const PREFERENCES: Preference[] = [
  {
    id: "tier-notifications",
    title: "Loyalty Tier Notifications",
    description:
      "Get notified when you are close to earning a free seasonal merch drop.",
    defaultOn: true,
  },
  {
    id: "beta-access",
    title: "Feature Flag Beta Access",
    description:
      "Opt-in to test experimental co-branded swags before general rollout.",
    defaultOn: true,
    drivesBetaRole: true,
  },
  {
    id: "newsletter",
    title: "Monthly Swag Newsletter",
    description:
      "Receive drop alerts, custom community design updates, and behind-the-scenes engineering logs.",
    defaultOn: false,
  },
];
