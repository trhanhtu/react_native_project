// lib/models/verify_otp_response.dart
// This response might vary depending on which verify endpoint was called.
// It could contain a simple success message, or tokens/user data if verification logs in/registers.
class VerifyOTPResponse {
  final bool success; // Assuming a boolean success flag
  final String message;
  // Optional fields based on context:
  final String? token; // e.g., a short-lived token for password reset confirmation
  // final LoginResponse? loginData; // If verifying OTP logs the user in

  VerifyOTPResponse({
     required this.success,
     required this.message,
     this.token,
     // this.loginData,
  });

  factory VerifyOTPResponse.fromJson(Map<String, dynamic> json) {
    return VerifyOTPResponse(
      success: json['success'] as bool? ?? false, // Provide default if nullable
      message: json['message'] as String? ?? 'Verification status unknown', // Provide default
      token: json['token'] as String?,
      // loginData: json['loginData'] != null ? LoginResponse.fromJson(json['loginData']) : null,
      // Adjust keys and types based on your actual API responses for verify, verify-register etc.
    );
  }
}