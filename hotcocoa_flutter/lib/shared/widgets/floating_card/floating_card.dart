import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Floating card with subtle motion animation
class FloatingCard extends StatefulWidget {
  final Widget child;
  final double floatAmount;
  final Duration duration;
  final EdgeInsets padding;
  final BorderRadius? borderRadius;

  const FloatingCard({
    super.key,
    required this.child,
    this.floatAmount = 8,
    this.duration = const Duration(seconds: 3),
    this.padding = const EdgeInsets.all(20),
    this.borderRadius,
  });

  @override
  State<FloatingCard> createState() => _FloatingCardState();
}

class _FloatingCardState extends State<FloatingCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final borderRadius = widget.borderRadius ?? BorderRadius.circular(16);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final progress = _controller.value;
        final yOffset = math.sin(progress * 2 * math.pi) * widget.floatAmount;
        final rotation = math.sin(progress * 2 * math.pi) * 0.01;

        return Transform.translate(
          offset: Offset(0, yOffset),
          child: Transform.rotate(
            angle: rotation,
            child: Container(
              padding: widget.padding,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: borderRadius,
                border: Border.all(
                  color: AppColors.white10,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 20,
                    offset: Offset(0, 10 + yOffset / 2),
                  ),
                ],
              ),
              child: widget.child,
            ),
          ),
        );
      },
    );
  }
}

/// Motion wrapper that adds subtle parallax effect
class MotionWrapper extends StatefulWidget {
  final Widget child;
  final double parallaxAmount;

  const MotionWrapper({
    super.key,
    required this.child,
    this.parallaxAmount = 0.02,
  });

  @override
  State<MotionWrapper> createState() => _MotionWrapperState();
}

class _MotionWrapperState extends State<MotionWrapper> {
  Offset _offset = Offset.zero;

  void _handleHover(PointerEvent event) {
    final size = context.size;
    if (size == null) return;

    final centerX = size.width / 2;
    final centerY = size.height / 2;

    setState(() {
      _offset = Offset(
        (event.localPosition.dx - centerX) * widget.parallaxAmount,
        (event.localPosition.dy - centerY) * widget.parallaxAmount,
      );
    });
  }

  void _handleExit(PointerEvent event) {
    setState(() {
      _offset = Offset.zero;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onHover: _handleHover,
      onExit: _handleExit,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        transform: Matrix4.identity()
          ..translate(_offset.dx, _offset.dy)
          ..rotateY(_offset.dx * 0.001)
          ..rotateX(-_offset.dy * 0.001),
        child: widget.child,
      ),
    );
  }
}
