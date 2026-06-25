package io.github.kunal26das.domain.repository

import io.github.kunal26das.domain.model.Experience

interface ExperienceRepository {
    fun getExperiences(): List<Experience>
}
