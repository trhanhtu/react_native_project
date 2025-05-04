// lib/models/login_response.dart
class LoginResponse {
  final String accessToken;
  // Add other fields your login endpoint returns, e.g.:
  // final String refreshToken;
  // final User user; // Assuming you have a User model

  LoginResponse({
    required this.accessToken,
    // required this.refreshToken,
    // required this.user,
  });

  // Assumes the JSON passed here is the *content* of the 'data' field from the API response
  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['accessToken'] as String, // Adjust key if necessary
      // refreshToken: json['refreshToken'] as String,
      // user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

// Example User model (if needed)
// class User {
//   final String id;
//   final String name;
//   final String email;
//   // ... other user fields
//   User({required this.id, required this.name, required this.email});
//
//   factory User.fromJson(Map<String, dynamic> json) {
//     return User(
//       id: json['id'] as String,
//       name: json['name'] as String,
//       email: json['email'] as String,
//     );
//   }
// }