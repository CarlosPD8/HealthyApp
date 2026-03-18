class PasswordPolicyModel {
  const PasswordPolicyModel({
    required this.minLength,
    required this.maxLength,
    required this.allowLower,
    required this.allowUpper,
    required this.allowDigits,
    required this.allowSymbols,
    required this.requireLower,
    required this.requireUpper,
    required this.requireDigits,
    required this.requireSymbols,
  });

  final int minLength;
  final int maxLength;
  final bool allowLower;
  final bool allowUpper;
  final bool allowDigits;
  final bool allowSymbols;
  final bool requireLower;
  final bool requireUpper;
  final bool requireDigits;
  final bool requireSymbols;

  factory PasswordPolicyModel.fromJson(Map<String, dynamic> json) {
    return PasswordPolicyModel(
      minLength: (json['minLength'] as num).toInt(),
      maxLength: (json['maxLength'] as num).toInt(),
      allowLower: json['allowLower'] as bool,
      allowUpper: json['allowUpper'] as bool,
      allowDigits: json['allowDigits'] as bool,
      allowSymbols: json['allowSymbols'] as bool,
      requireLower: json['requireLower'] as bool,
      requireUpper: json['requireUpper'] as bool,
      requireDigits: json['requireDigits'] as bool,
      requireSymbols: json['requireSymbols'] as bool,
    );
  }
}
