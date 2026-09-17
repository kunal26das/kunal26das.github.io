# Repository guidance

This repository publishes Kunal Das’s portfolio at https://kunal26das.github.io.
It is a static HTML/CSS/JavaScript website. The former Kotlin/Compose portfolio and its Gradle
build have been removed; do not restore them to make website changes.

## Commands

```bash
python3 scripts/build.py
python3 scripts/check.py --check-js
python3 -m http.server 8080 --directory dist
```

No dependencies need installing. Python assembles and checks the static output; Node checks
JavaScript syntax. CI runs the same checks before deploying `dist/` on pushes to `master`.

## Source and content

- `site/` maps to the published domain root, including hidden `.well-known/` files.
- `site/index.html` is the homepage and the source of profile, project and repository content.
- `site/blog/` contains the blog index, standalone article pages and shared styles/scripts.
- New articles must also appear in the homepage, blog index, RSS feed and sitemap.
- Shared theme tokens and typography are in `site/blog/blog.css`; theme persistence is handled
  by `site/blog/blog.js`. Homepage-specific styles and interactions use `site/home.css` and
  `site/home.js`.
- Preserve the existing visual design, keyboard controls, mobile layouts, readable HTML and
  reduced-motion behavior. Use the existing CSS variables instead of inventing another theme.
- `/involute/`, `/resume/`, `/startup/` and `/yify/` are separate project sites. Do not generate
  local placeholder directories that would shadow those deployments.

## Build boundaries

- Edit `site/`, not generated `dist/`.
- `doom-dist/` is an upstream artifact maintained by `kunal26das/doom` CI. Its workflow replaces
  this directory and pushes to `master`; the static build copies it unchanged to `/doom/`.
  Do not hand-edit those generated files or remove the directory.
- Keep `site/.well-known/assetlinks.json`, publisher verification, search verification, icons,
  manifest, RSS and sitemap in the deployed artifact.
- The build copies two legacy asset aliases beneath `/composeResources/` to support cached
  pages. The website uses normal `/assets/` paths and has no Compose runtime.
- Old homepage query links, including `?view=interactive`, display the static portfolio.

Use short imperative commit summaries and run the checks above before publishing.
