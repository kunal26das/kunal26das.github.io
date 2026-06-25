package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kunal26das.domain.model.Profile
import io.github.kunal26das.presentation.theme.Background
import io.github.kunal26das.presentation.theme.Border
import io.github.kunal26das.presentation.theme.Clay
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.theme.liquidGlass
import io.github.kunal26das.presentation.ui.components.GradientButton
import io.github.kunal26das.presentation.ui.components.GradientText
import io.github.kunal26das.presentation.ui.components.Reveal
import io.github.kunal26das.presentation.ui.components.SayHelloButton
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.emoji
import io.github.kunal26das.presentation.ui.components.rememberShimmerBrush

@Composable
fun HeroSection(
    profile: Profile,
    onViewWork: () -> Unit,
    onContact: () -> Unit,
) {
    val shimmer = rememberShimmerBrush()
    SectionContainer(
        padding = PaddingValues(start = 24.dp, end = 24.dp, top = 96.dp, bottom = 88.dp),
    ) { compact ->
        Reveal(delayMillis = 0) {
            Box(
                modifier =
                    Modifier
                        .size(82.dp)
                        .clip(CircleShape)
                        .background(shimmer),
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    modifier =
                        Modifier
                            .size(74.dp)
                            .clip(CircleShape)
                            .background(Background),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(emoji("👋"), fontSize = 34.sp)
                }
            }
        }
        Spacer(Modifier.height(24.dp))
        Reveal(delayMillis = 60) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier =
                    Modifier
                        .liquidGlass(RoundedCornerShape(50), tintAlpha = 0.20f)
                        .border(BorderStroke(1.dp, Border), RoundedCornerShape(50))
                        .padding(horizontal = 14.dp, vertical = 7.dp),
            ) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(Clay))
                Spacer(Modifier.width(8.dp))
                Text("Open to new adventures", style = MaterialTheme.typography.bodyMedium, color = Clay)
            }
        }
        Spacer(Modifier.height(24.dp))
        val heroStyle =
            if (compact) {
                MaterialTheme.typography.displayLarge.copy(fontSize = 42.sp, lineHeight = 48.sp)
            } else {
                MaterialTheme.typography.displayLarge
            }
        Reveal(delayMillis = 120) {
            Column {
                Text("Hi, I'm ${profile.name}.", style = heroStyle, color = OnSurface)
                GradientText("I make apps people love.", style = heroStyle, brush = shimmer)
            }
        }
        Spacer(Modifier.height(22.dp))
        Reveal(delayMillis = 200) {
            Text(
                profile.tagline,
                style = MaterialTheme.typography.bodyLarge,
                color = Muted,
                modifier = Modifier.widthIn(max = 640.dp),
            )
        }
        Spacer(Modifier.height(32.dp))
        Reveal(delayMillis = 280) {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                GradientButton("See what I've made", onClick = onViewWork)
                SayHelloButton(onClick = onContact)
            }
        }
        Spacer(Modifier.height(44.dp))
        Reveal(delayMillis = 360) {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Stat("10M+", "People reached")
                Stat("99%+", "Crash-free & happy")
                Stat("4 apps", "Live on the stores")
                Stat("Since 2016", "Making apps")
            }
        }
    }
}

@Composable
private fun Stat(
    value: String,
    label: String,
) {
    Column(
        modifier =
            Modifier
                .liquidGlass(RoundedCornerShape(14.dp), tintAlpha = 0.24f)
                .border(BorderStroke(1.dp, Border), RoundedCornerShape(14.dp))
                .padding(horizontal = 20.dp, vertical = 14.dp),
    ) {
        GradientText(value, style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(2.dp))
        Text(label, style = MaterialTheme.typography.bodyMedium, color = Muted)
    }
}
