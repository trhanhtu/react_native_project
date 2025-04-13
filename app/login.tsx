import SquareImage from "@/src/components/SquareImage";
import useLogin from "@/src/hooks/useLogin";
import { Button, Icon, IconProps, Input, Layout, Spinner, Text } from "@ui-kitten/components";
import React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function LoginScreen() {
    const tw = useTailwind();

    const {
        formData,
        handleChange,
        handleSignUp,
        handleLogin,
        secureTextEntry,
        toggleSecureEntry,
        handleForgotPassword,
        isLoading,
    } = useLogin();

    // Render Password Eye Icon
    const renderIcon = (props: IconProps): React.ReactElement => (
        <Pressable onPress={toggleSecureEntry}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} fill={tw('text-gray-500/100').color as string} />
        </Pressable>
    );

    // Loading Indicator for Button
    const LoadingIndicator = (props: any): React.ReactElement => (
        <View style={[props.style, styles.indicator]}>
            <Spinner size='small' status='control' />
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw("flex-1 bg-white/100")}
        >
            <ScrollView
                contentContainerStyle={tw("flex-grow")}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Layout style={tw('flex-1 items-center bg-transparent pt-16 pb-8')}>
                    <SquareImage
                        percent={0.6}
                        src={require("@/assets/images/login.png")}
                        customStyle={tw("mb-10 rounded-xl")}
                    />

                    <Text category='h4' style={tw('mb-1 text-gray-800/100')}>Welcome Back!</Text>
                    <Text category='s1' style={tw('mb-8 text-gray-500/100')}>Login to your account</Text>

                    {/* Form Section */}
                    <View style={tw('w-full px-6')}>
                        <Input
                            placeholder="Email"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={tw('mb-4 bg-gray-100/100 border-gray-300/100 rounded-lg')}
                            textStyle={tw('text-gray-900/100')}
                            size='large'
                        />
                        <Input
                            placeholder="Password"
                            value={formData.password}
                            secureTextEntry={secureTextEntry}
                            accessoryRight={renderIcon}
                            onChangeText={(value) => handleChange('password', value)}
                            style={tw('mb-2 bg-gray-100/100 border-gray-300/100 rounded-lg')}
                            textStyle={tw('text-gray-900/100')}
                            size='large'
                        />
                        {/* Forgot Password Button */}
                        <View style={tw("flex-row justify-end mb-6")}>
                            <Button
                                appearance="ghost"
                                status="primary"
                                onPress={handleForgotPassword}
                                size='small'
                                style={tw("-mr-2")}
                            >
                                {/* Directly wrap text in <Text> */}
                                <Text style={tw('text-sm')}>Forgot Password?</Text>
                            </Button>
                        </View>

                        {/* Login Button */}
                        <Button
                            disabled={isLoading}
                            style={tw('mt-4 bg-purple-600/100 border-0')}
                            size='large'
                            status="primary"
                            onPress={handleLogin}
                            accessoryLeft={isLoading ? LoadingIndicator : undefined}
                        >
                            {/* Directly wrap text in <Text> */}
                            <Text style={tw('text-white/100 font-bold')}>
                                {isLoading ? 'Logging In...' : 'Login'}
                            </Text>
                        </Button>
                    </View>

                    {/* Sign Up Link */}
                    <View style={tw("flex-row items-center mt-8")}>
                        <Text style={tw('text-gray-600/100')}>Don't have an account? </Text>
                        <Button
                            appearance='ghost'
                            status='primary'
                            size='small'
                            onPress={handleSignUp}
                            style={tw('-ml-2')}
                        >
                            <Text style={tw('font-semibold')}>Sign Up</Text>
                        </Button>
                    </View>
                </Layout>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
