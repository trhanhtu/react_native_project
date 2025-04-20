// useVerify.ts
import { resendOTP, verifyOTP, verifyOTPChangeEmail, verifyOTPRegister } from "@/api/api"; // Added verifyOTPRegister
import { ApiResponse, VerifyOTPRequest, VerifyOTPResponse } from "@/src/utils/types"; // Import necessary types
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { OTPInputRef } from "../components/OTPInput"; // Assuming this path is correct
import { useToast } from "../context/ToastProvider"; // Assuming this path is correct

export default function useVerify() {
    const router = useRouter();
    const { toastShow } = useToast();
    // Assuming verify screen can be for registration or other flows. Add param check if needed.
    const { email: emailParam, flow } = useLocalSearchParams<{ email?: string, flow?: 'register' | 'reset' | 'change-email' }>(); // More specific params type

    const [isLoadingConfirm, setIsLoadingConfirm] = useState(false); // Separate loading states
    const [isLoadingResend, setIsLoadingResend] = useState(false);

    const otpRef = useRef<OTPInputRef>(null);

    const email = emailParam || "No_email_on_params"; // Provide fallback

    const handleConfirmOTP = async () => {
        const currentOtp = otpRef.current?.getValue();
        if (!currentOtp || currentOtp.length !== 6) { // Basic OTP validation
            toastShow("Vui lòng nhập đủ mã OTP", "info");
            return;
        }
        if (email === "No_email_on_params") {
            toastShow("Lỗi: Không tìm thấy địa chỉ email", "error");
            return;
        }

        setIsLoadingConfirm(true);
        try {
            const requestData: VerifyOTPRequest = {
                email: email,
                otp: currentOtp,
            };

            let response: VerifyOTPResponse | null = null;

            // Choose the correct verify endpoint based on the flow param
            // MISSING: Need to ensure the 'flow' param is correctly passed from the previous screen (e.g., signup)
            if (flow === 'register') {
                
                response = await verifyOTPRegister(requestData);
            } else if (flow === 'change-email') {
                // MISSING: import verifyOTPChangeEmail if not already in api.ts
                response = await verifyOTPChangeEmail(requestData);
                toastShow("Chức năng này chưa được hỗ trợ (change-email)", "info"); // Placeholder
                response = null; // Simulate failure for now
            }
            else {
                // Default or reset password flow (assuming verifyOTP handles reset)
                response = await verifyOTP(requestData);
            }


            if (response !== null && response.verifyStatus === "SUCCESS") { // Check response structure
                toastShow("Xác thực thành công!", "success");
                // Navigate based on flow
                if (flow === 'register') {
                    router.replace("/login" as Href); // Go to login after successful registration verification
                } else {
                    // For other flows like password reset, might navigate elsewhere or pass state
                    // Example: router.replace({ pathname: "/reset-password", params: { email: email, otp: currentOtp } } as Href);
                    router.replace("/login" as Href); // Default to login for now
                }
            } else {
                toastShow("Mã OTP không hợp lệ hoặc đã hết hạn", "error");
            }
        } catch (error) {
            console.error("Verify OTP error:", error);
            toastShow("Đã xảy ra lỗi trong quá trình xác thực OTP.", "error");
        } finally {
            setIsLoadingConfirm(false);
        }
    }

    const handleResendOTP = async () => {
        if (email === "No_email_on_params") {
            toastShow("Lỗi: Không tìm thấy địa chỉ email để gửi lại OTP", "error");
            return;
        }

        setIsLoadingResend(true);
        try {
            // resendOTP only needs the email string according to api-raw.txt
            const response: ApiResponse<any> | null = await resendOTP(email);

            // Check the response structure for success indication
            if (response && response.statusCode >= 200 && response.statusCode < 300) {
                toastShow("Đã gửi lại mã OTP. Vui lòng kiểm tra email.", "success");
                otpRef.current?.clear(); // Clear OTP input on resend
            } else {
                toastShow(response?.message || response?.error || "Gửi lại OTP thất bại.", "error");
            }
        } catch (error) {
            console.error("Resend OTP error:", error);
            toastShow("Đã xảy ra lỗi khi gửi lại OTP.", "error");
        } finally {
            setIsLoadingResend(false);
        }
    }

    return {
        email, // Return the determined email
        otpRef,
        isLoadingResend, // Renamed from disableResend
        isLoadingConfirm, // Renamed from disableConfirm
        handleResendOTP,
        handleConfirmOTP,
    }
}