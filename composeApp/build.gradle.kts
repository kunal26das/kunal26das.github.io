@file:OptIn(org.jetbrains.kotlin.gradle.ExperimentalWasmDsl::class)

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.ktlint)
}

compose.resources {
    publicResClass = true
    packageOfResClass = "io.github.kunal26das.resources"
    generateResClass = always
}

ktlint {
    filter {
        exclude { it.file.absolutePath.contains("${layout.buildDirectory.get().asFile.absolutePath}") }
    }
}

configurations.all {
    resolutionStrategy {
        force("org.jetbrains.kotlinx:kotlinx-datetime:0.6.2")
    }
}

kotlin {
    jvmToolchain(17)

    wasmJs {
        outputModuleName.set("composeApp")
        browser {
            commonWebpackConfig {
                outputFileName = "composeApp.js"
            }
        }
        binaries.executable()
    }

    sourceSets {
        wasmJsMain.dependencies {
            implementation(libs.compose.runtime)
            implementation(libs.compose.foundation)
            implementation(libs.compose.material3)
            implementation(libs.compose.ui)
            implementation(libs.compose.components.resources)
            implementation(libs.compose.components.uiToolingPreview)
            implementation(libs.haze)
        }
    }
}
