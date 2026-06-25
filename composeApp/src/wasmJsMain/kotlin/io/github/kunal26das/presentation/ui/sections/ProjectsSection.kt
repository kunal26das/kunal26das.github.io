package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import io.github.kunal26das.domain.model.Project
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.theme.Violet
import io.github.kunal26das.presentation.ui.components.CardGrid
import io.github.kunal26das.presentation.ui.components.Chip
import io.github.kunal26das.presentation.ui.components.GradientTile
import io.github.kunal26das.presentation.ui.components.HoverCard
import io.github.kunal26das.presentation.ui.components.LinkText
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.SectionTitle
import io.github.kunal26das.presentation.ui.components.emoji

@Composable
fun ProjectsSection(
    projects: List<Project>,
    onOpenUrl: (String) -> Unit,
) {
    SectionContainer { compact ->
        SectionTitle("Made for fun", "A few things I've built")
        CardGrid(projects, compact) { _, project ->
            ProjectCard(project, onOpenUrl, Modifier.fillMaxWidth().fillMaxHeight())
        }
    }
}

@Composable
private fun ProjectCard(
    project: Project,
    onOpenUrl: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    HoverCard(
        modifier = modifier,
        featured = project.featured,
        onClick = { onOpenUrl(project.web ?: project.live ?: project.repo) },
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            GradientTile(project.name.first().toString())
            Spacer(Modifier.width(12.dp))
            Text(project.name, style = MaterialTheme.typography.titleLarge, color = OnSurface)
            if (project.featured) {
                Spacer(Modifier.width(10.dp))
                Box(
                    modifier =
                        Modifier
                            .clip(RoundedCornerShape(50))
                            .background(Violet.copy(alpha = 0.18f))
                            .padding(horizontal = 9.dp, vertical = 3.dp),
                ) {
                    Text(emoji("⭐ Favorite", Violet), style = MaterialTheme.typography.bodyMedium, color = Violet)
                }
            }
        }
        Spacer(Modifier.height(14.dp))
        Text(project.blurb, style = MaterialTheme.typography.bodyMedium, color = Muted)
        Spacer(Modifier.height(16.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            project.tags.forEach { Chip(it) }
        }
        Spacer(Modifier.height(18.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(20.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (project.live != null) {
                LinkText(project.liveLabel ?: "Take a look") { onOpenUrl(project.live) }
            }
            if (project.web != null) {
                LinkText(project.webLabel ?: "Open web app") { onOpenUrl(project.web) }
            }
            LinkText("Peek behind the scenes") { onOpenUrl(project.repo) }
        }
    }
}
