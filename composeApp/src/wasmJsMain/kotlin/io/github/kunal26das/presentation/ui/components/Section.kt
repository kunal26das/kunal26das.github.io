package io.github.kunal26das.presentation.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.OnSurface

@Composable
fun SectionContainer(
    modifier: Modifier = Modifier,
    padding: PaddingValues = PaddingValues(horizontal = 24.dp, vertical = 72.dp),
    content: @Composable (compact: Boolean) -> Unit,
) {
    Box(modifier = modifier.fillMaxWidth(), contentAlignment = Alignment.TopCenter) {
        BoxWithConstraints {
            val compact = maxWidth < 720.dp
            Column(
                modifier =
                    Modifier
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
fun SectionTitle(
    label: String,
    title: String,
) {
    Text(
        text = label.uppercase(),
        style = MaterialTheme.typography.labelLarge,
        color = Clay,
    )
    Text(
        text = title,
        style = MaterialTheme.typography.displaySmall,
        color = OnSurface,
        modifier = Modifier.padding(top = 8.dp, bottom = 32.dp),
    )
}
