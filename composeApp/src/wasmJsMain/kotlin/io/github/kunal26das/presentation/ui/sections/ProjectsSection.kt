package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kunal26das.domain.model.Project
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.theme.Surface
import io.github.kunal26das.presentation.ui.components.CardGrid
import io.github.kunal26das.presentation.ui.components.LinkText
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.SectionTitle

@Composable
fun ProjectsSection(
    projects: List<Project>,
    onOpenUrl: (String) -> Unit,
) {
    SectionContainer { compact ->
        SectionTitle("01 / Selected work", "Different problems. Same curiosity.")
        CardGrid(projects.filter { it.featured }, compact) { index, project ->
            ProjectCard(index, project, onOpenUrl, Modifier.fillMaxWidth().fillMaxHeight())
        }
    }
}

@Composable
private fun ProjectCard(
    index: Int,
    project: Project,
    onOpenUrl: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier =
            modifier
                .background(Surface.copy(alpha = 0.86f), RoundedCornerShape(6.dp))
                .border(1.dp, Border, RoundedCornerShape(6.dp))
                .padding(26.dp),
    ) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("0${index + 1}", color = Clay, fontFamily = FontFamily.Monospace, fontSize = 13.sp)
            Text(project.category.uppercase(), color = Muted, fontFamily = FontFamily.Monospace, fontSize = 12.sp)
        }
        Spacer(Modifier.height(26.dp))
        Text(
            project.name,
            style = MaterialTheme.typography.displaySmall.copy(fontSize = 34.sp, lineHeight = 40.sp),
            color = OnSurface,
            modifier = Modifier.semantics { heading() },
        )
        Spacer(Modifier.height(14.dp))
        Text(project.blurb, style = MaterialTheme.typography.bodyLarge, color = Muted)
        Spacer(Modifier.height(22.dp))
        Text(project.tags.joinToString(" / "), fontFamily = FontFamily.Monospace, fontSize = 12.sp, color = Clay)
        Spacer(Modifier.height(24.dp))
        ProjectLinks(project, onOpenUrl)
    }
}

@Composable
fun ProjectLinks(
    project: Project,
    onOpenUrl: (String) -> Unit,
) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        project.web?.let { url -> LinkText(project.webLabel ?: "Open project") { onOpenUrl(url) } }
        project.live?.let { url -> LinkText(project.liveLabel ?: "Try it") { onOpenUrl(url) } }
        project.repo?.let { url -> LinkText("Source code") { onOpenUrl(url) } }
    }
}
