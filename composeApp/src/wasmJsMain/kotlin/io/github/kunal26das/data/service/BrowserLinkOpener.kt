package io.github.kunal26das.data.service

import io.github.kunal26das.domain.service.LinkOpener
import kotlinx.browser.window

class BrowserLinkOpener : LinkOpener {
    override fun open(url: String) {
        window.open(url, "_blank")
    }

    override fun openEmail(email: String) {
        open("mailto:$email")
    }
}
