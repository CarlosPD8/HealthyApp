import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/user_model.dart';

class SecureStorageService {
  static const _tokenKey = 'auth_token';
  static const _userKey = 'auth_user';

  const SecureStorageService(this._storage);

  final FlutterSecureStorage _storage;

  Future<void> saveSession(String token, UserModel user) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
  }

  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<UserModel?> readUser() async {
    final raw = await _storage.read(key: _userKey);
    if (raw == null) return null;
    return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<void> clearSession() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
  }
}
