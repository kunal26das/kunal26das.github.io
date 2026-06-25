package io.github.kunal26das.presentation.state

import io.github.kunal26das.domain.model.Experience
import io.github.kunal26das.domain.model.Profile
import io.github.kunal26das.domain.model.Project
import io.github.kunal26das.domain.model.SkillGroup

data class PortfolioUiState(
    val profile: Profile,
    val skills: List<SkillGroup>,
    val projects: List<Project>,
    val experiences: List<Experience>,
)
