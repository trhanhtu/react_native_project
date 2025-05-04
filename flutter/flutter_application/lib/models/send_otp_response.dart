// lib/models/send_otp_response.dart
// Assuming the API response confirms the details sent or provides a message
class SendOTPResponse {
  final String email;
  final String? type;
  final String? message; // Optional: confirmation message from API

  SendOTPResponse({required this.email, this.type, this.message});

  factory SendOTPResponse.fromJson(Map<String, dynamic> json) {
    return SendOTPResponse(
      email: json['email'] as String,
      type: json['type'] as String?,
      message: json['message'] as String?, // Adjust keys as needed
    );
  }
}