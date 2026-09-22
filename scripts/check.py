#!/usr/bin/env python3
"""Validate the built static site without installing Python packages.

Run after `python3 scripts/build.py`. Checks local links and fragments, CSS
assets, JSON/JSON-LD, feed and sitemap destinations, publisher verification,
legacy asset URLs, and the unchanged DOOM artifact. Use --check-js to also
syntax-check the portfolio's JavaScript with Node.js (never DOOM's bundle).
"""

import argparse
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import subprocess
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET

from build import COMPATIBILITY_ASSETS, PROJECT_ASSETS, ROOT, project_files


ORIGIN = "https://kunal26das.github.io"
# These routes belong to separate GitHub Pages repositories, not this artifact.
SEPARATE_PROJECTS = {"startup", "yify"}
CSS_URL = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.IGNORECASE)


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = []
        self.links = []
        self.json_blocks = []
        self.styles = []
        self.script_sources = []
        self._json = None
        self._style = None
        self.feed(path.read_text(encoding="utf-8"))
        self.close()

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("name"):
            self.ids.append(attrs["name"])
        for attribute in ("href", "src", "poster", "action"):
            if attrs.get(attribute):
                self.links.append(attrs[attribute])
        if attrs.get("srcset"):
            for candidate in attrs["srcset"].split(","):
                if candidate.strip():
                    self.links.append(candidate.strip().split()[0])
        if attrs.get("style"):
            self.styles.append(attrs["style"])
        if tag == "meta" and attrs.get("property") in {"og:image", "og:url"}:
            if attrs.get("content"):
                self.links.append(attrs["content"])
        if tag == "script":
            if attrs.get("src"):
                self.script_sources.append(attrs["src"])
            if attrs.get("type") == "application/ld+json":
                self._json = []
        if tag == "style":
            self._style = []

    def handle_data(self, data):
        if self._json is not None:
            self._json.append(data)
        if self._style is not None:
            self._style.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._json is not None:
            self.json_blocks.append("".join(self._json))
            self._json = None
        if tag == "style" and self._style is not None:
            self.styles.append("".join(self._style))
            self._style = None


def digest(path):
    return hashlib.sha256(path.read_bytes()).digest()


