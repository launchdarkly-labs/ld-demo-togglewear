import type { NextApiRequest, NextApiResponse } from "next";
import { guard, LIMITS } from "@/lib/apiGuard";
import { resetConfigured, resetDemo, type ResetResult } from "@/lib/demoReset";

export type DemoResetResponse = { configured: boolean; results?: ResetResult[] };

// Next refuses a bigger body with 413 before the handler runs.
export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

// The Reset demo button in Under the hood. GET says whether this environment
// has a reset key at all (one built before the button does not); POST runs
// the reset and answers with what happened to each flag and config.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DemoResetResponse | { error: string }>,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") return res.status(200).json({ configured: resetConfigured() });
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!guard(req, res, "demo-reset", LIMITS.reset)) return;
  if (!resetConfigured()) return res.status(200).json({ configured: false });

  res.status(200).json({ configured: true, results: await resetDemo() });
}
