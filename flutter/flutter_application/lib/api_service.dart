// lib/api_service.dart
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Import the new generic response wrapper
import 'models/api_response.dart';
// Import all your specific request/response models (representing the 'data' part)
import 'models/login_request.dart';
import 'models/login_response.dart';
import 'models/register_request.dart';
import 'models/register_response.dart';
import 'models/reset_password_request.dart';
import 'models/send_otp_request.dart';
import 'models/send_otp_response.dart';
import 'models/verify_otp_request.dart';
import 'models/verify_otp_response.dart';

class ApiService {
  // !!! REPLACE WITH YOUR ACTUAL API BASE URL !!!
  static final String _baseUrl =
      dotenv.env['API_BASE_URL'] ?? 'http://default-url.com/api';
  // --- Helper Methods ---

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
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
      } else if (kDebugMode) {
        print("Warning: includeAuth=true but no token found.");
      }
    }
    return headers;
  }

  // Helper to process the response using the generic ApiResponse
  // Throws an exception if the request fails at the HTTP level or parsing fails severely
  ApiResponse<T> _processResponse<T>(
    http.Response response,
    DataParser<T> parseData,
  ) {
    if (kDebugMode) {
      print('--- API Request ---');
      print('URL: ${response.request?.url}');
      print('Method: ${response.request?.method}');
      print('Headers: ${response.request?.headers}');
      // Avoid printing body for sensitive requests in production logs
      // if (response.request?.body != null) print('Request Body: ${response.request?.body}');
      print('--- API Response ---');
      print('Status Code: ${response.statusCode}');
      print('Body: ${response.body}');
      print('--------------------');
    }
    try {
      final decodedBody = jsonDecode(response.body);
      final apiResponse = ApiResponse<T>.fromJson(decodedBody, parseData);

      // Use HTTP status code as the primary indicator of success/failure
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Optional: Check body status code if it's critical for your logic
        // if (apiResponse.statusCode != null && apiResponse.statusCode! >= 200 && apiResponse.statusCode! < 300) {
        return apiResponse;
        // } else {
        //    throw Exception(apiResponse.message ?? apiResponse.error ?? 'API returned success status but body indicates failure.');
        // }
      } else {
        // Throw exception with message from parsed body if possible
        throw Exception(
          '${apiResponse.statusCode ?? response.statusCode}: ${apiResponse.message ?? apiResponse.error ?? response.reasonPhrase}',
        );
      }
    } on FormatException catch (e) {
      // JSON Parsing failed
      throw Exception(
        'Failed to parse response JSON: ${e.toString()}. Response Body: ${response.body}',
      );
    } catch (e) {
      // Catch exceptions from parsing or status code checks
      rethrow; // Re-throw the caught exception (could be the one from status check or parsing)
    }
  }

  // --- API Methods (Updated) ---

  Future<LoginResponse?> login(LoginRequest data) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: await _getHeaders(),
        body: jsonEncode(data.toJson()),
      );

      // Process using the generic helper and the specific LoginResponse parser
      final apiResponse = _processResponse<LoginResponse>(
        response,
        (dataJson) => LoginResponse.fromJson(dataJson as Map<String, dynamic>),
      );

      // On success (HTTP 2xx), store token and return data
      if (apiResponse.data != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', apiResponse.data!.accessToken);
        if (kDebugMode) {
          print('Token stored successfully.');
        }
        return apiResponse.data;
      } else {
        // Handle case where HTTP is 2xx but data is null (should ideally not happen if API is consistent)
        throw Exception(
          apiResponse.message ?? 'Login successful but no data received.',
        );
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error during login: $e');
      }
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
        (dataJson) =>
            RegisterResponse.fromJson(dataJson as Map<String, dynamic>),
      );
      return apiResponse
          .data; // Return the parsed data (can be null if API returns null data on success)
    } catch (e) {
      if (kDebugMode) {
        print('Error during registration: $e');
      }
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
        (dataJson) =>
            SendOTPResponse.fromJson(dataJson as Map<String, dynamic>),
      );
      return apiResponse.data;
    } catch (e) {
      if (kDebugMode) {
        print('Error sending OTP: $e');
      }
      return null;
    }
  }

  // --- NOTICE the pattern: All methods now follow the same structure ---

  Future<VerifyOTPResponse?> verifyOTP(VerifyOTPRequest data) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/verify'),
        headers: await _getHeaders(),
        body: jsonEncode(data.toJson()),
      );
      final apiResponse = _processResponse<VerifyOTPResponse>(
        response,
        (dataJson) =>
            VerifyOTPResponse.fromJson(dataJson as Map<String, dynamic>),
      );
      return apiResponse.data;
    } catch (e) {
      if (kDebugMode) {
        print('Error verifying OTP: $e');
      }
      return null;
    }
  }

  Future<VerifyOTPResponse?> verifyOTPRegister(VerifyOTPRequest data) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/verify-register'),
        headers: await _getHeaders(),
        body: jsonEncode(data.toJson()),
      );
      final apiResponse = _processResponse<VerifyOTPResponse>(
        response,
        (dataJson) =>
            VerifyOTPResponse.fromJson(dataJson as Map<String, dynamic>),
      );
      return apiResponse.data;
    } catch (e) {
      if (kDebugMode) {
        print('Error verifying OTP for register: $e');
      }
      return null;
    }
  }

  Future<VerifyOTPResponse?> verifyOTPChangeEmail(VerifyOTPRequest data) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/verify-change-email'),
        headers: await _getHeaders(includeAuth: true), // Assume auth needed
        body: jsonEncode(data.toJson()),
      );
      final apiResponse = _processResponse<VerifyOTPResponse>(
        response,
        (dataJson) =>
            VerifyOTPResponse.fromJson(dataJson as Map<String, dynamic>),
      );
      return apiResponse.data;
    } catch (e) {
      if (kDebugMode) {
        print('Error verifying OTP for change email: $e');
      }
      return null;
    }
  }

  Future<VerifyOTPResponse?> resetPassword(ResetPasswordRequest data) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/reset-password'),
        headers: await _getHeaders(),
        body: jsonEncode(data.toJson()),
      );
      final apiResponse = _processResponse<VerifyOTPResponse>(
        response,
        (dataJson) =>
            VerifyOTPResponse.fromJson(dataJson as Map<String, dynamic>),
      );
      return apiResponse.data;
    } catch (e) {
      if (kDebugMode) {
        print('Error resetting password: $e');
      }
      return null;
    }
  }

  Future<bool> logout() async {
    try {
      final response = await http.get(
        // Assuming GET
        Uri.parse('$_baseUrl/auth/logout'),
        headers: await _getHeaders(includeAuth: true),
      );

      // Process response, but we don't care about the 'data' part for logout
      _processResponse<dynamic>(
        response,
        (dataJson) => dataJson,
      ); // Use a generic parser

      // Clear stored token only on successful logout (HTTP 2xx)
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('jwt_token');
   
        logger.e('Token removed on logout.');
      
      return true; // Indicate success
    } catch (e) {
        logger.e('Error during logout: $e');
      
      return false; // Indicate failure
    }
  }
}

// Create a logger instance
final logger = Logger(
  // Customize the printer (optional)
  printer: PrettyPrinter(
      methodCount: 1, // Number of method calls to be displayed
      errorMethodCount: 8, // Number of method calls if stacktrace is provided
      lineLength: 120, // Width of the output
      colors: true, // Colorful log messages
      printEmojis: true, // Print an emoji for each log message
      printTime: true // Should each log print contain a timestamp
      ),
  // Set minimum log level based on build mode
  // In release mode, only log warnings and errors (or higher)
  // In debug mode, log everything (debug level and above)
  level: kReleaseMode ? Level.warning : Level.debug,
);