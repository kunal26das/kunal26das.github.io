package io.github.kunal26das.domain.model

data class Experience(
    val product: String,
    val period: String,
    val blurb: String,
    val playStore: String? = null,
    val appStore: String? = null,
)
