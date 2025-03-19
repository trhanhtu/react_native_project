import { resendOTP, resetPassword } from "@/api/api";
import { useToast } from "@/src/context/ToastProvider";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { OTPInputRef } from "../components/OTPInput";

export default function useForgotPassword() {

    const { toastShow } = useToast();
    const otpRef = useRef<OTPInputRef>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    // Handle input changes dynamically
    const handleChange = (key: string, value: string) => {
        setFormData({ ...formData, [key]: value });
    };
    const toggleSecureEntry = () => {
        setSecureTextEntry((prev) => !prev);
    };



    const validateFormData = () => {
        const { email, password, confirmPassword } = formData;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return 'Vui lòng nhập email hợp lệ.';
        }
        if (password.length < 6) {
            return 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        }
        if (password !== confirmPassword) {
            return 'Mật khẩu và xác nhận mật khẩu không khớp.';
        }
        const otp = otpRef.current?.getValue();
        if (!otp || otp.length !== 6) {
            return 'Vui lòng nhập mã OTP hợp lệ.';
        }
        return null;
    };

    const handleSendOTP = () => {
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            toastShow('Vui lòng nhập email hợp lệ.', 'error');
            return false;
        }
        const response = resendOTP(formData.email);
        if (response !== null) {
            router.replace("/login");
            toastShow('Gửi mã OTP thành công!', 'success');
        }
        return true;
    }

    const handleResetPassword = () => {
        const errorMessage = validateFormData();
        if (errorMessage) {
            toastShow(errorMessage, 'error');
            return;
        }
        const response = resetPassword(formData.email, formData.password, formData.confirmPassword, otpRef.current?.getValue() || "");
        if (response !== null) {
            toastShow("Đặt lại mật khẩu thành công!", "success");
            return;
        }
        toastShow('Lỗi!', 'error');
    }
    return {
        otpRef,
        formData,
        handleChange,
        handleSendOTP,
        secureTextEntry,
        toggleSecureEntry,
        handleResetPassword,
    }
}