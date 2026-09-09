# kunal26das.github.io

My personal portfolio and engineering notebook, published at **https://kunal26das.github.io**.

The default homepage and blog use semantic HTML, shared editorial styles, and small JavaScript
enhancements. They render immediately without the Compose/Skiko runtime. The earlier Kotlin/Wasm
interface remains available at `/?view=interactive` as a Compose playground.

## Highlights

- A shared editorial design: warm paper and terracotta, Lora headings, generous spacing, and light/dark themes.
- A project showcase with an authentic Yify screenshot, a Startup dependency sketch, and a step-by-step sorting demonstration.
- All 14 public repositories, checked on 2026-09-09, with accessible category filters.
- Four engineering articles, including three new source-grounded deep dives with links pinned to the reviewed repository commits.
- Native section links, mobile navigation, keyboard controls, and readable content without JavaScript.
- Reading progress, section navigation, copy-link controls, and an RSS feed.
- CI checks Kotlin formatting and the production build before publishing to GitHub Pages.

## Stack

| Tool | Version |
| --- | --- |
| Kotlin | 2.4.10 |
| Compose Multiplatform | 1.12.0 |
| ktlint (Gradle plugin) | 14.2.0 |
| Gradle | 9.7.1 |
| JDK | 17 |

## Website files

`composeApp/src/wasmJsMain/resources/index.html`, `home.css`, and `home.js` are the default
homepage. It shares its base palette, fonts, header, and theme handling with `blog/blog.css`
and `blog/blog.js`. The homepage sorting sketch is an illustrative bubble-sort demo, not an
embedded AlgoScope instance. No runtime GitHub API is needed.

Article pages live in `resources/blog/<slug>/index.html`. When adding writing, update the blog
index, homepage article list, `feed.xml`, `sitemap.xml`, and `ArticleRepositoryImpl.kt` so the
optional Compose experience stays consistent. Keep project descriptions synchronized with
`ProjectRepositoryImpl.kt` and the homepage directory.

## Compose playground architecture

The app follows **clean architecture** with an **MVVM** presentation layer. Dependencies point
inward — `presentation` and `data` depend on `domain`, never the other way around — and the UI
talks to abstractions (interfaces), wired together by a tiny manual DI module.

```
domain/                     # pure Kotlin, zero framework deps — the core
  model/                    #   Profile, SkillGroup, Project, Experience
  repository/               #   ProfileRepository, SkillRepository, ... (interfaces)
  service/                  #   LinkOpener, ThemePreferenceStore (interfaces)

data/                       # implementations of the domain contracts
  repository/               #   *RepositoryImpl — the site's content lives here
  service/                  #   BrowserLinkOpener (window.open),
                            #   LocalStorageThemePreferenceStore

presentation/               # everything Compose
  state/                    #   PortfolioUiState (immutable snapshot)
  viewmodel/                #   PortfolioViewModel, ThemeViewModel
  theme/                    #   Palette, colors, typography, PortfolioTheme
  ui/
    components/             #   reusable: buttons, cards, chips, text effects, animations
    sections/               #   Hero, About, Skills, Projects, Experience, Footer
    navigation/             #   TopNav
    background/             #   AuroraBackground
  App.kt                    #   composes the sections and nav together

di/
  AppModule.kt              # constructs impls, hands ViewModels their dependencies

Main.kt                     # Kotlin/Wasm entry point — isolated Compose viewport + readiness signal
```

### Why it's shaped this way

- **Single responsibility** — each section, component, and repository does one thing and
  lives in its own file.
- **Dependency inversion** — `PortfolioViewModel` depends on `ProfileRepository` (an
  interface), not on where the data actually comes from. Swapping static content for a network
  source later means writing one new `data/` class and changing one line in `AppModule`.
- **Testable core** — the `domain` and `viewmodel` layers have no Compose or browser
  dependencies, so they're plain unit-testable Kotlin.
- **MVVM** — `ViewModel`s expose immutable state and intent functions (`onContact`,
  `onOpenUrl`, `toggle`); composables stay dumb and just render state + forward events.

## Run locally

```bash
./gradlew :composeApp:wasmJsBrowserDevelopmentRun --no-configuration-cache
```

Then open the printed `http://localhost:8080`.

The commands in this README disable Gradle's configuration cache to match CI. Dependency
and build-output caching remain enabled.

## Lint

```bash
./gradlew :composeApp:ktlintCheck --no-configuration-cache     # verify
./gradlew :composeApp:ktlintFormat --no-configuration-cache    # auto-fix
```

Compose `@Composable` PascalCase names are allowed via `.editorconfig`, and generated
resource sources are excluded from the check.

## Build the static site

```bash
./gradlew :composeApp:wasmJsBrowserDistribution --no-configuration-cache
```

Output lands in `composeApp/build/dist/wasmJs/productionExecutable/`.

The default homepage renders directly as HTML; `?view=html` remains compatible with older links.
Only `?view=interactive` downloads the Compose/Skiko runtime. In that mode, the readable homepage
stays available until Compose reports readiness. Bundle-size warnings apply to the optional
interactive build, not the default homepage download.

## Deploy

Pull requests targeting `master` run lint and build the production Wasm distribution.
Pushing to `master`, or manually running `.github/workflows/deploy.yml`, also publishes the
validated distribution to GitHub Pages. Pull requests never upload or publish a Pages artifact.
Only the deploy job has Pages and identity-token write permissions.

> **One-time setup:** in the repo **Settings → Pages**, set **Source** to **GitHub Actions**.

## Project preview asset

The Yify preview is an optimized copy of the [public app screenshot](https://raw.githubusercontent.com/kunal26das/yify/main/store-artifacts/screenshots/01-home.png). The workbench sorting sketch illustrates bubble sort; it is not an embedded AlgoScope instance.
