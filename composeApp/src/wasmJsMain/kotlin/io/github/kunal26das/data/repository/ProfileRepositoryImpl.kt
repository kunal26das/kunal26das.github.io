package io.github.kunal26das.data.repository

import io.github.kunal26das.domain.model.Profile
import io.github.kunal26das.domain.repository.ProfileRepository

class ProfileRepositoryImpl : ProfileRepository {
    override fun getProfile(): Profile =
        Profile(
            name = "Kunal Das",
            role = "Mobile App Developer",
            tagline =
                "I turn product ideas into reliable mobile experiences with Kotlin, Compose and React Native. " +
                    "Since 2019, I've helped teams at Licious, Koo and Powerplay build apps used by millions.",
            location = "Bengaluru, India",
            linkedIn = "https://linkedin.com/in/kunal26das",
            gitHub = "https://github.com/kunal26das",
            resume = "https://kunal26das.github.io/resume/",
            email = "kunal26das@gmail.com",
            since = 2019,
        )
}
