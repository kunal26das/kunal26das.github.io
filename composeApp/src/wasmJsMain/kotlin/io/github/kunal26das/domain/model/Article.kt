package io.github.kunal26das.domain.model

data class Article(
    val title: String,
    val blurb: String,
    val date: String,
    val url: String,
    val tags: List<String> = emptyList(),
)
