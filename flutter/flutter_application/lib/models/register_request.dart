// lib/models/register_request.dart
class RegisterRequest {
  final String name; 
  final String email;
  final String password;

  RegisterRequest({
    required this.name,
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
    'name': name, // Ensure keys match API
    'email': email,
    'password': password,
  };
}