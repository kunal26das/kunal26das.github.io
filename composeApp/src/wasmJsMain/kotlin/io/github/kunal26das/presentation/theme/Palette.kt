package io.github.kunal26das.presentation.theme

import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

class Palette(
    val background: Color,
    val surface: Color,
    val surfaceHi: Color,
    val onSurface: Color,
    val muted: Color,
    val clay: Color,
    val clayLight: Color,
    val ochre: Color,
    val slate: Color,
    val border: Color,
    val isDark: Boolean,
)

val LightPalette =
    Palette(
        background = Color(0xFFF3F0E9),
        surface = Color(0xFFFBFAF6),
        surfaceHi = Color(0xFFFFFFFF),
        onSurface = Color(0xFF1F1D18),
        muted = Color(0xFF6E675B),
        clay = Color(0xFFC2613F),
        clayLight = Color(0xFFDB7E5A),
        ochre = Color(0xFFC79A4B),
        slate = Color(0xFF4F6470),
        border = Color(0xFFE4DDCE),
        isDark = false,
    )

val DarkPalette =
    Palette(
        background = Color(0xFF1B1916),
        surface = Color(0xFF262320),
        surfaceHi = Color(0xFF312D28),
        onSurface = Color(0xFFEDE7DB),
        muted = Color(0xFFA39B8B),
        clay = Color(0xFFD27A53),
        clayLight = Color(0xFFE89B72),
        ochre = Color(0xFFD9B362),
        slate = Color(0xFF8AA3AF),
        border = Color(0xFF3A352D),
        isDark = true,
    )

val LocalPalette = staticCompositionLocalOf { DarkPalette }
