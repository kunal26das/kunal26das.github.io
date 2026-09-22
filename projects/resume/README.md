# Resume — Kunal Das

Live at **<https://kunal26das.github.io/resume/>**

Maintained in `projects/resume/` of the
[portfolio repository](https://github.com/kunal26das/kunal26das.github.io/tree/master/projects/resume).
The portfolio's build publishes this directory's `index.html` at the same `/resume/` URL.
Source files, local archives and generated PDFs are not included in the deployed site.

One hand-written source, `src/resume.html`, and one published file, `index.html`. Every other
rendition of this document — shorter, re-laid-out, tailored to a role, as a PDF, a Word file,
plain text, Markdown or JSON — is built in your browser at the moment you ask for it. Fonts
are inlined, so the document renders identically offline, from `file://`, or
behind any host, with nothing to break when a CDN changes.

The screen view shares the portfolio's Lora headings, warm palette, navigation and theme
preference. Its shell and screen styles are separate from the resume itself: saved files
and print retain the original document layouts without the website navigation or controls.

## The page filters itself

`/resume/` ships the whole annotated document — every bullet carrying the tags that decide when it
survives — plus an engine that does in the browser exactly what the build used to do on
my machine: drop the subtrees a shorter version does not admit, join the bullets that merge
into their neighbour, re-count the sentences that count themselves. No network calls, no framework.

The opening view is **Full**, the detailed career record. **Two-page** and **One-page**
provide shorter copies. The default Editorial view (`lay=datasheet`) leads with platform ownership and three
concrete proof points; the shorter copies use a concise skills summary and describe the
DOOM port rather than reducing it to a project name and link.

The **Customize** button opens a panel of reading and export controls.
It sits outside the resume — appended to the page, never mounted inside the document
it filters — which is why nothing it does can turn up in a file you save, and why the search
field keeps your cursor while the document rebuilds underneath it. Every control writes itself
into the query string, so whatever view you arrive at is a link you can send.

**Jump to** at the top of the panel is the document's own table of contents, built from
whatever survived the current filter — cut to the one-page length and it drops from eight
links to five, because there are five sections left. Whichever section you are reading is
marked as you scroll.

| Control | Param | Try it |
|---|---|---|
| **Length** — full, two-page, one-page | `len` | [`?len=one`](https://kunal26das.github.io/resume/?len=one) |
| **Layout** — editorial (`datasheet`), column, plain | `lay` | [`?lay=plain`](https://kunal26das.github.io/resume/?lay=plain) |
| **Lead with** — platform, product, android, rn | `lead` | [`?lead=android`](https://kunal26das.github.io/resume/?lead=android) |
| **Only show** — 14 topic tags | `only` | [`?only=kmp,ios`](https://kunal26das.github.io/resume/?only=kmp,ios) |
| **Companies** — hide any of the five | `hide` | [`?hide=none`](https://kunal26das.github.io/resume/?hide=none) |
| **Search** — highlights as it filters | `q` | [`?q=gradle`](https://kunal26das.github.io/resume/?q=gradle) |
| **Contact** — masked or shown on screen | `contact` | [`?contact=show`](https://kunal26das.github.io/resume/?contact=show) |
| **Theme** — website (`auto`), light, dark, paper, contrast, slate, terminal | `theme` | [`?theme=terminal`](https://kunal26das.github.io/resume/?theme=terminal) |

They compose:
[`?len=short&lead=android&lay=plain`](https://kunal26das.github.io/resume/?len=short&lead=android&lay=plain)
is the two-page Android copy with no colour in it.

**Lead** and **only** are different tools. *Lead with* hides nothing — it shifts a tagged
bullet one step up or down the priority order, so at a shorter length the work you care about
survives a cut it would otherwise lose, and the spine of the document stays put. *Only show*
is the blunt instrument: it filters, and the counts in the panel tell you how much is left.

Wish starts hidden — it was a contract engagement and most readers do not need it — so the
page you land on shows four companies. `?hide=none` brings all five back, and so does the
chip. Hiding a company hides it in your copy of the page, not in the page as served: the
markup is still there. If it needs to be gone, save the file rather than sending the link.

With JavaScript off, the page is the full resume. The engine only ever removes.

## The file is made at the moment you ask for it

**Save as PDF** in the toolbar or customization panel — or ⌘P — renders the selected document through the
same `@media print` stylesheet the build asserts page counts against. It is named after the
view it came from, `kunal-das-resume-short-android-no-wish.pdf`, and it carries the full
contact details whatever the screen is showing. A PDF is what people ask for, so it is the
only download format exposed in the controls. The print fonts load in the background, and
the PDF button waits for them before opening print. If a font cannot load, visible system
fonts keep the export readable; native printing uses the same fallback.

The page can also write itself out as a self-contained HTML file, as Word, as plain text, as
Markdown and as [JSON Resume](https://jsonresume.org) — same code, same view, no library and
no network, `window.__versions.download("docx")` from the console. Those generators are a port
of the Python that used to run at build time and commit these files into the repository, and
were checked byte-for-byte against it — text, Markdown, JSON, and all five parts of the Word
file — before the Python was deleted. They stay because the build still tests them on every
run; they are not in the panel because nobody was going to press them.

## Nothing is committed but the page

There is no PDF here, no `.docx`, no `.txt`, no `resume.json`, and no second HTML page.
**If you have a link to one, it no longer resolves**: `/short/`, `/column/`, `/column-short/`,
`/plain/`, `/plain-short/`, `/for-platform/`, `/for-product/`, `kunal-das-resume.pdf` and its
`.docx`, `.txt` and `.md` siblings are all gone. The page makes any of them.

The build still renders nine PDFs locally on every run — full, two-page, ATS-plain, one-page,
platform, product, android, and dark versions of the first two — and asserts the page count
and the paper size of each, plus font resources and actual text drawing. When Poppler is
installed, extracted text must also be readable, so an empty document cannot pass merely
by having the expected number of pages. They are printed from the published page itself
(`index.html?len=short&lead=android`), so those assertions cover the engine and the print
stylesheet a reader actually gets, which is the reason to render them at all: it is the only
thing that catches a content edit quietly spilling a two-page version onto a third page.
They are simply not committed. Three and a half megabytes of binary per revision is not worth
carrying to publish something the reader's own browser produces better.

## Contact details are masked on the page

The email address and the phone number are not in the served HTML as text. Each sits base64 in
a `data-real` attribute and comes back when you click it, when you print, or with
`?contact=show`; every file you save carries them in full regardless. Revealing them is the
engine's job, so with JavaScript off the mask stays on. It is obfuscation and not a lock — it
costs an address-harvesting crawler everything and a human one click.

## Every previous version

Local snapshots are kept, but not published. `archive/` holds a rendered page next to the
source it was built from; `./src/snapshot.sh "what changed"` adds the current build to it.
It is gitignored and is not populated by a fresh clone. Existing local archives remain in
the original local checkout, and the script can back up new snapshots to a separate directory.
Committed source history is preserved in the portfolio repository.

## Build

```sh
# From the portfolio repository root:
cd projects/resume
python3 src/build.py     # about 25 seconds

# any one-off copy, into gitignored out/ — the same renditions without a browser
python3 src/render.py --len short --lead android --hide wish --theme dark --pdf
python3 src/selftest.py  # 42 checks, including blank-PDF rejection and backup rotation

# optional focused export regression checks (requires Node.js)
node src/formats-selftest.js
```

The screen build reads the shared Lora font from `site/assets/fonts/lora-semibold.ttf` in the
portfolio repository. It needs no dependencies beyond Python 3, and a local Chrome or Chromium — without one the build prints
`SKIPPED` and still succeeds. Composing the page takes well under a second; the rest of that
time is ten headless Chrome runs — nine PDFs, and one that drives the download generators over
five different views.

Edit `src/resume.html` for content, `src/screen.css` for the website presentation, or
`src/shell.html` for navigation and controls around the document. Rebuild and commit the
changed source together with `index.html`.
The Python and Node self-tests above do not require a browser.

## Publish with the portfolio

Return to the portfolio repository root and validate the assembled site:

```sh
cd ../..
python3 scripts/build.py
python3 scripts/check.py --check-js
```

The root build copies `projects/resume/index.html` to `dist/resume/index.html`; it does not
regenerate the resume. Commit changes normally, preserving the repository's history.
A push to `master` runs the shared GitHub Pages workflow and publishes the resume together
with the portfolio. There is no separate resume repository, Pages deployment or force-push step.

The generated page embeds its fonts and scripts; that single file is the resume website.

## How the versions stay honest

None of these is a second document. Every one of them is the same source with subtrees dropped
and neighbouring bullets joined, chosen by tier attributes that never reach anything you save.
Leading with different work shifts a tagged bullet's tier by one, so a tailored copy can open
on different evidence without a word being rewritten. Nothing is ever written twice, so no
figure can drift between any version of this.

The build enforces that rather than trusting it. It refuses a variant containing a number that
is not in the source; it refuses to separate a figure from the clause that qualifies it — drop
"green on the branch" and an in-progress upgrade ladder starts reading as shipped work; and it
refuses to let a sentence that counts the document, "the eight I would lead with", go stale
when filtering changes the count. The renditions are made in the browser now, so the build
drives them there: a headless run generates all four downloads across five different views,
then checks the text and Markdown for invented figures, the JSON for a section gone silently
empty, and the Word file for its five parts. Portfolio and app links must survive in text,
Markdown and Word, with clickable links in the latter two. Browser checks cover search,
Reset, shared layouts, topic highlights, one-page role coverage and keyboard focus when opening or closing the panel.
`src/selftest.py` exercises the content rules and checks backup rotation in folders with spaces.

Every figure on the resume is measured from the underlying repository's git history. Nothing
is estimated, rounded up, or extrapolated.

## Design notes

The screen defaults to the portfolio's theme, shared through its `theme` storage preference,
with dark as the initial fallback. A small head script applies this before the page paints.
The header theme button uses the same preference; an explicit `theme` query parameter still
selects one of the existing resume palettes. The **Website** option (`theme=auto`) follows the
portfolio on screen and prints light. An explicitly selected resume palette prints as selected.

`src/screen.css` supplies the screen presentation as a separate `style[data-site]` block after
the document and layout styles. `src/shell.html` wraps the original `.sheet` without changing
the content that the filtering engine processes. Print hides the website shell, and standalone
downloads use only the original `style[data-doc]` and selected layout. Neither the website
chrome nor its font enters exported documents.

Amber is reserved for measured quantities and nothing else, which is what makes the numbers
scannable at a glance; ordinary emphasis is bold. The `plain` layout has no colour at all,
which keeps the reservation by having nothing to reserve. A layout file may not touch `:root`
and the build refuses one that does: a layout restyles the document, never the controls
around it.

The website uses [Lora](https://github.com/cyrealtype/Lora-Cyrillic) for its display type, embedded
from the portfolio's shared font asset; its SIL OFL licence is in `site/assets/fonts/OFL-Lora.txt`.
The document and exports retain [Archivo](https://github.com/Omnibus-Type/Archivo) for display,
[IBM Plex Sans](https://github.com/IBM/plex) for body and IBM Plex Mono for labels and data —
147 KB of woff2, inlined. Both are SIL OFL 1.1 and the licences ship in `src/fonts/`. The
`plain` layout uses system fonts instead, and the ATS-plain PDF is rendered from it.

## What is in here

```
src/resume.html        THE SOURCE                edit this
src/screen.css         portfolio screen presentation, excluded from exports
src/shell.html         website navigation and document wrapper
src/layout/*.css       one file per layout       datasheet, column, plain
src/versions.js        the live filter engine
src/formats.js         text, Markdown, JSON and Word, written in the browser
src/build.py           the build
src/selftest.py        tests for the content filter and the content rules
src/browser-selftest.js browser regression checks, run by the build
src/formats-selftest.js optional focused export checks, run with Node.js
src/render.py          renders one arbitrary version into out/
src/archive.py         snapshots a build into archive/
src/snapshot.sh        archive.py + the commands to publish the resume
src/fonts/             woff2 originals + OFL licences
.nojekyll              tells Pages to serve the files as-is

index.html             the published page — generated, do not edit
```

## Contact

kunal26das@gmail.com · [linkedin.com/in/kunal26das](https://linkedin.com/in/kunal26das) ·
[github.com/kunal26das](https://github.com/kunal26das)
