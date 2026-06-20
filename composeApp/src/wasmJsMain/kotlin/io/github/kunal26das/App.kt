package io.github.kunal26das

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import kotlinx.coroutines.launch

@Composable
fun App() {
    PortfolioTheme {
        val scroll = rememberScrollState()
        val scope = rememberCoroutineScope()
        var workY by remember { mutableStateOf(0f) }

        Box(modifier = Modifier.fillMaxSize().background(Background)) {
            Column(modifier = Modifier.fillMaxSize().verticalScroll(scroll)) {
                Hero(onViewWork = {
                    scope.launch { scroll.animateScrollTo(workY.toInt()) }
                })
                About()
                Skills()
                Box(modifier = Modifier.onGloballyPositioned { workY = it.positionInParent().y }) {
                    Projects()
                }
                Footer()
            }
        }
    }
}
