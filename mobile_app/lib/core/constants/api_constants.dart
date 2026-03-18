class ApiConstants {
  static const String defaultAndroidEmulatorBaseUrl = 'http://10.0.2.2:8080';
  static const String defaultLocalhostBaseUrl = 'http://localhost:3001';
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: defaultAndroidEmulatorBaseUrl,
  );

  static const String authPolicy = '/api/auth/policy';
  static const String authRegister = '/api/auth/register';
  static const String authLogin = '/api/auth/login';
  static const String entries = '/api/entries';
}
