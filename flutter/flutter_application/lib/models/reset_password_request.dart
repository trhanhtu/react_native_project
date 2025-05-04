// lib/models/reset_password_request.dart
class ResetPasswordRequest {
  final String email;
  final String otp;
  final String newPassword;

  ResetPasswordRequest({
    required this.email,
    required this.otp,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'otp': otp,
    'newPassword': newPassword, // Ensure keys match your API
  };
}