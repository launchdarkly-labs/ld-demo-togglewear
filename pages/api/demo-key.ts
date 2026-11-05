import type { NextApiRequest, NextApiResponse } from "next";
import { guard, LIMITS } from "@/lib/apiGuard";

export type DemoKeyResponse = { key: string };

// Hands the browser this store's demo key, which it sends back as x-demo-key
// on every guarded API call (lib/apiGuard.ts says what that does and does
// not protect). Empty when the store has none, which lib/api.ts treats as
// "send no header".
// Next refuses a bigger body with 413 before the handler runs.
export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

export default function handler(req: NextApiRequest, res: NextApiResponse<DemoKeyResponse | { error: string }>) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!guard(req, res, "demo-key", LIMITS.key, { auth: false })) return;
  res.status(200).json({ key: process.env.DEMO_API_SECRET ?? "" });
}
