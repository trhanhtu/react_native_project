import OTPInput from "@/src/components/OTPInput";
import SquareImage from "@/src/components/SquareImage";
import useVerify from "@/src/hooks/useVerify";
import { Button, Text } from "@ui-kitten/components";
import { ScrollView, View } from "react-native";
import { useTailwind } from "tailwind-rn";


export default function VerifyScreen() {
    const tailwind = useTailwind()
    const { email,
        isLoadingConfirm,
        isLoadingResend,
        handleConfirmOTP,
        handleResendOTP,
        otpRef } = useVerify();
    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>

            <View
                style={tailwind("flex-1 items-center bg-white/100")}
            >
                <SquareImage
                    percent={0.7}
                    src={require("../assets/images/wait_for_email.png")}
                    customStyle={[tailwind("mt-15p rounded-xl"), { backgroundColor: "#07A9F0" },]}
                />

                <Text category='h5' style={tailwind("pointer-events-none my-10")}>
                    Hãy kiểm tra email của bạn
                </Text>
                <Text style={tailwind("text-center px-5 mb-5p")}>
                    Chúng tôi đã gửi 1 email xác nhận tới địa chỉ {email as string}. Hãy hoàn tất quá trình đăng ký với chúng tôi.
                </Text>
                <OTPInput length={6} ref={otpRef} />
                <View style={tailwind("flex flex-row flex-1 w-full justify-center items-end mt-5p")}>
                    <Button disabled={isLoadingConfirm} status="success" style={tailwind("mb-5 w-70p")} onPress={handleConfirmOTP}>Xác nhận</Button>
                </View>
                <View style={tailwind("flex flex-row flex-1 w-full justify-center items-end")}>
                    <Button disabled={isLoadingResend} style={tailwind("mb-5 w-70p")} onPress={handleResendOTP}>Gửi lại OTP</Button>
                </View>
            </View>
        </ScrollView>
    )
}