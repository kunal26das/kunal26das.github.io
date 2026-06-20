package io.github.kunal26das

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.hoverable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.input.pointer.PointerIcon
import androidx.compose.ui.input.pointer.pointerHoverIcon
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.util.lerp as lerpFloat

// ---------- Reusable hover card ----------

@Composable
fun HoverCard(
    modifier: Modifier = Modifier,
    featured: Boolean = false,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    val baseBorder = if (featured) Violet.copy(alpha = 0.45f) else Border
    val glow = if (featured) Violet else Cyan
    Column(
        modifier = modifier
            .graphicsLayer {
                val s = lerpFloat(1f, 1.02f, p)
                scaleX = s
                scaleY = s
            }
            .clip(RoundedCornerShape(18.dp))
            .background(lerp(Surface, SurfaceHi, p * 0.7f))
            .border(BorderStroke(1.dp, lerp(baseBorder, glow.copy(alpha = 0.6f), p)), RoundedCornerShape(18.dp))
            .hoverable(source)
            .let {
                if (onClick != null) it.pointerHoverIcon(PointerIcon.Hand).clickable(onClick = onClick) else it
            }
            .padding(24.dp),
        content = content,
    )
}

@Composable
private fun GradientTile(letter: String, size: Int = 40) {
    Box(
        modifier = Modifier
            .size(size.dp)
            .clip(RoundedCornerShape((size / 4).dp))
            .background(AccentGradient),
        contentAlignment = Alignment.Center,
    ) {
        Text(letter, color = Background, fontWeight = FontWeight.Bold)
    }
}

// ---------- Hero ----------

@Composable
fun Hero(onViewWork: () -> Unit, onContact: () -> Unit) {
    val shimmer = rememberShimmerBrush()
    SectionContainer(
        padding = PaddingValues(start = 24.dp, end = 24.dp, top = 96.dp, bottom = 88.dp),
    ) { compact ->
        Reveal(delayMillis = 0) {
            Box(
                modifier = Modifier
                    .size(82.dp)
                    .clip(CircleShape)
                    .background(shimmer),
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    modifier = Modifier
                        .size(74.dp)
                        .clip(CircleShape)
                        .background(Background),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("👋", fontSize = 34.sp)
                }
            }
        }
        Spacer(Modifier.height(24.dp))
        Reveal(delayMillis = 60) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .background(SurfaceHi)
                    .border(BorderStroke(1.dp, Border), RoundedCornerShape(50))
                    .padding(horizontal = 14.dp, vertical = 7.dp),
            ) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(Cyan))
                Spacer(Modifier.width(8.dp))
                Text("Open to new adventures", style = MaterialTheme.typography.bodyMedium, color = Cyan)
            }
        }
        Spacer(Modifier.height(24.dp))
        val heroStyle = if (compact) {
            MaterialTheme.typography.displayLarge.copy(fontSize = 42.sp, lineHeight = 48.sp)
        } else {
            MaterialTheme.typography.displayLarge
        }
        Reveal(delayMillis = 120) {
            Column {
                Text("Hi, I'm ${Profile.NAME}.", style = heroStyle, color = OnSurface)
                GradientText("I make apps people love.", style = heroStyle, brush = shimmer)
            }
        }
        Spacer(Modifier.height(22.dp))
        Reveal(delayMillis = 200) {
            Text(
                Profile.TAGLINE,
                style = MaterialTheme.typography.bodyLarge,
                color = Muted,
                modifier = Modifier.widthIn(max = 640.dp),
            )
        }
        Spacer(Modifier.height(32.dp))
        Reveal(delayMillis = 280) {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                GradientButton("See what I've made", onClick = onViewWork)
                OutlineButton("Say hello", onClick = onContact)
            }
        }
        Spacer(Modifier.height(44.dp))
        Reveal(delayMillis = 360) {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Stat("10+", "Years making apps")
                Stat("Millions", "People reached")
                Stat("Tons", "Of late-night coffee")
            }
        }
    }
}

@Composable
private fun Stat(value: String, label: String) {
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(14.dp))
            .background(Surface.copy(alpha = 0.6f))
            .border(BorderStroke(1.dp, Border), RoundedCornerShape(14.dp))
            .padding(horizontal = 20.dp, vertical = 14.dp),
    ) {
        GradientText(value, style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(2.dp))
        Text(label, style = MaterialTheme.typography.bodyMedium, color = Muted)
    }
}

// ---------- About ----------

@Composable
fun About() {
    SectionContainer { _ ->
        Reveal {
            Column {
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
            maxItemsInEachRow = if (compact) 1 else 2,
        ) {
            skills.forEachIndexed { index, group ->
                Reveal(delayMillis = index * 80, modifier = Modifier.weight(1f)) {
                    HoverCard(modifier = Modifier.fillMaxWidth()) {
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
}

// ---------- Experience ----------

@Composable
fun ExperienceSection() {
    SectionContainer { _ ->
        SectionTitle("Journey", "Apps I've helped build")
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            experience.forEachIndexed { index, exp ->
                Reveal(delayMillis = index * 70) {
                    ExperienceCard(exp, Modifier.fillMaxWidth().widthIn(max = 960.dp))
                }
            }
        }
    }
}

@Composable
private fun ExperienceCard(exp: Experience, modifier: Modifier = Modifier) {
    val onClick: (() -> Unit)? = exp.link?.let { link -> { openUrl(link) } }
    HoverCard(modifier = modifier, onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            GradientTile(exp.product.first().toString())
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
            LinkText("Get it on Play Store →") { openUrl(exp.link) }
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
            maxItemsInEachRow = if (compact) 1 else 2,
        ) {
            projects.forEachIndexed { index, project ->
                Reveal(delayMillis = index * 80, modifier = Modifier.weight(1f)) {
                    ProjectCard(project, Modifier.fillMaxWidth())
                }
            }
        }
    }
}

@Composable
private fun ProjectCard(project: Project, modifier: Modifier = Modifier) {
    HoverCard(
        modifier = modifier,
        featured = project.featured,
        onClick = { openUrl(project.live ?: project.repo) },
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            GradientTile(project.name.first().toString())
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
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    Text(
        text,
        style = MaterialTheme.typography.labelLarge.copy(letterSpacing = 0.2.sp),
        color = lerp(Cyan, OnSurface, p),
        modifier = Modifier
            .hoverable(source)
            .pointerHoverIcon(PointerIcon.Hand)
            .clickable(onClick = onClick),
    )
}

// ---------- Footer ----------

@Composable
fun Footer() {
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
    }
}
