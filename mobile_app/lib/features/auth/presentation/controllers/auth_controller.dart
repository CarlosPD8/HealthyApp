import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/errors/app_exception.dart';
import '../../../../data/models/password_policy_model.dart';
import '../../../../data/models/user_model.dart';
import '../../../../data/repositories/auth_repository.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    required this.status,
    this.token,
    this.user,
    this.errorMessage,
    this.isSubmitting = false,
    this.passwordPolicy,
  });

  final AuthStatus status;
  final String? token;
  final UserModel? user;
  final String? errorMessage;
  final bool isSubmitting;
  final PasswordPolicyModel? passwordPolicy;

  AuthState copyWith({
    AuthStatus? status,
    String? token,
    UserModel? user,
    String? errorMessage,
    bool? isSubmitting,
    PasswordPolicyModel? passwordPolicy,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      token: token ?? this.token,
      user: user ?? this.user,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      passwordPolicy: passwordPolicy ?? this.passwordPolicy,
    );
  }

  static const initial = AuthState(status: AuthStatus.unknown);
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repository) : super(AuthState.initial);

  final AuthRepository _repository;

  Future<void> bootstrap() async {
    final session = await _repository.restoreSession();
    if (session == null) {
      state = const AuthState(status: AuthStatus.unauthenticated);
      return;
    }

    state = AuthState(
      status: AuthStatus.authenticated,
      token: session.$1,
      user: session.$2,
    );
  }

  Future<void> fetchPasswordPolicy() async {
    try {
      final policy = await _repository.fetchPolicy();
      state = state.copyWith(passwordPolicy: policy, clearError: true);
    } catch (e) {
      if (e is AppException) {
        state = state.copyWith(errorMessage: e.message);
      } else {
        state = state.copyWith(
          errorMessage: 'No se pudo cargar la politica de contrasenas.',
        );
      }
    }
  }

  Future<bool> login({required String email, required String password}) async {
    state = state.copyWith(isSubmitting: true, clearError: true);

    try {
      final authResponse = await _repository.login(
        email: email.trim(),
        password: password,
      );
      await _repository.persistSession(authResponse);
      state = AuthState(
        status: AuthStatus.authenticated,
        token: authResponse.token,
        user: authResponse.user,
        passwordPolicy: state.passwordPolicy,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isSubmitting: false,
        errorMessage:
            e is AppException ? e.message : 'Error de inicio de sesion.',
      );
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isSubmitting: true, clearError: true);

    try {
      final authResponse = await _repository.register(
        email: email.trim(),
        password: password,
      );
      await _repository.persistSession(authResponse);
      state = AuthState(
        status: AuthStatus.authenticated,
        token: authResponse.token,
        user: authResponse.user,
        passwordPolicy: state.passwordPolicy,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isSubmitting: false,
        errorMessage: e is AppException ? e.message : 'Error de registro.',
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.clearSession();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}
