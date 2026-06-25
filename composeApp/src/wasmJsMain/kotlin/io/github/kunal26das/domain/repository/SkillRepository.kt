package io.github.kunal26das.domain.repository

import io.github.kunal26das.domain.model.SkillGroup

interface SkillRepository {
    fun getSkills(): List<SkillGroup>
}
