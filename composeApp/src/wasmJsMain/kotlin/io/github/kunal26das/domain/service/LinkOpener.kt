package io.github.kunal26das.domain.service

interface LinkOpener {
    fun open(url: String)

    fun openEmail(email: String)
}
