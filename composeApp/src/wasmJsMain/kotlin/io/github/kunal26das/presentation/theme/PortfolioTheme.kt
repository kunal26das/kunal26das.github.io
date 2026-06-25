package io.github.kunal26das.presentation.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import io.github.kunal26das.presentation.viewmodel.ThemeViewModel
import io.github.kunal26das.resources.Res
import io.github.kunal26das.resources.lora_bold
import io.github.kunal26das.resources.lora_medium
import io.github.kunal26das.resources.lora_regular
import io.github.kunal26das.resources.lora_semibold
import io.github.kunal26das.resources.noto_emoji
import org.jetbrains.compose.resources.Font

val LocalEmojiFontFamily = staticCompositionLocalOf<FontFamily> { FontFamily.Default }

val LocalThemeViewModel =
    staticCompositionLocalOf<ThemeViewModel> {
        error("ThemeViewModel not provided")
    }

private fun colorScheme(palette: Palette) =
    if (palette.isDark) {
        darkColorScheme(
            primary = palette.clay,
            onPrimary = palette.background,
            secondary = palette.slate,
            background = palette.background,
            onBackground = palette.onSurface,
            surface = palette.surface,
            onSurface = palette.onSurface,
            surfaceVariant = palette.surfaceHi,
            outline = palette.border,
        )
    } else {
        lightColorScheme(
            primary = palette.clay,
            onPrimary = palette.surface,
            secondary = palette.slate,
            background = palette.background,
            onBackground = palette.onSurface,
            surface = palette.surface,
            onSurface = palette.onSurface,
            surfaceVariant = palette.surfaceHi,
            outline = palette.border,
        )
    }

@Composable
fun PortfolioTheme(
    themeViewModel: ThemeViewModel,
    content: @Composable () -> Unit,
) {
    val palette = if (themeViewModel.isDark) DarkPalette else LightPalette

    val emojiFamily = FontFamily(Font(Res.font.noto_emoji))
    val serif =
        FontFamily(
            Font(Res.font.lora_regular, FontWeight.Normal),
            Font(Res.font.lora_medium, FontWeight.Medium),
            Font(Res.font.lora_semibold, FontWeight.SemiBold),
            Font(Res.font.lora_bold, FontWeight.Bold),
        )
    CompositionLocalProvider(
        LocalEmojiFontFamily provides emojiFamily,
        LocalPalette provides palette,
        LocalThemeViewModel provides themeViewModel,
    ) {
        MaterialTheme(
            colorScheme = colorScheme(palette),
            typography = appTypography(serif, FontFamily.Default),
            content = content,
        )
    }
}
