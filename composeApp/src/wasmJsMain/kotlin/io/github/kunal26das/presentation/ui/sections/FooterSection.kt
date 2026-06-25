package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.github.kunal26das.domain.model.Profile
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.ui.components.GradientText
import io.github.kunal26das.presentation.ui.components.OutlineButton
import io.github.kunal26das.presentation.ui.components.Reveal
import io.github.kunal26das.presentation.ui.components.SayHelloButton
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.emoji

@Composable
fun FooterSection(
    profile: Profile,
    onContact: () -> Unit,
    onOpenUrl: (String) -> Unit,
) {
    SectionContainer(
        padding = PaddingValues(start = 24.dp, end = 24.dp, top = 56.dp, bottom = 56.dp),
    ) { _ ->
        Box(Modifier.fillMaxWidth().height(1.dp).background(Border))
        Spacer(Modifier.height(40.dp))
        Reveal {
            Column {
                GradientText("Let's make something together. ✨", style = MaterialTheme.typography.headlineMedium)
                Spacer(Modifier.height(12.dp))
                Text(
                    "Got an idea, a project, or just want to chat? I'd love to hear from you. " +
                        "Drop me a line — I always write back.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Muted,
                )
                Spacer(Modifier.height(24.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                ) {
                    SayHelloButton(onClick = onContact)
                    OutlineButton("See my code") { onOpenUrl(profile.gitHub) }
                    OutlineButton("Connect on LinkedIn") { onOpenUrl(profile.linkedIn) }
                }
                Spacer(Modifier.height(48.dp))
                Text(
                    emoji("© 2026 ${profile.name} · Made with ❤️ in Bengaluru", Muted),
                    style = MaterialTheme.typography.bodyMedium,
                    color = Muted,
                )
            }
        }
    }
}
