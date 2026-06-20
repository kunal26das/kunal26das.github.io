package io.github.kunal26das

import kotlinx.browser.window

// ---- Profile ----

object Profile {
    const val NAME = "Kunal Das"
    const val ROLE = "Mobile App Maker"
    const val TAGLINE = "I make the apps that live on your phone — the ones you tap open every day. " +
        "From ordering dinner to staying in touch, I help build experiences that just work, " +
        "and feel good to use."
    const val LOCATION = "Bengaluru, India"
    const val GITHUB = "https://github.com/kunal26das"
    const val EMAIL = "kunal26das@gmail.com"
    const val SINCE = 2016
}

// ---- What I bring ----

val skills: List<SkillGroup> = listOf(
    SkillGroup(
        "🚀",
        "Apps people love",
        "I've helped build apps used by millions — and I sweat the little details that make them a joy to use.",
    ),
    SkillGroup(
        "🎨",
        "Beautiful & simple",
        "Clean, friendly screens that feel natural. No clutter, no confusion — just the thing you came to do.",
    ),
    SkillGroup(
        "📱",
        "Works everywhere",
        "Android, iPhone, and beyond. Whatever phone you're holding, the app should feel right at home.",
    ),
    SkillGroup(
        "⚡",
        "Fast & reliable",
        "Smooth, snappy, and dependable — apps that don't make you wait or let you down.",
    ),
)

data class SkillGroup(val icon: String, val title: String, val description: String)

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
        name = "Pokedex",
        blurb = "A playful pocket guide to the world of Pokémon — beautiful, fast, and fun to flip " +
            "through. Free to download on Google Play.",
        tags = listOf("🎮 Fun", "📱 Android"),
        repo = "https://github.com/kunal26das/pokedex",
        live = "https://play.google.com/store/apps/details?id=io.github.kunal26das.multidex",
        liveLabel = "Play Store",
        featured = true,
    ),
    Project(
        name = "This Website",
        blurb = "Yep — even this page is something I built myself, just for fun, to share a bit " +
            "about my work and say hello.",
        tags = listOf("✨ Made by me", "🌐 On the web"),
        repo = "https://github.com/kunal26das/kunal26das.github.io",
        live = "https://kunal26das.github.io",
        liveLabel = "You're here!",
        featured = true,
    ),
    Project(
        name = "YIFY",
        blurb = "A handy little app for movie lovers to browse and discover films — running smoothly " +
                "on both iPhone and Android. You can download it on the Play Store today.",
        tags = listOf("🎬 Movies", "📱 iPhone & Android"),
        repo = "https://github.com/kunal26das/yify",
        live = "https://play.google.com/store/apps/details?id=io.github.kunal26das.yify",
        liveLabel = "Play Store",
        featured = true,
    ),
    Project(
        name = "Bunxdo",
        blurb = "A freelance project — an app I built to help sellers run their business right " +
                "from their phone.",
        tags = listOf("🛍️ For sellers", "📱 Android"),
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
