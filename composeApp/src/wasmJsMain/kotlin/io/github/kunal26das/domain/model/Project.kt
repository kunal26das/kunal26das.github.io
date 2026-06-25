package io.github.kunal26das.domain.model

data class Project(
    val name: String,
    val blurb: String,
    val tags: List<String>,
    val repo: String,
    val live: String? = null,
    val liveLabel: String? = null,
    val web: String? = null,
    val webLabel: String? = null,
    val featured: Boolean = false,
)
