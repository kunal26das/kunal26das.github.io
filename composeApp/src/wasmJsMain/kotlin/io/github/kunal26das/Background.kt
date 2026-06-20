package io.github.kunal26das

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/**
 * Soft, slowly drifting "aurora" blobs painted behind everything. Each blob is a radial
 * gradient that fades to transparent and is composited with [BlendMode.Plus] so overlaps
 * glow rather than flatten on the dark background.
 */
@Composable
fun AuroraBackground(modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "aurora")
    val drift by transition.animateFloat(
        initialValue = 0f,
        targetValue = (2.0 * PI).toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 26000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "drift",
    )

    Canvas(modifier) {
        val w = size.width
        val h = size.height
        val unit = minOf(w, h)

        fun blob(color: Color, baseX: Float, baseY: Float, ax: Float, ay: Float, phase: Float, radius: Float) {
            val cx = w * baseX + cos(drift + phase) * unit * ax
            val cy = h * baseY + sin(drift + phase) * unit * ay
            drawRect(
                brush = Brush.radialGradient(
                    colors = listOf(color, Color.Transparent),
                    center = Offset(cx, cy),
                    radius = unit * radius,
                ),
                blendMode = BlendMode.Plus,
            )
        }

        // Top-anchored violet wash behind the hero.
        blob(Violet.copy(alpha = 0.30f), 0.22f, 0.04f, 0.06f, 0.04f, 0f, 0.85f)
        // Drifting cyan on the right.
        blob(Cyan.copy(alpha = 0.18f), 0.86f, 0.10f, 0.05f, 0.05f, 2.1f, 0.70f)
        // Warm pink lower down for depth.
        blob(Pink.copy(alpha = 0.14f), 0.62f, 0.30f, 0.07f, 0.04f, 4.0f, 0.65f)
    }
}
