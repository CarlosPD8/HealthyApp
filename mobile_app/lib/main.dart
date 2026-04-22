import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/app.dart';
import 'core/services/root_security_service.dart';
import 'shared/widgets/root_blocked_app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final securityService = RootSecurityService();
  final threats = await securityService.getSecurityThreats();
  if (threats.isNotEmpty) {
    runApp(RootBlockedApp(reasons: threats));
    return;
  }

  runApp(const ProviderScope(child: HealthyApp()));
}
