package io.github.kunal26das

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ---------- Hero ----------

@Composable
fun Hero(onViewWork: () -> Unit) {
    SectionContainer(
        padding = androidx.compose.foundation.layout.PaddingValues(
            start = 24.dp, end = 24.dp, top = 120.dp, bottom = 96.dp,
        ),
    ) { compact ->
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(SurfaceHi)
                .border(BorderStroke(1.dp, Border), RoundedCornerShape(50))
                .padding(horizontal = 14.dp, vertical = 7.dp),
        ) {
            Text(
                "● Available for opportunities",
                style = MaterialTheme.typography.bodyMedium,
                color = Cyan,
            )
        }
        Spacer(Modifier.height(24.dp))
        val heroStyle = if (compact) {
            MaterialTheme.typography.displayLarge.copy(fontSize = 40.sp, lineHeight = 46.sp)
        } else {
            MaterialTheme.typography.displayLarge
        }
        Text(
            "Hi, I'm ${Profile.NAME}.",
            style = heroStyle,
            color = OnSurface,
        )
        GradientText("I make Android feel effortless.", style = heroStyle)
        Spacer(Modifier.height(20.dp))
        Text(
            Profile.TAGLINE,
            style = MaterialTheme.typography.bodyLarge,
            color = Muted,
            modifier = Modifier.widthIn(max = 620.dp),
        )
        Spacer(Modifier.height(32.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            GradientButton("View my work", onClick = onViewWork)
            OutlineButton("GitHub") { openUrl(Profile.GITHUB) }
            OutlineButton("Email me") { openUrl("mailto:${Profile.EMAIL}") }
        }
        Spacer(Modifier.height(40.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(32.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Stat("6+", "Years in Android")
            Stat("2", "Apps on Play Store")
            Stat("100%", "Kotlin-first")
        }
    }
}

@Composable
private fun Stat(value: String, label: String) {
    Column {
        GradientText(value, style = MaterialTheme.typography.headlineMedium)
        Text(label, style = MaterialTheme.typography.bodyMedium, color = Muted)
    }
}

// ---------- About ----------

@Composable
fun About() {
    SectionContainer { _ ->
        SectionTitle("About", "A bit about me")
        Text(
            "I'm an Android engineer based in ${Profile.LOCATION}, building apps in Kotlin since " +
                "${Profile.SINCE}. I care about clean architecture, smooth Compose UI, and shipping " +
                "real products people can download. Lately I've been exploring Compose Multiplatform " +
                "and Kotlin/Wasm — the very tech this site runs on.",
            style = MaterialTheme.typography.bodyLarge,
            color = Muted,
            modifier = Modifier.widthIn(max = 720.dp),
        )
    }
}

// ---------- Skills ----------

@Composable
fun Skills() {
    SectionContainer { compact ->
        SectionTitle("Skills", "What I work with")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            skills.forEach { group ->
                Column(
                    modifier = Modifier
                        .width(if (compact) 320.dp else 300.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Surface)
                        .border(BorderStroke(1.dp, Border), RoundedCornerShape(16.dp))
                        .padding(20.dp),
                ) {
                    Text(group.title, style = MaterialTheme.typography.titleLarge, color = OnSurface)
                    Spacer(Modifier.height(14.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        group.items.forEach { Chip(it) }
                    }
                }
            }
        }
    }
}

// ---------- Projects ----------

@Composable
fun Projects() {
    SectionContainer { compact ->
        SectionTitle("Work", "Selected projects")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            projects.forEach { project ->
                ProjectCard(project, Modifier.width(if (compact) 340.dp else 470.dp))
            }
        }
    }
}

@Composable
private fun ProjectCard(project: Project, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(Surface)
            .border(
                BorderStroke(1.dp, if (project.featured) Violet.copy(alpha = 0.45f) else Border),
                RoundedCornerShape(18.dp),
            )
            .clickable { openUrl(project.live ?: project.repo) }
            .padding(24.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(AccentGradient),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    project.name.first().toString(),
                    color = Background,
                    fontWeight = FontWeight.Bold,
                )
            }
            Spacer(Modifier.width(12.dp))
            Text(project.name, style = MaterialTheme.typography.titleLarge, color = OnSurface)
            if (project.featured) {
                Spacer(Modifier.width(10.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(Violet.copy(alpha = 0.18f))
                        .padding(horizontal = 9.dp, vertical = 3.dp),
                ) {
                    Text("Featured", style = MaterialTheme.typography.bodyMedium, color = Violet)
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
        Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
            LinkText("Code →") { openUrl(project.repo) }
            if (project.live != null) {
                LinkText("${project.liveLabel} →") { openUrl(project.live) }
            }
        }
    }
}

@Composable
private fun LinkText(text: String, onClick: () -> Unit) {
    Text(
        text,
        style = MaterialTheme.typography.labelLarge,
        color = Cyan,
        modifier = Modifier.clickable(onClick = onClick),
    )
}

// ---------- Footer ----------

@Composable
fun Footer() {
    SectionContainer(
        padding = androidx.compose.foundation.layout.PaddingValues(
            start = 24.dp, end = 24.dp, top = 56.dp, bottom = 56.dp,
        ),
    ) { _ ->
        Box(Modifier.fillMaxWidth().height(1.dp).background(Border))
        Spacer(Modifier.height(40.dp))
        GradientText("Let's build something.", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(12.dp))
        Text(
            "The fastest way to reach me is email. I'm always up for a good Android problem.",
            style = MaterialTheme.typography.bodyLarge,
            color = Muted,
        )
        Spacer(Modifier.height(24.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            GradientButton("Say hello") { openUrl("mailto:${Profile.EMAIL}") }
            OutlineButton("GitHub") { openUrl(Profile.GITHUB) }
        }
        Spacer(Modifier.height(48.dp))
        Text(
            "© 2026 ${Profile.NAME} · Built with Compose Multiplatform + Kotlin/Wasm",
            style = MaterialTheme.typography.bodyMedium,
            color = Muted,
        )
    }
}
