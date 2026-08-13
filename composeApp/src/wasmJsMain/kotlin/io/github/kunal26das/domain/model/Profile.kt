package io.github.kunal26das.domain.model

data class Profile(
    val name: String,
    val role: String,
    val tagline: String,
    val location: String,
    val linkedIn: String,
    val gitHub: String,
    val resume: String,
    val email: String,
    val since: Int,
)
