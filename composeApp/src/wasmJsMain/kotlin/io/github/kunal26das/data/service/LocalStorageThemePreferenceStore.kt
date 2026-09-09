package io.github.kunal26das.data.service

import io.github.kunal26das.domain.service.ThemePreferenceStore
import kotlinx.browser.localStorage

class LocalStorageThemePreferenceStore : ThemePreferenceStore {
    private var dark = runCatching { localStorage.getItem(THEME_KEY) != LIGHT }.getOrDefault(true)

    override fun isDark(): Boolean = dark

    override fun setDark(dark: Boolean) {
        this.dark = dark
        // Storage may be unavailable or full; the current session still keeps the preference.
        runCatching { localStorage.setItem(THEME_KEY, if (dark) DARK else LIGHT) }
    }

    private companion object {
        const val THEME_KEY = "theme"
        const val DARK = "dark"
        const val LIGHT = "light"
    }
}
