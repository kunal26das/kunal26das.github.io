package io.github.kunal26das

import kotlinx.browser.window

// ---- Profile ----

object Profile {
    const val NAME = "Kunal Das"
    const val ROLE = "Mobile Engineer"
    const val TAGLINE = "I build cross-platform mobile apps across Android, iOS, React Native " +
        "and Kotlin Multiplatform — and ship them to real users."
    const val LOCATION = "Bengaluru, India"
    const val GITHUB = "https://github.com/kunal26das"
    const val EMAIL = "kunal26das@gmail.com"
    const val SINCE = 2016
}

// ---- Skills ----

val skills: List<SkillGroup> = listOf(
    SkillGroup("Languages", listOf("Kotlin", "Swift", "TypeScript", "Java")),
    SkillGroup("Android", listOf("Jetpack Compose", "Coroutines & Flow", "Hilt / DI", "Room", "Material 3")),
    SkillGroup("iOS & React Native", listOf("SwiftUI", "UIKit", "React Native", "Expo")),
    SkillGroup("Multiplatform", listOf("Kotlin Multiplatform", "Compose Multiplatform", "Kotlin/Wasm")),
    SkillGroup("Tooling", listOf("Gradle", "Git", "CI / GitHub Actions", "Firebase")),
)

data class SkillGroup(val title: String, val items: List<String>)

// ---- Projects ----

data class Project(
    val name: String,
    val blurb: String,
    val tags: List<String>,
    val repo: String,
    val live: String? = null,
    val liveLabel: String? = null,
    val featured: Boolean = false,
)

val projects: List<Project> = listOf(
    Project(
        name = "YIFY",
        blurb = "A cross-platform movie-browsing app for YTS, built with React Native so it runs " +
            "natively on both iOS and Android. Published on the Google Play Store.",
        tags = listOf("React Native", "TypeScript", "iOS & Android"),
        repo = "https://github.com/kunal26das/yify",
        live = "https://play.google.com/store/apps/details?id=io.github.kunal26das.yify",
        liveLabel = "Play Store",
        featured = true,
    ),
    Project(
        name = "Pokedex",
        blurb = "A native Android Pokedex with a multi-module architecture, rich detail screens " +
            "and smooth Jetpack Compose UI. Live on Google Play.",
        tags = listOf("Kotlin", "Jetpack Compose", "Multi-module"),
        repo = "https://github.com/kunal26das/pokedex",
        live = "https://play.google.com/store/apps/details?id=io.github.kunal26das.multidex",
        liveLabel = "Play Store",
        featured = true,
    ),
    Project(
        name = "kunal26das.github.io",
        blurb = "This very site — built with Compose Multiplatform for Web, compiled to " +
            "WebAssembly and deployed to GitHub Pages.",
        tags = listOf("Compose Multiplatform", "Kotlin/Wasm", "GitHub Pages"),
        repo = "https://github.com/kunal26das/kunal26das.github.io",
        live = "https://kunal26das.github.io",
        liveLabel = "Live",
        featured = true,
    ),
    Project(
        name = "Bunxdo",
        blurb = "A freelance project — the seller-facing Android app for the Bunxdo platform, " +
            "built in Kotlin.",
        tags = listOf("Kotlin", "Android", "Freelance"),
        repo = "https://github.com/kunal26das/bunxdo",
    ),
)

// ---- Web helpers ----

fun openUrl(url: String) {
    window.open(url, "_blank")
}
