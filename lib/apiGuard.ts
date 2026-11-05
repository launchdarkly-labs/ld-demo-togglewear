import { timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

// The gate in front of the storefront's own API routes: the ones that spend
// money on Bedrock (the AI features) and the ones that change the demo (the
// generators and Reset demo). Without it anyone on the internet could run up
// the Bedrock bill, start traffic generators or reset someone's demo mid-call.
//
// Three checks, in this order:
//
// 1. A rate limit per client address and per route, so one caller cannot
//    flood a route and the whole store has a ceiling whatever the caller.
//    Counted in this process, which is fine because each store runs one pod
//    (lib/generator/runner.ts relies on the same thing).
// 2. A shared key, DEMO_API_SECRET, that the browser sends as x-demo-key on
//    every guarded call. Each store has its own, made by the build and kept
//    in the pod's Kubernetes Secret, and the page fetches it from
//    /api/demo-key. It is the store's identity rather than a visitor's: a
//    visitor can read it from the page, and that is accepted. What it stops
//    is scanners and scripts that hit every *-togglewear host alike, other
//    sites making a visitor's browser call these routes (a custom header
//    needs a CORS preflight, which fails), and a key that leaks being good
//    for one store only, until that store's next rotation.
// 3. Body size, set per route as a bodyParser sizeLimit in its exported
//    config, and field lengths, checked by each route.
//
// Fails closed: a production store with no DEMO_API_SECRET answers 503 on
// every guarded route rather than serving them open. In development a
// missing key is allowed, with a warning, so npm run dev works out of the box.

export const DEMO_KEY_HEADER = "x-demo-key";

export type Limit = { perClient: number; total: number };

// Requests allowed per minute, per client address and in total per route.
export const LIMITS = {
  // One AI answer at a time per shopper, a few seconds each: 30 a minute is
  // more than a person presenting can click.
  ai: { perClient: 30, total: 120 },
  feedback: { perClient: 60, total: 240 },
  // Start/stop and status: the Cmd+K panel polls status once a second, but
  // that is a GET, which is not counted. Only POSTs are.
  control: { perClient: 20, total: 60 },
  // Each reset is a handful of LaunchDarkly API calls.
  reset: { perClient: 5, total: 10 },
  key: { perClient: 60, total: 600 },
} satisfies Record<string, Limit>;

const WINDOW_MS = 60_000;
// Above this many live windows, expired ones are swept on the next request.
const SWEEP_ABOVE = 10_000;

type Window = { count: number; resetAt: number };

// On globalThis so the dev server's module reloads keep the counts.
const scope = globalThis as typeof globalThis & { __togglewearRateWindows?: Map<string, Window> };
const windows = (scope.__togglewearRateWindows ??= new Map());

// Counts one request against key and answers with how many seconds until the
// window resets, or 0 when the request is within the limit.
function count(key: string, limit: number, now: number): number {
  if (windows.size > SWEEP_ABOVE) {
    for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
  }
  let window = windows.get(key);
  if (!window || window.resetAt <= now) {
    window = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(key, window);
  }
  window.count += 1;
  return window.count > limit ? Math.max(1, Math.ceil((window.resetAt - now) / 1000)) : 0;
}

// The address the request came from. The ingress sets X-Real-IP to the
// client's address; X-Forwarded-For is the fallback for other proxies, and
// the socket for a store run by hand.
export function clientAddress(req: NextApiRequest): string {
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real) return real.trim();
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

function demoKeyMatches(given: string | string[] | undefined, expected: string): boolean {
  if (typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

let warnedOpen = false;

// Whether this request may go on. When it may not, the request has been
// answered (429 over the limit, 503 with no key configured, 401 with a
// missing or wrong key) and the route returns without doing anything.
export function guard(
  req: NextApiRequest,
  res: NextApiResponse,
  route: string,
  limit: Limit,
  { auth = true }: { auth?: boolean } = {},
): boolean {
  const now = Date.now();
  const retry = Math.max(
    count(`${route}|${clientAddress(req)}`, limit.perClient, now),
    count(`${route}|*`, limit.total, now),
  );
  if (retry) {
    res.setHeader("Retry-After", String(retry));
    res.status(429).json({ error: "Too many requests. Try again in a moment." });
    return false;
  }
  if (!auth) return true;

  const expected = process.env.DEMO_API_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      res.status(503).json({ error: "This store has no demo key, so this route is closed." });
      return false;
    }
    if (!warnedOpen) {
      warnedOpen = true;
      console.warn("DEMO_API_SECRET is not set — the API routes are open (allowed outside production)");
    }
    return true;
  }
  if (!demoKeyMatches(req.headers[DEMO_KEY_HEADER], expected)) {
    res.status(401).json({ error: `Missing or wrong ${DEMO_KEY_HEADER} header` });
    return false;
  }
  return true;
}

// A string field of at most max characters, or null when the field is not a
// string or is too long. Too long is refused rather than cut, so a route
// never quietly works on half of what it was sent.
export function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.length <= max ? value : null;
}
