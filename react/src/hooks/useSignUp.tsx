// useSignup.ts
import { register } from "@/api/api"; // Correct import assumed based on api-raw.txt structure
import { useToast } from "@/src/context/ToastProvider";
import { RegisterRequest, RegisterResponse } from "@/src/utils/types"; // Import request/response types
import { Href, useRouter } from "expo-router"; // Import useRouter hook and Href type
import { useState } from "react";

export default function useSignUp() {
    const { toastShow } = useToast();
    const router = useRouter(); // Get router instance

    const [formData, setFormData] = useState<RegisterRequest>({ // Use RegisterRequest type for state
        name: '', // Changed userName to name to match RegisterRequest
        email: '',
        password: ''
        // No confirmPassword in RegisterRequest, handled separately
    });
    const [confirmPassword, setConfirmPassword] = useState(''); // Separate state for confirm password
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    // Handle input changes dynamically
    const handleChange = (key: keyof RegisterRequest | 'confirmPassword', value: string) => {
        if (key === 'confirmPassword') {
            setConfirmPassword(value);
        } else {
            setFormData({ ...formData, [key]: value });
        }
    };

    const toggleSecureEntry = () => {
        setSecureTextEntry((prev) => !prev);
    };

    const validateFormData = (): string | null => { // Return type string | null
        const { name, email, password } = formData;
        if (!name || name.length > 15 || name.length < 5) {
            return 'Tên người dùng phải từ 5-15 kí tự.';
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return 'Vui lòng nhập email hợp lệ.';
        }
        if (!password || password.length < 6) { // Check password existence too
            return 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        }
        if (password !== confirmPassword) {
            return 'Mật khẩu và xác nhận mật khẩu không khớp.';
        }
        return null;
    };

    async function handleSignUp() { // Removed router parameter, use router from hook context
        const errorMessage = validateFormData();
        if (errorMessage) {
            toastShow(errorMessage, 'error');
            return;
        }

        setIsLoading(true); // Set loading true
        toastShow("Đang đăng ký...", "info"); // Updated message

        try {
            // Pass the formData object directly as per RegisterRequest type
            const response: RegisterResponse | null = await register(formData);

            if (response && response.status === "PENDING_VERIFICATION") { // Check response based on RegisterResponse structure
                toastShow("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.", "success");
                // Navigate to verification screen, passing email
                router.replace({ pathname: "/verify", params: { email: formData.email, flow: "register" } } as Href);
            } else {
                // Handle potential errors from API response if structure provides details
                // Example: toastShow(response?.message || "Đăng ký thất bại. Vui lòng thử lại.", "error");
                // For now, using a generic message based on api-raw.txt error handling
                toastShow("Đăng ký thất bại. Email có thể đã tồn tại.", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            toastShow("Đã xảy ra lỗi trong quá trình đăng ký.", "error");
        } finally {
            setIsLoading(false); // Set loading false
        }
    }

    return {
        formData,
        confirmPassword, // Return confirmPassword state
        isLoading, // Return loading state
        handleSignUp,
        handleChange,
        secureTextEntry,
        toggleSecureEntry,
    }
}