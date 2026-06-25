package io.github.kunal26das.presentation.ui.components

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import io.github.kunal26das.presentation.theme.AccentGradient
import io.github.kunal26das.presentation.theme.LocalEmojiFontFamily
import io.github.kunal26das.presentation.theme.OnSurface

@Composable
fun emoji(
    text: String,
    color: Color = OnSurface,
): AnnotatedString {
    val family = LocalEmojiFontFamily.current
    return remember(text, family, color) {
        buildAnnotatedString {
            var i = 0
            while (i < text.length) {
                val c = text[i]
                val isPair = c.isHighSurrogate() && i + 1 < text.length && text[i + 1].isLowSurrogate()
                val chunk = text.substring(i, i + if (isPair) 2 else 1)
                if (c.code >= 0x2000) {
                    withStyle(SpanStyle(fontFamily = family, color = color)) { append(chunk) }
                } else {
                    append(chunk)
                }
                i += chunk.length
            }
        }
    }
}

@Composable
fun GradientText(
    text: String,
    style: TextStyle,
    brush: Brush = AccentGradient,
) {
    Text(text = emoji(text), style = style.copy(brush = brush))
}
