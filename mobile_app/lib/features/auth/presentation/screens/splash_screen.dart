import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/providers.dart';
import '../../../../shared/widgets/loading_view.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      await ref.read(authControllerProvider.notifier).bootstrap();
      await ref.read(authControllerProvider.notifier).fetchPasswordPolicy();
    });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: LoadingView(message: 'Comprobando sesion...'));
  }
}
