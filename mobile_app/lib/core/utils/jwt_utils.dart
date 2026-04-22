import 'dart:convert';

class JwtUtils {
  static bool isExpired(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return true;
      final payload = utf8.decode(
        base64Url.decode(base64Url.normalize(parts[1])),
      );
      final map = jsonDecode(payload) as Map<String, dynamic>;
      final exp = map['exp'];
      if (exp is! num) return true;
      return DateTime.now().millisecondsSinceEpoch >= exp.toInt() * 1000;
    } catch (_) {
      return true;
    }
  }
}
