import 'package:flutter/material.dart';

import '../api_service.dart';
import '../models/send_otp_request.dart';
import 'otp_verification_page.dart'; // Navigate to OTP page

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  final ApiService _apiService = ApiService();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

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

  Future<void> _sendResetOtp() async {
    if (!_formKey.currentState!.validate()) {
       _showSnackBar("Vui lòng nhập email hợp lệ.", isError: true);
      return;
    }
    setState(() => _isLoading = true);

    final otpRequest = SendOTPRequest(
      email: _emailController.text.trim(),
      type: 'RESET_PASSWORD', // Use the type your backend expects
    );

    try {
      final otpResponse = await _apiService.sendOTP(otpRequest);

      if (otpResponse != null && mounted) {
          _showSnackBar("Mã OTP đặt lại mật khẩu đã được gửi.");
         Navigator.push(
           context,
           MaterialPageRoute(
             builder: (context) => OtpVerificationPage(
               email: _emailController.text.trim(),
               purpose: OtpPurpose.passwordReset, // Set purpose correctly
             ),
           ),
         );
      } else if(mounted) {
         _showSnackBar("Không thể gửi OTP. Email không tồn tại hoặc lỗi máy chủ.", isError: true);
      }
    } catch (e) {
       if(mounted){
          _showSnackBar("Lỗi: ${e.toString()}", isError: true);
       }
    } finally {
       if(mounted){
          setState(() => _isLoading = false);
       }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
         title: Text("Quên Mật Khẩu"), // Vietnamese: Forgot Password
         backgroundColor: Colors.transparent, // Make AppBar transparent
         elevation: 0, // Remove shadow
         foregroundColor: Colors.teal, // Back button color
      ),
      body: SafeArea(
        child: Center( // Center content
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  // 1. Image
                  Image.asset(
                    'assets/images/forgot_password.jpg', // Use forgot password image
                    height: 180,
                  ),
                  SizedBox(height: 30),

                  // 2. Title/Instruction Text
                   Text(
                     'Đặt Lại Mật Khẩu', // Vietnamese: Reset Password
                     textAlign: TextAlign.center,
                     style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: Colors.teal),
                  ),
                  SizedBox(height: 15),
                   Text(
                     'Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu.', // Vietnamese: Enter your registered email to receive an OTP code to reset your password.
                     textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                  ),
                  SizedBox(height: 30),

                  // 3. Form Field
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      hintText: 'Nhập email của bạn',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty || !value.contains('@')) {
                        return 'Vui lòng nhập email hợp lệ';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 25),

                  // 4. Submit Button
                  _isLoading
                      ? Center(child: CircularProgressIndicator(color: Colors.teal))
                      : ElevatedButton(
                          onPressed: _sendResetOtp,
                          child: Text('Gửi mã OTP'), // Vietnamese: Send OTP Code
                        ),
                   SizedBox(height: 30),
                   // Optional: Back to Login Link (though AppBar has back button)
                   // TextButton(
                   //    onPressed: () => Navigator.pop(context),
                   //    child: Text("Quay lại Đăng nhập"), // Vietnamese: Back to Login
                   // ),
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