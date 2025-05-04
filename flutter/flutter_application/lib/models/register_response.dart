// lib/models/register_response.dart
// Adjust based on what your register API actually returns after successful registration
// It might return the new user object, a success message, or maybe even tokens like login.
class RegisterResponse {
  final String userId; // Example: assuming it returns the ID of the created user
  final String email;
  // Or maybe:
  // final String message;
  // final LoginResponse? tokens; // If registration also logs the user in

  RegisterResponse({
    required this.userId,
    required this.email,
    // required this.message
    // this.tokens
  });

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      userId: json['userId'] as String, // Adjust keys based on actual API response
      email: json['email'] as String,
      // message: json['message'] as String,
      // tokens: json['tokens'] != null ? LoginResponse.fromJson(json['tokens']) : null,
    );
  }
}