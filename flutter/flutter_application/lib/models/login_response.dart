// lib/models/login_response.dart

class LoginResponse {
  final int id;
  final String email;
  final String name;
  final String? avatar; // Make nullable as avatar might be optional
  final String accessToken;
  final String role;
  final bool active;

  LoginResponse({
    required this.id,
    required this.email,
    required this.name,
    this.avatar, // Nullable
    required this.accessToken,
    required this.role,
    required this.active,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      id: json['id'] as int? ?? 0, // Handle potential null/wrong type
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? '',
      avatar: json['avatar'] as String?, // Allow null
      accessToken: json['accessToken'] as String? ?? '',
      role: json['role'] as String? ?? '',
      active: json['active'] as bool? ?? false, // Handle potential null/wrong type
    );
  }

   @override
  String toString() {
    return 'LoginResponse(id: $id, email: $email, name: $name, avatar: $avatar, role: $role, active: $active, hasToken: ${accessToken.isNotEmpty})';
  }
}