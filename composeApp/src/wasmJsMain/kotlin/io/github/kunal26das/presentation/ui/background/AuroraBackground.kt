package io.github.kunal26das.presentation.ui.background

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.Ochre
import io.github.kunal26das.presentation.theme.Slate
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun AuroraBackground(modifier: Modifier = Modifier) {
    val clay = Clay
    val ochre = Ochre
    val slate = Slate

    val transition = rememberInfiniteTransition(label = "aurora")
    val drift by transition.animateFloat(
        initialValue = 0f,
        targetValue = (2.0 * PI).toFloat(),
        animationSpec =
            infiniteRepeatable(
                animation = tween(durationMillis = 26000, easing = LinearEasing),
                repeatMode = RepeatMode.Restart,
            ),
        label = "drift",
    )

    Canvas(modifier) {
        val w = size.width
        val h = size.height
        val unit = minOf(w, h)

        fun blob(
            color: Color,
            baseX: Float,
            baseY: Float,
            ax: Float,
            ay: Float,
            phase: Float,
            radius: Float,
        ) {
            val cx = w * baseX + cos(drift + phase) * unit * ax
            val cy = h * baseY + sin(drift + phase) * unit * ay
            drawRect(
                brush =
                    Brush.radialGradient(
                        colors = listOf(color, Color.Transparent),
                        center = Offset(cx, cy),
                        radius = unit * radius,
                    ),
            )
        }

        blob(clay.copy(alpha = 0.13f), 0.22f, 0.02f, 0.06f, 0.04f, 0f, 0.95f)
        blob(ochre.copy(alpha = 0.12f), 0.88f, 0.08f, 0.05f, 0.05f, 2.1f, 0.78f)
        blob(slate.copy(alpha = 0.08f), 0.60f, 0.32f, 0.07f, 0.04f, 4.0f, 0.72f)
    }
}
