import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Intimacy modes - matching React ThemeContext
enum IntimacyMode { hot, warm }

/// Theme mode provider
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, IntimacyMode>(
  (ref) => ThemeModeNotifier(),
);

class ThemeModeNotifier extends StateNotifier<IntimacyMode> {
  ThemeModeNotifier() : super(IntimacyMode.hot);

  void setMode(IntimacyMode mode) {
    state = mode;
  }

  void toggle() {
    state = state == IntimacyMode.hot ? IntimacyMode.warm : IntimacyMode.hot;
  }
}

/// AI Settings state
class AiSettings {
  final double temperature;
  final int maxTokens;
  final double topP;
  final String? systemPromptOverride;

  const AiSettings({
    this.temperature = 0.8,
    this.maxTokens = 1024,
    this.topP = 0.95,
    this.systemPromptOverride,
  });

  AiSettings copyWith({
    double? temperature,
    int? maxTokens,
    double? topP,
    String? systemPromptOverride,
  }) {
    return AiSettings(
      temperature: temperature ?? this.temperature,
      maxTokens: maxTokens ?? this.maxTokens,
      topP: topP ?? this.topP,
      systemPromptOverride: systemPromptOverride ?? this.systemPromptOverride,
    );
  }
}

/// AI Settings provider
final aiSettingsProvider = StateNotifierProvider<AiSettingsNotifier, AiSettings>(
  (ref) => AiSettingsNotifier(),
);

class AiSettingsNotifier extends StateNotifier<AiSettings> {
  AiSettingsNotifier() : super(const AiSettings());

  void updateTemperature(double value) {
    state = state.copyWith(temperature: value);
  }

  void updateMaxTokens(int value) {
    state = state.copyWith(maxTokens: value);
  }

  void updateTopP(double value) {
    state = state.copyWith(topP: value);
  }

  void updateSystemPrompt(String? value) {
    state = state.copyWith(systemPromptOverride: value);
  }
}
