package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.github.kunal26das.domain.model.Profile
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.ui.components.Reveal
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.SectionTitle

@Composable
fun AboutSection(profile: Profile) {
    SectionContainer { _ ->
        Reveal {
            Column {
                SectionTitle("Hello", "A little about me")
                Text(
                    "I'm Kunal, and I make mobile apps from ${profile.location}. I've been at it since " +
                        "${profile.since}, and along the way I've had the joy of building apps that " +
                        "10 million+ people use every day — for ordering food, sharing stories, getting " +
                        "work done, and more. These days I build for iPhone and Android together, often " +
                        "sharing one codebase so both feel equally cared for.\n\nWhat I care about most " +
                        "is simple: apps should be easy, friendly, and a pleasure to use. The best " +
                        "technology is the kind you never have to think about — it just works, quickly " +
                        "and reliably. That's what I try to make, every single time.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Muted,
                    modifier = Modifier.widthIn(max = 720.dp),
                )
            }
        }
    }
}
