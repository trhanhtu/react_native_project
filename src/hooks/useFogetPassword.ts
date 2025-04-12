// useForgotPassword.ts
import { resendOTP, resetPassword } from "@/api/api";
import { OTPInputRef } from "@/src/components/OTPInput"; // Assuming correct path
import { useToast } from "@/src/context/ToastProvider"; // Assuming correct path
import {
    ApiResponse // For typing the response from resendOTP
    ,
    ResetPasswordRequest, // For typing the request to resendOTP
    VerifyOTPResponse
} from "@/src/utils/types"; // Corrected path
import { Href, useRouter } from "expo-router"; // Import useRouter and Href
import { useRef, useState } from "react";

export default function useForgotPassword() {
    const { toastShow } = useToast();
    const router = useRouter(); // Get router instance
    const otpRef = useRef<OTPInputRef>(null);

    const [formData, setFormData] = useState<Omit<ResetPasswordRequest, 'otp'>>({ // Use Omit for fields before OTP
        email: '',
        password: '',
        passwordConfirm: '' // Use passwordConfirm based on ResetPasswordRequest type
    });
    const [otp, setOtp] = useState(''); // Separate state for OTP from input ref
    const [confirmPassword, setConfirmPassword] = useState(''); // Keep for validation check if needed, though type uses passwordConfirm
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
    const [isLoadingSendOTP, setIsLoadingSendOTP] = useState(false);
    const [isLoadingReset, setIsLoadingReset] = useState(false);

    // Handle input changes dynamically
    const handleChange = (key: keyof Omit<ResetPasswordRequest, 'otp'> | 'confirmPassword', value: string) => {
         if (key === 'confirmPassword') {
            // If using a separate confirmPassword field for UI validation before submitting
             setConfirmPassword(value);
             // Also update passwordConfirm if it's the direct field from the type
             if ('passwordConfirm' in formData) {
                setFormData({ ...formData, passwordConfirm: value });
             }
        } else if (key === 'passwordConfirm') {
             setFormData({ ...formData, [key]: value });
             setConfirmPassword(value); // Keep them in sync if using both
        }
        else {
            setFormData({ ...formData, [key]: value });
        }
    };

    const toggleSecureEntry = () => {
        setSecureTextEntry((prev) => !prev);
    };

    // Validation before sending OTP
    const validateEmail = (): string | null => {
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            return 'Vui lòng nhập email hợp lệ.';
        }
        return null;
    }

    // Full validation before resetting password
    const validateResetData = (): string | null => {
        const emailError = validateEmail();
        if (emailError) return emailError;

        const { password, passwordConfirm } = formData;
        if (!password || password.length < 6) {
            return 'Mật khẩu mới phải chứa ít nhất 6 ký tự.';
        }
        if (password !== passwordConfirm) {
            return 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
        }
        const currentOtp = otpRef.current?.getValue(); // Get OTP from ref
        if (!currentOtp || currentOtp.length !== 6) {
            return 'Vui lòng nhập mã OTP gồm 6 chữ số.';
        }
        // Update OTP state if needed, though it's passed directly from ref below
        // setOtp(currentOtp);
        return null;
    };

    const handleSendOTP = async () => {
        const emailError = validateEmail();
        if (emailError) {
            toastShow(emailError, 'error');
            return; // Don't proceed if email is invalid
        }

        setIsLoadingSendOTP(true);
        setOtpSent(false); // Reset otpSent status
        try {
            // `resendOTP` in api-raw.txt actually takes `email: string` and returns `Promise<ApiResponse<any> | null>`
            // It doesn't return SendOTPRequest
            const response: ApiResponse<any> | null = await resendOTP(formData.email);

            // Check the API response structure for success
            if (response && response.statusCode >= 200 && response.statusCode < 300) {
                toastShow('Gửi mã OTP thành công! Vui lòng kiểm tra email.', 'success');
                setOtpSent(true); // Update state to show OTP input field
                otpRef.current?.clear(); // Clear any previous OTP
            } else {
                toastShow(response?.message || response?.error || 'Gửi mã OTP thất bại.', 'error');
            }
        } catch (error) {
            console.error("Send OTP error:", error);
            toastShow('Đã xảy ra lỗi khi gửi OTP.', 'error');
        } finally {
            setIsLoadingSendOTP(false);
        }
    }

    const handleResetPassword = async () => {
        const errorMessage = validateResetData();
        if (errorMessage) {
            toastShow(errorMessage, 'error');
            return;
        }

        const currentOtp = otpRef.current?.getValue();
        if (!currentOtp) { // Should be caught by validateResetData, but double check
            toastShow('Lỗi: Không thể lấy mã OTP.', 'error');
            return;
        }

        setIsLoadingReset(true);
        try {
            // Construct the request object matching ResetPasswordRequest
            const requestData: ResetPasswordRequest = {
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm,
                otp: currentOtp // Get OTP from ref at the moment of submission
            };

            // Call the resetPassword API
            const response: VerifyOTPResponse | null = await resetPassword(requestData);

            if (response !== null && response.verifyStatus === 'success') { // Check response structure
                toastShow("Đặt lại mật khẩu thành công!", "success");
                router.replace("/login" as Href); // Navigate to login screen on success
            } else {
                 // Provide more specific error if available from response
                toastShow('Đặt lại mật khẩu thất bại. Mã OTP có thể không đúng hoặc đã hết hạn.', 'error');
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toastShow('Đã xảy ra lỗi trong quá trình đặt lại mật khẩu.', 'error');
        } finally {
            setIsLoadingReset(false);
        }
    }

    return {
        otpRef,
        formData,
        // confirmPassword, // Only needed if UI uses it separately for validation display
        otpSent, // Control UI flow (show OTP input?)
        isLoadingSendOTP,
        isLoadingReset,
        handleChange,
        handleSendOTP,
        secureTextEntry,
        toggleSecureEntry,
        handleResetPassword,
    }
}