def check(check_js=False):
    output = ROOT / "dist"
    errors = []
    checked_links = 0
    if not (output / "index.html").is_file():
        raise SystemExit("No dist/index.html. Run python3 scripts/build.py first.")

    def fail(path, message):
        errors.append(f"{path.relative_to(output)}: {message}")

    pages = {path: Page(path) for path in sorted(output.rglob("*.html"))}

    def local_link(source, reference):
        nonlocal checked_links
        reference = reference.strip()
        if not reference or reference.startswith(("data:", "mailto:", "tel:")):
            return
        base = ORIGIN + "/" + source.relative_to(output).as_posix()
        url = urlsplit(urljoin(base, reference))
        if url.scheme not in {"http", "https"} or url.netloc != urlsplit(ORIGIN).netloc:
            return
        path = unquote(url.path).lstrip("/")
        first_component = path.split("/", 1)[0]
        if first_component in SEPARATE_PROJECTS:
            return
        target = output / path
        if target.is_dir():
            target = target / "index.html"
        checked_links += 1
        if not target.is_file():
            fail(source, f"missing local destination {reference}")
        elif url.fragment and target in pages:
            fragment = unquote(url.fragment)
            # Text fragments are browser search directives, not element IDs.
            fragment = fragment.split(":~:text=", 1)[0]
            if fragment and fragment not in pages[target].ids:
                fail(source, f"missing fragment {reference}")

    def css_links(source, css):
        for match in CSS_URL.finditer(css):
            reference = match.group(2).strip()
            if not reference.startswith("#"):
                local_link(source, reference)

    for path, page in pages.items():
        duplicates = [key for key, count in Counter(page.ids).items() if count > 1]
        if duplicates:
            fail(path, f"duplicate element IDs: {', '.join(duplicates)}")
        for link in page.links:
            local_link(path, link)
        for style in page.styles:
            css_links(path, style)
        for block in page.json_blocks:
            try:
                json.loads(block)
            except json.JSONDecodeError as error:
                fail(path, f"invalid JSON-LD: {error}")
        if path.relative_to(output).parts[0] != "doom":
            for source in page.script_sources:
                if "composeApp" in source or source.endswith(".wasm"):
                    fail(path, f"obsolete portfolio runtime: {source}")

    for path in sorted(output.rglob("*.css")):
        css_links(path, path.read_text(encoding="utf-8"))

    for path in sorted(output.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(output)
        if relative.parts[0] != "doom" and (
            path.suffix == ".wasm" or path.name == "composeApp.js"
        ):
            fail(path, "portfolio runtime must not be included")
        if path.suffix in {".json", ".webmanifest"}:
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                if path.suffix == ".webmanifest":
                    local_link(path, data["start_url"])
                    for icon in data.get("icons", []):
                        local_link(path, icon["src"])
            except (json.JSONDecodeError, KeyError) as error:
                fail(path, f"invalid JSON/manifest: {error}")

    xml_documents = {}
    for name in ("feed.xml", "sitemap.xml"):
        path = output / name
        try:
            document = ET.parse(path).getroot()
            xml_documents[name] = document
            for element in document.iter():
                tag = element.tag.rsplit("}", 1)[-1]
                if tag in {"link", "loc", "guid"} and element.text:
                    local_link(path, element.text.strip())
                if tag == "link" and element.get("href"):
                    local_link(path, element.get("href"))
        except (OSError, ET.ParseError) as error:
            fail(path, f"invalid or missing XML: {error}")

    if "feed.xml" in xml_documents and "sitemap.xml" in xml_documents:
        feed_links = [element.text for element in xml_documents["feed.xml"].findall("./channel/item/link")]
        sitemap_links = [element.text for element in xml_documents["sitemap.xml"].iter()
                         if element.tag.endswith("}loc")]
        if len(feed_links) != len(set(feed_links)):
            fail(output / "feed.xml", "duplicate article links")
        if len(sitemap_links) != len(set(sitemap_links)):
            fail(output / "sitemap.xml", "duplicate URLs")
        if ORIGIN + "/privacy/" not in sitemap_links:
            fail(output / "sitemap.xml", "portfolio privacy page is missing")
        for project in PROJECT_ASSETS:
            if ORIGIN + f"/{project}/" not in sitemap_links:
                fail(output / "sitemap.xml", f"{project} page is missing")
        for article in (output / "blog").glob("*/index.html"):
            url = ORIGIN + "/" + article.parent.relative_to(output).as_posix() + "/"
            if url not in feed_links:
                fail(output / "feed.xml", f"article missing from feed: {url}")
            if url not in sitemap_links:
                fail(output / "sitemap.xml", f"article missing from sitemap: {url}")

    for name in (".nojekyll", ".well-known/assetlinks.json", "app-ads.txt", "ads.txt",
                 "google03573044e28217e9.html", "robots.txt", "site.webmanifest", "privacy/index.html"):
        destination = output / name
        if not destination.is_file():
            fail(destination, "required publishing file is missing")
        elif name != ".nojekyll":
            source = ROOT / "site" / name
            if not source.is_file() or digest(source) != digest(destination):
                fail(destination, "publishing file differs from source")

    for old_path, new_path in COMPATIBILITY_ASSETS.items():
        destination = output / old_path
        source = output / new_path
        if not destination.is_file() or not source.is_file():
            fail(destination, "compatibility asset is missing")
        elif digest(destination) != digest(source):
            fail(destination, "compatibility asset differs from current asset")

    published_projects = project_files()
    for project in PROJECT_ASSETS:
        expected = {path for path in published_projects if path.parts[0] == project}
        actual = {path.relative_to(output) for path in (output / project).rglob("*")
                  if path.is_file()}
        if actual != expected:
            fail(output / project, "published files differ from project allowlist")
        for relative in expected & actual:
            if digest(published_projects[relative]) != digest(output / relative):
                fail(output / relative, "project asset differs from source")

    doom_source = ROOT / "doom-dist"
    doom_destination = output / "doom"
    source_files = {path.relative_to(doom_source) for path in doom_source.rglob("*") if path.is_file()}
    built_files = {path.relative_to(doom_destination) for path in doom_destination.rglob("*") if path.is_file()}
    if source_files != built_files:
        fail(doom_destination, "DOOM file list differs from doom-dist/")
    for relative in source_files & built_files:
        if digest(doom_source / relative) != digest(doom_destination / relative):
            fail(doom_destination / relative, "DOOM artifact was changed during build")
    for name in ("index.html", "composeApp.js", "composeResources/doom.composeapp.generated.resources/files/doom1.wad"):
        if not (doom_destination / name).is_file():
            fail(doom_destination / name, "required DOOM asset is missing")
    if not list(doom_destination.glob("*.wasm")):
        fail(doom_destination, "DOOM WebAssembly assets are missing")

    if check_js:
        node = shutil.which("node")
        if not node:
            errors.append("Node.js is required for --check-js")
        else:
            for path in sorted(path for path in output.rglob("*") if path.suffix in {".js", ".mjs"}):
                if path.relative_to(output).parts[0] == "doom":
                    continue
                result = subprocess.run([node, "--check", str(path)], capture_output=True, text=True)
                if result.returncode:
                    errors.append(f"{path.relative_to(ROOT)}: {result.stderr.strip()}")

    if errors:
        raise SystemExit("Static site checks failed:\n" + "\n".join(f"- {error}" for error in errors))
    print(f"Validated {len(pages)} HTML pages and {checked_links} local references; project assets and DOOM files are unchanged.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-js", action="store_true", help="also run Node.js syntax checks on published JavaScript, excluding DOOM")
    args = parser.parse_args()
    check(check_js=args.check_js)
