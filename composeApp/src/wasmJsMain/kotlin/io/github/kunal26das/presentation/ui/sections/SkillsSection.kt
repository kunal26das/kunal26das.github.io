package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.github.kunal26das.domain.model.SkillGroup
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.ui.components.CardGrid
import io.github.kunal26das.presentation.ui.components.HoverCard
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.SectionTitle
import io.github.kunal26das.presentation.ui.components.emoji

@Composable
fun SkillsSection(skills: List<SkillGroup>) {
    SectionContainer { compact ->
        SectionTitle("What I bring", "Why people like working with me")
        CardGrid(skills, compact) { _, group ->
            HoverCard(modifier = Modifier.fillMaxWidth().fillMaxHeight()) {
                Text(emoji(group.icon), style = MaterialTheme.typography.displaySmall)
                Spacer(Modifier.height(12.dp))
                Text(group.title, style = MaterialTheme.typography.titleLarge, color = OnSurface)
                Spacer(Modifier.height(8.dp))
                Text(group.description, style = MaterialTheme.typography.bodyMedium, color = Muted)
            }
        }
    }
}
