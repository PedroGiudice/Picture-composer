import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Somatic loader - breathing animation widget
class SomaticLoader extends StatefulWidget {
  final String? text;
  final double size;

  const SomaticLoader({
    super.key,
    this.text,
    this.size = 120,
  });

  @override
  State<SomaticLoader> createState() => _SomaticLoaderState();
}

class _SomaticLoaderState extends State<SomaticLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).colorScheme.primary;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: widget.size,
          height: widget.size,
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return CustomPaint(
                painter: _SomaticPainter(
                  progress: _controller.value,
                  color: primaryColor,
                ),
                size: Size(widget.size, widget.size),
              );
            },
          ),
        ),
        if (widget.text != null) ...[
          const SizedBox(height: 24),
          _BreathingText(text: widget.text!),
        ],
      ],
    );
  }
}

/// Custom painter for the breathing animation
class _SomaticPainter extends CustomPainter {
  final double progress;
  final Color color;

  _SomaticPainter({
    required this.progress,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;

    // Breathing curve - inhale, hold, exhale, hold
    double breath;
    if (progress < 0.4) {
      // Inhale (0-0.4)
      breath = _easeInOutSine(progress / 0.4);
    } else if (progress < 0.5) {
      // Hold (0.4-0.5)
      breath = 1.0;
    } else if (progress < 0.9) {
      // Exhale (0.5-0.9)
      breath = 1.0 - _easeInOutSine((progress - 0.5) / 0.4);
    } else {
      // Hold (0.9-1.0)
      breath = 0.0;
    }

    final baseRadius = maxRadius * 0.3;
    final breathRadius = baseRadius + (maxRadius * 0.5 * breath);

    // Draw concentric rings
    for (int i = 0; i < 4; i++) {
      final ringProgress = (progress + i * 0.1) % 1.0;
      final opacity = (1.0 - i * 0.2) * (0.3 + breath * 0.5);
      final ringRadius = breathRadius * (0.7 + i * 0.15);

      final paint = Paint()
        ..color = color.withOpacity(opacity.clamp(0.0, 1.0))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2 - i * 0.3;

      canvas.drawCircle(center, ringRadius, paint);
    }

    // Center glow
    final glowPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          color.withOpacity(0.4 + breath * 0.3),
          color.withOpacity(0.0),
        ],
      ).createShader(Rect.fromCircle(center: center, radius: breathRadius));

    canvas.drawCircle(center, breathRadius * 0.8, glowPaint);

    // Center dot
    final dotPaint = Paint()..color = color.withOpacity(0.8 + breath * 0.2);
    canvas.drawCircle(center, 4 + breath * 2, dotPaint);
  }

  double _easeInOutSine(double x) {
    return -(math.cos(math.pi * x) - 1) / 2;
  }

  @override
  bool shouldRepaint(_SomaticPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

/// Breathing text that fades in and out
class _BreathingText extends StatefulWidget {
  final String text;

  const _BreathingText({required this.text});

  @override
  State<_BreathingText> createState() => _BreathingTextState();
}

class _BreathingTextState extends State<_BreathingText>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        // Match breathing pattern
        double opacity;
        final progress = _controller.value;
        if (progress < 0.4) {
          opacity = 0.3 + 0.5 * (progress / 0.4);
        } else if (progress < 0.5) {
          opacity = 0.8;
        } else if (progress < 0.9) {
          opacity = 0.8 - 0.5 * ((progress - 0.5) / 0.4);
        } else {
          opacity = 0.3;
        }

        return Text(
          widget.text,
          style: TextStyle(
            fontSize: 10,
            letterSpacing: 4,
            fontWeight: FontWeight.bold,
            color: AppColors.white.withOpacity(opacity),
          ),
        );
      },
    );
  }
}
