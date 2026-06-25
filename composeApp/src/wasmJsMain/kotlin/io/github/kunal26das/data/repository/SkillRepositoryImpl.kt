package io.github.kunal26das.data.repository

import io.github.kunal26das.domain.model.SkillGroup
import io.github.kunal26das.domain.repository.SkillRepository

class SkillRepositoryImpl : SkillRepository {
    override fun getSkills(): List<SkillGroup> =
        listOf(
            SkillGroup(
                "🚀",
                "Apps people love",
                "I've helped build apps used by 10 million+ people — and I sweat the little details that make " +
                    "them a joy to use.",
            ),
            SkillGroup(
                "📱",
                "Works everywhere",
                "Android, iPhone, and the web. Whatever device you're holding, the app should feel right at " +
                    "home — often from a single shared codebase.",
            ),
            SkillGroup(
                "⚡",
                "Fast & reliable",
                "I chase down the slow frames and crashes so you don't have to. The apps I work on stay " +
                    "smooth and dependable for 99%+ of people, 99%+ of the time.",
            ),
            SkillGroup(
                "🎨",
                "Beautiful & simple",
                "Clean, friendly screens that feel natural. No clutter, no confusion — just the thing you came to do.",
            ),
            SkillGroup(
                "🏗️",
                "Built to last",
                "Tidy foundations under the hood mean new features land faster and nothing falls over later. " +
                    "I love modernizing older apps and giving them room to grow.",
            ),
            SkillGroup(
                "🚢",
                "Shipped, not stuck",
                "I get things out the door — from a brand-new app on the store in two weeks to smooth, " +
                    "automated releases across iPhone and Android.",
            ),
        )
}
