import 'package:flutter/material.dart';
import 'package:flutter_application/api_service.dart';
import 'package:flutter_application/pages/introduction_page.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
// Import logger if you define it here or globally
// import 'package:logger/logger.dart';

// Define logger if you want to use it here
// final logger = Logger();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await dotenv.load(fileName: ".env");
    logger.i("dotenv loaded successfully");
    logger.i("API_BASE_URL from env: ${dotenv.env['API_BASE_URL']}");
  } catch (e) {
    logger.e("Error loading .env file: $e");
  }

  runApp(const MyApp());
}

// ... rest of your MyApp class

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'App Manager',
      theme: ThemeData(
        primarySwatch: Colors.blue, // Or any color theme you like
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const IntroductionPage(), // Start with the IntroductionPage
      debugShowCheckedModeBanner: false, // Optional: hide the debug banner
    );
  }
}
