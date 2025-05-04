// lib/models/register_request.dart
class RegisterRequest {
  final String email;
  final String password;
  // Add other required fields for registration, e.g.:
  // final String name;
  // final String phone;

  RegisterRequest({
    required this.email,
    required this.password,
    // required this.name,
    // required this.phone,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
    // 'name': name,
    // 'phone': phone,
    // Ensure keys match your API
  };
}