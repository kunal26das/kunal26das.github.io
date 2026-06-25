package io.github.kunal26das.presentation.viewmodel

import io.github.kunal26das.domain.repository.ExperienceRepository
import io.github.kunal26das.domain.repository.ProfileRepository
import io.github.kunal26das.domain.repository.ProjectRepository
import io.github.kunal26das.domain.repository.SkillRepository
import io.github.kunal26das.domain.service.LinkOpener
import io.github.kunal26das.presentation.state.PortfolioUiState

class PortfolioViewModel(
    profileRepository: ProfileRepository,
    skillRepository: SkillRepository,
    projectRepository: ProjectRepository,
    experienceRepository: ExperienceRepository,
    private val linkOpener: LinkOpener,
) {
    val uiState: PortfolioUiState =
        PortfolioUiState(
            profile = profileRepository.getProfile(),
            skills = skillRepository.getSkills(),
            projects = projectRepository.getProjects(),
            experiences = experienceRepository.getExperiences(),
        )

    fun onOpenUrl(url: String) {
        linkOpener.open(url)
    }

    fun onContact() {
        linkOpener.openEmail(uiState.profile.email)
    }
}
