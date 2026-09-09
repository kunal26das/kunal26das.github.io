package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kunal26das.domain.model.Profile
import io.github.kunal26das.domain.model.Project
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.ui.components.GradientButton
import io.github.kunal26das.presentation.ui.components.OutlineButton
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.Workbench

@Composable
fun HeroSection(
    profile: Profile,
    projects: List<Project>,
    onViewWork: () -> Unit,
    onContact: () -> Unit,
    onOpenUrl: (String) -> Unit,
) {
    SectionContainer(padding = PaddingValues(horizontal = 24.dp, vertical = 56.dp)) { compact ->
        if (compact) {
            Introduction(profile, true, onViewWork, onContact)
            Spacer(Modifier.height(40.dp))
            Workbench(projects, onOpenUrl, Modifier.fillMaxWidth())
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(40.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.weight(1.35f)) { Introduction(profile, false, onViewWork, onContact) }
                Workbench(projects, onOpenUrl, Modifier.weight(1f))
            }
        }
        Spacer(Modifier.height(48.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(Border))
        FlowRow(
            modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(48.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            Evidence("10M+", "people reached")
            Evidence("99%+", "crash-free sessions")
            Evidence(projects.count { it.repo != null }.toString(), "public repositories")
            Evidence("Since ${profile.since}", "shipping & learning")
        }
    }
}

@Composable
private fun Introduction(
    profile: Profile,
    compact: Boolean,
    onViewWork: () -> Unit,
    onContact: () -> Unit,
) {
    Column {
        Text("${profile.name.uppercase()} / MOBILE DEVELOPER", fontSize = 12.sp, fontFamily = FontFamily.Monospace, color = Clay)
        Spacer(Modifier.height(24.dp))
        val display =
            MaterialTheme.typography.displayLarge.copy(
                fontSize = if (compact) 44.sp else 58.sp,
                lineHeight = if (compact) 50.sp else 65.sp,
            )
        Text("Mobile by trade.", style = display, color = OnSurface, modifier = Modifier.semantics { heading() })
        Text("Curious by\ndefault.", style = display, color = Clay)
        Spacer(Modifier.height(24.dp))
        Text(
            "I’m ${profile.name}. I build apps people rely on — and explore the ideas I can’t leave alone. " +
                "From apps used by millions to game engines, shared libraries and algorithm playgrounds.",
            style = MaterialTheme.typography.bodyLarge,
            color = Muted,
        )
        Spacer(Modifier.height(28.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            GradientButton("Explore the work", onClick = onViewWork)
            OutlineButton("Let’s talk", onClick = onContact)
        }
        Spacer(Modifier.height(24.dp))
        Text("${profile.location}  /  Kotlin · Compose · React Native", fontSize = 13.sp, lineHeight = 21.sp, color = Muted)
    }
}

@Composable
private fun Evidence(
    value: String,
    label: String,
) {
    Column {
        Text(value, style = MaterialTheme.typography.headlineMedium, color = OnSurface)
        Spacer(Modifier.height(3.dp))
        Text(label, fontFamily = FontFamily.Monospace, fontSize = 12.sp, color = Muted)
    }
}
