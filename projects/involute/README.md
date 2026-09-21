# Involute Explorer

An interactive geometry experiment at [kunal26das.github.io/involute](https://kunal26das.github.io/involute/), styled to match Kunal Das’s portfolio.

Adjust the circle radius, unwind a tangent string, and inspect distances along the involute. The explorer includes keyboard controls, dark and light themes, optional animation (stepped movement with reduced motion), and CSV export. No accounts, services, or runtime dependencies.

## Use locally

Serve the repository with `python3 -m http.server 8875`, then open `http://localhost:8875`. There is no build step. `index.html` also works directly from disk; theme persistence depends on the browser’s storage policy.

## Geometry

For radius r and unwound angle θ in radians:

- x = r(cos θ + θ sin θ)
- y = r(sin θ − θ cos θ)
- Centre distance = r√(1 + θ²)
- Polar angle φ = θ − arctan θ

`geometry.js` inverts the polar-angle equation by bisection to calculate each table sample. The diagram and CSV use these same samples. The full plotted curve spans one polar revolution; the unwind control demonstrates one revolution around the base circle. The graph fits the curve to the available space. All distances use the radius’s unit.

Run the mathematical regression checks with `node --test tests/geometry.test.cjs`. GitHub Actions verifies these checks and deploys only the website files to Pages. The original `explorer.html` address redirects to the current explorer.

`main.py` remains the original command-line calculator. Its historical 22/7 approximation and averaged angle bins differ from the exact-angle calculations now used on the website.

Typography: Lora, distributed under the SIL Open Font License; see `assets/OFL-Lora.txt`.
