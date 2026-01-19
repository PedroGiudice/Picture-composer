import 'package:flutter/material.dart';

/// App color schemes matching React Deep Dark palette
class AppColors {
  // HOT Mode colors
  static const hotPrimary = Color(0xFFE11D48);      // Rose-600
  static const hotBackground = Color(0xFF0A0506);   // Deep void
  static const hotAccent = Color(0xFFC2410C);       // Orange-700
  static const hotSurface = Color(0xFF1F0F12);      // Dark surface

  // WARM Mode colors
  static const warmPrimary = Color(0xFFDB2777);     // Pink-600
  static const warmBackground = Color(0xFF0F0508);  // Deep pink-void
  static const warmAccent = Color(0xFFD97706);      // Amber-600
  static const warmSurface = Color(0xFF1A0A10);     // Dark surface

  // Common colors
  static const white = Color(0xFFFFFFFF);
  static const white70 = Color(0xB3FFFFFF);
  static const white50 = Color(0x80FFFFFF);
  static const white30 = Color(0x4DFFFFFF);
  static const white20 = Color(0x33FFFFFF);
  static const white10 = Color(0x1AFFFFFF);
}

/// App text styles
class AppTextStyles {
  static const fontFamily = 'SpaceMono';

  static const displayLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 32,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  );

  static const titleLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    letterSpacing: 1.5,
  );

  static const titleMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 1,
  );

  static const bodyLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.normal,
    letterSpacing: 0.5,
  );

  static const bodyMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.normal,
    letterSpacing: 0.3,
  );

  static const labelSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 4,
  );
}

/// App themes
class AppTheme {
  static ThemeData get hotTheme => _buildTheme(
    primary: AppColors.hotPrimary,
    background: AppColors.hotBackground,
    accent: AppColors.hotAccent,
    surface: AppColors.hotSurface,
  );

  static ThemeData get warmTheme => _buildTheme(
    primary: AppColors.warmPrimary,
    background: AppColors.warmBackground,
    accent: AppColors.warmAccent,
    surface: AppColors.warmSurface,
  );

  static ThemeData _buildTheme({
    required Color primary,
    required Color background,
    required Color accent,
    required Color surface,
  }) {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: AppTextStyles.fontFamily,

      colorScheme: ColorScheme.dark(
        primary: primary,
        secondary: accent,
        surface: surface,
        surfaceContainerHighest: background,
        onPrimary: AppColors.white,
        onSecondary: AppColors.white,
        onSurface: AppColors.white,
      ),

      scaffoldBackgroundColor: background,

      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: AppColors.white,
        elevation: 0,
        titleTextStyle: AppTextStyles.titleLarge.copyWith(
          color: AppColors.white,
        ),
      ),

      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(
            color: AppColors.white10,
            width: 1,
          ),
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: AppColors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTextStyles.titleMedium,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.white70,
          side: BorderSide(color: AppColors.white20),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTextStyles.titleMedium,
        ),
      ),

      sliderTheme: SliderThemeData(
        activeTrackColor: primary,
        inactiveTrackColor: AppColors.white10,
        thumbColor: primary,
        overlayColor: primary.withOpacity(0.2),
        trackHeight: 4,
      ),

      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primary;
          }
          return AppColors.white50;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primary.withOpacity(0.5);
          }
          return AppColors.white10;
        }),
      ),

      textTheme: TextTheme(
        displayLarge: AppTextStyles.displayLarge.copyWith(color: AppColors.white),
        titleLarge: AppTextStyles.titleLarge.copyWith(color: AppColors.white),
        titleMedium: AppTextStyles.titleMedium.copyWith(color: AppColors.white),
        bodyLarge: AppTextStyles.bodyLarge.copyWith(color: AppColors.white70),
        bodyMedium: AppTextStyles.bodyMedium.copyWith(color: AppColors.white70),
        labelSmall: AppTextStyles.labelSmall.copyWith(color: AppColors.white30),
      ),

      iconTheme: const IconThemeData(
        color: AppColors.white70,
        size: 24,
      ),

      dividerTheme: DividerThemeData(
        color: AppColors.white10,
        thickness: 1,
      ),
    );
  }
}

/// Extension for theme-aware colors
extension ThemeColors on BuildContext {
  Color get primaryColor => Theme.of(this).colorScheme.primary;
  Color get accentColor => Theme.of(this).colorScheme.secondary;
  Color get backgroundColor => Theme.of(this).scaffoldBackgroundColor;
  Color get surfaceColor => Theme.of(this).colorScheme.surface;
}
