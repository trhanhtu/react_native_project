// lib/models/send_otp_request.dart
class SendOTPRequest {
  final String email;
  final String? type; // e.g., 'REGISTER', 'RESET_PASSWORD', 'CHANGE_EMAIL'. Make optional or required based on API.

  SendOTPRequest({required this.email, this.type});

  Map<String, dynamic> toJson() {
     final Map<String, dynamic> data = {'email': email};
     if (type != null) {
       data['type'] = type;
     }
     return data;
  }
}