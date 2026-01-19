import 'package:flutter/material.dart';

/// Transicao de fade suave
class FadeTransitionWidget extends StatelessWidget {
  final Widget child;
  final Duration duration;
  final Curve curve;

  const FadeTransitionWidget({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 300),
    this.curve = Curves.easeInOut,
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: duration,
      curve: curve,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: child,
        );
      },
      child: child,
    );
  }
}

/// Transicao de slide com fade
class SlideUpTransition extends StatelessWidget {
  final Widget child;
  final Duration duration;
  final Curve curve;
  final double slideDistance;

  const SlideUpTransition({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 400),
    this.curve = Curves.easeOutCubic,
    this.slideDistance = 50.0,
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: duration,
      curve: curve,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, slideDistance * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}

/// Transicao de scale com fade
class ScaleFadeTransition extends StatelessWidget {
  final Widget child;
  final Duration duration;
  final Curve curve;
  final double initialScale;

  const ScaleFadeTransition({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 350),
    this.curve = Curves.easeOutBack,
    this.initialScale = 0.8,
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: duration,
      curve: curve,
      builder: (context, value, child) {
        final scale = initialScale + (1.0 - initialScale) * value;
        return Transform.scale(
          scale: scale,
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}

/// Wrapper para animar mudancas de estado com transicoes suaves
class StateTransitionWrapper extends StatelessWidget {
  final Widget child;
  final Object stateKey;
  final Duration duration;
  final Curve curve;
  final TransitionType type;

  const StateTransitionWrapper({
    super.key,
    required this.child,
    required this.stateKey,
    this.duration = const Duration(milliseconds: 300),
    this.curve = Curves.easeInOut,
    this.type = TransitionType.fade,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: duration,
      switchInCurve: curve,
      switchOutCurve: curve,
      transitionBuilder: (child, animation) {
        switch (type) {
          case TransitionType.fade:
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          case TransitionType.slideUp:
            return SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 0.1),
                end: Offset.zero,
              ).animate(animation),
              child: FadeTransition(
                opacity: animation,
                child: child,
              ),
            );
          case TransitionType.scale:
            return Transform.scale(
              scale: Tween<double>(begin: 0.8, end: 1.0).evaluate(animation),
              child: FadeTransition(
                opacity: animation,
                child: child,
              ),
            );
        }
      },
      child: KeyedSubtree(
        key: ValueKey(stateKey),
        child: child,
      ),
    );
  }
}

/// Tipos de transicao disponiveis
enum TransitionType {
  fade,
  slideUp,
  scale,
}

/// Extension para facilitar uso de transicoes
extension TransitionExtensions on Widget {
  /// Aplica transicao de fade
  Widget withFadeTransition({
    Duration duration = const Duration(milliseconds: 300),
    Curve curve = Curves.easeInOut,
  }) {
    return FadeTransitionWidget(
      duration: duration,
      curve: curve,
      child: this,
    );
  }

  /// Aplica transicao de slide up
  Widget withSlideUpTransition({
    Duration duration = const Duration(milliseconds: 400),
    Curve curve = Curves.easeOutCubic,
    double slideDistance = 50.0,
  }) {
    return SlideUpTransition(
      duration: duration,
      curve: curve,
      slideDistance: slideDistance,
      child: this,
    );
  }

  /// Aplica transicao de scale
  Widget withScaleTransition({
    Duration duration = const Duration(milliseconds: 350),
    Curve curve = Curves.easeOutBack,
    double initialScale = 0.8,
  }) {
    return ScaleFadeTransition(
      duration: duration,
      curve: curve,
      initialScale: initialScale,
      child: this,
    );
  }
}
