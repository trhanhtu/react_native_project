import { useToast } from "@/src/context/ToastProvider";
import { useRef, useState } from "react";
import { OTPInputRef } from "../OTPInput";

export default function useForgotPassword() {

    const { show } = useToast();
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
        if (!otp || otp.length !== 5) {
            return 'Vui lòng nhập mã OTP hợp lệ.';
        }
        return null;
    };

    function handleSubmit() {
        const errorMessage = validateFormData();
        if (errorMessage) {
            show(errorMessage, 'error');
            return;
        }
        show('Đặt lại mật khẩu thành công!', 'success');
    }

    return {
        otpRef,
        formData,
        handleSubmit,
        handleChange,
        secureTextEntry,
        toggleSecureEntry,
    }
}