package io.github.kunal26das.domain.repository

import io.github.kunal26das.domain.model.Article

interface ArticleRepository {
    fun getArticles(): List<Article>
}
