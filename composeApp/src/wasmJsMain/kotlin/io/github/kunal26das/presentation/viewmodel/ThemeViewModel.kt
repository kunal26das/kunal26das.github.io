package io.github.kunal26das.presentation.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import io.github.kunal26das.domain.service.ThemePreferenceStore

class ThemeViewModel(
    private val preferenceStore: ThemePreferenceStore,
) {
    var isDark by mutableStateOf(preferenceStore.isDark())
        private set

    fun toggle() {
        isDark = !isDark
        preferenceStore.setDark(isDark)
    }
}
