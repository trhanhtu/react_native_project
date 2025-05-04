// lib/api_service.dart

import 'dart:async'; // Import for FutureOr used in catchError example
import 'dart:convert';

import 'package:flutter/foundation.dart'; // For kReleaseMode
import 'package:flutter_dotenv/flutter_dotenv.dart'; // If using dotenv
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart'; // Import logger
import 'package:shared_preferences/shared_preferences.dart';

// Import the generic response wrapper
import 'models/api_response.dart';
// Import all specific request/response models
import 'models/login_request.dart';
import 'models/login_response.dart';
import 'models/register_request.dart';
import 'models/register_response.dart';
import 'models/reset_password_request.dart';
import 'models/reset_password_response.dart'; // Updated model
import 'models/send_otp_request.dart';
import 'models/send_otp_response.dart';
import 'models/verify_otp_request.dart';
import 'models/verify_otp_response.dart'; // Keep if used by verifyOTP or verifyOTPChangeEmail
import 'models/verify_register_response.dart'; // Updated model


// --- Logger Setup ---
// Define a global logger instance
final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 1,        // Show only 1 method call stack trace line
    errorMethodCount: 8,   // Show 8 stack trace lines for errors
    lineLength: 100,       // Width of the log output
    colors: true,          // Use colors
    printEmojis: true,      // Print emojis for different levels
    printTime: true,       // Include timestamp
  ),
  // Filter logs based on build mode
  level: kReleaseMode ? Level.warning : Level.debug,
);
// --- End Logger Setup ---


class ApiService {
  // Base URL using dotenv
  static final String _baseUrl = dotenv.env['API_BASE_URL'] ?? 'SETUP_ENV_FILE_ERROR'; // Make error obvious if .env missing

  // --- Helper Methods ---

  Future<String?> _getToken() async {
    try {
       final prefs = await SharedPreferences.getInstance();
       return prefs.getString('jwt_token');
    } catch (e, s) {
       logger.e("Failed to get token from SharedPreferences", error: e, stackTrace: s);
       return null;
    }
  }

