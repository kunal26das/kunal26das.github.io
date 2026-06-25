package io.github.kunal26das.domain.repository

import io.github.kunal26das.domain.model.Profile

interface ProfileRepository {
    fun getProfile(): Profile
}
