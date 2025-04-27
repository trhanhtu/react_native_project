// useLogin.ts
import { login } from "@/api/api";
import { useToast } from "@/src/context/ToastProvider";
import GlobalStorage from "@/src/utils/GlobalStorage"; // Assuming correct path
import { LoginRequest, LoginResponse } from "@/src/utils/types"; // Corrected path
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import WebSocketService from "../services/WebSocketService";

export default function useLogin() {
    const { toastShow } = useToast();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false); // Renamed for clarity
    const [formData, setFormData] = useState<LoginRequest>({ // Use LoginRequest type
        email: '',
        password: '',
    });
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    // Handle input changes dynamically
    const handleChange = (key: keyof LoginRequest, value: string) => { // Use keyof LoginRequest
        setFormData({ ...formData, [key]: value });
    };

    const toggleSecureEntry = () => { // Added function for consistency
        setSecureTextEntry((prev) => !prev);
    };

    const validateFormData = (): string | null => { // Return type string | null
        const { email, password } = formData;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return 'Vui lòng nhập email hợp lệ.';
        }
        if (!password || password.length < 6) { // Check password existence too
            return 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        }
        return null;
    };

    async function handleLogin() {
        const errorMessage = validateFormData();
        if (errorMessage) {
            toastShow(errorMessage, 'error');
            return; // Stop execution if validation fails
        }

        setIsLoading(true); // Set loading state
        try {
            // Call login API with the formData object
            const loginResponse: LoginResponse | null = await login(formData);


            if (loginResponse !== null) {
                // Login successful, store user data
                // MISSING: Consider using await if GlobalStorage is async
                GlobalStorage.setItem("access_token", loginResponse.accessToken);
                GlobalStorage.setItem("id", loginResponse.id.toString());
                GlobalStorage.setItem("email", loginResponse.email);
                GlobalStorage.setItem("name", loginResponse.name);
                // Provide a default avatar if null/empty, using ID or name for consistency
                GlobalStorage.setItem("avatar", loginResponse.avatar || `https://picsum.photos/seed/${loginResponse.name}/200`);
                GlobalStorage.setItem("role", loginResponse.role);
                GlobalStorage.setItem("isActive", loginResponse.active.toString()); // Store isActive status
                try {
                    console.log("Attempting to connect WebSocket (response was not null)...");
                    await WebSocketService.connect();
                    console.log("WebSocket connect initiated.");
                } catch (error) {
                    console.error("Error connecting WebSocket or navigating:", error);
                    alert("An error occurred after login attempt.");
                }

                // Optional: Check if user is active before navigating
                if (!loginResponse.active) {
                    toastShow("Tài khoản của bạn chưa được kích hoạt hoặc đã bị khóa.", "error");
                    // Optionally clear storage or logout here if inactive users shouldn't proceed
                    // GlobalStorage.clearAll(); // Example
                } else {
                    toastShow("Đăng nhập thành công!", "success");

                    router.replace("/main" as Href); // Navigate to main screen
                }

            } else {
                // Login failed (API returned null, likely due to error caught in api.ts or 4xx/5xx response)
                // Provide a more specific message if possible (e.g., from error handling in api.ts)
                toastShow("Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.", "error");
            }
        } catch (error) {
            // Catch unexpected errors during the API call or storage operations
            console.error("Login error:", error);
            toastShow("Đã xảy ra lỗi trong quá trình đăng nhập.", "error");
        } finally {
            setIsLoading(false); // Reset loading state regardless of outcome
        }
    }

    function handleForgotPassword() {
        router.push("/forgotpassword" as Href); // Use push instead of replace for better back navigation
    }

    function handleSignUp() {
        router.push("/signup" as Href); // Use push instead of replace
    }

    return {
        formData,
        isLoading, // Use isLoading instead of loginButtonIsPressed
        handleSignUp,
        handleChange,
        handleLogin,
        secureTextEntry,
        toggleSecureEntry, // Return the toggle function
        handleForgotPassword,
    }
}