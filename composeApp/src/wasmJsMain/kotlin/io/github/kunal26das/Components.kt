package io.github.kunal26das

import androidx.compose.animation.core.EaseOutCubic
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.hoverable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsHoveredAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.PointerIcon
import androidx.compose.ui.input.pointer.pointerHoverIcon
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.util.lerp

/** Centers content and caps it to a readable max width. */
@Composable
fun SectionContainer(
    modifier: Modifier = Modifier,
    padding: PaddingValues = PaddingValues(horizontal = 24.dp, vertical = 72.dp),
    content: @Composable (compact: Boolean) -> Unit,
) {
    Box(modifier = modifier.fillMaxWidth(), contentAlignment = Alignment.TopCenter) {
        androidx.compose.foundation.layout.BoxWithConstraints {
            val compact = maxWidth < 720.dp
            androidx.compose.foundation.layout.Column(
                modifier = Modifier
                    .widthIn(max = 980.dp)
                    .fillMaxWidth()
                    .padding(padding),
            ) {
                content(compact)
            }
        }
    }
}

@Composable
fun SectionTitle(label: String, title: String) {
    Text(
        text = label.uppercase(),
        style = MaterialTheme.typography.labelLarge,
        color = Cyan,
    )
    Text(
        text = title,
        style = MaterialTheme.typography.displaySmall,
        color = OnSurface,
        modifier = Modifier.padding(top = 8.dp, bottom = 32.dp),
    )
}

@Composable
fun Chip(text: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(SurfaceHi)
            .border(BorderStroke(1.dp, Border), RoundedCornerShape(50))
            .padding(horizontal = 12.dp, vertical = 6.dp),
    ) {
        Text(text, style = MaterialTheme.typography.bodyMedium, color = Muted)
    }
}

// ---------- Animation helpers ----------

/**
 * Fades and slides its content up once, shortly after first composition. [delayMillis]
 * staggers multiple reveals so a section assembles itself instead of snapping in.
 */
@Composable
fun Reveal(delayMillis: Int = 0, modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    var shown by remember { mutableStateOf(false) }
    val progress by animateFloatAsState(
        targetValue = if (shown) 1f else 0f,
        animationSpec = tween(durationMillis = 650, delayMillis = delayMillis, easing = EaseOutCubic),
        label = "reveal",
    )
    LaunchedEffect(Unit) { shown = true }
    Box(
        modifier = modifier.graphicsLayer {
            alpha = progress
            translationY = (1f - progress) * 28.dp.toPx()
        },
    ) {
        content()
    }
}

/** 0f when idle, animates to 1f while the pointer hovers [source]. */
@Composable
fun hoverProgress(source: MutableInteractionSource): Float {
    val hovered by source.collectIsHoveredAsState()
    val progress by animateFloatAsState(
        targetValue = if (hovered) 1f else 0f,
        animationSpec = tween(durationMillis = 180),
        label = "hover",
    )
    return progress
}

/** A linear-gradient brush whose angle slowly sweeps, giving text a living shimmer. */
@Composable
fun rememberShimmerBrush(): Brush {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val shift by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 5200, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "shift",
    )
    return Brush.linearGradient(
        colors = listOf(Violet, Cyan, Pink, Violet),
        start = Offset(lerp(-220f, 120f, shift), 0f),
        end = Offset(lerp(360f, 700f, shift), 220f),
    )
}

// ---------- Buttons ----------

@Composable
fun GradientButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    Box(
        modifier = modifier
            .graphicsLayer {
                scaleX = lerp(1f, 1.04f, p)
                scaleY = lerp(1f, 1.04f, p)
            }
            .clip(RoundedCornerShape(12.dp))
            .background(AccentGradient)
            .hoverable(source)
            .pointerHoverIcon(PointerIcon.Hand)
            .clickable(onClick = onClick)
            .padding(horizontal = 22.dp, vertical = 13.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = Background, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun OutlineButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(androidx.compose.ui.graphics.lerp(androidx.compose.ui.graphics.Color.Transparent, SurfaceHi, p))
            .border(
                BorderStroke(1.dp, androidx.compose.ui.graphics.lerp(Border, Cyan.copy(alpha = 0.6f), p)),
                RoundedCornerShape(12.dp),
            )
            .hoverable(source)
            .pointerHoverIcon(PointerIcon.Hand)
            .clickable(onClick = onClick)
            .padding(horizontal = 22.dp, vertical = 13.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = OnSurface, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun GradientText(
    text: String,
    style: TextStyle,
    brush: Brush = AccentGradient,
) {
    Text(text = text, style = style.copy(brush = brush))
}
