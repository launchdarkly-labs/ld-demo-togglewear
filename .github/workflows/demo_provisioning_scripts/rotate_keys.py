"""rotate_keys — gives an existing ToggleWear environment fresh keys.

For the Redeploy workflow, which rebuilds a store's image and pod without
rebuilding its LaunchDarkly project. Every key the old image carried is
replaced, so an image already in the registry opens nothing:

- The production environment's server-side SDK key is reset. The old one keeps
  working for GRACE_MINUTES, long enough for the new pod to take over, then
  stops.
- The store's reset key (the service token behind Reset demo) is deleted and
  made again, exactly as DemoBuilder makes it.

The client-side ID is read too, for the build; it is public by design and is
not rotated.

Reads LD_API_KEY and LD_PROJECT_KEY. Writes LD_CLIENT_KEY, LD_SDK_KEY and
LD_RESET_TOKEN to GITHUB_ENV, masked first because the Actions log is public.
"""

import os
import sys
import time

import LDPlatform
from DemoBuilder import DemoBuilder

BASE = "https://app.launchdarkly.com/api/v2"
ENVIRONMENT = "production"
GRACE_MINUTES = 30


def mask(value):
    # GitHub only reads a command at the start of a line.
    print(f"\n::add-mask::{value}", flush=True)


def main():
    api_key = os.environ["LD_API_KEY"]
    project_key = os.environ["LD_PROJECT_KEY"]
    github_env = os.getenv("GITHUB_ENV")

    ld = LDPlatform.LDPlatform(api_key, None, None)
    ld.project_key = project_key
    headers = {"Authorization": api_key, "LD-API-Version": "20240415"}

    env_url = f"{BASE}/projects/{project_key}/environments/{ENVIRONMENT}"
    res = ld.getrequest("GET", env_url, headers=headers)
    if not res.ok:
        sys.exit(f"Could not read {project_key}'s {ENVIRONMENT} environment (HTTP {res.status_code})")
    client_id = res.json()["_id"]

    print("Resetting the SDK key", end="...")
    expiry = int((time.time() + GRACE_MINUTES * 60) * 1000)
    res = ld.getrequest("POST", f"{env_url}/apiKey?expiry={expiry}", headers=headers)
    if not res.ok:
        sys.exit(f"Could not reset the SDK key (HTTP {res.status_code}): {res.text[:200]}")
    sdk_key = res.json()["apiKey"]
    print("Done")

    print("Replacing the store's reset key", end="...")
    reset_token = ld.create_reset_token(ENVIRONMENT, DemoBuilder.RESET_CHANGES)
    print("Done" if reset_token else "Failed; the store's Reset demo button will say to reset by hand")

    for value in (sdk_key, client_id, reset_token):
        if value:
            mask(value)
    if not github_env:
        sys.exit("GITHUB_ENV is not set")
    with open(github_env, "a") as f:
        f.write(f"LD_CLIENT_KEY={client_id}\n")
        f.write(f"LD_SDK_KEY={sdk_key}\n")
        f.write(f"LD_RESET_TOKEN={reset_token or ''}\n")


if __name__ == "__main__":
    main()
