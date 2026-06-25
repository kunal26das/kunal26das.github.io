package io.github.kunal26das.data.service

import io.github.kunal26das.domain.service.ThemePreferenceStore
import kotlinx.browser.localStorage

class LocalStorageThemePreferenceStore : ThemePreferenceStore {
    override fun isDark(): Boolean = localStorage.getItem(THEME_KEY) != LIGHT

    override fun setDark(dark: Boolean) {
        localStorage.setItem(THEME_KEY, if (dark) DARK else LIGHT)
    }

    private companion object {
        const val THEME_KEY = "theme"
        const val DARK = "dark"
        const val LIGHT = "light"
    }
}
