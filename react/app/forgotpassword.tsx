// ForgotPasswordScreen.tsx
import OTPInput from "@/src/components/OTPInput"; // Assuming correct path
import SquareImage from "@/src/components/SquareImage";
import useForgotPassword from "@/src/hooks/useFogetPassword";
import { Button, Icon, IconProps, Input, Layout, Spinner, Text } from "@ui-kitten/components"; // Added Spinner
import { Href, useRouter } from "expo-router"; // Import useRouter and Href
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function ForgotPasswordScreen() {
    const tw = useTailwind(); // Use tw consistently
    const router = useRouter(); // Get router instance

    const {
        otpRef,
        formData,
        handleChange,
        handleSendOTP, // Async function to trigger OTP sending
        secureTextEntry,
        handleResetPassword, // Async function to reset password
        isLoadingReset, // Loading state for reset action
        isLoadingSendOTP, // Loading state for sending OTP
        otpSent, // Boolean indicating if OTP has been successfully sent (controls UI flow)
        toggleSecureEntry,
    } = useForgotPassword();

    // Render Password Eye Icon
    const renderIcon = (props: IconProps): React.ReactElement => (
        <Pressable onPress={toggleSecureEntry}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} fill={tw('text-gray-500/100').color as string} />
        </Pressable>
    );

    // Loading Indicator for Buttons
    const LoadingIndicator = (props: any): React.ReactElement => (
        <View style={[props.style, styles.indicator]}>
            <Spinner size='small' status='control' />
        </View>
    );


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw("flex-1 bg-white/100")} // Added background
        >
            <ScrollView contentContainerStyle={tw("flex-grow")} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Layout style={tw('flex-1 items-center bg-transparent pt-16 pb-8')}>

                    {/* Header Image */}
                    <SquareImage
                        percent={0.6} // Adjusted size
                        src={require("@/assets/images/forgot_password.jpg")} // Corrected path prefix
                        customStyle={tw("mb-8 rounded-xl")} // Simplified margins
                    />

                    <Text category='h4' style={tw('mb-1 text-gray-800/100')}>Quên mật khẩu?</Text>
                    <Text category='s1' style={tw('mb-8 text-gray-500/100 px-6 text-center')}>Nhập email và mật khẩu mới để lấy mã OTP</Text>

                    {/* Form Section */}
                    <View style={tw('w-full px-6')}>
                        {/* Email Input */}
                        <Input
                            placeholder="Email"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            // Disable email input once OTP has been sent to prevent changes
                            disabled={otpSent || isLoadingSendOTP || isLoadingReset}
                            style={tw('mb-4 bg-gray-100/100 border-gray-300/100 rounded-lg')}
                            textStyle={tw('text-gray-900/100')}
                            size='large'
                        />

                        {/* New Password Input */}
                        <Input
                            placeholder="Mật khẩu mới"
                            value={formData.password}
                            secureTextEntry={secureTextEntry}
                            // textContentType={secureTextEntry ? 'password' : 'none'} // 'newPassword' might be better semantically if available
                            accessoryRight={renderIcon}
                            onChangeText={(value) => handleChange('password', value)}
                            disabled={isLoadingSendOTP || isLoadingReset}
                            style={tw('mb-4 bg-gray-100/100 border-gray-300/100 rounded-lg')}
                            textStyle={tw('text-gray-900/100')}
                            size='large'
                        />

                        {/* Confirm New Password Input */}
                        <Input
                            placeholder="Xác nhận mật khẩu mới"
                            value={formData.passwordConfirm} // Ensure this matches state key used in handleChange
                            // Use secureTextEntry state for consistency or keep it always secure
                            secureTextEntry={true} // Typically confirm is always secure
                            // textContentType={'password'} // Can use 'password'
                            // Use 'passwordConfirm' as the key for handleChange based on hook's type
                            onChangeText={(value) => handleChange('passwordConfirm', value)}
                            disabled={isLoadingSendOTP || isLoadingReset}
                            style={tw('mb-4 bg-gray-100/100 border-gray-300/100 rounded-lg')}
                            textStyle={tw('text-gray-900/100')}
                            size='large'
                        />

                        {/* Send OTP Button Component */}
                        {/* Show only if OTP hasn't been sent yet */}
                        {!otpSent && (
                            <SendOtpButton
                                handleSendOTP={handleSendOTP}
                                isLoading={isLoadingSendOTP} // Pass loading state
                                disabled={isLoadingReset} // Also disable if reset is in progress
                            />
                        )}


                        {/* OTP Input - Show only after OTP is sent */}
                        {otpSent && (
                            <View style={tw('items-center my-6')}>
                                <Text category="s1" style={tw('mb-2 text-gray-700/100')}>Enter OTP sent to {formData.email}</Text>
                                <OTPInput
                                    ref={otpRef}
                                    length={6}
                                // Style the OTP input container if needed via style prop
                                />
                                {/* Optional: Add a resend button here if needed, using similar logic to SendOtpButton */}
                            </View>
                        )}


                        {/* Reset Password Button */}
                        <Button
                            style={tw('mt-4 bg-purple-600/100 border-0')} // Adjusted margin
                            status="primary" // Use primary status
                            size="large"
                            // Disable button if OTP hasn't been sent OR if reset is already in progress
                            disabled={!otpSent || isLoadingReset || isLoadingSendOTP}
                            onPress={handleResetPassword}
                            accessoryLeft={isLoadingReset ? LoadingIndicator : undefined}
                        >
                            {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-bold')]}>{isLoadingReset ? 'Đang tiến hành...' : 'Đặt lại mật khẩu'}</Text>}
                        </Button>
                    </View>

                    {/* Login/Signup Links */}
                    <View style={tw("flex-row items-center mt-8")}>
                        <Button appearance='ghost' status='primary' size='small' onPress={() => router.replace("/login" as Href)}>
                            {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('font-semibold')]}>Trờ về Đăng nhập</Text>}
                        </Button>
                    </View>
                </Layout>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// -- Send OTP Button Component --
