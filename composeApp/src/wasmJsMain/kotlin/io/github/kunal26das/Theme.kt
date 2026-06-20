package io.github.kunal26das

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import io.github.kunal26das.resources.Res
import io.github.kunal26das.resources.noto_emoji
import org.jetbrains.compose.resources.Font

// Palette
val Background = Color(0xFF080B12)
val Surface = Color(0xFF111622)
val SurfaceHi = Color(0xFF1B2233)
val OnSurface = Color(0xFFEDF1F8)
val Muted = Color(0xFF8B95A7)
val Violet = Color(0xFF7C5CFF)
val Cyan = Color(0xFF22D3EE)
val Pink = Color(0xFFFF5DA2)
val Border = Color(0xFF222A3A)

val AccentGradient = Brush.linearGradient(listOf(Violet, Cyan))
val WarmGradient = Brush.linearGradient(listOf(Pink, Violet))

private val ColorScheme = darkColorScheme(
    primary = Cyan,
    onPrimary = Background,
    secondary = Violet,
    background = Background,
    onBackground = OnSurface,
    surface = Surface,
    onSurface = OnSurface,
    surfaceVariant = SurfaceHi,
    outline = Border,
)

private fun appTypography(family: FontFamily) = Typography(
    displayLarge = TextStyle(fontFamily = family, fontWeight = FontWeight.Bold, fontSize = 72.sp, lineHeight = 76.sp, letterSpacing = (-1.5).sp),
    displaySmall = TextStyle(fontFamily = family, fontWeight = FontWeight.Bold, fontSize = 40.sp, lineHeight = 46.sp, letterSpacing = (-0.5).sp),
    headlineMedium = TextStyle(fontFamily = family, fontWeight = FontWeight.Bold, fontSize = 30.sp, lineHeight = 36.sp, letterSpacing = (-0.3).sp),
    titleLarge = TextStyle(fontFamily = family, fontWeight = FontWeight.SemiBold, fontSize = 20.sp, lineHeight = 26.sp),
    bodyLarge = TextStyle(fontFamily = family, fontWeight = FontWeight.Normal, fontSize = 17.sp, lineHeight = 28.sp),
    bodyMedium = TextStyle(fontFamily = family, fontWeight = FontWeight.Normal, fontSize = 15.sp, lineHeight = 23.sp),
    labelLarge = TextStyle(fontFamily = family, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 18.sp, letterSpacing = 1.5.sp),
)

@Composable
fun PortfolioTheme(content: @Composable () -> Unit) {
    // Skiko's bundled sans font has no emoji glyphs, so we register an emoji font as a
    // fallback in every text style. Skia shapes missing glyphs through the rest of the
    // family, so Latin text uses the default font and emoji come from Noto Emoji.
    val emojiFamily = FontFamily(Font(Res.font.noto_emoji))
    MaterialTheme(
        colorScheme = ColorScheme,
        typography = appTypography(emojiFamily),
        content = content,
    )
}
