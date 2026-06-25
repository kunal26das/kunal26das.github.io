package io.github.kunal26das.data.repository

import io.github.kunal26das.domain.model.Profile
import io.github.kunal26das.domain.repository.ProfileRepository

class ProfileRepositoryImpl : ProfileRepository {
    override fun getProfile(): Profile =
        Profile(
            name = "Kunal Das",
            role = "Mobile App Maker",
            tagline =
                "I make the apps that live on your phone — the ones you tap open every day. " +
                    "From ordering dinner to staying in touch, I help build experiences that just work, " +
                    "and feel good to use — on iPhone, on Android, and everywhere in between.",
            location = "Bengaluru, India",
            linkedIn = "https://linkedin.com/in/kunal26das",
            gitHub = "https://github.com/kunal26das",
            email = "kunal26das@gmail.com",
            since = 2016,
        )
}
