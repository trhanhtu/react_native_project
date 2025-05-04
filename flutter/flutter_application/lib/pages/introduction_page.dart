import 'dart:async';

import 'package:flutter/material.dart';

import 'login_page.dart'; // Navigate to login page

class IntroductionPage extends StatefulWidget {
  const IntroductionPage({super.key});

  @override
  State<IntroductionPage> createState() => _IntroductionPageState();
}

class _IntroductionPageState extends State<IntroductionPage> {
  Timer? _timer;
  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer(const Duration(seconds: 10), () {
     
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const LoginPage()),
        );
      }else{
        
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              // Optional: Add an intro image/logo if you have one
              // Image.asset('assets/images/intro_logo.png', height: 150),
              // SizedBox(height: 30),
              Text(
                'App Quản Lý Nhóm', // Vietnamese: Group Manager App
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 20),
              Text(
                'Giới thiệu thành viên:', // Vietnamese: Member Introduction:
                style: Theme.of(context).textTheme.titleMedium,
              ),
              SizedBox(height: 10),
              Text('- Trần Hoàng Anh Tú'), // Replace with actual names
              Text('- Vương Đình Hiếu'),
              // Add all team members
              SizedBox(height: 40),
              CircularProgressIndicator(),
              SizedBox(height: 15),
              Text(
                'Đang chuyển đến trang đăng nhập sau 10 giây...', // Vietnamese: Redirecting to login page...
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      ),
    );
  }
}