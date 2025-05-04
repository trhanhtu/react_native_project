// lib/models/login_request.dart
class LoginRequest {
  final String email;
  final String password;

  LoginRequest({required this.email, required this.password});

  Map<String, dynamic> toJson() => {
    'email': email, // Ensure these keys match your API specification
    'password': password,
  };
}