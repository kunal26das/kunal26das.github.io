package io.github.kunal26das

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

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
            Column(
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
        style = androidx.compose.material3.MaterialTheme.typography.labelLarge,
        color = Cyan,
    )
    Text(
        text = title,
        style = androidx.compose.material3.MaterialTheme.typography.displaySmall,
        color = OnSurface,
        modifier = Modifier.padding(top = 6.dp, bottom = 32.dp),
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
        Text(text, style = androidx.compose.material3.MaterialTheme.typography.bodyMedium, color = Muted)
    }
}

@Composable
fun GradientButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(AccentGradient)
            .clickable(onClick = onClick)
            .padding(horizontal = 22.dp, vertical = 13.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = Background, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun OutlineButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .border(BorderStroke(1.dp, Border), RoundedCornerShape(12.dp))
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
    style: androidx.compose.ui.text.TextStyle,
    brush: Brush = AccentGradient,
) {
    Text(text = text, style = style.copy(brush = brush))
}
