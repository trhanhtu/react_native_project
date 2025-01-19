import { useToast } from "@/src/context/ToastProvider";
import authCheck from "@/src/utils/authCheck";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function useLogin() {
    const { show } = useToast();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    // Handle input changes dynamically
    const handleChange = (key: string, value: string) => {
        setFormData({ ...formData, [key]: value });
    };
    const validateFormData = () => {
        const { email, password } = formData;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return 'Vui lòng nhập email hợp lệ.';
        }
        if (password.length < 6) {
            return 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        }
        return null;
    };
    function handleLogin() {
        const errorMessage = validateFormData();
        if (errorMessage) {
            show(errorMessage, 'error');
            return;
        }
        show('Đăng nhập thành công!', 'success');
        authCheck.login().then(() => router.replace("/(usertabs)/profile"));
    }
    function handleForgotPassword() {
        router.replace("/forgotpassword")
    }
    function handleSignUp() {
        router.replace("/signup")
    }
    return {
        formData,
        handleSignUp,
        handleChange,
        handleLogin,
        secureTextEntry,
        setSecureTextEntry,
        handleForgotPassword,
    }
}