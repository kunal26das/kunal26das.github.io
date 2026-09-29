# kunal26das.github.io

My personal portfolio and engineering notebook at **https://kunal26das.github.io**.

The website is plain HTML, CSS and JavaScript. It has no framework, package installation,
Kotlin compiler, Gradle build or application server. The homepage and articles remain readable
without JavaScript; small scripts handle themes, navigation, section highlighting and reading
tools.

## Structure

```text
site/                    Website source, published at the domain root
  index.html             Homepage, project directory and contact details
  home.css, home.js      Homepage styles and interactions
  assets/                Fonts, font license and project screenshot
  blog/                  Blog index, shared styles/scripts and article pages
  multidex/              Multidex landing page
  compensation/          Browser-only compensation explorer; fictional public examples
  feed.xml, sitemap.xml  RSS and search discovery
  .well-known/           Android Digital Asset Links
  app-ads.txt, ads.txt    Publisher verification
projects/
  2048/                  Adapted 2048 game, browser assets and game-rule tests
  games/                 Tetris, chess, Flow Free, Tic-Tac-Toe and game collection
  resume/                Résumé source, export tools and generated index.html
  involute/              Involute Explorer and original calculator files
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
the page. For quick work on the portfolio alone, serve `site/` directly. `/resume/`, `/involute/`,
`/2048/`, `/games/`, `/doom/` and legacy asset aliases are included in the assembled `dist/` preview.

The `/startup/` and `/yify/` project sites are deployed independently;
their root-relative links resolve on the live GitHub Pages domain, not this local server.

## Check and deploy

```bash
python3 scripts/build.py
python3 scripts/check.py --check-js
node --test projects/2048/tests/*.test.cjs
node --test projects/games/tests/*.test.cjs
node --test tests/compensation.test.mjs
```

Python checks the assembled pages, local links and anchors, assets, discovery files and
required deployment files. Node checks JavaScript syntax and runs the project regression
tests; it is not a build or runtime dependency for the website. There are no npm packages to
install. Project-specific checks and editing commands are documented in
[`projects/resume/README.md`](projects/resume/README.md) and
[`projects/involute/README.md`](projects/involute/README.md), plus
[`projects/2048/README.md`](projects/2048/README.md) and
[`projects/games/README.md`](projects/games/README.md).

Pull requests targeting `master` run these checks. A push to `master`, or a manual run of
`.github/workflows/deploy.yml`, also publishes `dist/` to GitHub Pages. Only the deployment job
has Pages and identity-token write permissions. The artifact includes hidden verification
files and only the website output, never repository configuration or local caches.

The résumé and Involute now share this deployment. The build publishes the résumé's generated
`index.html` at `/resume/` and an explicit list of Involute web files at `/involute/`. Their
source tools, tests, original calculator artifacts and project configuration stay out of the
published output. Both original repositories and their Git histories were imported under
`projects/`; use normal commits in this repository for future changes.

The adapted 2048 game is published at `/2048/` from `projects/2048/`. Its HTML, CSS,
JavaScript and original MIT license are explicitly included in the build; tests and
authoring documentation stay out of the published output.

The Games collection at `/games/` adds browser adaptations of Tetris, chess puzzles,
Flow Free and Tic-Tac-Toe from `kunal26das/game-algorithms`, retaining its Apache-2.0
license and contributor notices. The original repository remains independent. Its
executables and object files are not imported into the website. Games are linked from
site footers, outside the main navigation and the homepage's project selection.

`doom-dist/` is copied unchanged to `/doom/`. It is produced by `kunal26das/doom` and can still
use Kotlin independently; do not edit its generated files in this repository.

## Editing content

- **Articles:** add `site/blog/<slug>/index.html`, then update the blog index, homepage article
  list, `feed.xml` and `sitemap.xml`.
- **Projects and profile:** edit `site/index.html`. There is no second Kotlin copy to maintain.
  The homepage is written for hiring managers: positioning and proof points, what I do,
  experience, selected projects, writing, about and contact. Take every figure from
  `projects/resume/src/resume.html` and follow the résumé's default view (Wish stays hidden).
  Keep the legacy `#work`, `#code` and `#journey` anchors, which older links and other pages use.
- **Résumé:** edit `projects/resume/src/`, then run `python3 projects/resume/src/build.py` to
  regenerate `projects/resume/index.html` before building the combined site.
- **Involute:** edit the web files in `projects/involute/`; retain the legacy `explorer.html`
  redirect and run its geometry checks before publishing.
- **2048:** edit `projects/2048/` and run its Node game-rule tests before publishing.
  Preserve the original game's attribution and MIT license.
- **Game collection:** edit `projects/games/` and run its rule/solver tests. Keep the
  collection, footer link and sitemap current; preserve Apache notices.
- **Design:** shared typography, colors, header and theme behavior live in `site/blog/blog.css`
  and `site/blog/blog.js`; homepage-specific styles and interactions live in `home.css` and
  `home.js`. Preserve keyboard access, mobile layouts and reduced-motion support.

## Compatibility

Page URLs, article anchors and query links remain valid. Old `?view=interactive` and
`?view=html` links now show the current portfolio. The former Compose interface was removed;
its source remains in Git history before this migration.

The consolidated résumé retains `/resume/` and its layout, theme and filtering query links.
Involute retains `/involute/` and the `/involute/explorer.html` redirect.

The build preserves the previous Lora semibold font and Yify screenshot addresses under
`/composeResources/io.github.kunal26das.resources/` for older cached pages. New pages use
`/assets/` URLs. These compatibility files do not load a Compose runtime.

## Assets

Lora is bundled under the SIL Open Font License in `site/assets/fonts/OFL-Lora.txt`.
The Yify preview is an optimized copy of the [public app screenshot](https://raw.githubusercontent.com/kunal26das/yify/main/store-artifacts/screenshots/01-home.png).
The homepage bubble-sort sketch is an illustrative JavaScript demo, not an embedded AlgoScope instance.
2048 is adapted from [Gabriele Cirulli's original game](https://github.com/gabrielecirulli/2048),
with its MIT license retained in `projects/2048/LICENSE.txt`.

## Compensation explorer

`/compensation/` shows an interactive annual CTC timeline, fixed/variable detail, monthly
gross and take-home comparisons, equity grants and consulting records. Its public bundle
contains fictional examples only. Personal records must never be committed to this
repository or included in `site/` or `dist/`.

Use **Import your data** to read a local JSON file. It is validated and saved under
`compensation-explorer:data:v1` in this browser's local storage. The page makes no network
requests for data and its Content Security Policy blocks connections, frames, forms and
external scripts. Local storage is device/profile-specific, readable by other scripts on
the same origin, and cleared when site data is removed; it is not an encrypted vault.
**Export a backup** saves a local JSON copy. **Clear my data** removes the browser copy.
The example toggle does not replace a saved file.

The version 1 import schema is defined in `site/compensation/data.mjs` and illustrated
by `EXAMPLE` in `site/compensation/app.mjs`. Amounts are INR numbers, dates use ISO format,
and unknown components use `null`, never a guessed zero. A file requires a title,
review date and at least one annual milestone; payroll, equity, consulting and notes
are optional. Files are limited to 1 MB and 100 entries per section. The parser keeps
only documented fields and renders imported text as text, never HTML.

This workspace page is intentionally marked `noindex,nofollow` and excluded from
search discovery files. That setting is not access control: only the generic tool
is public, while imported figures are stored in the viewer's browser.
