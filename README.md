# kunal26das.github.io

A blank [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html) site built with
[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) for the web
(Kotlin/Wasm), deployed to GitHub Pages at **https://kunal26das.github.io**.

## Stack

| Tool | Version |
| --- | --- |
| Kotlin | 2.4.0 |
| Compose Multiplatform | 1.11.1 |
| Gradle | 9.6.0 |
| JDK | 17 |

## Project layout

```
composeApp/
  src/wasmJsMain/
    kotlin/io/github/kunal26das/
      App.kt    # the composable UI
      Main.kt   # Wasm entry point
    resources/
      index.html
```

## Run locally

```bash
./gradlew :composeApp:wasmJsBrowserDevelopmentRun
```

Then open the printed `http://localhost:8080`.

## Build the static site

```bash
./gradlew :composeApp:wasmJsBrowserDistribution
```

Output lands in `composeApp/build/dist/wasmJs/productionExecutable/`.

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the Wasm
distribution and publishes it to GitHub Pages.

> **One-time setup:** in the repo **Settings → Pages**, set **Source** to **GitHub Actions**.
