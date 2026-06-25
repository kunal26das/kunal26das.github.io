# kunal26das.github.io

My personal portfolio — a warm, animated single-page site built entirely in Kotlin with
[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) compiled to
**Kotlin/Wasm**, and deployed to GitHub Pages at **https://kunal26das.github.io**.

No HTML/CSS framework, no JavaScript app code — just Kotlin, Compose, and a WebAssembly
binary the browser runs at near-native speed.

## Highlights

- 🎨 **Hand-built design system** — a Claude-inspired clay/terracotta palette over warm
  paper, with light and dark moods, a serif display face (Lora), and a monochrome emoji font
  pinned to only the emoji glyphs.
- ✨ **Alive, not static** — a drifting aurora canvas background, shimmering gradient text,
  staggered reveal-on-mount animations, and hover micro-interactions throughout.
- 🌗 **Theme toggle** that remembers your choice across reloads (dark by default).
- 🧱 **Clean architecture + MVVM** — strict domain / data / presentation layering (see below).
- 🧹 **Linted in CI** — ktlint runs before every deploy.
- ⚡ **Fast** — content and behavior are injected as plain data, so the UI stays thin.

## Stack

| Tool | Version |
| --- | --- |
| Kotlin | 2.4.0 |
| Compose Multiplatform | 1.11.1 |
| ktlint (Gradle plugin) | 12.1.1 |
| Gradle | 9.6.0 |
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

Main.kt                     # Kotlin/Wasm entry point — ComposeViewport(document.body)
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
./gradlew :composeApp:wasmJsBrowserDevelopmentRun
```

Then open the printed `http://localhost:8080`.

## Lint

```bash
./gradlew :composeApp:ktlintCheck     # verify
./gradlew :composeApp:ktlintFormat    # auto-fix
```

Compose `@Composable` PascalCase names are allowed via `.editorconfig`, and generated
resource sources are excluded from the check.

## Build the static site

```bash
./gradlew :composeApp:wasmJsBrowserDistribution
```

Output lands in `composeApp/build/dist/wasmJs/productionExecutable/`.

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which **lints → builds the Wasm
distribution → publishes** to GitHub Pages.

> **One-time setup:** in the repo **Settings → Pages**, set **Source** to **GitHub Actions**.
