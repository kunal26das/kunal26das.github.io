#!/usr/bin/env python3
"""Build the portfolio using only Python's standard library.

Run `python3 scripts/build.py` from any directory. The generated dist/ directory
is replaced on every build. DOOM is copied from its separately built artifact;
the portfolio itself has no compilation step or package dependencies.
"""

import argparse
from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parents[1]
COMPATIBILITY_ASSETS = {
    "composeResources/io.github.kunal26das.resources/font/lora_semibold.ttf":
        "assets/fonts/lora-semibold.ttf",
    "composeResources/io.github.kunal26das.resources/drawable/yify_preview.jpg":
        "assets/images/yify-preview.jpg",
}


def build():
    source = ROOT / "site"
    doom = ROOT / "doom-dist"
    output = ROOT / "dist"

    # Validate inputs before replacing the previous build.
    for required in [source / "index.html", doom / "index.html"]:
        if not required.is_file():
            raise SystemExit(f"Missing build input: {required.relative_to(ROOT)}")
    for asset in COMPATIBILITY_ASSETS.values():
        if not (source / asset).is_file():
            raise SystemExit(f"Missing build input: site/{asset}")
    if (source / "doom").exists():
        raise SystemExit("site/doom must not shadow the separately built doom-dist/")

    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(source, output)
    shutil.copytree(doom, output / "doom")
    (output / ".nojekyll").touch()
    # Keep published asset URLs working for existing consumers and cached CSS.
    for old_path, source_path in COMPATIBILITY_ASSETS.items():
        destination = output / old_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source / source_path, destination)

    files = [path for path in output.rglob("*") if path.is_file()]
    print(f"Built {len(files)} files in {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    build()
