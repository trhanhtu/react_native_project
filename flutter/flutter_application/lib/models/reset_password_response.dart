// lib/models/reset_password_response.dart

class ResetPasswordResponse {
  final String email;
  final String verifyStatus; // e.g., "SUCCESS", "INVALID_OTP", "FAILED"

  ResetPasswordResponse({
    required this.email,
    required this.verifyStatus,
  });

  factory ResetPasswordResponse.fromJson(Map<String, dynamic> json) {
    return ResetPasswordResponse(
      email: json['email'] as String? ?? '',
      verifyStatus: json['verifyStatus'] as String? ?? 'UNKNOWN',
    );
  }

   @override
  String toString() {
    return 'ResetPasswordResponse(email: $email, verifyStatus: $verifyStatus)';
  }
}