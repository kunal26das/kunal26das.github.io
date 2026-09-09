package io.github.kunal26das.data.repository

import io.github.kunal26das.domain.model.Article
import io.github.kunal26das.domain.repository.ArticleRepository

class ArticleRepositoryImpl : ArticleRepository {
    override fun getArticles(): List<Article> =
        listOf(
            Article(
                title = "Startup, in the right order",
                blurb = "Explicit dependencies, graph validation, and the AndroidX boundary inside a Kotlin Multiplatform startup library.",
                date = "September 2026",
                url = "https://kunal26das.github.io/blog/startup-dependency-graph/",
                tags = listOf("Kotlin Multiplatform", "Dependency graphs", "AndroidX"),
            ),
            Article(
                title = "Make the algorithm explain itself: inside AlgoScope",
                blurb =
                    "Saved frames, a shared Flutter player, and tests of intermediate state make " +
                        "algorithms something you can pause, inspect, and replay.",
                date = "September 2026",
                url = "https://kunal26das.github.io/blog/algoscope-visualizing-algorithms/",
                tags = listOf("Flutter", "Dart", "Algorithms"),
            ),
            Article(
                title = "Porting DOOM means preserving its decisions",
                blurb = "Fixed-point maths, independent worlds, and the boundary between a 35 Hz engine and Compose.",
                date = "September 2026",
                url = "https://kunal26das.github.io/blog/doom-kotlin-port/",
                tags = listOf("Kotlin", "DOOM", "Game engines"),
            ),
            Article(
                title = "One Kotlin codebase, three platforms",
                blurb =
                    "How Multidex shares its UI, architecture and theming across Android, iOS and desktop, " +
                        "and where the platform seams still show.",
                date = "July 2026",
                url = "https://kunal26das.github.io/blog/multidex-kotlin-multiplatform/",
                tags = listOf("Kotlin Multiplatform", "Compose", "Architecture"),
            ),
        )
}
