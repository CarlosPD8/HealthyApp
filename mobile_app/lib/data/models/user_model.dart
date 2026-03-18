class UserModel {
  const UserModel({required this.id, required this.email, required this.role});

  final int id;
  final String email;
  final String role;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: (json['id'] as num).toInt(),
      email: json['email'] as String,
      role: (json['role'] as String?) ?? 'user',
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'email': email, 'role': role};
}
