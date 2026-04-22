import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/providers.dart';
import '../../../../core/utils/bmi_utils.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../../shared/widgets/gradient_panel.dart';

class AddEntryScreen extends ConsumerStatefulWidget {
  const AddEntryScreen({super.key});

  @override
  ConsumerState<AddEntryScreen> createState() => _AddEntryScreenState();
}

class _AddEntryScreenState extends ConsumerState<AddEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _weightController = TextEditingController();
  final _heightController = TextEditingController();

  @override
  void dispose() {
    _weightController.dispose();
    _heightController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final entriesState = ref.watch(entriesControllerProvider);
    final weight = double.tryParse(_weightController.text);
    final height = double.tryParse(_heightController.text);
    final bmi =
        (weight != null && height != null)
            ? BmiUtils.calculate(weight, height)
            : null;

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
        title: const Text('Anadir entrada'),
        actions: [
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
              colors: [Color(0xFFBFDBFE), Color(0xFFE9D5FF), Color(0xFFFBCFE8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  GradientPanel(
                    colors: const [Color(0xFFBAE6FD), Color(0xFFBFDBFE)],
                    child: AppTextField(
                      label: 'Peso (kg)',
                      controller: _weightController,
                      hint: '75.4',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (value) {
                        final parsed = double.tryParse(value ?? '');
                        if (parsed == null) {
                          return 'Introduce un peso valido';
                        }
                        if (parsed <= 2 || parsed > 300) {
                          return 'El peso debe ser >2 y <=300';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  GradientPanel(
                    colors: const [Color(0xFFFBCFE8), Color(0xFFD8B4FE)],
                    child: AppTextField(
                      label: 'Altura (m o cm)',
                      controller: _heightController,
                      hint: '1.78 o 178',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (value) {
                        final parsed = double.tryParse(value ?? '');
                        if (parsed == null) {
                          return 'Introduce una altura valida';
                        }
                        final normalized = parsed >= 3 ? parsed / 100 : parsed;
                        if (normalized <= 0 || normalized >= 3) {
                          return 'La altura debe estar entre 0 y 3 metros';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  GradientPanel(
                    colors: const [Color(0xFFC4B5FD), Color(0xFFDDD6FE)],
                    child: Text(
                      bmi == null
                          ? 'Introduce peso y altura para ver el IMC'
                          : 'IMC estimado: ${bmi.toStringAsFixed(1)}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed:
                        entriesState.isSubmitting
                            ? null
                            : () async {
                              if (!(_formKey.currentState?.validate() ??
                                  false)) {
                                return;
                              }

                              final ok = await ref
                                  .read(entriesControllerProvider.notifier)
                                  .addEntry(
                                    weight: double.parse(
                                      _weightController.text,
                                    ),
                                    height: double.parse(
                                      _heightController.text,
                                    ),
                                  );

                              if (!context.mounted) {
                                return;
                              }

                              if (ok) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Entrada guardada correctamente.',
                                    ),
                                  ),
                                );
                                context.go('/entries/history');
                              }
                            },
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF6D28D9),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child:
                        entriesState.isSubmitting
                            ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                            : const Text('Guardar entrada'),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: () => context.go('/home'),
                    icon: const Icon(Icons.home),
                    label: const Text('Ir a inicio'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
