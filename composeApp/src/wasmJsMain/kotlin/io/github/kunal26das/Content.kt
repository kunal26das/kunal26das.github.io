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

// ---- Experience ----

data class Experience(
    val product: String,
    val period: String,
    val blurb: String,
    val link: String? = null,
)

val experience: List<Experience> = listOf(
    Experience(
        product = "Licious",
        period = "Present",
        blurb = "I help build the Licious app — India's much-loved fresh meat and seafood " +
            "delivery service — making it smooth and reliable for the millions of people who " +
            "order their everyday groceries through it.",
        link = "https://play.google.com/store/apps/details?id=com.licious",
    ),
    Experience(
        product = "Alle",
        period = "Dec 2023 — Mar 2024",
        blurb = "Worked on Alle, an AI-powered fashion app that suggests outfits, lets you try " +
            "looks on virtually and shop them in a tap. I focused on making the experience feel " +
            "playful and effortless.",
        link = "https://play.google.com/store/apps/details?id=com.heyalle.android",
    ),
    Experience(
        product = "Koo",
        period = "Dec 2022 — Jun 2023",
        blurb = "Helped build Koo, a made-in-India social app where people share thoughts and " +
            "follow the conversation in their own language. I worked on features used by a huge, " +
            "vibrant community across many Indian languages.",
        link = "https://play.google.com/store/apps/details?id=com.koo.app",
    ),
    Experience(
        product = "Powerplay",
        period = "Sep 2020 — Jul 2022",
        blurb = "Built the Powerplay app, a simple tool that keeps construction teams on the same " +
            "page — tracking site progress, sharing photos and updates, and connecting the people " +
            "on-site with the office.",
        link = "https://play.google.com/store/apps/details?id=in.powerplay.android.fieldapp",
    ),
)

// ---- Web helpers ----

fun openUrl(url: String) {
    window.open(url, "_blank")
}
