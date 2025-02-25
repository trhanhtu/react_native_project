import { register } from "@/api/api";
import { useToast } from "@/src/context/ToastProvider";
import { Router } from "expo-router";
import { useState } from "react";

export default function useSignUp() {

    const { toastShow } = useToast();

    const [formData, setFormData] = useState({
        userName: '',
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
        const { email, password, confirmPassword, userName } = formData;
        if (!userName || userName.length > 15 || userName.length < 5) {
            return 'Tên người dùng phải từ 5-15 kí tự.';
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return 'Vui lòng nhập email hợp lệ.';
        }
        if (password.length < 6) {
            return 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        }
        if (password !== confirmPassword) {
            return 'Mật khẩu và xác nhận mật khẩu không khớp.';
        }
        return null;
    };

    async function handleSignUp(router: Router) {
        const errorMessage = validateFormData();
        if (errorMessage) {
            toastShow(errorMessage, 'error');
            return;
        }
        toastShow("Đang xác thực email", "info");
        await register(formData.userName, formData.email, formData.password);
        router.replace({ pathname: "/verify", params: { email: formData.email } });
    }

    return {
        formData,
        handleSignUp,
        handleChange,
        secureTextEntry,
        toggleSecureEntry,
    }
}