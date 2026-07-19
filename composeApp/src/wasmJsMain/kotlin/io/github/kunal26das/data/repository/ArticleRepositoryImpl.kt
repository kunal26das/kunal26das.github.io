package io.github.kunal26das.data.repository

import io.github.kunal26das.domain.model.Article
import io.github.kunal26das.domain.repository.ArticleRepository

class ArticleRepositoryImpl : ArticleRepository {
    override fun getArticles(): List<Article> =
        listOf(
            Article(
                title = "One Kotlin codebase, three platforms",
                blurb =
                    "How Multidex ships to Android, iPhone and Desktop from a single Kotlin " +
                        "codebase — what shared beautifully, where the platform seams still show, " +
                        "and the lessons I'd hand my past self before starting.",
                date = "July 2026",
                url = "https://kunal26das.github.io/blog/multidex-kotlin-multiplatform/",
                tags = listOf("📱 Kotlin Multiplatform", "🎨 Compose", "🍿 War stories"),
            ),
        )
}
