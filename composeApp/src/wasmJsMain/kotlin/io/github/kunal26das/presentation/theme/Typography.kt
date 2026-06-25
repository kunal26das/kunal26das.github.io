package io.github.kunal26das.presentation.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

fun appTypography(
    serif: FontFamily,
    sans: FontFamily,
) = Typography(
    displayLarge =
        TextStyle(
            fontFamily = serif,
            fontWeight = FontWeight.Bold,
            fontSize = 70.sp,
            lineHeight = 76.sp,
            letterSpacing = (-1.8).sp,
        ),
    displaySmall =
        TextStyle(
            fontFamily = serif,
            fontWeight = FontWeight.SemiBold,
            fontSize = 40.sp,
            lineHeight = 46.sp,
            letterSpacing = (-0.6).sp,
        ),
    headlineMedium =
        TextStyle(
            fontFamily = serif,
            fontWeight = FontWeight.SemiBold,
            fontSize = 30.sp,
            lineHeight = 37.sp,
            letterSpacing = (-0.3).sp,
        ),
    titleLarge =
        TextStyle(
            fontFamily = serif,
            fontWeight = FontWeight.Medium,
            fontSize = 21.sp,
            lineHeight = 27.sp,
            letterSpacing = (-0.2).sp,
        ),
    bodyLarge =
        TextStyle(
            fontFamily = sans,
            fontWeight = FontWeight.Normal,
            fontSize = 17.sp,
            lineHeight = 29.sp,
        ),
    bodyMedium =
        TextStyle(
            fontFamily = sans,
            fontWeight = FontWeight.Normal,
            fontSize = 15.sp,
            lineHeight = 23.sp,
        ),
    labelLarge =
        TextStyle(
            fontFamily = sans,
            fontWeight = FontWeight.SemiBold,
            fontSize = 13.sp,
            lineHeight = 18.sp,
            letterSpacing = 1.8.sp,
        ),
)
