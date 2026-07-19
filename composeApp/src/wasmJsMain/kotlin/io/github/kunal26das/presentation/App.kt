package io.github.kunal26das.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.hazeSource
import io.github.kunal26das.di.AppModule
import io.github.kunal26das.presentation.theme.Background
import io.github.kunal26das.presentation.theme.LocalHazeState
import io.github.kunal26das.presentation.theme.PortfolioTheme
import io.github.kunal26das.presentation.ui.background.AuroraBackground
import io.github.kunal26das.presentation.ui.navigation.NavHeight
import io.github.kunal26das.presentation.ui.navigation.TopNav
import io.github.kunal26das.presentation.ui.sections.AboutSection
import io.github.kunal26das.presentation.ui.sections.ExperienceSection
import io.github.kunal26das.presentation.ui.sections.FooterSection
import io.github.kunal26das.presentation.ui.sections.HeroSection
import io.github.kunal26das.presentation.ui.sections.ProjectsSection
import io.github.kunal26das.presentation.ui.sections.SkillsSection
import io.github.kunal26das.presentation.ui.sections.WritingSection
import kotlinx.coroutines.launch

@Composable
fun App() {
    val viewModel = remember { AppModule.providePortfolioViewModel() }
    val themeViewModel = remember { AppModule.provideThemeViewModel() }
    val state = viewModel.uiState

    PortfolioTheme(themeViewModel) {
        val scroll = rememberScrollState()
        val scope = rememberCoroutineScope()
        val density = LocalDensity.current
        val anchors = remember { mutableStateMapOf<String, Float>() }
        val navOffsetPx = with(density) { (NavHeight + 16.dp).toPx() }

        fun goTo(key: String) {
            val y = anchors[key] ?: return
            scope.launch { scroll.animateScrollTo((y - navOffsetPx).toInt().coerceAtLeast(0)) }
        }

        val scrolled = (scroll.value / 80f).coerceIn(0f, 1f)

        val backdropHaze = remember { HazeState() }
        val navHaze = remember { HazeState() }

        Box(modifier = Modifier.fillMaxSize().background(Background)) {
            AuroraBackground(
                Modifier
                    .fillMaxSize()
                    .hazeSource(state = backdropHaze)
                    .hazeSource(state = navHaze),
            )

            CompositionLocalProvider(LocalHazeState provides backdropHaze) {
                Column(
                    modifier =
                        Modifier
                            .fillMaxSize()
                            .verticalScroll(scroll)
                            .hazeSource(state = navHaze),
                ) {
                    Spacer(Modifier.height(NavHeight))
                    HeroSection(
                        profile = state.profile,
                        onViewWork = { goTo("work") },
                        onContact = viewModel::onContact,
                    )
                    Anchor("about", anchors) { AboutSection(state.profile) }
                    Anchor("skills", anchors) { SkillsSection(state.skills) }
                    Anchor("work", anchors) { ProjectsSection(state.projects, viewModel::onOpenUrl) }
                    Anchor("writing", anchors) { WritingSection(state.articles, viewModel::onOpenUrl) }
                    Anchor("journey", anchors) { ExperienceSection(state.experiences, viewModel::onOpenUrl) }
                    Anchor("contact", anchors) {
                        FooterSection(state.profile, viewModel::onContact, viewModel::onOpenUrl)
                    }
                }
            }

            CompositionLocalProvider(LocalHazeState provides navHaze) {
                TopNav(
                    name = state.profile.name,
                    scrolled = scrolled,
                    onHome = { scope.launch { scroll.animateScrollTo(0) } },
                    onNavigate = { goTo(it) },
                    onContact = viewModel::onContact,
                    modifier = Modifier.align(Alignment.TopCenter),
                )
            }
        }
    }
}

@Composable
private fun Anchor(
    key: String,
    anchors: MutableMap<String, Float>,
    content: @Composable () -> Unit,
) {
    Box(modifier = Modifier.onGloballyPositioned { anchors[key] = it.positionInParent().y }) {
        content()
    }
}
