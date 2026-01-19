import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Particula individual no background
class _Particle {
  double x;
  double y;
  final double vx;
  final double vy;
  final double radius;
  final double opacity;

  _Particle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.radius,
    required this.opacity,
  });
}

/// CustomPainter para renderizar particulas animadas
class _MotionBackgroundPainter extends CustomPainter {
  final List<_Particle> particles;
  final Color primaryColor;
  final double time;

  _MotionBackgroundPainter({
    required this.particles,
    required this.primaryColor,
    required this.time,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2);

    for (final particle in particles) {
      // Efeito de pulso sutil baseado no tempo
      final pulse = 0.8 + math.sin(time + particle.x) * 0.2;

      paint.color = primaryColor.withOpacity(particle.opacity * pulse);
      canvas.drawCircle(
        Offset(particle.x, particle.y),
        particle.radius * pulse,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_MotionBackgroundPainter oldDelegate) {
    // Repaint apenas se o tempo mudou significativamente
    return (time - oldDelegate.time).abs() > 0.016; // ~60fps
  }

  @override
  bool shouldRebuildSemantics(_MotionBackgroundPainter oldDelegate) => false;
}

/// Background animado com particulas sutis
///
/// Cria uma camada de fundo com particulas que se movem lentamente,
/// adicionando profundidade e vida ao app sem distrair o usuario.
class MotionBackground extends StatefulWidget {
  final Widget child;
  final int particleCount;
  final double particleSpeed;
  final double minRadius;
  final double maxRadius;
  final double minOpacity;
  final double maxOpacity;

  const MotionBackground({
    super.key,
    required this.child,
    this.particleCount = 30,
    this.particleSpeed = 0.3,
    this.minRadius = 1.0,
    this.maxRadius = 3.0,
    this.minOpacity = 0.05,
    this.maxOpacity = 0.15,
  });

  @override
  State<MotionBackground> createState() => _MotionBackgroundState();
}

class _MotionBackgroundState extends State<MotionBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<_Particle> _particles = [];
  final math.Random _random = math.Random();
  Size _lastSize = Size.zero;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 120),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _initParticles(Size size) {
    if (size == _lastSize) return;
    _lastSize = size;

    _particles.clear();
    for (int i = 0; i < widget.particleCount; i++) {
      _particles.add(_createParticle(size));
    }
  }

  _Particle _createParticle(Size size) {
    final angle = _random.nextDouble() * 2 * math.pi;
    final speed = widget.particleSpeed * (0.5 + _random.nextDouble() * 0.5);

    return _Particle(
      x: _random.nextDouble() * size.width,
      y: _random.nextDouble() * size.height,
      vx: math.cos(angle) * speed,
      vy: math.sin(angle) * speed,
      radius: widget.minRadius +
          _random.nextDouble() * (widget.maxRadius - widget.minRadius),
      opacity: widget.minOpacity +
          _random.nextDouble() * (widget.maxOpacity - widget.minOpacity),
    );
  }

  void _updateParticles(Size size) {
    for (final particle in _particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around nas bordas
      if (particle.x < 0) {
        particle.x = size.width;
      } else if (particle.x > size.width) {
        particle.x = 0;
      }

      if (particle.y < 0) {
        particle.y = size.height;
      } else if (particle.y > size.height) {
        particle.y = 0;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).colorScheme.primary;

    return LayoutBuilder(
      builder: (context, constraints) {
        final size = Size(constraints.maxWidth, constraints.maxHeight);
        _initParticles(size);

        return Stack(
          children: [
            // Background com particulas
            Positioned.fill(
              child: RepaintBoundary(
                child: AnimatedBuilder(
                  animation: _controller,
                  builder: (context, _) {
                    _updateParticles(size);
                    final time = _controller.value * 120;

                    return CustomPaint(
                      painter: _MotionBackgroundPainter(
                        particles: _particles,
                        primaryColor: primaryColor,
                        time: time,
                      ),
                      size: size,
                    );
                  },
                ),
              ),
            ),
            // Conteudo principal
            widget.child,
          ],
        );
      },
    );
  }
}
