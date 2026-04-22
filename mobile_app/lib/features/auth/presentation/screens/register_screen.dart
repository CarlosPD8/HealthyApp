import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/providers.dart';
import '../../../../data/models/password_policy_model.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../../shared/widgets/gradient_panel.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(authControllerProvider.notifier).fetchPasswordPolicy(),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final policy = authState.passwordPolicy;

    ref.listen(authControllerProvider, (_, next) {
      if (next.errorMessage != null && mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(next.errorMessage!)));
        ref.read(authControllerProvider.notifier).clearError();
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Registro')),
      body: SafeArea(
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFFFBCFE8), Color(0xFFE9D5FF), Color(0xFFBFDBFE)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: GradientPanel(
                  colors: const [
                    Color(0xFFFCE7F3),
                    Color(0xFFEDE9FE),
                    Color(0xFFDBEAFE),
                  ],
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Crear cuenta',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (policy != null) _PasswordPolicyHint(policy: policy),
                        AppTextField(
                          label: 'Email',
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          validator: (value) {
                            final v = value?.trim() ?? '';
                            if (v.isEmpty) {
                              return 'El email es obligatorio';
                            }
                            if (!v.contains('@')) {
                              return 'Email invalido';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        AppTextField(
                          label: 'Contrasena',
                          controller: _passwordController,
                          obscureText: true,
                          textInputAction: TextInputAction.done,
                          validator: (value) {
                            final v = value ?? '';
                            if (v.isEmpty) {
                              return 'La contrasena es obligatoria';
                            }

                            if (policy != null) {
                              if (v.length < policy.minLength ||
                                  v.length > policy.maxLength) {
                                return 'Longitud ${policy.minLength}-${policy.maxLength} caracteres';
                              }
                            }

                            return null;
                          },
                        ),
                        const SizedBox(height: 18),
                        FilledButton(
                          onPressed:
                              authState.isSubmitting
                                  ? null
                                  : () async {
                                    if (!(_formKey.currentState?.validate() ??
                                        false)) {
                                      return;
                                    }
                                    final ok = await ref
                                        .read(authControllerProvider.notifier)
                                        .register(
                                          email: _emailController.text,
                                          password: _passwordController.text,
                                        );
                                    if (ok && context.mounted) {
                                      context.go('/home');
                                    }
                                  },
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xFF6D28D9),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child:
                              authState.isSubmitting
                                  ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                  : const Text('Crear cuenta'),
                        ),
                        const SizedBox(height: 10),
                        TextButton(
                          onPressed: () => context.go('/login'),
                          child: const Text('Ya tengo cuenta'),
                        ),
                      ],
                    ),
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

class _PasswordPolicyHint extends StatelessWidget {
  const _PasswordPolicyHint({required this.policy});

  final PasswordPolicyModel policy;

  @override
  Widget build(BuildContext context) {
    final requirements = <String>[];
    if (policy.requireLower) {
      requirements.add('1 minuscula');
    }
    if (policy.requireUpper) {
      requirements.add('1 mayuscula');
    }
    if (policy.requireDigits) {
      requirements.add('1 numero');
    }
    if (policy.requireSymbols) {
      requirements.add('1 simbolo');
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.75),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        'Politica: ${policy.minLength}-${policy.maxLength} caracteres. '
        '${requirements.isEmpty ? '' : 'Debe incluir ${requirements.join(', ')}.'}',
      ),
    );
  }
}
