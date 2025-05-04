// lib/models/verify_register_response.dart

class VerifyRegisterResponse {
  final String email;
  final String verifyStatus; // e.g., "VERIFIED", "ALREADY_VERIFIED", "INVALID_OTP"

  VerifyRegisterResponse({
    required this.email,
    required this.verifyStatus,
  });

  factory VerifyRegisterResponse.fromJson(Map<String, dynamic> json) {
    return VerifyRegisterResponse(
      email: json['email'] as String? ?? '',
      verifyStatus: json['verifyStatus'] as String? ?? 'UNKNOWN',
    );
  }

   @override
  String toString() {
    return 'VerifyRegisterResponse(email: $email, verifyStatus: $verifyStatus)';
  }
}