import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../app/providers.dart';
import '../../../../core/utils/bmi_utils.dart';
import '../../../../shared/widgets/gradient_panel.dart';
import '../../../../shared/widgets/loading_view.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(entriesControllerProvider.notifier).loadEntries(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final entriesState = ref.watch(entriesControllerProvider);
    final formatter = DateFormat('dd/MM/yyyy HH:mm');

    ref.listen(entriesControllerProvider, (_, next) {
      if (next.errorMessage != null && mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(next.errorMessage!)));
        ref.read(entriesControllerProvider.notifier).clearError();
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial'),
        actions: [
          IconButton(
            onPressed:
                () =>
                    ref.read(entriesControllerProvider.notifier).loadEntries(),
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            onPressed: () => context.go('/home'),
            icon: const Icon(Icons.home),
            tooltip: 'Ir a inicio',
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
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () => context.go('/entries/new'),
                        icon: const Icon(Icons.add),
                        label: const Text('Nueva entrada'),
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF7C3AED),
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => context.go('/home'),
                        icon: const Icon(Icons.home),
                        label: const Text('Inicio'),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child:
                    entriesState.isLoading
                        ? const LoadingView(message: 'Cargando historial...')
                        : entriesState.entries.isEmpty
                        ? const Center(child: Text('No hay entradas todavia.'))
                        : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                          itemBuilder: (context, index) {
                            final entry = entriesState.entries[index];
                            final bmi = BmiUtils.calculate(
                              entry.weight,
                              entry.height,
                            );

                            return GradientPanel(
                              colors: const [
                                Color(0xFFDBEAFE),
                                Color(0xFFEDE9FE),
                              ],
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    formatter.format(entry.createdAt.toLocal()),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Peso: ${entry.weight} kg   Altura: ${entry.height}   IMC: ${bmi?.toStringAsFixed(1) ?? '-'}',
                                  ),
                                ],
                              ),
                            );
                          },
                          separatorBuilder:
                              (_, __) => const SizedBox(height: 10),
                          itemCount: entriesState.entries.length,
                        ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
