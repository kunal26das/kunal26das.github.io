package io.github.kunal26das.presentation.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kunal26das.domain.model.Project
import io.github.kunal26das.presentation.theme.Background
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.theme.Surface
import io.github.kunal26das.presentation.theme.SurfaceHi
import io.github.kunal26das.resources.Res
import io.github.kunal26das.resources.yify_preview
import org.jetbrains.compose.resources.painterResource

@Composable
fun Workbench(
    projects: List<Project>,
    onOpenUrl: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val names = listOf("AlgoScope", "Yify", "Startup")
    var selected by remember { mutableStateOf(names.first()) }
    val project = projects.firstOrNull { it.name == selected } ?: return
    Column(
        modifier = modifier.border(1.dp, Border, RoundedCornerShape(6.dp)).background(Surface, RoundedCornerShape(6.dp)),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("THE WORKBENCH", color = Muted, fontFamily = FontFamily.Monospace, fontSize = 12.sp)
            Text("0${names.indexOf(selected) + 1} / 03", color = Clay, fontFamily = FontFamily.Monospace, fontSize = 12.sp)
        }
        FlowRow(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).selectableGroup(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            names.forEach { name ->
                Box(
                    modifier =
                        Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(if (selected == name) Clay else SurfaceHi)
                            .selectable(selected = selected == name, role = Role.Tab, onClick = { selected = name })
                            .padding(horizontal = 12.dp, vertical = 12.dp),
                ) {
                    Text(name, color = if (selected == name) Background else OnSurface, fontSize = 14.sp)
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        when (selected) {
            "AlgoScope" -> AlgorithmSketch()
            "Yify" -> {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                        .background(Color(0xFF10100F))
                        .padding(horizontal = 20.dp),
                ) {
                    Column(Modifier.weight(1f).padding(top = 24.dp, end = 12.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                        Text("Yify", style = MaterialTheme.typography.headlineMedium, color = Color(0xFFEDE7DB))
                        Text("Movie\ndiscovery.", fontSize = 17.sp, lineHeight = 24.sp, color = Color(0xFFE89B72))
                        Text(
                            "iOS\nAndroid\nWeb",
                            fontSize = 12.sp,
                            lineHeight = 22.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFFA39B8B),
                        )
                    }
                    Image(
                        painter = painterResource(Res.drawable.yify_preview),
                        contentDescription = "Yify movie discovery app, showing its featured film and catalog",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.width(148.dp).fillMaxHeight(),
                    )
                }
            }
            else -> StartupSketch()
        }
        Column(Modifier.padding(20.dp)) {
            Text(
                when (selected) {
                    "AlgoScope" -> "Make the invisible visible."
                    "Yify" -> "For the next movie night."
                    else -> "A good start. On every platform."
                },
                style = MaterialTheme.typography.titleLarge,
                color = OnSurface,
            )
            Spacer(Modifier.height(10.dp))
            LinkText(if (selected == "Yify") "Open Yify" else "Explore ${project.name}") {
                (if (selected == "Yify") project.web else project.repo)?.let(onOpenUrl)
            }
        }
    }
}

/** An interactive illustration of the algorithm visualizer, not an embedded app. */
@Composable
private fun AlgorithmSketch() {
    val frames = remember { bubbleSortFrames(listOf(7, 3, 6, 2, 5, 1)) }
    var step by remember { mutableStateOf(0) }
    val values = frames[step]
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .height(260.dp)
                .background(Background)
                .padding(20.dp),
    ) {
        Text("BUBBLE SORT / TRY A STEP", fontSize = 12.sp, lineHeight = 16.sp, fontFamily = FontFamily.Monospace, color = Muted)
        Spacer(Modifier.height(18.dp))
        Row(
            modifier =
                Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .semantics { contentDescription = "Sorting values: ${values.joinToString()}. Step $step of ${frames.lastIndex}." },
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.Bottom,
        ) {
            values.forEach { value ->
                Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.fillMaxWidth().height((value * 13).dp).background(Clay))
                    Spacer(Modifier.height(8.dp))
                    Text(value.toString(), fontSize = 14.sp, lineHeight = 18.sp, fontFamily = FontFamily.Monospace, color = OnSurface)
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            LinkText(if (step == frames.lastIndex) "Replay" else "Next step") {
                step = if (step == frames.lastIndex) 0 else step + 1
            }
            Text(
                if (step == frames.lastIndex) "Sorted." else "$step / ${frames.lastIndex}",
                fontSize = 12.sp,
                color = Muted,
                modifier =
                    Modifier.semantics {
                        liveRegion = LiveRegionMode.Polite
                        contentDescription = "Step $step of ${frames.lastIndex}. Values: ${values.joinToString()}."
                    },
            )
        }
    }
}

internal fun bubbleSortFrames(input: List<Int>): List<List<Int>> {
    val values = input.toMutableList()
    val frames = mutableListOf(values.toList())
    for (end in values.lastIndex downTo 1) {
        for (index in 0 until end) {
            if (values[index] > values[index + 1]) {
                val next = values[index]
                values[index] = values[index + 1]
                values[index + 1] = next
                frames.add(values.toList())
            }
        }
    }
    return frames
}

@Composable
private fun StartupSketch() {
    Column(
        modifier =
            Modifier
                .fillMaxWidth()
                .height(260.dp)
                .background(Background)
                .padding(20.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Text("commonMain / AppStartup.kt", fontSize = 12.sp, color = Muted, fontFamily = FontFamily.Monospace)
        Text("{ startup }", fontSize = 32.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = Clay)
        Text("Declare dependencies.\nShare the graph.\nStart in order.", color = OnSurface, fontSize = 17.sp, lineHeight = 27.sp)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Logger", color = Clay, fontFamily = FontFamily.Monospace, fontSize = 14.sp)
            Spacer(Modifier.width(12.dp))
            Text("→", color = Muted)
            Spacer(Modifier.width(12.dp))
            Text("Analytics", color = Clay, fontFamily = FontFamily.Monospace, fontSize = 14.sp)
        }
    }
}
