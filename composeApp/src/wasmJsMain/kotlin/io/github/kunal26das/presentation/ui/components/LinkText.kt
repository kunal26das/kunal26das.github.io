package io.github.kunal26das.presentation.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.hoverable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.input.pointer.PointerIcon
import androidx.compose.ui.input.pointer.pointerHoverIcon
import androidx.compose.ui.unit.sp
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.OnSurface

@Composable
fun LinkText(
    text: String,
    onClick: () -> Unit,
) {
    val source = remember { MutableInteractionSource() }
    val p = hoverProgress(source)
    Text(
        text,
        style = MaterialTheme.typography.labelLarge.copy(letterSpacing = 0.2.sp),
        color = lerp(Clay, OnSurface, p),
        modifier =
            Modifier
                .hoverable(source)
                .pointerHoverIcon(PointerIcon.Hand)
                .clickable(onClick = onClick),
    )
}
