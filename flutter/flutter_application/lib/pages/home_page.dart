import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart'; // To clear token on logout

import '../api_service.dart';
import 'login_page.dart'; // Navigate back to login

class HomePage extends StatefulWidget {
  final String userEmail;
  const HomePage({super.key, required this.userEmail});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  //final ApiService _apiService = ApiService();
  bool _isLoggingOut = false;

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.redAccent : Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _logout() async {
    setState(() => _isLoggingOut = true);
    try {
      // No need to call API service logout if you just want to clear token locally
      // bool loggedOut = await _apiService.logout();

      // Clear local token immediately
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('jwt_token');
      logger.i("Token removed locally.");

      if (mounted) {
        // Navigate back to login screen and remove all previous routes
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const LoginPage()),
          (Route<dynamic> route) => false,
        );
      }
      // Optional: Call API logout in background if needed (fire and forget)
      // _apiService.logout().catchError((e) => print("Background logout API call failed: $e"));
    } catch (e) {
      // This catch is mainly for potential SharedPreferences errors now
      if (mounted) {
        _showSnackBar("Lỗi khi đăng xuất: ${e.toString()}", isError: true);
      }
    } finally {
      // May not be reached if navigation happens successfully
      if (mounted) {
        setState(() => _isLoggingOut = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Trang Chủ"), // Vietnamese: Home Page
        automaticallyImplyLeading: false, // Remove back button
        actions: [
          _isLoggingOut
              ? Padding(
                padding: const EdgeInsets.all(10.0),
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 3,
                  ),
                ),
              )
              : IconButton(
                icon: Icon(Icons.logout),
                tooltip: 'Đăng xuất', // Vietnamese: Logout
                onPressed: _logout,
              ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.check_circle_outline, size: 80, color: Colors.green),
              SizedBox(height: 20),
              Text(
                'Chào mừng bạn đã đăng nhập! ${widget.userEmail}', // Vietnamese: Welcome, you are logged in!
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 30),
              // Add dashboard content / other functionality here
              Text(
                'Đây là trang chính của ứng dụng quản lý.', // Vietnamese: This is the main page of the manager app.
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
