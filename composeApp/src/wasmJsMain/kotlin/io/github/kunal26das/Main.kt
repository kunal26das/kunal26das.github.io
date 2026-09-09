package io.github.kunal26das

import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport
import io.github.kunal26das.presentation.App
import kotlinx.browser.document

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    val root = document.getElementById("compose-root") ?: return
    ComposeViewport(root) {
        App()
        LaunchedEffect(Unit) {
            // Wait until Compose has had a frame to draw before replacing readable HTML.
            withFrameNanos { }
            withFrameNanos { }
            root.removeAttribute("aria-hidden")
            document.documentElement?.classList?.add("compose-ready")
        }
    }
}
