import 'package:flutter/material.dart';

import '../api_service.dart';
// Import RegisterRequest if your final registration happens here
import '../models/register_request.dart';
import '../models/reset_password_request.dart';
import '../models/verify_otp_request.dart';
import 'login_page.dart'; // To navigate after success


// Enum to define the purpose of the OTP page
enum OtpPurpose { signup, passwordReset }

class OtpVerificationPage extends StatefulWidget {
  final String email;
  final OtpPurpose purpose;
  final String? password; // Only passed during signup flow
  // final String? name; // Only passed during signup flow if needed

  const OtpVerificationPage({
    super.key,
    required this.email,
    required this.purpose,
    this.password,
    // this.name,
  });

  @override
  State<OtpVerificationPage> createState() => _OtpVerificationPageState();
}

class _OtpVerificationPageState extends State<OtpVerificationPage> {
  final _formKey = GlobalKey<FormState>();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController(); // Only for password reset
  final _confirmNewPasswordController = TextEditingController(); // Only for password reset
  bool _isLoading = false;
  final ApiService _apiService = ApiService();

  @override
  void dispose() {
     _otpController.dispose();
     _newPasswordController.dispose();
     _confirmNewPasswordController.dispose();
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

  Future<void> _verifyAndProceed() async {
    if (!_formKey.currentState!.validate()) {
       _showSnackBar("Vui lòng kiểm tra lại thông tin đã nhập.", isError: true);
      return;
    }
    setState(() => _isLoading = true);

    try {
       if (widget.purpose == OtpPurpose.signup) {
         // --- Signup Flow Step 2: Verify OTP ---
         // We first verify the OTP. Registration might happen here or require another step.
          final verifyRequest = VerifyOTPRequest(email: widget.email, otp: _otpController.text);
          final verifyResponse = await _apiService.verifyOTPRegister(verifyRequest); // Use specific verify endpoint

          if (verifyResponse?.success == true && mounted) { // Check success flag from VerifyOTPResponse model
             _showSnackBar(verifyResponse?.message ?? "OTP đã xác thực thành công.");

             // --- Signup Flow Step 3: Register User ---
             // Now attempt to register the user using the details passed from signup page
             // This assumes OTP verification doesn't automatically create the user.
             // Adjust if your API combines OTP verification and user creation.
             if (widget.password != null) { // Ensure password was passed
                  final registerRequest = RegisterRequest(
                     email: widget.email,
                     password: widget.password!,
                     // name: widget.name // Include name if needed/passed
                  );
                  final registerResponse = await _apiService.register(registerRequest);

                  if (registerResponse != null && mounted) {
                      _showSnackBar("Đăng ký tài khoản thành công!");
                       Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(builder: (context) => const LoginPage()),
                          (Route<dynamic> route) => false, // Clear all previous routes
                       );
                  } else if (mounted) {
                      // Registration failed after OTP success
                      _showSnackBar("Đăng ký thất bại sau khi xác thực OTP. ${registerResponse?.toString() ?? 'Lỗi không xác định'}", isError: true);
                  }
             } else if (mounted) {
                 // Handle case where password wasn't passed (shouldn't happen in signup flow)
                 _showSnackBar("Lỗi nội bộ: Thiếu thông tin để đăng ký.", isError: true);
             }

          } else if (mounted) {
              // OTP verification failed
              _showSnackBar(verifyResponse?.message ?? "Mã OTP không hợp lệ hoặc đã hết hạn.", isError: true);
          }

       } else if (widget.purpose == OtpPurpose.passwordReset) {
          // --- Password Reset Flow Step 2: Reset Password ---
          if (_newPasswordController.text != _confirmNewPasswordController.text) {
             _showSnackBar("Mật khẩu mới không khớp.", isError: true);
             setState(() => _isLoading = false);
             return;
          }

           final resetRequest = ResetPasswordRequest(
              email: widget.email,
              otp: _otpController.text,
              newPassword: _newPasswordController.text,
           );
           // Assuming resetPassword API internally verifies OTP again with the new password
           final resetResponse = await _apiService.resetPassword(resetRequest);

          // Assuming VerifyOTPResponse structure is returned by resetPassword endpoint too
          if (resetResponse?.success == true && mounted) {
              _showSnackBar(resetResponse?.message ?? "Mật khẩu đã được đặt lại thành công.");
              Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginPage()),
                   (Route<dynamic> route) => false,
              );
          } else if (mounted) {
               _showSnackBar(resetResponse?.message ?? "Đặt lại mật khẩu thất bại. OTP không đúng hoặc lỗi khác.", isError: true);
          }
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

  // TODO: Implement OTP Resend Logic if needed
  // Future<void> _resendOtp() async { ... }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
       appBar: AppBar(
          title: Text("Xác Thực OTP"), // Vietnamese: OTP Verification
          backgroundColor: Colors.transparent,
          elevation: 0,
          foregroundColor: Colors.teal,
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
                      'assets/images/wait_for_email.png',
                      height: 150,
                    ),
                    SizedBox(height: 20),

                    // 2. Instruction Text
                    Text(
                      'Nhập mã OTP', // Vietnamese: Enter OTP Code
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: Colors.teal),
                    ),
                     SizedBox(height: 10),
                    Text(
                      'Mã xác thực gồm 6 chữ số đã được gửi đến email:', // Vietnamese: A 6-digit verification code has been sent to email:
                      textAlign: TextAlign.center,
                       style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                    ),
                    SizedBox(height: 5),
                    Text(
                      widget.email, // Display the email
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 30),

