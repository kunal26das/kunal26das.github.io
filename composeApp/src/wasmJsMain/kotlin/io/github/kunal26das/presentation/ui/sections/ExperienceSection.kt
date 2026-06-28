package io.github.kunal26das.presentation.ui.sections

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.hoverable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.input.pointer.PointerIcon
import androidx.compose.ui.input.pointer.pointerHoverIcon
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kunal26das.domain.model.Experience
import io.github.kunal26das.presentation.theme.AccentGradient
import io.github.kunal26das.presentation.theme.Background
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Cyan
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.theme.Surface
import io.github.kunal26das.presentation.theme.Violet
import io.github.kunal26das.presentation.ui.components.HoverCard
import io.github.kunal26das.presentation.ui.components.LinkText
import io.github.kunal26das.presentation.ui.components.Reveal
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.SectionTitle
import io.github.kunal26das.presentation.ui.components.hoverProgress
import androidx.compose.ui.util.lerp as lerpFloat

@Composable
fun ExperienceSection(
    experiences: List<Experience>,
    onOpenUrl: (String) -> Unit,
) {
    SectionContainer { _ ->
        SectionTitle("Journey", "Apps I've helped build")
        val items = remember(experiences) { experiences.reversed() }
        var selected by remember { mutableStateOf(items.lastIndex) }

        Reveal {
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
                items.forEachIndexed { i, exp ->
                    TimelineNode(exp = exp, selected = i == selected, onClick = { selected = i })
                    if (i != items.lastIndex) {
                        Box(
                            modifier =
                                Modifier
                                    .weight(1f)
                                    .padding(top = 25.dp)
                                    .height(2.dp)
                                    .background(
                                        Brush.horizontalGradient(
                                            listOf(Violet.copy(alpha = 0.45f), Cyan.copy(alpha = 0.25f)),
                                        ),
                                    ),
                        )
                    }
                }
            }
        }
        Spacer(Modifier.height(28.dp))
        key(selected) {
            Reveal { ExperienceDetail(items[selected], onOpenUrl) }
        }
    }
}

@Composable
private fun TimelineNode(
    exp: Experience,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val source = remember { MutableInteractionSource() }
    val hover = hoverProgress(source)
    val sel by animateFloatAsState(targetValue = if (selected) 1f else 0f, label = "select")
    val year = exp.period.split(" ").firstOrNull { it.length == 4 && it.all { c -> c.isDigit() } } ?: ""
    val shortLabel = if (exp.period.contains("Present")) "Now" else year

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier =
            Modifier
                .hoverable(source)
                .pointerHoverIcon(PointerIcon.Hand)
                .clickable(onClick = onClick),
    ) {
        Box(
            modifier =
                Modifier
                    .graphicsLayer {
                        val s = lerpFloat(1f, 1.12f, maxOf(sel, hover * 0.6f))
                        scaleX = s
                        scaleY = s
                    }.size(52.dp)
                    .clip(CircleShape)
                    .background(if (selected) AccentGradient else SolidColor(Surface))
                    .border(BorderStroke(2.dp, lerp(Border, Cyan, sel)), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                exp.product.first().toString(),
                color = lerp(Muted, Background, sel),
                fontWeight = FontWeight.Bold,
            )
        }
        Spacer(Modifier.height(8.dp))
        Text(
            shortLabel,
            style = MaterialTheme.typography.labelLarge.copy(letterSpacing = 0.5.sp),
            color = lerp(Muted, Cyan, sel),
        )
    }
}

@Composable
private fun ExperienceDetail(
    exp: Experience,
    onOpenUrl: (String) -> Unit,
) {
    val primaryLink = exp.playStore ?: exp.appStore
    val onClick: (() -> Unit)? = primaryLink?.let { link -> { onOpenUrl(link) } }
    HoverCard(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(exp.product, style = MaterialTheme.typography.titleLarge, color = OnSurface)
            Spacer(Modifier.width(10.dp))
            Box(
                modifier =
                    Modifier
                        .clip(RoundedCornerShape(50))
                        .background(Cyan.copy(alpha = 0.14f))
                        .padding(horizontal = 10.dp, vertical = 3.dp),
            ) {
                Text(exp.period, style = MaterialTheme.typography.bodyMedium, color = Cyan)
            }
        }
        Spacer(Modifier.height(12.dp))
        Text(exp.blurb, style = MaterialTheme.typography.bodyLarge, color = Muted)
        if (exp.playStore != null || exp.appStore != null) {
            Spacer(Modifier.height(16.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                if (exp.playStore != null) {
                    LinkText("Get it on Play Store") { onOpenUrl(exp.playStore) }
                }
                if (exp.appStore != null) {
                    LinkText("Get it on the App Store") { onOpenUrl(exp.appStore) }
                }
            }
        }
    }
}
