package io.github.kunal26das.presentation.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.dom.events.Event
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.js

/** Browser preferences shared by decorative motion and explicit navigation. */
data class MotionPreferences(
    val reduceMotion: Boolean = false,
    val pageVisible: Boolean = true,
) {
    val animationsEnabled: Boolean
        get() = !reduceMotion && pageVisible
}

val LocalMotionPreferences = compositionLocalOf { MotionPreferences() }

// The generated browser bindings do not expose Document.visibilityState yet.
@OptIn(ExperimentalWasmJsInterop::class)
private fun isPageVisible(): Boolean = js("document.visibilityState !== 'hidden'")

@Composable
fun rememberMotionPreferences(): MotionPreferences {
    val query = remember { window.matchMedia("(prefers-reduced-motion: reduce)") }
    var reduceMotion by remember(query) { mutableStateOf(query.matches) }
    var pageVisible by remember { mutableStateOf(isPageVisible()) }

    DisposableEffect(query) {
        val onMotionChange: (Event) -> Unit = { reduceMotion = query.matches }
        val onVisibilityChange: (Event) -> Unit = { pageVisible = isPageVisible() }
        query.addEventListener("change", onMotionChange)
        document.addEventListener("visibilitychange", onVisibilityChange)
        reduceMotion = query.matches
        pageVisible = isPageVisible()

        onDispose {
            query.removeEventListener("change", onMotionChange)
            document.removeEventListener("visibilitychange", onVisibilityChange)
        }
    }

    return MotionPreferences(reduceMotion, pageVisible)
}
