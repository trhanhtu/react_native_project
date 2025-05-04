// Filename: useLogin.ts

import { login } from "@/api/api";
import { useToast } from "@/src/context/ToastProvider";
import GlobalStorage from "@/src/utils/GlobalStorage";
import { LoginRequest, LoginResponse } from "@/src/utils/types";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { useNotificationContext } from "../context/NotificationProvider";

export default function useLogin() {
  const { toastShow } = useToast();
  const router = useRouter();
  const { connectSocket } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({ email: "", password: "" });
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleChange = (key: keyof LoginRequest, value: string) => {
    setFormData({ ...formData, [key]: value });
  };
  const toggleSecureEntry = () => setSecureTextEntry((p) => !p);

  const validateFormData = (): string | null => {
    const { email, password } = formData;
    if (!email || !/\S+@\S+\.\S+/.test(email)) return "Vui lòng nhập email hợp lệ.";
    if (!password || password.length < 6) return "Mật khẩu phải chứa ít nhất 6 ký tự.";
    return null;
  };

  async function handleLogin() {
    const err = validateFormData();
    if (err) {
      toastShow(err, "error");
      return;
    }
    setIsLoading(true);

    try {
      const res: LoginResponse | null = await login(formData);
      if (!res) {
        toastShow("Đăng nhập thất bại.", "error");
      } else {
        // store tokens
        GlobalStorage.setItem("access_token", res.accessToken);                                               // explicit connect after login :contentReference[oaicite:5]{index=5}
        GlobalStorage.setItem("email", res.email);                                               // explicit connect after login :contentReference[oaicite:5]{index=5}
        GlobalStorage.setItem("avatar", res.avatar);                                               // explicit connect after login :contentReference[oaicite:5]{index=5}
        GlobalStorage.setItem("id", res.id.toString());                                               // explicit connect after login :contentReference[oaicite:5]{index=5}
        GlobalStorage.setItem("name", res.name);                                               // explicit connect after login :contentReference[oaicite:5]{index=5}
        GlobalStorage.setItem("role", res.role);                                                             // explicit connect after login :contentReference[oaicite:5]{index=5}
        connectSocket();
        toastShow("Đăng nhập thành công!", "success");
        router.replace("/main" as Href);
      }
    } catch (error) {
      console.error("Login error:", error);
      toastShow("Lỗi trong quá trình đăng nhập.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const handleForgotPassword = () => router.push("/forgotpassword" as Href);
  const handleSignUp = () => router.push("/signup" as Href);

  return {
    formData,
    isLoading,
    handleChange,
    handleLogin,
    secureTextEntry,
    toggleSecureEntry,
    handleForgotPassword,
    handleSignUp,
  };
}
