package io.github.kunal26das.presentation.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.hoverable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.input.pointer.PointerIcon
import androidx.compose.ui.input.pointer.pointerHoverIcon
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kunal26das.presentation.theme.AccentGradient
import io.github.kunal26das.presentation.theme.Background
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.theme.SurfaceHi
import io.github.kunal26das.presentation.theme.liquidGlass
import io.github.kunal26das.presentation.ui.components.SayHelloButton
import io.github.kunal26das.presentation.ui.components.ThemeToggle
import io.github.kunal26das.presentation.ui.components.hoverProgress

val NavHeight = 64.dp

@Composable
fun TopNav(
    name: String,
    scrolled: Float,
    onHome: () -> Unit,
    onNavigate: (String) -> Unit,
    onContact: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier =
            modifier
                .fillMaxWidth()
                .heightIn(min = NavHeight)
                .liquidGlass(RectangleShape, tintAlpha = 0.10f + 0.24f * scrolled),
        contentAlignment = Alignment.Center,
    ) {
        Box(
            Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(1.dp)
                .background(lerp(Color.Transparent, Border, scrolled)),
        )
        BoxWithConstraints(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            val compact = maxWidth < 720.dp
            Row(
                modifier =
                    Modifier
                        .fillMaxWidth()
                        .widthIn(max = 1120.dp)
                        .padding(horizontal = 24.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Monogram(onHome)
                if (!compact) {
                    Spacer(Modifier.width(12.dp))
                    Text(
                        name,
                        style = MaterialTheme.typography.titleLarge,
                        color = OnSurface,
                        modifier =
                            Modifier
                                .pointerHoverIcon(PointerIcon.Hand)
                                .clickable(onClick = onHome),
                    )
                }
                Spacer(Modifier.weight(1f))
                if (!compact) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        NavLink("About") { onNavigate("about") }
                        NavLink("Work") { onNavigate("work") }
                        NavLink("Writing") { onNavigate("writing") }
                        NavLink("Journey") { onNavigate("journey") }
                        Spacer(Modifier.width(8.dp))
                    }
                }
                ThemeToggle()
                Spacer(Modifier.width(10.dp))
                SayHelloButton(onClick = onContact)
            }
        }
    }
}

@Composable
private fun Monogram(onClick: () -> Unit) {
    Box(
        modifier =
            Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(11.dp))
                .background(AccentGradient)
                .pointerHoverIcon(PointerIcon.Hand)
                .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text("KD", color = Background, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun NavLink(
    text: String,
    onClick: () -> Unit,
) {
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    Box(
        modifier =
            Modifier
                .clip(RoundedCornerShape(8.dp))
                .background(lerp(Color.Transparent, SurfaceHi, p))
                .hoverable(source)
                .pointerHoverIcon(PointerIcon.Hand)
                .clickable(onClick = onClick)
                .padding(horizontal = 12.dp, vertical = 8.dp),
    ) {
        Text(
            text,
            style = MaterialTheme.typography.labelLarge.copy(letterSpacing = 0.2.sp),
            color = lerp(Muted, OnSurface, p),
        )
    }
}
