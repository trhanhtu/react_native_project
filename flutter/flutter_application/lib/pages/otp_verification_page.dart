import 'package:flutter/material.dart';

import '../api_service.dart'; // Assuming logger is defined here or globally accessible
import '../models/reset_password_request.dart';
import '../models/reset_password_response.dart'; // Updated response model
import '../models/send_otp_request.dart';
import '../models/verify_otp_request.dart';
import '../models/verify_register_response.dart'; // Updated response model
// Import navigation targets and services/models
import 'login_page.dart';
// If ApiService file doesn't define logger globally, import logger package
// import 'package:logger/logger.dart';

// Enum to define the purpose of the OTP page
enum OtpPurpose { signup, passwordReset }

class OtpVerificationPage extends StatefulWidget {
  final String email;
  final OtpPurpose purpose;
  // Password is no longer needed for signup flow based on updated logic
  final String? password;

  const OtpVerificationPage({
    super.key,
    required this.email,
    required this.purpose,
    this.password,
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
  bool _isResending = false; // State for resend button
  final ApiService _apiService = ApiService();

  // If logger is not defined globally in api_service.dart or elsewhere, define it here
  // final logger = Logger();

  @override
  void dispose() {
     _otpController.dispose();
     _newPasswordController.dispose();
     _confirmNewPasswordController.dispose();
     super.dispose();
  }

   // Helper to show feedback SnackBar
   void _showSnackBar(String message, {bool isError = false}) {
      // Check if the widget is still mounted before showing SnackBar
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
         SnackBar(
           content: Text(message),
           backgroundColor: isError ? Colors.redAccent : Colors.green,
           behavior: SnackBarBehavior.floating,
         ),
      );
   }

  // Handles form submission for both signup verification and password reset
  Future<void> _verifyAndProceed() async {
    // Validate form inputs
    if (!_formKey.currentState!.validate()) {
       _showSnackBar("Vui lòng kiểm tra lại thông tin đã nhập.", isError: true);
       return;
    }
    // Additional validation for password reset
    if (widget.purpose == OtpPurpose.passwordReset &&
        _newPasswordController.text != _confirmNewPasswordController.text) {
       _showSnackBar("Mật khẩu mới không khớp.", isError: true);
       return;
    }

    setState(() => _isLoading = true);

    try {
       if (widget.purpose == OtpPurpose.signup) {
         // --- Signup Flow: Verify OTP via /auth/verify-register ---
          final verifyRequest = VerifyOTPRequest(email: widget.email, otp: _otpController.text);
          final VerifyRegisterResponse? verifyResponse = await _apiService.verifyOTPRegister(verifyRequest);
          logger.d("Verify OTP Response: ${verifyResponse?.verifyStatus}");
          // --- Check verifyStatus ---
          // IMPORTANT: Replace "VERIFIED" with the exact string your API returns on success
          if (verifyResponse != null && verifyResponse.verifyStatus.toUpperCase() == "SUCCESS" && mounted) {
             _showSnackBar("Xác thực email thành công! Vui lòng đăng nhập.");
             Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) => const LoginPage()),
                (Route<dynamic> route) => false, // Clear registration stack
             );
          } else if (mounted) {
              // OTP verification failed or status wasn't successful
              logger.w("Signup OTP Verification failed. Status: ${verifyResponse?.verifyStatus}, Email: ${widget.email}");
              _showSnackBar("Mã OTP không hợp lệ hoặc đã hết hạn. (${verifyResponse?.verifyStatus})", isError: true);
          }

       } else if (widget.purpose == OtpPurpose.passwordReset) {
          // --- Password Reset Flow: Call /auth/reset-password ---
           final resetRequest = ResetPasswordRequest(
              email: widget.email,
              otp: _otpController.text,
              password: _newPasswordController.text, // API expects 'password'
              passwordConfirm: _confirmNewPasswordController.text, // API expects 'passwordConfirm'
           );
           final ResetPasswordResponse? resetResponse = await _apiService.resetPassword(resetRequest);

           // --- Check verifyStatus ---
           // IMPORTANT: Replace "SUCCESS" with the exact string your API returns on success
          if (resetResponse != null && resetResponse.verifyStatus.toUpperCase() == "SUCCESS" && mounted) {
              _showSnackBar("Mật khẩu đã được đặt lại thành công.");
              Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginPage()),
                   (Route<dynamic> route) => false,
              );
          } else if (mounted) {
               logger.w("Password Reset failed. Status: ${resetResponse?.verifyStatus}, Email: ${widget.email}");
               _showSnackBar("Đặt lại mật khẩu thất bại. (${resetResponse?.verifyStatus})", isError: true);
          }
       }
    } catch (e, s) {
        logger.e("Error during OTP verification/proceed", error: e, stackTrace: s);
        if (mounted) {
           _showSnackBar("Đã xảy ra lỗi: ${e.toString()}", isError: true);
        }
    } finally {
         // Ensure loading state is reset even if widget is unmounted during await
         if (mounted) {
            setState(() => _isLoading = false);
         }
    }
  }

  // Function to handle resending OTP
  Future<void> _resendOtp() async {
      setState(() => _isResending = true);
      logger.d("Resend OTP requested for email: ${widget.email}");
      try {
         // Call sendOTP endpoint
         final otpRequest = SendOTPRequest(email: widget.email);
         final otpResponse = await _apiService.sendOTP(otpRequest);

         if (otpResponse != null && mounted) {
            _showSnackBar("Đã gửi lại mã OTP."); // Vietnamese: OTP has been resent.
         } else if (mounted) {
            _showSnackBar("Gửi lại OTP thất bại.", isError: true); // Vietnamese: Failed to resend OTP.
         }
      } catch (e, s) {
          logger.e("Error resending OTP", error: e, stackTrace: s);
          if (mounted) {
             _showSnackBar("Lỗi gửi lại OTP: ${e.toString()}", isError: true);
          }
      } finally {
         if (mounted) {
            setState(() => _isResending = false);
         }
      }
  }


  @override
  Widget build(BuildContext context) {
    final bool isPasswordReset = widget.purpose == OtpPurpose.passwordReset;
    final String confirmButtonText = isPasswordReset ? 'Đặt Lại Mật Khẩu' : 'Xác Nhận Đăng Ký';
    final String pageTitle = isPasswordReset ? 'Đặt Lại Mật Khẩu' : 'Xác Thực Email Đăng Ký';

    return Scaffold(
       appBar: AppBar(
          title: Text(pageTitle), // Dynamic title
          backgroundColor: Colors.transparent, // Make AppBar transparent
          elevation: 0, // Remove shadow
          foregroundColor: Colors.teal, // Back button color
       ),
       body: SafeArea(
         child: Center( // Center content vertically
           child: SingleChildScrollView( // Allow scrolling
             padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
             child: Form(
                key: _formKey,
               child: Column(
                 mainAxisAlignment: MainAxisAlignment.center, // Center vertically in Column
                 crossAxisAlignment: CrossAxisAlignment.stretch, // Stretch buttons etc.
                 children: <Widget>[
                    // 1. Image
                    Image.asset(
                      'assets/images/wait_for_email.png', // Image for OTP step
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
                      widget.email, // Display the email being verified
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
                       maxLength: 6, // Assume 6 digit OTP
                       style: TextStyle(fontSize: 18, letterSpacing: 10, fontWeight: FontWeight.bold), // Make OTP input look distinct
                       validator: (value) {
                          if (value == null || value.length != 6) {
                             return 'Vui lòng nhập đủ 6 số OTP'; // Vietnamese: Please enter the full 6-digit OTP
                          }
                          // Optional: Add regex for digits only if needed
                          return null;
                       }
                    ),
                    SizedBox(height: 15),

                    // 4. Conditional fields for Password Reset
                    if (isPasswordReset) ...[
                       TextFormField(
                          controller: _newPasswordController,
                          decoration: const InputDecoration(
                             labelText: 'Mật khẩu mới', // Vietnamese: New Password
                             hintText: 'Nhập mật khẩu mới', // Vietnamese: Enter new password
                             prefixIcon: Icon(Icons.lock_outline)
                           ),
                          obscureText: true,
                          validator: (value) {
                             if (value == null || value.length < 6) {
                                return 'Mật khẩu cần ít nhất 6 ký tự'; // Vietnamese: Password needs at least 6 characters
                             }
                             return null;
                          }
                      ),
                      SizedBox(height: 15),
                      TextFormField(
                          controller: _confirmNewPasswordController,
                          decoration: const InputDecoration(
                             labelText: 'Xác nhận mật khẩu mới', // Vietnamese: Confirm New Password
                             hintText: 'Nhập lại mật khẩu mới', // Vietnamese: Re-enter new password
                             prefixIcon: Icon(Icons.lock_clock_outlined)
                           ),
                          obscureText: true,
                          validator: (value) {
                             if (value == null || value.isEmpty) {
                                return 'Vui lòng xác nhận mật khẩu mới'; // Vietnamese: Please confirm new password
                             }
                              if (value != _newPasswordController.text) {
                                 return 'Mật khẩu không khớp'; // Vietnamese: Passwords do not match
                              }
                              return null;
                          }
                      ),
                    ], // End conditional fields

                    SizedBox(height: 25),
                     // 5. Submit Button
                     _isLoading
                     ? Center(child: CircularProgressIndicator(color: Colors.teal))
                     : ElevatedButton(
                        onPressed: _verifyAndProceed, // Call main verification/action function
                        child: Text(confirmButtonText), // Dynamic button text
                      ),
                     SizedBox(height: 20),

                    // 6. Resend OTP Button / Link
                     _isResending
                       // Show smaller indicator for resend
                       ? Center(child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 3, color: Colors.teal)))
                       : TextButton(
                          // Disable buttons while main action is loading
                          onPressed: _isLoading ? null : _resendOtp,
                          child: Text('Không nhận được mã? Gửi lại OTP'), // Vietnamese: Didn't receive code? Resend OTP
                        ),
                     SizedBox(height: 20), // Bottom padding
                 ],
               ),
             ),
           ),
         ),
       ),
    );
  }
}