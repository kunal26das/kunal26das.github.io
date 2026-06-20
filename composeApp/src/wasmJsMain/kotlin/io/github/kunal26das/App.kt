package io.github.kunal26das

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun App() {
    PortfolioTheme {
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

        Box(modifier = Modifier.fillMaxSize().background(Background)) {
            AuroraBackground(Modifier.fillMaxSize())

            Column(modifier = Modifier.fillMaxSize().verticalScroll(scroll)) {
                Spacer(Modifier.height(NavHeight))
                Hero(
                    onViewWork = { goTo("work") },
                    onContact = { openUrl("mailto:${Profile.EMAIL}") },
                )
                Anchor("about", anchors) { About() }
                Anchor("skills", anchors) { Skills() }
                Anchor("work", anchors) { Projects() }
                Anchor("journey", anchors) { ExperienceSection() }
                Anchor("contact", anchors) { Footer() }
            }

            TopNav(
                scrolled = scrolled,
                onHome = { scope.launch { scroll.animateScrollTo(0) } },
                onNavigate = { goTo(it) },
                onContact = { openUrl("mailto:${Profile.EMAIL}") },
                modifier = Modifier.align(Alignment.TopCenter),
            )
        }
    }
}

/** Records a section's vertical offset so the nav can smooth-scroll to it. */
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
