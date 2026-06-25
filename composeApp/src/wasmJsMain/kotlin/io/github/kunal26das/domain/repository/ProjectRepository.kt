package io.github.kunal26das.domain.repository

import io.github.kunal26das.domain.model.Project

interface ProjectRepository {
    fun getProjects(): List<Project>
}
