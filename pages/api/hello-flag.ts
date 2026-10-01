import type { NextApiRequest, NextApiResponse } from "next";
import { init, type LDClient } from "@launchdarkly/node-server-sdk";

const FLAG_KEY = process.env.HELLO_FLAG_KEY ?? "hello-world";

// Starting the SDK is expensive and the client must outlive a single request,
// so it's cached on the module and shared across invocations.
let clientPromise: Promise<LDClient> | null = null;

function getClient(): Promise<LDClient> {
  if (!clientPromise) {
    const sdkKey = process.env.LD_SDK_KEY;
    if (!sdkKey) {
      return Promise.reject(new Error("LD_SDK_KEY is not set"));
    }
    const client = init(sdkKey);
    clientPromise = client
      .waitForInitialization({ timeout: 5 })
      .then(() => client);
  }
  return clientPromise;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const context = {
    kind: "user",
    key: "scaffold-check",
    anonymous: true,
  };

  try {
    const client = await getClient();
    const value = await client.variation(FLAG_KEY, context, false);
    res.status(200).json({ flagKey: FLAG_KEY, value, source: "launchdarkly" });
  } catch (err) {
    // An unset key or unreachable LaunchDarkly shouldn't break the page while
    // the project is still being built out.
    clientPromise = null;
    res.status(200).json({
      flagKey: FLAG_KEY,
      value: false,
      source: "fallback",
      reason: err instanceof Error ? err.message : String(err),
    });
  }
}
