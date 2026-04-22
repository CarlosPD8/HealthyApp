import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class RootSecurityService {
  static const MethodChannel _channel = MethodChannel('healthy_app/security');

  Future<bool> isDeviceRooted() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) {
      return false;
    }

    try {
      final rooted = await _channel.invokeMethod<bool>('isDeviceRooted');
      return rooted ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }

  Future<bool> isInsecureEnvironment() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) {
      return false;
    }

    try {
      final insecure = await _channel.invokeMethod<bool>('isInsecureEnvironment');
      return insecure ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }

  Future<bool> isAppTampered() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) {
      return false;
    }

    try {
      final tampered = await _channel.invokeMethod<bool>('isAppTampered');
      return tampered ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }

  Future<List<String>> getSecurityThreats() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) {
      return const [];
    }

    try {
      final threats = await _channel.invokeListMethod<String>('getSecurityThreats');
      return threats ?? const [];
    } on MissingPluginException {
      return const [];
    } on PlatformException {
      return const [];
    }
  }
}