interface SendOtpButtonProps {
    handleSendOTP: () => Promise<void>; // Expecting async function from hook
    isLoading: boolean; // Loading state from hook
    disabled?: boolean; // Additional external disable condition
}

const SendOtpButton: React.FC<SendOtpButtonProps> = React.memo(({ handleSendOTP, isLoading, disabled }) => {
    const tw = useTailwind();
    const [buttonLabel, setButtonLabel] = useState<string>("Gửi mã OTP");
    const [secondsLeft, setSecondsLeft] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Cleanup timer on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (secondsLeft > 0) {
            timerRef.current = setInterval(() => {
                setSecondsLeft((prevSeconds) => {
                    const nextSeconds = prevSeconds - 1;
                    if (nextSeconds <= 0) {
                        clearInterval(timerRef.current as NodeJS.Timeout);
                        setButtonLabel("Resend OTP"); // Change label after countdown
                        return 0;
                    }
                    const minutes = Math.floor(nextSeconds / 60);
                    const seconds = nextSeconds % 60;
                    setButtonLabel(`Resend in ${minutes}:${seconds.toString().padStart(2, "0")}`);
                    return nextSeconds;
                });
            }, 1000);
        } else {
            // Ensure timer is cleared if secondsLeft becomes 0 externally
            if (timerRef.current) clearInterval(timerRef.current);
        }

        // Cleanup function for this effect instance
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [secondsLeft]); // Rerun effect when secondsLeft changes

    const handleClick = async () => {
        // Prevent clicks if already loading, disabled, or timer is running
        if (isLoading || disabled || secondsLeft > 0) {
            return;
        }

        try {
            await handleSendOTP(); // Call the async function from the hook
            // If handleSendOTP doesn't throw an error, assume success (hook handles toast)
            setSecondsLeft(120); // Start 2-minute timer on success
            setButtonLabel("Resend in 2:00");
        } catch (error) {
            // Hook should ideally show toast on error, but we could add logging here
            console.error("handleSendOTP error in component:", error);
            // Optionally reset button state here if needed after failure
            // setButtonLabel("Send OTP");
        }
        // isLoading state is managed by the hook
    };

    // Loading Indicator for Button
    const LoadingIndicator = (props: any): React.ReactElement => (
        <View style={[props.style, styles.indicator]}>
            <Spinner size='small' status='control' />
        </View>
    );

    const isButtonDisabled = isLoading || disabled || secondsLeft > 0;

    return (
        <Button
            disabled={isButtonDisabled}
            onPress={handleClick}
            style={tw('mt-1 mb-4 bg-blue-500/100 border-0')} // Send OTP button style
            status="info" // Use info status
            size="large"
            accessoryLeft={isLoading ? LoadingIndicator : undefined}
        >
            {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-bold')]}>{isLoading ? 'Đang gửi...' : buttonLabel}</Text>}
        </Button>
    );
});

// Add StyleSheet for spinner positioning
const styles = StyleSheet.create({
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});