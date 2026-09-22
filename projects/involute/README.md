# Involute Explorer

An interactive geometry experiment at [kunal26das.github.io/involute](https://kunal26das.github.io/involute/), styled to match Kunal Das’s portfolio.

Adjust the circle radius, unwind a tangent string, and inspect distances along the involute. The explorer includes keyboard controls, dark and light themes, optional animation (stepped movement with reduced motion), and CSV export. No accounts, services, or runtime dependencies.

## Use locally

From the portfolio repository root, run `python3 scripts/build.py`, then
`python3 -m http.server 8080 --directory dist` and open
`http://localhost:8080/involute/`. This previews the same routes as the combined deployment.

For isolated editing, serve this directory with
`python3 -m http.server 8875 --directory projects/involute` from the repository root, then open
`http://localhost:8875`. `index.html` also works directly from disk; theme persistence depends
on the browser’s storage policy.

## Geometry

For radius r and unwound angle θ in radians:

- x = r(cos θ + θ sin θ)
- y = r(sin θ − θ cos θ)
- Centre distance = r√(1 + θ²)
- Polar angle φ = θ − arctan θ

`geometry.js` inverts the polar-angle equation by bisection to calculate each table sample. The diagram and CSV use these same samples. The full plotted curve spans one polar revolution; the unwind control demonstrates one revolution around the base circle. The graph fits the curve to the available space. All distances use the radius’s unit.

Run the mathematical regression checks from the repository root with
`node --test projects/involute/tests/geometry.test.cjs`. The original `explorer.html` address
redirects to the current explorer.

## Deployment and retained sources

Involute is part of the [portfolio repository](../../README.md). Its root
[Pages workflow](../../.github/workflows/deploy.yml) validates and publishes the combined site
on pushes to `master`; there is no separate Involute deployment. The public address remains
`https://kunal26das.github.io/involute/`.

The root build publishes only `index.html`, `explorer.html`, `styles.css`, `theme.js`,
`geometry.js`, `explorer.js`, `og-image.jpg`, `robots.txt`, `sitemap.xml` and `assets/`.
Original Python, CAD and packaged binary artifacts remain in this source directory and Git
history, alongside the tests and license. They are not included in the published site.

`main.py` remains the original command-line calculator. Its historical 22/7 approximation and averaged angle bins differ from the exact-angle calculations now used on the website.

Typography: Lora, distributed under the SIL Open Font License; see `assets/OFL-Lora.txt`.
