package io.github.kunal26das.data.repository

import io.github.kunal26das.domain.model.Experience
import io.github.kunal26das.domain.repository.ExperienceRepository

class ExperienceRepositoryImpl : ExperienceRepository {
    override fun getExperiences(): List<Experience> =
        listOf(
            Experience(
                product = "Licious",
                period = "Present",
                blurb =
                    "I help build the Licious app — India's much-loved fresh meat and seafood " +
                        "delivery service used by 10 million+ people — across iPhone and Android alike. " +
                        "I keep it fast and dependable, with 99%+ of people enjoying a crash-free experience, " +
                        "and helped bring its newer cross-platform pieces to life on both stores.",
                playStore = "https://play.google.com/store/apps/details?id=com.licious",
                appStore = "https://apps.apple.com/in/app/licious-chicken-fish-meat/id1052440342",
            ),
            Experience(
                product = "Alle",
                period = "Dec 2023 — Mar 2024",
                blurb =
                    "As part of the founding team, I helped build Alle — an AI-powered fashion stylist — " +
                        "from a blank page to a polished app on the Play Store in just two weeks. I shaped its " +
                        "AI chatbot and wishlist, keeping the whole thing playful and effortless.",
            ),
            Experience(
                product = "Koo",
                period = "Dec 2022 — Jun 2023",
                blurb =
                    "Helped build Koo, a made-in-India social app where people share thoughts and " +
                        "follow the conversation in their own language. I made the feed smoother and faster, " +
                        "added filters so people see what matters to them, and looked after features used " +
                        "by a huge, vibrant community across many Indian languages.",
            ),
            Experience(
                product = "Powerplay",
                period = "Sep 2020 — Jun 2022",
                blurb =
                    "On the founding team, I helped take Powerplay — a tool that keeps construction " +
                        "teams on the same page — from the ground up. I built the very first sign-up flow and " +
                        "a WhatsApp-style chat, and helped grow it to 50,000 people in a single month.",
                playStore = "https://play.google.com/store/apps/details?id=in.powerplay.android.fieldapp",
                appStore = "https://apps.apple.com/in/app/powerplay-manage-projects/id1552606148",
            ),
        )
}