                    // 3. OTP Input Field
                    TextFormField(
                       controller: _otpController,
                       decoration: const InputDecoration(
                          labelText: 'Mã OTP', // Vietnamese: OTP Code
                          hintText: '------',
                          counterText: "", // Hide the default counter
                          prefixIcon: Icon(Icons.pin_outlined),
                       ),
                       keyboardType: TextInputType.number,
                       textAlign: TextAlign.center,
                       maxLength: 6,
                       style: TextStyle(fontSize: 18, letterSpacing: 10), // Make OTP input look distinct
                       validator: (value) { return (value == null || value.length != 6) ? 'Nhập đủ 6 số OTP': null; }
                    ),
                    SizedBox(height: 15),

                    // 4. Conditional fields for Password Reset
                    if (widget.purpose == OtpPurpose.passwordReset) ...[
                       TextFormField(
                          controller: _newPasswordController,
                          decoration: const InputDecoration(labelText: 'Mật khẩu mới', hintText: 'Nhập mật khẩu mới', prefixIcon: Icon(Icons.lock_outline)),
                          obscureText: true,
                          validator: (value) { return (value == null || value.length < 6) ? 'Mật khẩu cần ít nhất 6 ký tự' : null; }
                      ),
                      SizedBox(height: 15),
                      TextFormField(
                          controller: _confirmNewPasswordController,
                          decoration: const InputDecoration(labelText: 'Xác nhận mật khẩu mới', hintText: 'Nhập lại mật khẩu mới', prefixIcon: Icon(Icons.lock_clock_outlined)),
                          obscureText: true,
                          validator: (value) {
                             if (value == null || value.isEmpty) return 'Vui lòng xác nhận mật khẩu mới';
                              if (value != _newPasswordController.text) return 'Mật khẩu không khớp';
                              return null;
                          }
                      ),
                    ],

                    SizedBox(height: 25),
                     // 5. Submit Button
                     _isLoading
                     ? Center(child: CircularProgressIndicator(color: Colors.teal))
                     : ElevatedButton(
                        onPressed: _verifyAndProceed,
                        child: Text(
                            widget.purpose == OtpPurpose.signup ? 'Xác Nhận & Đăng Ký' : 'Đặt Lại Mật Khẩu', // Vietnamese: Confirm & Sign Up / Reset Password
                        ),
                      ),
                     SizedBox(height: 20),

                    // 6. Resend OTP Link
                     TextButton(
                       onPressed: () { /* TODO: Call _resendOtp() */ },
                       child: Text('Không nhận được mã? Gửi lại OTP'), // Vietnamese: Didn't receive code? Resend OTP
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