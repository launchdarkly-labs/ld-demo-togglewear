import type { LDClient } from "launchdarkly-react-client-sdk";
import { LDObserve } from "@launchdarkly/observability";

// Records a browser error that a flag caused, so it shows on that flag's
// Monitoring tab and not only under Errors.
//
// LaunchDarkly ties an error to a flag only when the flag was evaluated in the
// same trace. The browser plugin records each error, and each evaluation, as a
// trace of its own, so an error that comes after the flag is read (a page that
// crashes on what the catalog sent, a charge that fails at checkout) is tied to
// nothing. Evaluating the flag again inside one span, and recording the error
// inside the same span, puts both in one trace. The plugin records every
// evaluation, so this one is never dropped as a repeat of the first.
//
// Without a client, which only happens before LaunchDarkly has loaded, the
// error is still recorded, just not tied to the flag.
export function recordFlagError(
  client: LDClient | undefined,
  flagKey: string,
  error: Error,
  message: string,
  payload?: Record<string, string>,
) {
  if (!client) {
    LDObserve.recordError(error, message, payload);
    return;
  }
  LDObserve.startSpan(`${flagKey}.error`, () => {
    client.variation(flagKey, false);
    LDObserve.recordError(error, message, payload);
  });
}
