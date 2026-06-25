package io.github.kunal26das.domain.service

interface ThemePreferenceStore {
    fun isDark(): Boolean

    fun setDark(dark: Boolean)
}
