import type { LDClient } from "launchdarkly-react-client-sdk";
import type { DemoKeyResponse } from "@/pages/api/demo-key";

// Headers for the storefront's own API routes.
//
// x-ld-context is the context the browser was evaluated with, so a route
// evaluating a flag on the server sees the same shopper. x-demo-key is this
// store's demo key, which the guarded routes (lib/apiGuard.ts) refuse to run
// without. The key is fetched once per page load and kept; a fetch that
// failed is tried again on the next call.

let keyPromise: Promise<string> | null = null;

export function demoKey(): Promise<string> {
  keyPromise ??= fetch("/api/demo-key")
    .then(async (res) => (res.ok ? ((await res.json()) as DemoKeyResponse).key : ""))
    .catch(() => {
      keyPromise = null;
      return "";
    });
  return keyPromise;
}

export async function apiHeaders(client?: LDClient | null): Promise<Record<string, string>> {
  const key = await demoKey();
  return {
    ...(client ? { "x-ld-context": JSON.stringify(client.getContext()) } : {}),
    ...(key ? { "x-demo-key": key } : {}),
  };
}
