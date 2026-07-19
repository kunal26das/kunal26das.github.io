package io.github.kunal26das.data.repository

import io.github.kunal26das.domain.model.Project
import io.github.kunal26das.domain.repository.ProjectRepository

class ProjectRepositoryImpl : ProjectRepository {
    override fun getProjects(): List<Project> =
        listOf(
            Project(
                name = "Pokedex",
                blurb =
                    "A playful pocket guide to the world of Pokémon — beautiful, fast, and fun to flip " +
                        "through. Free to download on Google Play.",
                tags = listOf("🎮 Fun", "📱 Android"),
                live = "https://play.google.com/store/apps/details?id=io.github.kunal26das.multidex",
                liveLabel = "Play Store",
                featured = true,
            ),
            Project(
                name = "This Website",
                blurb =
                    "Yep — even this page is something I built myself, just for fun, to share a bit " +
                        "about my work and say hello.",
                tags = listOf("✨ Made by me", "🌐 On the web"),
                repo = "https://github.com/kunal26das/kunal26das.github.io",
                live = "https://kunal26das.github.io",
                liveLabel = "You're here!",
                featured = true,
            ),
            Project(
                name = "Yify",
                blurb =
                    "A handy little app for movie lovers to browse and discover films — running smoothly " +
                        "on both iPhone and Android. You can download it on the Play Store today.",
                tags = listOf("🎬 Movies", "📱 iPhone & Android"),
                repo = "https://github.com/kunal26das/yify",
                live = "https://play.google.com/store/apps/details?id=io.github.kunal26das.yify",
                liveLabel = "Play Store",
                web = "https://kunal26das.github.io/yify/",
                webLabel = "Try the web app",
                featured = true,
            ),
            Project(
                name = "Doom",
                blurb =
                    "The classic DOOM, running right in your browser — a fun port project " +
                        "you can play without installing anything.",
                tags = listOf("🎮 Game", "🌐 Web"),
                repo = "https://github.com/kunal26das/doom",
                web = "https://kunal26das.github.io/doom/",
                webLabel = "Play in browser",
                featured = true,
            ),
        )
}
