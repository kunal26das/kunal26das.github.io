package io.github.kunal26das.presentation.ui.components

import androidx.compose.animation.core.EaseOutCubic
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsHoveredAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.util.lerp
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.ClayLight
import io.github.kunal26das.presentation.theme.Ochre

@Composable
fun Reveal(
    delayMillis: Int = 0,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    var shown by remember { mutableStateOf(false) }
    val progress by animateFloatAsState(
        targetValue = if (shown) 1f else 0f,
        animationSpec = tween(durationMillis = 650, delayMillis = delayMillis, easing = EaseOutCubic),
        label = "reveal",
    )
    LaunchedEffect(Unit) { shown = true }
    Box(
        modifier =
            modifier.graphicsLayer {
                alpha = progress
                translationY = (1f - progress) * 28.dp.toPx()
            },
    ) {
        content()
    }
}

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

@Composable
fun rememberShimmerBrush(): Brush {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val shift by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec =
            infiniteRepeatable(
                animation = tween(durationMillis = 5200, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse,
            ),
        label = "shift",
    )
    return Brush.linearGradient(
        colors = listOf(Clay, ClayLight, Ochre, Clay),
        start = Offset(lerp(-220f, 120f, shift), 0f),
        end = Offset(lerp(360f, 700f, shift), 220f),
    )
}
