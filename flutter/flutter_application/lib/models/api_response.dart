// lib/models/api_response.dart
import 'package:flutter/foundation.dart'; // For kDebugMode

// Define a type alias for the function that parses the inner 'data' field
typedef DataParser<T> = T Function(dynamic dataJson);

class ApiResponse<T> {
  final int? statusCode; // From response body, can be null if parsing fails
  final String? message; // Can be null
  final T? data; // The actual payload, nullable
  final String? error; // Can be null

  ApiResponse({
    this.statusCode,
    this.message,
    this.data,
    this.error,
  });

  // Factory constructor to parse the JSON response
  // It requires a 'parser' function to handle the specific type 'T' of the data field
  factory ApiResponse.fromJson(Map<String, dynamic> json, DataParser<T> parseData) {
    T? parsedData;
    try {
      // Check if 'data' exists and is not null before trying to parse
      if (json['data'] != null) {
        parsedData = parseData(json['data']); // Use the provided parser for the 'data' field
      }
    } catch (e) {
       if (kDebugMode) {
         print("Error parsing 'data' field in ApiResponse: $e");
         print("Data field content: ${json['data']}");
       }
       // Keep parsedData as null if parsing fails
    }

    return ApiResponse<T>(
      // Use 'as int?' for safe casting, defaulting to null if wrong type or missing
      statusCode: json['statusCode'] as int?,
      message: json['message'] as String?,
      data: parsedData, // Use the result from the parser function
      error: json['error'] as String?,
    );
  }
}