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
PROJECT_ASSETS = {
    "games": (
        "index.html", "styles.css", "tetris", "flow", "chess", "tic-tac-toe",
        "LICENSE.txt", "NOTICE.txt",
    ),
    "2048": ("index.html", "styles.css", "js", "LICENSE.txt"),
    "resume": ("index.html",),
    "involute": (
        "index.html", "explorer.html", "styles.css", "theme.js", "geometry.js",
        "explorer.js", "og-image.jpg", "robots.txt", "sitemap.xml", "assets",
    ),
}


def project_files():
    """Return only publishable project files, excluding authoring/build tools."""
    files = {}
    for project, assets in PROJECT_ASSETS.items():
        source = ROOT / "projects" / project
        for asset in assets:
            path = source / asset
            if not path.exists():
                raise SystemExit(f"Missing build input: {path.relative_to(ROOT)}")
            for file in sorted(path.rglob("*")) if path.is_dir() else [path]:
                if file.is_file():
                    files[Path(project) / file.relative_to(source)] = file
    return files


def build():
    source = ROOT / "site"
    doom = ROOT / "doom-dist"
    output = ROOT / "dist"
    projects = project_files()

    # Validate inputs before replacing the previous build.
    for required in [source / "index.html", doom / "index.html"]:
        if not required.is_file():
            raise SystemExit(f"Missing build input: {required.relative_to(ROOT)}")
    for asset in COMPATIBILITY_ASSETS.values():
        if not (source / asset).is_file():
            raise SystemExit(f"Missing build input: site/{asset}")
    for route in ("doom", *PROJECT_ASSETS):
        if (source / route).exists():
            raise SystemExit(f"site/{route} must not shadow the separately managed /{route}/")

    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(source, output)
    shutil.copytree(doom, output / "doom")
    for relative, source_file in projects.items():
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_file, destination)
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
