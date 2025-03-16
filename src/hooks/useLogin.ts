import { login } from "@/api/api";
import { useToast } from "@/src/context/ToastProvider";
import { useRouter } from "expo-router";
import { useState } from "react";
import GlobalStorage from "../utils/GlobalStorage";
import { ApiResponse, LoginResponse } from "../utils/types";
export default function useLogin() {
    const { toastShow } = useToast();
    const router = useRouter();
    const [loginButtonIsPressed, setLoginButtonIsPressed] = useState<boolean>(false);
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
    async function handleLogin() {
        setLoginButtonIsPressed(true);
        const errorMessage = validateFormData();
        if (errorMessage) {
            toastShow(errorMessage, 'error');
            return;
        }
        const response: ApiResponse<LoginResponse> | null = await login(formData.email, formData.password);
        setLoginButtonIsPressed(false);
        if (response === null) {
            toastShow("Đăng nhập thất bại", "error");
            return;
        }
        const loginResponse: LoginResponse | undefined = response?.data;
        if (response !== null && loginResponse !== undefined) {
            GlobalStorage.setItem("access_token", loginResponse.accessToken);
            GlobalStorage.setItem("id", loginResponse.id.toString());
            GlobalStorage.setItem("email", loginResponse.email);
            GlobalStorage.setItem("name", loginResponse.name);
            GlobalStorage.setItem("avatar", loginResponse.avatar || "");
            GlobalStorage.setItem("role", loginResponse.role);
        }

        if (response !== null) {
            router.replace("/main");
        }

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
        loginButtonIsPressed
    }
}