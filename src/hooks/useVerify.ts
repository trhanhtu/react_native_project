import { resendOTP, verifyOTP } from "@/api/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { OTPInputRef } from "../components/OTPInput";
import { useToast } from "../context/ToastProvider";

export default function useVerify() {
    const router = useRouter()
    const { toastShow } = useToast();
    const [disableConfirm, setDisableConfirm] = useState(false);
    const [disableResend, setDisableResend] = useState(false);
    const { email = "No_email_on_params" } = useLocalSearchParams();
    const otpRef = useRef<OTPInputRef>(null);
    const handleConfirmOTP = async () => {
        setDisableConfirm(true);
        const response = await verifyOTP(email as string, otpRef.current?.getValue() || "");
        if (response !== null) {
            toastShow("Xác thực thành công", "success");
            router.replace("/login");
            return;
        }
        toastShow("Mã OTP không hợp lệ", "error");
        setDisableConfirm(false);
    }
    const handleResendOTP = async () => {
        setDisableResend(true);
        const response: any = await resendOTP(email as string);
        setDisableResend(false);
    }
    return {
        email,
        otpRef,
        disableResend,
        disableConfirm,
        handleResendOTP,
        handleConfirmOTP,
    }
}