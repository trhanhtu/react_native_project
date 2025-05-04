import 'package:flutter/material.dart';

import '../api_service.dart';
import '../models/send_otp_request.dart';
import 'login_page.dart';
import 'otp_verification_page.dart';
// Import RegisterRequest if needed for a direct register call approach
// import '../models/register_request.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
   final _formKey = GlobalKey<FormState>();
   final _emailController = TextEditingController();
   final _passwordController = TextEditingController();
   final _confirmPasswordController = TextEditingController();
   // Add other controllers like name if needed
   // final _nameController = TextEditingController();
   bool _isLoading = false;
   final ApiService _apiService = ApiService();

   @override
   void dispose() {
     _emailController.dispose();
     _passwordController.dispose();
     _confirmPasswordController.dispose();
     // _nameController.dispose();
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

   Future<void> _initiateSignup() async {
      if (!_formKey.currentState!.validate()) {
         _showSnackBar("Vui lòng điền đầy đủ và chính xác thông tin.", isError: true);
         return;
      }
      // Password match check already in validator, but double check is fine
      if (_passwordController.text != _confirmPasswordController.text) {
         _showSnackBar("Mật khẩu xác nhận không khớp.", isError: true);
         return;
      }

      setState(() => _isLoading = true);

      // --- Send OTP for Registration Verification ---
      final otpRequest = SendOTPRequest(
         email: _emailController.text.trim(),
         type: 'REGISTER' // Use the type your backend expects
      );

      try {
         final otpResponse = await _apiService.sendOTP(otpRequest);

         // Check if OTP was sent successfully (apiResponse.data might have details)
         if (otpResponse != null && mounted) {
             _showSnackBar("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra.");
             Navigator.push(
                context,
                MaterialPageRoute(
                   builder: (context) => OtpVerificationPage(
                      email: _emailController.text.trim(),
                      password: _passwordController.text, // Pass password for final registration step
                      // name: _nameController.text, // Pass other data if needed
                      purpose: OtpPurpose.signup,
                   ),
                ),
             );
         } else if (mounted){
             // If otpResponse is null but no exception, likely API logic failure
             _showSnackBar("Không thể gửi OTP. Vui lòng thử lại.", isError: true);
         }
      } catch (e) {
          if (mounted) {
             _showSnackBar("Lỗi: ${e.toString()}", isError: true);
          }
      } finally {
          if (mounted) {
             setState(() => _isLoading = false);
          }
      }
   }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
       // Add AppBar if desired
       // appBar: AppBar(title: Text("Đăng Ký Tài Khoản")),
       body: SafeArea(
         child: Center( // Center vertically
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
                      'assets/images/signup.png',
                      height: 150, // Adjust size
                    ),
                    SizedBox(height: 30),

                     // 2. Form Title
                    Text(
                     'Tạo Tài Khoản Mới', // Vietnamese: Create New Account
                     textAlign: TextAlign.center,
                     style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: Colors.teal),
                    ),
                    SizedBox(height: 30),

                   // 3. Form Fields (Add 'Name' field if your registration requires it)
                    // TextFormField(
                    //    controller: _nameController,
                    //    decoration: const InputDecoration(labelText: 'Họ và Tên', hintText: 'Nhập họ tên', prefixIcon: Icon(Icons.person_outline)),
                    //    validator: (value) => (value == null || value.isEmpty) ? 'Vui lòng nhập họ tên' : null,
                    // ),
                    // SizedBox(height: 15),
                    TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(labelText: 'Email', hintText: 'Nhập email đăng ký', prefixIcon: Icon(Icons.email_outlined)),
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) { return (value == null || value.isEmpty || !value.contains('@')) ? 'Email không hợp lệ' : null;}
                    ),
                    SizedBox(height: 15),
                     TextFormField(
                         controller: _passwordController,
                         decoration: const InputDecoration(labelText: 'Mật khẩu', hintText: 'Tạo mật khẩu', prefixIcon: Icon(Icons.lock_outline)),
                         obscureText: true,
                          validator: (value) { return (value == null || value.length < 6) ? 'Mật khẩu cần ít nhất 6 ký tự' : null; } // Vietnamese: Password needs at least 6 characters
                     ),
                    SizedBox(height: 15),
                     TextFormField(
                         controller: _confirmPasswordController,
                         decoration: const InputDecoration(labelText: 'Xác nhận Mật khẩu', hintText: 'Nhập lại mật khẩu', prefixIcon: Icon(Icons.lock_clock_outlined)),
                         obscureText: true,
                         validator: (value) {
                            if (value == null || value.isEmpty) return 'Vui lòng xác nhận mật khẩu';
                            if (value != _passwordController.text) return 'Mật khẩu không khớp'; // Vietnamese: Passwords do not match
                            return null;
                         }
                     ),
                     SizedBox(height: 25),

                     // 4. Submit Button
                     _isLoading
                     ? Center(child: CircularProgressIndicator(color: Colors.teal))
                     : ElevatedButton(
                        onPressed: _initiateSignup,
                        child: Text('Đăng ký'), // Vietnamese: Sign Up
                      ),
                     SizedBox(height: 30),

                   // 5. Navigation Text
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Text('Đã có tài khoản?'), // Vietnamese: Already have an account?
                        TextButton(
                          onPressed: _isLoading ? null : () {
                             // Navigate back to login, replacing signup page
                             Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(builder: (context) => const LoginPage()),
                              );
                          },
                          child: Text('Đăng nhập'), // Vietnamese: Login
                          ),
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