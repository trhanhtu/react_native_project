import OTPInput from "@/src/components/OTPInput";
import SquareImage from "@/src/components/SquareImage";
import useForgotPassword from "@/src/hooks/useFogetPassword";
import { Button, Icon, IconProps, Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function ForgotPasswordScreen() {
    const { otpRef,
        formData,
        handleSubmit,
        handleChange,
        secureTextEntry,
        toggleSecureEntry } = useForgotPassword();
    const tailwind = useTailwind();
    const renderIcon = (props: IconProps) => (
        <Pressable onPress={toggleSecureEntry} >
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
        </Pressable>
    );
    return (
        <Layout style={tailwind('flex-1 items-center')}>

            {/* Header */}

            <SquareImage
                percent={0.7}
                src={require("../assets/images/forgot_password.jpg")}
                customStyle={tailwind(" mt-15p mb-5p rounded-xl")}
            />
            {/* Form Section */}
            <View style={tailwind('w-full px-6 mt-20p')}>

                <Input
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={(value) => handleChange('email', value)}
                    keyboardType="email-address"
                    style={tailwind('mb-4')}
                />
                <Input
                    placeholder="Mật khẩu mới"
                    value={formData.password}
                    secureTextEntry={secureTextEntry}
                    textContentType={!secureTextEntry ? 'none' : 'password'}
                    accessoryRight={renderIcon}
                    onChangeText={(value) => handleChange('password', value)}
                    style={tailwind('mb-4')}
                />
                <Input
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    secureTextEntry={true}
                    textContentType={'password'}
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    style={tailwind('mb-4')}
                />
                <SendButton />
                <OTPInput ref={otpRef} style={tailwind("mt-5p")} length={5} onComplete={() => { }} />

                <Button style={tailwind('mt-4')} status="info" onPress={handleSubmit}>
                    Đặt lại mật khẩu
                </Button>
            </View>
            <View style={tailwind("flex flex-row flex-1 items-center")}>
                <Text>Chưa có tài khoản? </Text>
                <Text onPress={() => router.replace("/signup")} status='primary' style={tailwind("underline")}>Đăng ký ngay</Text>
            </View>
        </Layout>
    )
}

const SendButton: React.FC = React.memo(() => {
    const [buttonLabel, setButtonLabel] = useState<string>("Gửi mã xác nhận");
    const [secondsLeft, setSecondsLeft] = useState<number>(0); // Track secondsLeft as state for reactivity
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isButtonDisable, setIsButtonDisable] = useState<boolean>(false);
    useEffect(() => {
        if (secondsLeft > 0) {
            timerRef.current = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current as NodeJS.Timeout);
                        setButtonLabel("Gửi mã xác nhận");
                        setIsButtonDisable(false);
                        return 0;
                    }
                    const minutes = Math.floor((prev - 1) / 60);
                    const seconds = (prev - 1) % 60;
                    setButtonLabel(`Thử lại sau ${minutes}:${seconds.toString().padStart(2, "0")}`);
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [secondsLeft]);

    const handleClick = () => {
        if (secondsLeft === 0) {
            setSecondsLeft(120); // Set the countdown to 120 seconds (2 minutes)
            setButtonLabel("Thử lại sau 2:00");
            setIsButtonDisable(true);
        }
    };

    return (
        <Button disabled={isButtonDisable} onPress={handleClick}>
            {buttonLabel}
        </Button>
    );
});

