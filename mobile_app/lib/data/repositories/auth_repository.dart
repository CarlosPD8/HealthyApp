import '../../core/constants/api_constants.dart';
import '../../core/utils/jwt_utils.dart';
import '../models/auth_response_model.dart';
import '../models/password_policy_model.dart';
import '../models/user_model.dart';
import '../services/api_client.dart';
import '../services/secure_storage_service.dart';

class AuthRepository {
  const AuthRepository(this._apiClient, this._storage);

  final ApiClient _apiClient;
  final SecureStorageService _storage;

  Future<PasswordPolicyModel> fetchPolicy() async {
    final response = await _apiClient.get(ApiConstants.authPolicy);
    return PasswordPolicyModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<AuthResponseModel> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.authLogin,
      data: {'email': email, 'password': password},
    );

    return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<AuthResponseModel> register({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.authRegister,
      data: {'email': email, 'password': password},
    );

    return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> persistSession(AuthResponseModel authResponse) {
    return _storage.saveSession(authResponse.token, authResponse.user);
  }

  Future<void> clearSession() => _storage.clearSession();

  Future<(String, UserModel)?> restoreSession() async {
    final token = await _storage.readToken();
    final user = await _storage.readUser();

    if (token == null ||
        token.isEmpty ||
        user == null ||
        JwtUtils.isExpired(token)) {
      await _storage.clearSession();
      return null;
    }

    return (token, user);
  }
}
