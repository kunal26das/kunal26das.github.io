package io.github.kunal26das.presentation.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun <T> CardGrid(
    items: List<T>,
    compact: Boolean,
    card: @Composable (index: Int, item: T) -> Unit,
) {
    val cols = if (compact) 1 else 2
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        items.chunked(cols).forEachIndexed { rowIndex, rowItems ->
            Row(
                modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Min),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                rowItems.forEachIndexed { colIndex, item ->
                    val index = rowIndex * cols + colIndex
                    Reveal(delayMillis = index * 80, modifier = Modifier.weight(1f).fillMaxHeight()) {
                        card(index, item)
                    }
                }
                repeat(cols - rowItems.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}
