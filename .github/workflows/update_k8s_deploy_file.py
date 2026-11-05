"""Fills the placeholders in deploy_files/deploy.yaml for one environment.

Reads NAMESPACE and IMAGE from the environment, as the workflows set them,
and rewrites the file in place. Plain string replacement in Python: nothing
here goes through a shell, so a value can only ever be text in the manifest.
The workflows check NAMESPACE against ^[a-z0-9-]+$ before this runs
(authorize.yaml), and this checks again, since the file it writes is applied
to the cluster.
"""

import os
import re
import sys

DEPLOY_FILE = "./.github/workflows/deploy_files/deploy.yaml"
ROOT_DOMAIN = "launchdarklydemos.com"
NAMESPACE_PATTERN = re.compile(r"^[a-z0-9-]{1,50}$")
# Registry host, repository and tag: nothing else belongs in an image name.
IMAGE_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]*:[A-Za-z0-9._-]{1,128}$")


def main():
    namespace = os.getenv("NAMESPACE", "")
    image = os.getenv("IMAGE", "")
    if not NAMESPACE_PATTERN.match(namespace):
        sys.exit(f"NAMESPACE {namespace!r} is not a plain lowercase name")
    if not IMAGE_PATTERN.match(image):
        sys.exit(f"IMAGE {image!r} is not a registry/repository:tag")

    replacements = {
        "placeholder1": namespace,                       # service name
        "placeholder2": f"{namespace}.{ROOT_DOMAIN}",    # host
        "placeholder3": namespace,                       # service the ingress points at
        "placeholder4": image,                           # container image
        "placeholder-tls-secret": f"{namespace}-tls-secret",
        "placeholder-project": namespace,                # LD_PROJECT_KEY, same as the namespace
    }

    with open(DEPLOY_FILE, encoding="utf-8") as f:
        text = f.read()
    for placeholder, value in replacements.items():
        text = text.replace(placeholder, value)
    with open(DEPLOY_FILE, "w", encoding="utf-8") as f:
        f.write(text)


if __name__ == "__main__":
    main()
