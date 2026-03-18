import 'package:flutter/material.dart';

class GradientPanel extends StatelessWidget {
  const GradientPanel({
    required this.colors,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    super.key,
  });

  final List<Color> colors;
  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: LinearGradient(colors: colors),
        boxShadow: const [
          BoxShadow(
            color: Color(0x22000000),
            blurRadius: 12,
            offset: Offset(0, 6),
          ),
        ],
      ),
      padding: padding,
      child: child,
    );
  }
}
