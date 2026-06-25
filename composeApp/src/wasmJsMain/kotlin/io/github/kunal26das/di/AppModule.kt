package io.github.kunal26das.di

import io.github.kunal26das.data.repository.ExperienceRepositoryImpl
import io.github.kunal26das.data.repository.ProfileRepositoryImpl
import io.github.kunal26das.data.repository.ProjectRepositoryImpl
import io.github.kunal26das.data.repository.SkillRepositoryImpl
import io.github.kunal26das.data.service.BrowserLinkOpener
import io.github.kunal26das.data.service.LocalStorageThemePreferenceStore
import io.github.kunal26das.domain.repository.ExperienceRepository
import io.github.kunal26das.domain.repository.ProfileRepository
import io.github.kunal26das.domain.repository.ProjectRepository
import io.github.kunal26das.domain.repository.SkillRepository
import io.github.kunal26das.domain.service.LinkOpener
import io.github.kunal26das.domain.service.ThemePreferenceStore
import io.github.kunal26das.presentation.viewmodel.PortfolioViewModel
import io.github.kunal26das.presentation.viewmodel.ThemeViewModel

object AppModule {
    private val profileRepository: ProfileRepository = ProfileRepositoryImpl()
    private val skillRepository: SkillRepository = SkillRepositoryImpl()
    private val projectRepository: ProjectRepository = ProjectRepositoryImpl()
    private val experienceRepository: ExperienceRepository = ExperienceRepositoryImpl()
    private val linkOpener: LinkOpener = BrowserLinkOpener()
    private val themePreferenceStore: ThemePreferenceStore = LocalStorageThemePreferenceStore()

    fun providePortfolioViewModel(): PortfolioViewModel =
        PortfolioViewModel(
            profileRepository = profileRepository,
            skillRepository = skillRepository,
            projectRepository = projectRepository,
            experienceRepository = experienceRepository,
            linkOpener = linkOpener,
        )

    fun provideThemeViewModel(): ThemeViewModel = ThemeViewModel(themePreferenceStore)
}
