package io.github.kunal26das.presentation.ui.sections

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.github.kunal26das.domain.model.Article
import io.github.kunal26das.presentation.theme.Muted
import io.github.kunal26das.presentation.theme.OnSurface
import io.github.kunal26das.presentation.ui.components.Chip
import io.github.kunal26das.presentation.ui.components.GradientTile
import io.github.kunal26das.presentation.ui.components.HoverCard
import io.github.kunal26das.presentation.ui.components.LinkText
import io.github.kunal26das.presentation.ui.components.SectionContainer
import io.github.kunal26das.presentation.ui.components.SectionTitle

@Composable
fun WritingSection(
    articles: List<Article>,
    onOpenUrl: (String) -> Unit,
) {
    if (articles.isEmpty()) return
    SectionContainer { _ ->
        SectionTitle("Fresh off the keyboard", "Notes & writing")
        Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
            articles.forEach { article ->
                ArticleCard(article, onOpenUrl, Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
private fun ArticleCard(
    article: Article,
    onOpenUrl: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    HoverCard(
        modifier = modifier,
        onClick = { onOpenUrl(article.url) },
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            GradientTile("W")
            Spacer(Modifier.width(12.dp))
            Column {
                Text(article.title, style = MaterialTheme.typography.titleLarge, color = OnSurface)
                Text(article.date, style = MaterialTheme.typography.bodyMedium, color = Muted)
            }
        }
        Spacer(Modifier.height(14.dp))
        Text(article.blurb, style = MaterialTheme.typography.bodyMedium, color = Muted)
        if (article.tags.isNotEmpty()) {
            Spacer(Modifier.height(16.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                article.tags.forEach { Chip(it) }
            }
        }
        Spacer(Modifier.height(18.dp))
        LinkText("Read the story") { onOpenUrl(article.url) }
    }
}
