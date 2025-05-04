// lib/models/reset_password_request.dart
class ResetPasswordRequest {
  final String email;
  final String otp;
  final String password;
  final String passwordConfirm;

  ResetPasswordRequest({
    required this.email,
    required this.otp,
    required this.password,
    required this.passwordConfirm,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'otp': otp,
    'password': password, // Ensure keys match your API
    'passwordConfirm': passwordConfirm, // Ensure keys match your API
  };
}
