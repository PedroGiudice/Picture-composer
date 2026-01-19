import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Heat slider widget with custom painter and visual feedback
class HeatSlider extends StatefulWidget {
  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;

  const HeatSlider({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 1,
    this.max = 10,
  });

  @override
  State<HeatSlider> createState() => _HeatSliderState();
}

class _HeatSliderState extends State<HeatSlider>
    with SingleTickerProviderStateMixin {
  late AnimationController _glowController;

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final normalizedValue = (widget.value - widget.min) / (widget.max - widget.min);

    // Interpolate color based on value
    final baseColor = Color.lerp(
      AppColors.warmPrimary,
      AppColors.hotPrimary,
      normalizedValue,
    )!;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Heat indicator dots
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.max, (index) {
            final isActive = index < widget.value;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: AnimatedBuilder(
                animation: _glowController,
                builder: (context, child) {
                  final glowOpacity = isActive
                      ? 0.3 + (_glowController.value * 0.3 * normalizedValue)
                      : 0.0;
                  return Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive ? baseColor : AppColors.white10,
                      boxShadow: isActive
                          ? [
                              BoxShadow(
                                color: baseColor.withOpacity(glowOpacity),
                                blurRadius: 8,
                                spreadRadius: 2,
                              ),
                            ]
                          : null,
                    ),
                  );
                },
              ),
            );
          }),
        ),
        const SizedBox(height: 24),

        // Main slider
        SizedBox(
          width: 280,
          child: SliderTheme(
            data: SliderThemeData(
              trackHeight: 8,
              activeTrackColor: baseColor,
              inactiveTrackColor: AppColors.white10,
              thumbColor: baseColor,
              overlayColor: baseColor.withOpacity(0.2),
              thumbShape: _HeatThumbShape(
                enabledThumbRadius: 14,
                color: baseColor,
              ),
              trackShape: _HeatTrackShape(),
            ),
            child: Slider(
              value: widget.value.toDouble(),
              min: widget.min.toDouble(),
              max: widget.max.toDouble(),
              divisions: widget.max - widget.min,
              onChanged: (value) => widget.onChanged(value.round()),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Labels
        SizedBox(
          width: 280,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'SUAVE',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: AppColors.white30,
                  fontSize: 9,
                ),
              ),
              Text(
                'INTENSO',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: AppColors.white30,
                  fontSize: 9,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Custom thumb shape for heat slider
class _HeatThumbShape extends SliderComponentShape {
  final double enabledThumbRadius;
  final Color color;

  const _HeatThumbShape({
    required this.enabledThumbRadius,
    required this.color,
  });

  @override
  Size getPreferredSize(bool isEnabled, bool isDiscrete) {
    return Size.fromRadius(enabledThumbRadius);
  }

  @override
  void paint(
    PaintingContext context,
    Offset center, {
    required Animation<double> activationAnimation,
    required Animation<double> enableAnimation,
    required bool isDiscrete,
    required TextPainter labelPainter,
    required RenderBox parentBox,
    required SliderThemeData sliderTheme,
    required TextDirection textDirection,
    required double value,
    required double textScaleFactor,
    required Size sizeWithOverflow,
  }) {
    final canvas = context.canvas;

    // Outer glow
    final glowPaint = Paint()
      ..color = color.withOpacity(0.3)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);
    canvas.drawCircle(center, enabledThumbRadius + 4, glowPaint);

    // Main circle
    final paint = Paint()..color = color;
    canvas.drawCircle(center, enabledThumbRadius, paint);

    // Inner highlight
    final highlightPaint = Paint()
      ..color = Colors.white.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawCircle(center, enabledThumbRadius - 2, highlightPaint);

    // Center dot
    final centerPaint = Paint()..color = Colors.white.withOpacity(0.8);
    canvas.drawCircle(center, 3, centerPaint);
  }
}

/// Custom track shape for heat slider
class _HeatTrackShape extends RoundedRectSliderTrackShape {
  @override
  void paint(
    PaintingContext context,
    Offset offset, {
    required RenderBox parentBox,
    required SliderThemeData sliderTheme,
    required Animation<double> enableAnimation,
    required TextDirection textDirection,
    required Offset thumbCenter,
    Offset? secondaryOffset,
    bool isDiscrete = false,
    bool isEnabled = false,
    double additionalActiveTrackHeight = 0,
  }) {
    final canvas = context.canvas;
    final trackHeight = sliderTheme.trackHeight ?? 8;
    final trackLeft = offset.dx;
    final trackTop = offset.dy + (parentBox.size.height - trackHeight) / 2;
    final trackWidth = parentBox.size.width;
    final trackRadius = Radius.circular(trackHeight / 2);

    // Background track
    final inactiveTrackRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(trackLeft, trackTop, trackWidth, trackHeight),
      trackRadius,
    );
    final inactivePaint = Paint()
      ..color = sliderTheme.inactiveTrackColor ?? Colors.grey;
    canvas.drawRRect(inactiveTrackRRect, inactivePaint);

    // Active track with gradient
    final activeWidth = thumbCenter.dx - trackLeft;
    if (activeWidth > 0) {
      final activeTrackRRect = RRect.fromRectAndRadius(
        Rect.fromLTWH(trackLeft, trackTop, activeWidth, trackHeight),
        trackRadius,
      );

      final gradient = LinearGradient(
        colors: [
          AppColors.warmPrimary,
          sliderTheme.activeTrackColor ?? AppColors.hotPrimary,
        ],
      );

      final activePaint = Paint()
        ..shader = gradient.createShader(
          Rect.fromLTWH(trackLeft, trackTop, trackWidth, trackHeight),
        );
      canvas.drawRRect(activeTrackRRect, activePaint);
    }
  }
}
