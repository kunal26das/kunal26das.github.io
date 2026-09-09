# kunal26das.github.io

My personal portfolio — a warm, animated single-page site built entirely in Kotlin with
[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) compiled to
**Kotlin/Wasm**, and deployed to GitHub Pages at **https://kunal26das.github.io**.

The interactive interface is Kotlin and Compose, supported by a small HTML bootstrap and
a readable HTML version that stays available while WebAssembly loads or when it cannot start.

## Highlights

- 🎨 **Hand-built design system** — a Claude-inspired clay/terracotta palette over warm
  paper, with light and dark moods, a serif display face (Lora), and a monochrome emoji font
  pinned to only the emoji glyphs.
- ✨ **Alive, not static** — a drifting aurora canvas background, shimmering gradient text,
  staggered reveal-on-mount animations, and hover micro-interactions throughout.
- 🌗 **Theme toggle** that remembers your choice across reloads (dark by default).
- 🧱 **Clean architecture + MVVM** — strict domain / data / presentation layering (see below).
- 🧹 **Linted in CI** — ktlint and the production build run on pull requests and before every deploy.
- ♿ **Accessible alternatives** — a scrollable HTML version, descriptive controls, and reduced-motion support.
- 🧭 **Responsive navigation** — desktop links and a compact menu on smaller screens.
- 🛠️ **Interactive workbench** — a sorting demonstration, an authentic Yify preview, and a Startup library spotlight.
- 📂 **Public repository directory** — all 14 public repos verified on 2026-09-09, with category browsing and links in the HTML version.

## Stack

| Tool | Version |
| --- | --- |
| Kotlin | 2.4.10 |
| Compose Multiplatform | 1.11.1 |
| ktlint (Gradle plugin) | 14.2.0 |
| Gradle | 9.7.0 |
| JDK | 17 |

## Architecture

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

The homepage keeps readable HTML visible until Compose reports readiness. Add `?view=html`
to open the text version without downloading the Wasm runtime. The interactive build still
includes a substantial Compose/Skiko runtime; bundle-size warnings are expected.

## Deploy

Pull requests targeting `master` run lint and build the production Wasm distribution.
Pushing to `master`, or manually running `.github/workflows/deploy.yml`, also publishes the
validated distribution to GitHub Pages. Pull requests never upload or publish a Pages artifact.
Only the deploy job has Pages and identity-token write permissions.

> **One-time setup:** in the repo **Settings → Pages**, set **Source** to **GitHub Actions**.

## Project preview asset

The Yify preview is an optimized copy of the [public app screenshot](https://raw.githubusercontent.com/kunal26das/yify/main/store-artifacts/screenshots/01-home.png). The workbench sorting sketch illustrates bubble sort; it is not an embedded AlgoScope instance.
