package io.github.kunal26das.presentation.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.hoverable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
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
import io.github.kunal26das.presentation.theme.AccentGradient
import io.github.kunal26das.presentation.theme.Background
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.Cyan
import io.github.kunal26das.presentation.theme.LocalThemeViewModel
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.theme.liquidGlass
import androidx.compose.ui.util.lerp as lerpFloat

@Composable
fun GradientButton(
    text: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    Box(
        modifier =
            modifier
                .graphicsLayer {
                    scaleX = lerpFloat(1f, 1.04f, p)
                    scaleY = lerpFloat(1f, 1.04f, p)
                }
                .clip(RoundedCornerShape(12.dp))
                .background(AccentGradient)
                .hoverable(source)
                .pointerHoverIcon(PointerIcon.Hand)
                .clickable(onClick = onClick)
                .padding(horizontal = 22.dp, vertical = 13.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(emoji(text, Background), color = Background, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun SayHelloButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    GradientButton("Say hello 👋", modifier = modifier, onClick = onClick)
}

@Composable
fun ThemeToggle(modifier: Modifier = Modifier) {
    val themeViewModel = LocalThemeViewModel.current
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    Box(
        modifier =
            modifier
                .size(42.dp)
                .liquidGlass(RoundedCornerShape(50), tintAlpha = 0.14f + 0.18f * p)
                .border(
                    BorderStroke(1.dp, lerp(Border, Clay.copy(alpha = 0.6f), p)),
                    RoundedCornerShape(50),
                )
                .hoverable(source)
                .pointerHoverIcon(PointerIcon.Hand)
                .clickable(onClick = themeViewModel::toggle),
        contentAlignment = Alignment.Center,
    ) {
        val glyph = if (themeViewModel.isDark) "☀️" else "🌙"
        Text(emoji(glyph, OnSurface), fontSize = 19.sp)
    }
}

@Composable
fun OutlineButton(
    text: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    Box(
        modifier =
            modifier
                .liquidGlass(RoundedCornerShape(12.dp), tintAlpha = 0.12f + 0.18f * p)
                .border(
                    BorderStroke(1.dp, lerp(Border, Cyan.copy(alpha = 0.6f), p)),
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
