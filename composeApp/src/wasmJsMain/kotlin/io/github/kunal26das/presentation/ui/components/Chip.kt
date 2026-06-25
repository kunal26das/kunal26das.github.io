package io.github.kunal26das.presentation.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.liquidGlass

@Composable
fun Chip(text: String) {
    Box(
        modifier =
            Modifier
                .liquidGlass(RoundedCornerShape(50), tintAlpha = 0.22f)
                .border(BorderStroke(1.dp, Border), RoundedCornerShape(50))
                .padding(horizontal = 12.dp, vertical = 6.dp),
    ) {
        Text(emoji(text, Muted), style = MaterialTheme.typography.bodyMedium, color = Muted)
    }
}
