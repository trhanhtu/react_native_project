// lib/models/register_response.dart

class RegisterResponse {
  final String name;
  final String email;
  final String status; // e.g., "PENDING_VERIFICATION", "ACTIVE", etc.

  RegisterResponse({
    required this.name,
    required this.email,
    required this.status,
  });

  // Creates an instance from the JSON map (which is the 'data' part of ApiResponse)
  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      // Use 'as String?' for safety and provide default if needed, or 'as String' if guaranteed non-null
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      status: json['status'] as String? ?? 'UNKNOWN', // Use API keys
    );
  }

  // Optional: Add a toString for easy debugging
  @override
  String toString() {
    return 'RegisterResponse(name: $name, email: $email, status: $status)';
  }
}