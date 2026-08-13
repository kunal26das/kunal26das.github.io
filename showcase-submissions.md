# Showcase submission drafts

Paste-ready text for one-time directory submissions. Delete this file once submitted.

---

## 1. JetBrains Kotlin Multiplatform showcase

Where: https://kotlinlang.org/lp/multiplatform/case-studies/ — JetBrains collects
case studies and community apps; submit via the KMP feedback/contact form, or email
kmm.feedback@kotlinlang.org. Also worth posting in the #compose and #multiplatform
channels of the Kotlin Slack (invite at kotlinlang.org/community — a one-time post
sharing an app is community convention there, not social media upkeep).

**App name:** Multidex — Pokédex & Dex Guide

**Platforms:** Android (live on Google Play), iOS, Desktop (JVM)

**Stack:** Kotlin 2.4, Compose Multiplatform 1.9, Material 3 Expressive + Adaptive,
Navigation 3, Ktor, Room/DataStore, Koin (KSP annotations)

**Pitch:**
Multidex is a Pokédex app shipping to Android, iOS and Desktop from a single Kotlin
codebase — over 90% shared, including virtually all UI. Highlights: adaptive
list-detail layouts from one navigation graph, per-Pokémon Material color schemes
extracted from artwork at runtime, offline-first caching, and platform capabilities
(Play Billing, ML Kit GenAI) integrated behind expect/actual seams. Compose Hot
Reload on the desktop target serves as the development inner loop.

**Links:**
- Play Store: https://play.google.com/store/apps/details?id=io.github.kunal26das.multidex
- Write-up: https://kunal26das.github.io/blog/multidex-kotlin-multiplatform/
- Developer: https://kunal26das.github.io/

---

## 2. Expo showcase

Where: https://expo.dev/showcase — submissions via the form linked on that page
(or the expo/showcase GitHub repo, since Yify is open source).

**App name:** Yify

**Platforms:** iOS, Android (live on Google Play), Web, Desktop (Electron)

**Stack:** Expo SDK 57, React Native 0.85, React 19, TypeScript strict, expo-router
static export, RevoPush OTA updates, Firebase Remote Config

**Pitch:**
Yify is a streaming-grade movie browser shipping to four platforms from one Expo
codebase: a curated Netflix-style home with a rotating billboard hero, deep-linkable
browse-and-filter grid, and cinematic detail pages with inline trailers — wrapped in
iOS 26 liquid-glass UI over a strict clean-architecture core. The web build is
statically exported with expo-router and deployed to GitHub Pages; desktop ships via
Electron.

**Links:**
- Source (open source): https://github.com/kunal26das/yify
- Web app: https://kunal26das.github.io/yify/
- Play Store: https://play.google.com/store/apps/details?id=io.github.kunal26das.yify

---

## 3. Newsletter submissions (blog post)

- Kotlin Weekly — http://kotlinweekly.net → "Submit a link" at the bottom.
  URL: https://kunal26das.github.io/blog/multidex-kotlin-multiplatform/
  Title: One Kotlin codebase, three platforms: building Multidex with Compose Multiplatform
- Android Weekly — https://androidweekly.net → "Submit your Article".
  Same URL and title.

---

Note on Yify: consider the rename before submitting it anywhere high-visibility —
the YIFY name carries piracy associations that curators may balk at.