  Future<Map<String, String>> _getHeaders({bool includeAuth = false}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
    };
    if (includeAuth) {
      final token = await _getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      } else {
        // Log warning if auth required but no token found (will be ignored in release)
        logger.w("Attempted to include auth token, but none was found.");
      }
    }
    return headers;
  }

  // Helper to process the response using the generic ApiResponse
  // Throws an exception if the request fails at the HTTP level or parsing fails severely
  ApiResponse<T> _processResponse<T>(http.Response response, DataParser<T> parseData) {
     // Log basic request/response info at debug level
     logger.d(
        'API Request: ${response.request?.method} ${response.request?.url}\n'
        'API Response Status: ${response.statusCode}\n'
        'API Response Body: ${response.body.length > 500 ? "${response.body.substring(0, 500)}..." : response.body}' // Truncate long bodies
     );

     try {
        final decodedBody = jsonDecode(response.body);
        final apiResponse = ApiResponse<T>.fromJson(decodedBody, parseData);

        // Use HTTP status code as the primary indicator of success/failure
        if (response.statusCode >= 200 && response.statusCode < 300) {
            // Log application-level errors if present, even on HTTP 2xx
            if (apiResponse.error != null || (apiResponse.statusCode != null && apiResponse.statusCode! >= 300) ) {
                logger.w("API returned HTTP ${response.statusCode} but body indicates potential issue: Code=${apiResponse.statusCode}, Msg=${apiResponse.message}, Err=${apiResponse.error}");
            }
           return apiResponse;
        } else {
            // Throw exception with message from parsed body if possible
           throw Exception('${apiResponse.statusCode ?? response.statusCode}: ${apiResponse.message ?? apiResponse.error ?? response.reasonPhrase}');
        }
     } on FormatException catch (e, s) {
         // JSON Parsing failed
         logger.e("Response JSON parsing failed", error: e, stackTrace: s);
         throw Exception('Failed to parse response JSON. Body: ${response.body.length > 200 ? '${response.body.substring(0,200)}...' : response.body }');
     } catch (e, s) {
         // Catch exceptions from parsing or status code checks
         logger.e("Error processing API Response", error: e, stackTrace: s);
         rethrow; // Re-throw the caught exception
     }
  }


  // --- API Methods (Using Logger) ---

  Future<LoginResponse?> login(LoginRequest data) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: await _getHeaders(),
        body: jsonEncode(data.toJson()),
      );

      final apiResponse = _processResponse<LoginResponse>(
         response,
         (dataJson) => LoginResponse.fromJson(dataJson as Map<String, dynamic>)
      );

      if (apiResponse.data != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', apiResponse.data!.accessToken);
        logger.d('Token stored successfully.'); // Debug level
        return apiResponse.data;
      } else {
         throw Exception(apiResponse.message ?? 'Login successful but no data received.');
      }
    } catch (e, s) {
      logger.e('Login API call failed', error: e, stackTrace: s); // Log error with stacktrace
      return null; // Return null on any exception
    }
  }

   Future<RegisterResponse?> register(RegisterRequest data) async {
      try {
         final response = await http.post(
            Uri.parse('$_baseUrl/auth/register'),
            headers: await _getHeaders(),
            body: jsonEncode(data.toJson()),
         );
         final apiResponse = _processResponse<RegisterResponse>(
            response,
            (dataJson) => RegisterResponse.fromJson(dataJson as Map<String, dynamic>)
         );
         return apiResponse.data;
      } catch (e, s) {
          logger.e('Register API call failed', error: e, stackTrace: s);
          return null;
      }
   }

   Future<SendOTPResponse?> sendOTP(SendOTPRequest data) async {
     try {
       final response = await http.post(
         Uri.parse('$_baseUrl/auth/sendOTP'),
         headers: await _getHeaders(),
         body: jsonEncode(data.toJson()),
       );
        final apiResponse = _processResponse<SendOTPResponse>(
           response,
           (dataJson) => SendOTPResponse.fromJson(dataJson as Map<String, dynamic>)
        );
       return apiResponse.data;
     } catch (e, s) {
       logger.e('Send OTP API call failed', error: e, stackTrace: s);
       return null;
     }
   }

   Future<VerifyRegisterResponse?> verifyOTPRegister(VerifyOTPRequest data) async {
     try {
       final response = await http.post(
         Uri.parse('$_baseUrl/auth/verify-register'),
         headers: await _getHeaders(),
         body: jsonEncode(data.toJson()),
       );
        final apiResponse = _processResponse<VerifyRegisterResponse>(
           response,
           (dataJson) => VerifyRegisterResponse.fromJson(dataJson as Map<String, dynamic>)
        );
       return apiResponse.data;
     } catch (e, s) {
       logger.e('Verify OTP Register API call failed', error: e, stackTrace: s);
       return null;
     }
   }

  Future<ResetPasswordResponse?> resetPassword(ResetPasswordRequest data) async {
      try {
         final response = await http.post(
            Uri.parse('$_baseUrl/auth/reset-password'),
            headers: await _getHeaders(),
            body: jsonEncode(data.toJson()),
         );
         final apiResponse = _processResponse<ResetPasswordResponse>(
            response,
            (dataJson) => ResetPasswordResponse.fromJson(dataJson as Map<String, dynamic>)
         );
         return apiResponse.data;
      } catch (e, s) {
         logger.e('Reset Password API call failed', error: e, stackTrace: s);
         return null;
      }
   }

  // --- Keep other verify methods if needed, using VerifyOTPResponse ---
  // Example: Generic verify endpoint (if it exists and returns VerifyOTPResponse)
   Future<VerifyOTPResponse?> verifyOTP(VerifyOTPRequest data) async {
     try {
       final response = await http.post(
         Uri.parse('$_baseUrl/auth/verify'), // Assuming generic endpoint
         headers: await _getHeaders(),
         body: jsonEncode(data.toJson()),
       );
       final apiResponse = _processResponse<VerifyOTPResponse>(
          response,
          (dataJson) => VerifyOTPResponse.fromJson(dataJson as Map<String, dynamic>)
       );
       // Ensure VerifyOTPResponse model exists and is correct
       return apiResponse.data;
     } catch (e, s) {
       logger.e('Generic Verify OTP API call failed', error: e, stackTrace: s);
       return null;
     }
   }

  // Example: Change Email verify endpoint
  Future<VerifyOTPResponse?> verifyOTPChangeEmail(VerifyOTPRequest data) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/verify-change-email'),
        headers: await _getHeaders(includeAuth: true), // Assume auth needed
        body: jsonEncode(data.toJson()),
      );
      final apiResponse = _processResponse<VerifyOTPResponse>(
         response,
         (dataJson) => VerifyOTPResponse.fromJson(dataJson as Map<String, dynamic>)
      );
       // Ensure VerifyOTPResponse model exists and is correct
      return apiResponse.data;
    } catch (e, s) {
      logger.e('Verify OTP Change Email API call failed', error: e, stackTrace: s);
      return null;
    }
  }
  // --- End optional verify methods ---

  Future<bool> logout() async {
    try {
      final response = await http.get( // Assuming GET
        Uri.parse('$_baseUrl/auth/logout'),
        headers: await _getHeaders(includeAuth: true), // Logout requires auth
      );

      // Process response to check for errors, ignore data field
      _processResponse<dynamic>(response, (dataJson) => dataJson);

       // Clear stored token only on successful logout (HTTP 2xx)
       final prefs = await SharedPreferences.getInstance();
       await prefs.remove('jwt_token');
       logger.d('Token removed on logout.'); // Debug level
       return true; // Indicate success

    } catch (e, s) {
      logger.e('Logout API call failed', error: e, stackTrace: s);
      // Also attempt to clear local token even if API call fails
       try {
           final prefs = await SharedPreferences.getInstance();
           await prefs.remove('jwt_token');
           logger.w('Cleared local token despite logout API failure.');
       } catch (prefError) {
           logger.e('Failed to clear token after logout API failure.', error: prefError);
       }
      return false; // Indicate failure
    }
  }

} // End of ApiService class