// lib/models/send_otp_response.dart

class SendOTPResponse {
  final String email;

  SendOTPResponse({required this.email});

  factory SendOTPResponse.fromJson(Map<String, dynamic> json) {
    return SendOTPResponse(
      email: json['email'] as String? ?? '', // Handle potential null or wrong type
    );
  }

  @override
  String toString() {
    return 'SendOTPResponse(email: $email)';
  }
}