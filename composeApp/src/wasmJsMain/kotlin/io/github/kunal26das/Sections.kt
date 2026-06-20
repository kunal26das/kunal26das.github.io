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
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(SurfaceHi)
                .border(BorderStroke(1.dp, Border), RoundedCornerShape(50))
                .padding(horizontal = 14.dp, vertical = 7.dp),
        ) {
            Box(Modifier.size(8.dp).clip(androidx.compose.foundation.shape.CircleShape).background(Cyan))
            Spacer(Modifier.width(8.dp))
            Text(
                "👋 Open to new adventures",
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
        GradientText("I make apps people love.", style = heroStyle)
        Spacer(Modifier.height(20.dp))
        Text(
            Profile.TAGLINE,
            style = MaterialTheme.typography.bodyLarge,
            color = Muted,
            modifier = Modifier.widthIn(max = 620.dp),
        )
        Spacer(Modifier.height(32.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            GradientButton("See what I've made", onClick = onViewWork)
            OutlineButton("Say hello") { openUrl("mailto:${Profile.EMAIL}") }
        }
        Spacer(Modifier.height(40.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(32.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Stat("10+", "Years making apps")
            Stat("Millions", "People reached")
            Stat("Tons", "Of late-night coffee")
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
        SectionTitle("Hello", "A little about me")
        Text(
            "I'm Kunal, and I make mobile apps from ${Profile.LOCATION}. I've been at it since " +
                "${Profile.SINCE}, and along the way I've had the joy of building apps that " +
                "millions of people use every day — for ordering food, sharing stories, getting " +
                "work done, and more.\n\nWhat I care about most is simple: apps should be easy, " +
                "friendly, and a pleasure to use. The best technology is the kind you never have " +
                "to think about — it just works. That's what I try to make, every single time.",
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
        SectionTitle("What I bring", "Why people like working with me")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            skills.forEach { group ->
                Column(
                    modifier = Modifier
                        .width(if (compact) 320.dp else 460.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Surface)
                        .border(BorderStroke(1.dp, Border), RoundedCornerShape(16.dp))
                        .padding(24.dp),
                ) {
                    Text(group.icon, style = MaterialTheme.typography.displaySmall)
                    Spacer(Modifier.height(12.dp))
                    Text(group.title, style = MaterialTheme.typography.titleLarge, color = OnSurface)
                    Spacer(Modifier.height(8.dp))
                    Text(group.description, style = MaterialTheme.typography.bodyMedium, color = Muted)
                }
            }
        }
    }
}

// ---------- Experience ----------

@Composable
fun ExperienceSection() {
    SectionContainer { _ ->
        SectionTitle("Journey", "Apps I've helped build")
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            experience.forEach { exp ->
                ExperienceCard(exp, Modifier.fillMaxWidth().widthIn(max = 960.dp))
            }
        }
    }
}

@Composable
private fun ExperienceCard(exp: Experience, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(Surface)
            .border(BorderStroke(1.dp, Border), RoundedCornerShape(18.dp))
            .let { if (exp.link != null) it.clickable { openUrl(exp.link) } else it }
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
                    exp.product.first().toString(),
                    color = Background,
                    fontWeight = FontWeight.Bold,
                )
            }
            Spacer(Modifier.width(12.dp))
            Column {
                Text(exp.product, style = MaterialTheme.typography.titleLarge, color = OnSurface)
                Text(exp.period, style = MaterialTheme.typography.bodyMedium, color = Cyan)
            }
        }
        Spacer(Modifier.height(14.dp))
        Text(exp.blurb, style = MaterialTheme.typography.bodyMedium, color = Muted)
        if (exp.link != null) {
            Spacer(Modifier.height(18.dp))
            LinkText("Get it on Play Store") { openUrl(exp.link) }
        }
    }
}

// ---------- Projects ----------

@Composable
fun Projects() {
    SectionContainer { compact ->
        SectionTitle("Made for fun", "A few things I've built")
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
                    Text("⭐ Favorite", style = MaterialTheme.typography.bodyMedium, color = Violet)
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
            if (project.live != null) {
                LinkText(project.liveLabel ?: "Take a look →") { openUrl(project.live) }
            }
            LinkText("Peek behind the scenes") { openUrl(project.repo) }
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
        GradientText("Let's make something together. ✨", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(12.dp))
        Text(
            "Got an idea, a project, or just want to chat? I'd love to hear from you. " +
                "Drop me a line — I always write back.",
            style = MaterialTheme.typography.bodyLarge,
            color = Muted,
        )
        Spacer(Modifier.height(24.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            GradientButton("Say hello 👋") { openUrl("mailto:${Profile.EMAIL}") }
            OutlineButton("See my code") { openUrl(Profile.GITHUB) }
        }
        Spacer(Modifier.height(48.dp))
        Text(
            "© 2026 ${Profile.NAME} · Made with ❤️ in Bengaluru",
            style = MaterialTheme.typography.bodyMedium,
            color = Muted,
        )
    }
}
