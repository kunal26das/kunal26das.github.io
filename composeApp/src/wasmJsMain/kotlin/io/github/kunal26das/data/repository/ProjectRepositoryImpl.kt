package io.github.kunal26das.data.repository

import io.github.kunal26das.domain.model.Project
import io.github.kunal26das.domain.repository.ProjectRepository

class ProjectRepositoryImpl : ProjectRepository {
    override fun getProjects(): List<Project> =
        listOf(
            Project(
                name = "Startup",
                blurb =
                    "One shared initialization graph for Kotlin Multiplatform. Dependencies start in the right order, " +
                        "with AndroidX App Startup on Android.",
                tags = listOf("Kotlin Multiplatform", "Library"),
                repo = "https://github.com/kunal26das/startup",
                web = "https://central.sonatype.com/artifact/io.github.kunal26das/startup",
                webLabel = "Maven Central",
                featured = true,
                category = "Libraries",
            ),
            Project(
                name = "AlgoScope",
                blurb =
                    "An interactive Flutter playground for algorithms and data structures. Make the invisible steps " +
                        "visible, one operation at a time.",
                tags = listOf("Flutter", "Dart"),
                repo = "https://github.com/kunal26das/codes",
                featured = true,
                category = "Experiments",
            ),
            Project(
                name = "Yify",
                blurb =
                    "Movie discovery for iPhone, Android and the web. Browse the catalog, explore films and find your " +
                        "next watch.",
                tags = listOf("React Native", "Expo"),
                repo = "https://github.com/kunal26das/yify",
                web = "https://yify.expo.app/",
                webLabel = "Try Yify",
                live = "https://play.google.com/store/apps/details?id=io.github.kunal26das.yify",
                liveLabel = "Play Store",
                featured = true,
                category = "Apps",
            ),
            Project(
                name = "DOOM",
                blurb =
                    "The 1993 classic, ported to Kotlin Multiplatform. A game-engine experiment spanning JVM, Android, " +
                        "iOS and WebAssembly.",
                tags = listOf("Kotlin", "WebAssembly"),
                repo = "https://github.com/kunal26das/doom",
                web = "https://kunal26das.github.io/doom/",
                webLabel = "Play in browser",
                featured = true,
                category = "Experiments",
            ),
            Project(
                name = "Multidex",
                blurb = "A pocket guide to Pokémon, built with Kotlin Multiplatform and Compose for Android, iOS and desktop.",
                tags = listOf("Kotlin Multiplatform", "Compose"),
                web = "https://kunal26das.github.io/multidex/",
                webLabel = "Explore Multidex",
                live = "https://play.google.com/store/apps/details?id=io.github.kunal26das.multidex",
                liveLabel = "Play Store",
                featured = true,
                category = "Apps",
            ),
            Project(
                name = "Involute Explorer",
                blurb = "An interactive browser tool for exploring involute geometry and distances from a circle’s centre.",
                tags = listOf("HTML", "Geometry"),
                repo = "https://github.com/kunal26das/involute",
                web = "https://kunal26das.github.io/involute/",
                webLabel = "Open explorer",
                featured = true,
                category = "Experiments",
            ),
            Project(
                name = "Bunxdo",
                blurb = "Android commerce apps with shared components for customer and seller workflows.",
                tags = listOf("Kotlin", "Android"),
                repo = "https://github.com/kunal26das/bunxdo",
                category = "Apps",
            ),
            Project(
                name = "Android Assignments",
                blurb = "Android exercises in UI, networking, storage and app architecture.",
                tags = listOf("Kotlin", "Android"),
                repo = "https://github.com/kunal26das/android-assignments",
                category = "Apps",
            ),
            Project(
                name = "Interactive Résumé",
                blurb = "A browser-based résumé with adjustable layouts, topic filters and downloadable versions.",
                tags = listOf("HTML", "Web"),
                repo = "https://github.com/kunal26das/resume",
                web = "https://kunal26das.github.io/resume/",
                webLabel = "Read résumé",
                category = "Tools",
            ),
            Project(
                name = "This Website",
                blurb = "An editorial portfolio and engineering notebook, with a Kotlin/Compose playground.",
                tags = listOf("Kotlin/Wasm", "Compose"),
                repo = "https://github.com/kunal26das/kunal26das.github.io",
                category = "Tools",
            ),
            Project(
                name = "Ecommerce Scraper",
                blurb = "Python experiments collecting product data from Amazon and Flipkart categories.",
                tags = listOf("Python"),
                repo = "https://github.com/kunal26das/ecommerce-scraper",
                category = "Tools",
            ),
            Project(
                name = "Play Store Clone",
                blurb = "An early Android recreation of store browsing, search, app details and reviews.",
                tags = listOf("Java", "Android"),
                repo = "https://github.com/kunal26das/play-store-clone",
                category = "Early work",
            ),
            Project(
                name = "Game Algorithms",
                blurb = "Early explorations of Tetris, chess puzzles, Flow Free and Tic-Tac-Toe.",
                tags = listOf("C++"),
                repo = "https://github.com/kunal26das/game-algorithms",
                category = "Early work",
            ),
            Project(
                name = "Autonomous Car Model",
                blurb = "A student project exploring camera-based steering in a simulator and a Raspberry Pi car.",
                tags = listOf("Python"),
                repo = "https://github.com/kunal26das/autonomous-car-model",
                category = "Early work",
            ),
            Project(
                name = "Early C++ Projects",
                blurb = "School-era programs for hotel management and sales announcements. The starting point.",
                tags = listOf("C++"),
                repo = "https://github.com/kunal26das/basic-school-projects",
                category = "Early work",
            ),
        )
}
