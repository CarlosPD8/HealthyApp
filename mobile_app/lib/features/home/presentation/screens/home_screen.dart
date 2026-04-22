import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/providers.dart';
import '../../../../shared/widgets/gradient_panel.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('HealthyApp'),
        actions: [
          IconButton(
            onPressed: () async {
              await ref.read(authControllerProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesion',
          ),
        ],
      ),
      body: SafeArea(
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFFE0F2FE), Color(0xFFEDE9FE), Color(0xFFFCE7F3)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                GradientPanel(
                  colors: const [
                    Color(0xFFBFDBFE),
                    Color(0xFFBAE6FD),
                    Color(0xFF99F6E4),
                  ],
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Registro de Peso y Altura',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text('Sesion: ${user?.email ?? 'usuario'}'),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                GradientPanel(
                  colors: const [
                    Color(0xFFC4B5FD),
                    Color(0xFFD8B4FE),
                    Color(0xFFFBCFE8),
                  ],
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      FilledButton.icon(
                        onPressed: () => context.go('/entries/new'),
                        icon: const Icon(Icons.add_circle_outline),
                        label: const Text('Anadir entrada'),
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF6D28D9),
                          foregroundColor: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 10),
                      FilledButton.tonalIcon(
                        onPressed: () => context.go('/entries/history'),
                        icon: const Icon(Icons.history),
                        label: const Text('Historial'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
