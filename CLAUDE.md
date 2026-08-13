# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal portfolio site written entirely in Kotlin — Compose Multiplatform compiled to
Kotlin/Wasm — deployed as a static site to GitHub Pages at `https://kunal26das.github.io`.
One Gradle module (`:composeApp`), one source set (`wasmJsMain`). There is no Android/iOS/JVM
target, no `commonMain`, and no test source set (CI does not run tests).

## Commands

```bash
# Fast feedback loop — type-checks all Kotlin in ~seconds, no Node needed
./gradlew :composeApp:compileKotlinWasmJs

# Dev server at http://localhost:8080 (add --continuous to rebuild on source changes)
./gradlew :composeApp:wasmJsBrowserDevelopmentRun

# Lint (must match CI, which gates the deploy)
./gradlew :composeApp:ktlintCheck --no-configuration-cache
./gradlew :composeApp:ktlintFormat --no-configuration-cache

# Production bundle → composeApp/build/dist/wasmJs/productionExecutable/
./gradlew :composeApp:wasmJsBrowserDistribution --no-configuration-cache

# After bumping any dependency that changes JS/npm deps — the lockfile is committed
./gradlew kotlinWasmUpgradeYarnLock
```

**Configuration cache gotcha:** `org.gradle.configuration-cache=true` is set in
`gradle.properties`, but the ktlint plugin is not configuration-cache compatible — `ktlintCheck`
/ `ktlintFormat` **fail** without `--no-configuration-cache`. CI passes that flag to both the
lint and distribution steps. `compileKotlinWasmJs` runs fine with the cache on.

The first Wasm bundle build downloads Node and Yarn into the Gradle cache, so it needs network
access; `compileKotlinWasmJs` does not.

## Architecture

Clean architecture with an MVVM presentation layer, all inside
`composeApp/src/wasmJsMain/kotlin/io/github/kunal26das/`. `domain` has zero framework
dependencies; `data` and `presentation` depend on it, never the reverse. The README has the
full directory map — the non-obvious parts:

- **All site content is hardcoded in `data/repository/*RepositoryImpl.kt`.** Profile, skills,
  projects, experience and articles are `listOf(...)` literals returned synchronously. There is
  no network, no loading state, no coroutines in the data path.
- **`di/AppModule` is a hand-written singleton object**, not a DI framework. It eagerly
  constructs every impl and exposes `providePortfolioViewModel()` / `provideThemeViewModel()`.
  Swapping a data source = one new `data/` class + one line here.
- **ViewModels are plain classes**, not `androidx.lifecycle.ViewModel`. `PortfolioViewModel`
  builds its immutable `PortfolioUiState` once in the constructor and exposes intent functions
  (`onOpenUrl`, `onContact`). Only `ThemeViewModel.isDark` is observable (`mutableStateOf`).
- **There is no router.** `App.kt` is one `verticalScroll` Column. Each section is wrapped in a
  private `Anchor(key, anchors)` that records its `positionInParent().y` into a state map;
  `goTo(key)` animates the scroll to that offset minus the nav height. Adding a navigable
  section means: add the composable, wrap it in `Anchor("key")`, and add a matching `NavLink` in
  `ui/navigation/TopNav.kt`. Current keys: `about`, `skills`, `work`, `writing`, `journey`,
  `contact`.

### Design system conventions

- **Colors come from `theme/ThemeColors.kt`, not `MaterialTheme.colorScheme`.** Those are
  top-level `@Composable @ReadOnlyComposable` vals (`Background`, `Surface`, `Clay`, `Muted`, …)
  reading `LocalPalette`. `theme/Palette.kt` holds `LightPalette` / `DarkPalette`.
  `MaterialTheme`'s scheme is derived from the same palette only so M3 components inherit it.
  `Violet` / `Cyan` / `Pink` are legacy aliases for `Clay` / `Slate` / `Ochre` — prefer the real
  names in new code.
- **Frosted surfaces use `Modifier.liquidGlass(shape, tintAlpha)`** (`theme/Glass.kt`), backed by
  Haze. `App.kt` maintains two `HazeState`s — one for content blurred behind the nav, one for
  the aurora behind cards — provided via `LocalHazeState`. `liquidGlass` degrades to a
  translucent surface when no state is provided.
- **Emoji must go through `emoji(text)` or `GradientText`** (`ui/components/TextEffects.kt`),
  which re-spans any char ≥ `0x2000` into the bundled monochrome Noto Emoji font. Plain `Text`
  with an emoji in it will render inconsistently. Content strings (e.g. project tags) contain
  emoji, so section code should use these helpers.
- **Responsive layout** comes from `SectionContainer { compact -> … }` — `compact` is
  `maxWidth < 720.dp`; content is capped at 980.dp (nav at 1120.dp). No media queries anywhere
  else.
- Fonts live in `composeResources/font/` and are reached via generated `Res.font.*` accessors in
  package `io.github.kunal26das.resources`.

## Static web assets and the SEO duplication surface

`composeApp/src/wasmJsMain/resources/` is copied verbatim to the site root. It holds `index.html`
(which embeds a hand-written `#static-content` fallback that inline JS deletes once the Compose
canvas mounts — crawlers see it, users don't), hand-written HTML landing pages
(`multidex/`, `blog/`, `blog/<slug>/`), `feed.xml`, `sitemap.xml`, `robots.txt`, icons, the
webmanifest, and `.well-known/assetlinks.json`.

**This content is duplicated by design, and nothing keeps it in sync.** Changing what the site
says usually means editing several files:

- **New article** → `data/repository/ArticleRepositoryImpl.kt`, a new
  `resources/blog/<slug>/index.html`, a card in `resources/blog/index.html`, an `<item>` in
  `feed.xml`, a `<url>` in `sitemap.xml`, and the Writing line in the `index.html` fallback.
- **New project** → `ProjectRepositoryImpl.kt`, the Apps & Projects list in the `index.html`
  fallback, plus a landing page + `sitemap.xml` entry if it gets its own URL.
- **Profile / experience / skills edits** → the matching `*RepositoryImpl.kt` *and* the
  corresponding section of the `index.html` fallback, which restates them for crawlers.

The static HTML pages are standalone: inline `<style>` with their own CSS variables mirroring the
dark palette, plus JSON-LD. They do not share code with the Compose app — match the existing
page's structure when adding one.

## Deploy

Push to `master` runs `.github/workflows/deploy.yml`: ktlint → `wasmJsBrowserDistribution` →
Pages. Two quirks the workflow patches up after the build:

- `doom-dist/` (a prebuilt WebAssembly DOOM, pushed into this repo by `kunal26das/doom` CI) is
  copied into the artifact as `/doom`. Don't hand-edit it.
- The Compose resource copy skips dot-directories, so `.well-known/` is copied in explicitly and
  the artifact upload sets `include-hidden-files: true`.

## Conventions

- ktlint (official Kotlin style) gates the deploy — run `ktlintFormat` before committing.
  `.editorconfig` permits PascalCase `@Composable` function names and disables property-naming
  (for the top-level color vals).
- All versions live in `gradle/libs.versions.toml`; Dependabot bumps them in two groups
  (`github-actions`, `gradle-dependencies`). `composeApp/build.gradle.kts` force-resolves
  `kotlinx-datetime:0.8.0` to settle a transitive conflict.
- One thing per file — each section, component and repository has its own file.
- Commit messages are short imperative summaries ("Add RSS feed and Digital Asset Links…").
