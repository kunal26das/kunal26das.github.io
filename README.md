# kunal26das.github.io

My personal portfolio and engineering notebook at **https://kunal26das.github.io**.

The website is plain HTML, CSS and JavaScript. It has no framework, package installation,
Kotlin compiler, Gradle build or application server. The homepage and articles remain readable
without JavaScript; small scripts handle themes, navigation, repository filters, the sorting
demonstration and reading tools.

## Structure

```text
site/                    Website source, published at the domain root
  index.html             Homepage, project directory and contact details
  home.css, home.js      Homepage styles and interactions
  assets/                Fonts, font license and project screenshot
  blog/                  Blog index, shared styles/scripts and article pages
  multidex/              Multidex landing page
  feed.xml, sitemap.xml  RSS and search discovery
  .well-known/           Android Digital Asset Links
  app-ads.txt, ads.txt    Publisher verification
scripts/
  build.py               Assemble dist/ without compiling the website
  check.py               Validate the assembled site
doom-dist/              Prebuilt DOOM, updated by its own repository's CI
```

## Preview locally

Python 3 is the only requirement to build and preview:

```bash
python3 scripts/build.py
python3 scripts/check.py
python3 -m http.server 8080 --directory dist
```

Open **http://localhost:8080**. After editing files in `site/`, run the build again and reload
the page. For quick work on the portfolio alone, serve `site/` directly. `/doom/` and legacy
asset aliases are included in the assembled `dist/` preview.

The `/involute/`, `/resume/`, `/startup/` and `/yify/` project sites are deployed independently;
their root-relative links resolve on the live GitHub Pages domain, not this local server.

## Check and deploy

```bash
python3 scripts/build.py
python3 scripts/check.py --check-js
```

Python checks the assembled pages, local links and anchors, assets, discovery files and
required deployment files. Node is used only to check JavaScript syntax; it is not a build or
runtime dependency for the website. There are no npm packages to install.

Pull requests targeting `master` run these checks. A push to `master`, or a manual run of
`.github/workflows/deploy.yml`, also publishes `dist/` to GitHub Pages. Only the deployment job
has Pages and identity-token write permissions. The artifact includes hidden verification
files and only the website output, never repository configuration or local caches.

`doom-dist/` is copied unchanged to `/doom/`. It is produced by `kunal26das/doom` and can still
use Kotlin independently; do not edit its generated files in this repository.

## Editing content

- **Articles:** add `site/blog/<slug>/index.html`, then update the blog index, homepage article
  list, `feed.xml` and `sitemap.xml`.
- **Projects and profile:** edit `site/index.html`. There is no second Kotlin copy to maintain.
- **Design:** shared typography, colors, header and theme behavior live in `site/blog/blog.css`
  and `site/blog/blog.js`; homepage-specific styles and interactions live in `home.css` and
  `home.js`. Preserve keyboard access, mobile layouts and reduced-motion support.

## Compatibility

Page URLs, article anchors and query links remain valid. Old `?view=interactive` and
`?view=html` links now show the current portfolio. The former Compose interface was removed;
its source remains in Git history before this migration.

The build preserves the previous Lora semibold font and Yify screenshot addresses under
`/composeResources/io.github.kunal26das.resources/` for older cached pages. New pages use
`/assets/` URLs. These compatibility files do not load a Compose runtime.

## Assets

Lora is bundled under the SIL Open Font License in `site/assets/fonts/OFL-Lora.txt`.
The Yify preview is an optimized copy of the [public app screenshot](https://raw.githubusercontent.com/kunal26das/yify/main/store-artifacts/screenshots/01-home.png).
The homepage bubble-sort sketch is an illustrative JavaScript demo, not an embedded AlgoScope instance.
