package io.github.kunal26das.presentation.theme

import androidx.compose.foundation.background
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.HazeStyle
import dev.chrisbanes.haze.HazeTint
import dev.chrisbanes.haze.hazeEffect

val LocalHazeState = compositionLocalOf<HazeState?> { null }

@Composable
fun rememberGlassStyle(tintAlpha: Float): HazeStyle =
    HazeStyle(
        backgroundColor = Background,
        tints = listOf(HazeTint(Surface.copy(alpha = tintAlpha))),
        blurRadius = 24.dp,
        noiseFactor = 0.04f,
    )

@Composable
fun glassSheen(): Brush {
    val highlight = if (LocalPalette.current.isDark) 0.10f else 0.45f
    return Brush.verticalGradient(
        listOf(
            Color.White.copy(alpha = highlight),
            Color.Transparent,
        ),
    )
}

@Composable
fun Modifier.liquidGlass(
    shape: Shape,
    tintAlpha: Float = 0.30f,
): Modifier {
    val haze = LocalHazeState.current
    return if (haze != null) {
        this
            .clip(shape)
            .hazeEffect(state = haze, style = rememberGlassStyle(tintAlpha))
            .background(glassSheen())
    } else {
        this
            .clip(shape)
            .background(Surface.copy(alpha = tintAlpha))
            .background(glassSheen())
    }
}
