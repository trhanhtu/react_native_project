import 'package:flutter/material.dart';

import '../api_service.dart';
import '../models/login_request.dart';
import 'forgot_password_page.dart';
import 'home_page.dart';
import 'signup_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  final ApiService _apiService = ApiService(); // Use your ApiService instance

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showSnackBar(String message, {bool isError = false}) {
     if (!mounted) return;
     ScaffoldMessenger.of(context).showSnackBar(
       SnackBar(
         content: Text(message),
         backgroundColor: isError ? Colors.redAccent : Colors.green,
         behavior: SnackBarBehavior.floating, // Optional: Makes it float
       ),
     );
   }


  Future<void> _login() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);

      final loginRequest = LoginRequest(
        email: _emailController.text.trim(), // Trim whitespace
        password: _passwordController.text,
      );

      try {
          // Use the ApiService
          final loginResponse = await _apiService.login(loginRequest);

          if (loginResponse != null && mounted) {
             _showSnackBar("Đăng nhập thành công!");
            Navigator.pushReplacement( // Use pushReplacement to remove login page from stack
              context,
              MaterialPageRoute(builder: (context) => HomePage( userEmail: _emailController.text.trim())), // Pass user email if needed
            );
          } else if (mounted) {
             // If loginResponse is null but no exception, could be API logic failure
              _showSnackBar("Email hoặc mật khẩu không đúng.", isError: true);
          }

      } catch (e) {
           // Exceptions are now thrown by _processResponse for HTTP/parsing errors
           if (mounted) {
              _showSnackBar("Lỗi đăng nhập: ${e.toString()}", isError: true);
           }
      } finally {
           if (mounted) {
              setState(() => _isLoading = false);
           }
      }
    } else {
       _showSnackBar("Vui lòng điền đầy đủ thông tin.", isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center( // Center the content vertically
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Form(
               key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  // 1. Big Square Image
                  Image.asset(
                    'assets/images/login.png',
                    height: 180, // Adjust as needed
                  ),
                  SizedBox(height: 40),

                  // 2. Form Title (Optional)
                  Text(
                     'Đăng Nhập', // Vietnamese: Login
                     textAlign: TextAlign.center,
                     style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: Colors.teal),
                  ),
                  SizedBox(height: 30),

                  // 3. Form Fields
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email', // Vietnamese: Email
                      hintText: 'Nhập địa chỉ email', // Vietnamese: Enter email address
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty || !value.contains('@')) {
                        return 'Vui lòng nhập email hợp lệ'; // Vietnamese: Please enter a valid email
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 15),
                  TextFormField(
                    controller: _passwordController,
                    decoration: const InputDecoration(
                      labelText: 'Mật khẩu', // Vietnamese: Password
                      hintText: 'Nhập mật khẩu', // Vietnamese: Enter password
                      prefixIcon: Icon(Icons.lock_outline),
                      // Consider adding password visibility toggle
                    ),
                    obscureText: true,
                     validator: (value) {
                        if (value == null || value.isEmpty) {
                            return 'Vui lòng nhập mật khẩu'; // Vietnamese: Please enter password
                        }
                        return null;
                     },
                  ),
                  SizedBox(height: 10),
                  Align( // Align Forgot Password link to the right
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: _isLoading ? null : () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const ForgotPasswordPage()),
                        );
                      },
                      child: Text('Quên mật khẩu?'), // Vietnamese: Forgot Password?
                    ),
                  ),
                  SizedBox(height: 25),

                  // 4. Submit Button
                  _isLoading
                    ? Center(child: CircularProgressIndicator(color: Colors.teal))
                    : ElevatedButton(
                        onPressed: _login,
                        child: Text('Đăng nhập'), // Vietnamese: Login
                      ),
                  SizedBox(height: 30),

                  // 5. Navigation Text
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Text('Chưa có tài khoản?'), // Vietnamese: Don't have an account?
                      TextButton(
                        onPressed: _isLoading ? null : () {
                           Navigator.push(
                             context,
                             MaterialPageRoute(builder: (context) => const SignupPage()),
                           );
                        },
                        child: Text('Đăng ký ngay'), // Vietnamese: Sign up now
                      )
                    ],
                  ),
                   SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}