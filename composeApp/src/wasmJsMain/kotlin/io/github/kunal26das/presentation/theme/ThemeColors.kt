package io.github.kunal26das.presentation.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

val Background: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.background
val Surface: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.surface
val SurfaceHi: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.surfaceHi
val OnSurface: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.onSurface
val Muted: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.muted
val Clay: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.clay
val ClayLight: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.clayLight
val Ochre: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.ochre
val Slate: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.slate
val Border: Color
    @Composable @ReadOnlyComposable
    get() = LocalPalette.current.border

val Violet: Color
    @Composable @ReadOnlyComposable
    get() = Clay
val Cyan: Color
    @Composable @ReadOnlyComposable
    get() = Slate
val Pink: Color
    @Composable @ReadOnlyComposable
    get() = Ochre

val AccentGradient: Brush
    @Composable @ReadOnlyComposable
    get() =
        Brush.linearGradient(listOf(Clay, ClayLight))
val WarmGradient: Brush
    @Composable @ReadOnlyComposable
    get() =
        Brush.linearGradient(listOf(ClayLight, Ochre))
