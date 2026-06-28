package io.github.kunal26das.presentation.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.hoverable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
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
import io.github.kunal26das.presentation.theme.AccentGradient
import io.github.kunal26das.presentation.theme.Background
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Cyan
import io.github.kunal26das.presentation.theme.Violet
import io.github.kunal26das.presentation.theme.liquidGlass
import androidx.compose.ui.util.lerp as lerpFloat

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
        modifier =
            modifier
                .graphicsLayer {
                    val s = lerpFloat(1f, 1.02f, p)
                    scaleX = s
                    scaleY = s
                }.liquidGlass(RoundedCornerShape(18.dp), tintAlpha = 0.26f + 0.10f * p)
                .border(BorderStroke(1.dp, lerp(baseBorder, glow.copy(alpha = 0.6f), p)), RoundedCornerShape(18.dp))
                .hoverable(source)
                .let {
                    if (onClick != null) it.pointerHoverIcon(PointerIcon.Hand).clickable(onClick = onClick) else it
                }.padding(24.dp),
        content = content,
    )
}

@Composable
fun GradientTile(
    letter: String,
    size: Int = 40,
) {
    Box(
        modifier =
            Modifier
                .size(size.dp)
                .clip(RoundedCornerShape((size / 4).dp))
                .background(AccentGradient),
        contentAlignment = Alignment.Center,
    ) {
        Text(letter, color = Background, fontWeight = FontWeight.Bold)
    }
}
