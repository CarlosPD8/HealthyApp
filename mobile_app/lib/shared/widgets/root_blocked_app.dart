import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class RootBlockedApp extends StatefulWidget {
  const RootBlockedApp({required this.reasons, super.key});

  final List<String> reasons;

  @override
  State<RootBlockedApp> createState() => _RootBlockedAppState();
}

class _RootBlockedAppState extends State<RootBlockedApp> {
  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 3), _closeApp);
  }

  Future<void> _closeApp() async {
    await SystemNavigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    final reasonsText = widget.reasons.join('\n\n');

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFECACA), Color(0xFFFDE68A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x22000000),
                      blurRadius: 18,
                      offset: Offset(0, 10),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.security,
                        size: 56,
                        color: Color(0xFF991B1B),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Entorno inseguro detectado',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '$reasonsText\n\nLa aplicacion se cerrara de forma segura para proteger tus datos.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 16,
                          height: 1.4,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 20),
                      FilledButton(
                        onPressed: _closeApp,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF991B1B),
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Cerrar aplicacion'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
