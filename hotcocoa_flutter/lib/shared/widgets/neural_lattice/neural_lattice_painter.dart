import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Golden angle in radians for spiral generation
const double _goldenAngle = 137.508 * (math.pi / 180);

/// Point with x, y coordinates
class _Point {
  final double x;
  final double y;

  const _Point(this.x, this.y);
}

/// Neural Lattice CustomPainter - Ported from React NeuralLattice.tsx
///
/// Creates a golden spiral visualization with:
/// - Breathing animation (sigmoid easing)
/// - Mouse/pointer repulsion effect
/// - Connected particles with gradient colors
class NeuralLatticePainter extends CustomPainter {
  final double time;
  final Offset? mousePosition;
  final Size canvasSize;

  NeuralLatticePainter({
    required this.time,
    this.mousePosition,
    required this.canvasSize,
  });

  /// Sigmoid easing function for smooth breathing
  double _easeInOutSigmoid(double x) {
    return 1 / (1 + math.exp(-10 * (x - 0.5)));
  }

  @override
  void paint(Canvas canvas, Size size) {
    final centerX = size.width / 2;
    final centerY = size.height / 2;

    // Calculate 'breath' - cyclical animation
    final cycle = (math.sin(time * 0.5) + 1) / 2;
    final breath = 0.8 + _easeInOutSigmoid(cycle) * 0.6;

    // Transform mouse position relative to center
    final mouse = mousePosition != null
        ? _Point(
            mousePosition!.dx - centerX,
            mousePosition!.dy - centerY,
          )
        : const _Point(-1000, -1000);

    const numPoints = 80;
    const rotation = 0.2; // Multiplied by time
    final spread = 14 * breath;

    final points = <_Point>[];

    // Generate points with mouse interaction
    for (int i = 0; i < numPoints; i++) {
      final angle = i * _goldenAngle + time * rotation;
      final dist = spread * math.sqrt(i.toDouble());

      double x = math.cos(angle) * dist;
      double y = math.sin(angle) * dist;

      // Repulsion field
      final dx = x - mouse.x;
      final dy = y - mouse.y;
      final dToMouse = math.sqrt(dx * dx + dy * dy);
      const repelRadius = 120.0;

      if (dToMouse < repelRadius) {
        final force = (repelRadius - dToMouse) / repelRadius;
        final push = force * force * force * 60;
        final len = dToMouse == 0 ? 1.0 : dToMouse;
        x += (dx / len) * push;
        y += (dy / len) * push;
      }

      points.add(_Point(x, y));
    }

    // Translate to center for drawing
    canvas.save();
    canvas.translate(centerX, centerY);

    // Render connections and particles
    const neighbors = [1, 8, 13];
    final linePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    final particlePaint = Paint()..style = PaintingStyle.fill;

    for (int i = 0; i < points.length; i++) {
      final p1 = points[i];
      final hue = (180 + i * 2 + time * 20) % 360;

      // Draw lines to neighbors
      for (final offset in neighbors) {
        final neighborIdx = i - offset;
        if (neighborIdx >= 0) {
          final p2 = points[neighborIdx];
          final ldx = p1.x - p2.x;
          final ldy = p1.y - p2.y;
          final d = math.sqrt(ldx * ldx + ldy * ldy);

          final maxDist = 70 * breath;
          if (d < maxDist) {
            final alpha = (1 - (d / maxDist)) * 0.5;
            linePaint.color = HSLColor.fromAHSL(
              alpha.clamp(0.0, 1.0),
              hue,
              0.8,
              0.7,
            ).toColor();

            canvas.drawLine(
              Offset(p1.x, p1.y),
              Offset(p2.x, p2.y),
              linePaint,
            );
          }
        }
      }

      // Draw particle
      particlePaint.color = HSLColor.fromAHSL(
        1.0,
        hue,
        0.7,
        0.6,
      ).toColor();

      final pSize = 1 + (i / numPoints) * 3;
      canvas.drawCircle(Offset(p1.x, p1.y), pSize, particlePaint);
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(NeuralLatticePainter oldDelegate) {
    return oldDelegate.time != time ||
        oldDelegate.mousePosition != mousePosition;
  }
}

/// Neural Lattice Widget - animated golden spiral
class NeuralLatticeWidget extends StatefulWidget {
  final String text;
  final double size;

  const NeuralLatticeWidget({
    super.key,
    this.text = 'ANALYZING',
    this.size = 300,
  });

  @override
  State<NeuralLatticeWidget> createState() => _NeuralLatticeWidgetState();
}

class _NeuralLatticeWidgetState extends State<NeuralLatticeWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  Offset? _mousePosition;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 60),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleHover(PointerEvent event) {
    setState(() {
      _mousePosition = event.localPosition;
    });
  }

  void _handleExit(PointerEvent event) {
    setState(() {
      _mousePosition = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        MouseRegion(
          onHover: _handleHover,
          onExit: _handleExit,
          child: SizedBox(
            width: widget.size,
            height: widget.size,
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                // Convert animation value (0-1) to time
                final time = _controller.value * 60;
                return CustomPaint(
                  painter: NeuralLatticePainter(
                    time: time,
                    mousePosition: _mousePosition,
                    canvasSize: Size(widget.size, widget.size),
                  ),
                  size: Size(widget.size, widget.size),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 24),
        _AnimatedText(text: widget.text),
        const SizedBox(height: 8),
        Container(
          width: 128,
          height: 1,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.transparent,
                Colors.white.withOpacity(0.2),
                Colors.transparent,
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// Pulsing text for the loader
class _AnimatedText extends StatefulWidget {
  final String text;

  const _AnimatedText({required this.text});

  @override
  State<_AnimatedText> createState() => _AnimatedTextState();
}

class _AnimatedTextState extends State<_AnimatedText>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _opacity = Tween<double>(begin: 0.3, end: 0.8).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _opacity,
      builder: (context, child) {
        return Text(
          widget.text,
          style: TextStyle(
            fontSize: 10,
            letterSpacing: 4,
            fontWeight: FontWeight.bold,
            color: Colors.white.withOpacity(_opacity.value),
          ),
        );
      },
    );
  }
}
