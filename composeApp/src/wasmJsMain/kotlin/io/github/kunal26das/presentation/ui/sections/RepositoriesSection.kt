package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kunal26das.domain.model.Project
import io.github.kunal26das.presentation.theme.Background
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.theme.Surface
import io.github.kunal26das.presentation.ui.components.LinkText
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.SectionTitle

@Composable
fun RepositoriesSection(
    projects: List<Project>,
    onOpenUrl: (String) -> Unit,
) {
    val repositories = projects.filter { it.repo != null }
    var category by remember { mutableStateOf("All") }
    val filtered = repositories.filter { category == "All" || it.category == category }
    SectionContainer { compact ->
        SectionTitle("03 / Open source", "The whole collection.")
        Text(
            "${repositories.size} public repositories. Current projects, useful tools and the early experiments that started it all.",
            style = MaterialTheme.typography.bodyLarge,
            color = Muted,
        )
        Spacer(Modifier.height(24.dp))
        FlowRow(
            modifier = Modifier.selectableGroup(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            (listOf("All") + repositories.map { it.category }.distinct()).forEach { label ->
                Box(
                    modifier =
                        Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(if (category == label) Clay else Surface)
                            .selectable(selected = category == label, role = Role.Tab, onClick = { category = label })
                            .padding(horizontal = 14.dp, vertical = 13.dp),
                ) {
                    Text(label, fontSize = 14.sp, color = if (category == label) Background else OnSurface)
                }
            }
        }
        Spacer(Modifier.height(24.dp))
        Text(
            "${filtered.size} ${if (filtered.size == 1) "repository" else "repositories"}",
            fontFamily = FontFamily.Monospace,
            fontSize = 12.sp,
            color = Muted,
            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
        )
        Spacer(Modifier.height(8.dp))
        Column {
            filtered.chunked(if (compact) 1 else 2).forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(40.dp)) {
                    row.forEach { project ->
                        Column(Modifier.weight(1f).padding(vertical = 20.dp)) {
                            Box(Modifier.fillMaxWidth().height(1.dp).background(Border))
                            Spacer(Modifier.height(18.dp))
                            Text(
                                project.name,
                                style = MaterialTheme.typography.titleLarge,
                                color = OnSurface,
                                modifier =
                                    Modifier
                                        .clickable(role = Role.Button) { project.repo?.let(onOpenUrl) }
                                        .heightIn(min = 44.dp)
                                        .wrapContentHeight(),
                            )
                            Spacer(Modifier.height(10.dp))
                            Text(project.blurb, style = MaterialTheme.typography.bodyMedium, color = Muted)
                            Spacer(Modifier.height(10.dp))
                            Text(
                                project.repo!!.substringAfterLast("/") + " / " + project.tags.first(),
                                fontSize = 12.sp,
                                lineHeight = 18.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Muted,
                            )
                            if (project.web != null) {
                                Spacer(Modifier.height(12.dp))
                                LinkText(project.webLabel ?: "Open project") { onOpenUrl(project.web) }
                            }
                        }
                    }
                    if (!compact && row.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }
    }
}
