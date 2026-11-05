import type { NextApiRequest, NextApiResponse } from "next";
import { guard, LIMITS } from "@/lib/apiGuard";
import { isGeneratorId, type GeneratorStatus } from "@/lib/generator/catalog";
import {
  generatorStatuses,
  startGenerator,
  stopGenerator,
} from "@/lib/generator/runner";

export type GeneratorsResponse = { generators: GeneratorStatus[] };

// Next refuses a bigger body with 413 before the handler runs.
export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

// The Cmd+K panel's remote control. GET reads every generator's status; POST
// starts or stops one and answers with the statuses after.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeneratorsResponse | { error: string }>,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "POST") {
    if (!guard(req, res, "generators", LIMITS.control)) return;
    const { id, action } = req.body ?? {};
    if (!isGeneratorId(id) || (action !== "start" && action !== "stop")) {
      return res.status(400).json({ error: "Expected an id and start or stop" });
    }
    if (action === "start") await startGenerator(id);
    else stopGenerator(id);
  } else if (req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(200).json({ generators: generatorStatuses() });
}
