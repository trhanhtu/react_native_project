// Filename: LoginScreen.tsx
import SquareImage from "@/src/components/SquareImage";
import useLogin from "@/src/hooks/useLogin"; // Assuming useLogin handles navigation internally or provides methods like handleSignUp/handleForgotPassword that navigate
import { Button, Icon, IconProps, Input, Layout, Spinner, Text } from "@ui-kitten/components";
import React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTailwind } from "tailwind-rn";

//------------------------------------------------------
// Main Screen Component: LoginScreen
//------------------------------------------------------
export default function LoginScreen() {
    const tw = useTailwind();

    //----------------------------------
    // Hooks & State
    //----------------------------------
    const {
        formData,
        handleChange,
        handleSignUp, // Method to navigate to Sign Up
        handleLogin, // Method to perform login logic
        secureTextEntry,
        toggleSecureEntry,
        handleForgotPassword, // Method to navigate to Forgot Password
        isLoading,
    } = useLogin();

    //----------------------------------
    // Render Functions & Helpers
    //----------------------------------
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

    //----------------------------------
    // Main Render
    //----------------------------------
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

                    
                    <Text category='h4' style={tw('mb-1 text-gray-800/100')}>Chào mừng trở lại!</Text> 
                    <Text category='s1' style={tw('mb-8 text-gray-500/100')}>Đăng nhập vào tài khoản của bạn</Text> 

                    
                    <View style={tw('w-full px-6')}>
                        
                        <Input
                            placeholder="Email" // Kept as "Email"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={tw('mb-4 bg-gray-100/100 border-gray-300/100 rounded-lg')}
                            textStyle={tw('text-gray-900/100')}
                            size='large'
                            disabled={isLoading} // Disable input when loading
                        />
                        
                        <Input
                            placeholder="Mật khẩu" // Translated
                            value={formData.password}
                            secureTextEntry={secureTextEntry}
                            accessoryRight={renderIcon}
                            onChangeText={(value) => handleChange('password', value)}
                            style={tw('mb-2 bg-gray-100/100 border-gray-300/100 rounded-lg')}
                            textStyle={tw('text-gray-900/100')}
                            size='large'
                            disabled={isLoading} // Disable input when loading
                        />
                        
                        <View style={tw("flex-row justify-end mb-6")}>
                            <Button
                                appearance="ghost"
                                status="primary"
                                onPress={handleForgotPassword} // Navigate to Forgot Password screen
                                size='small'
                                style={tw("-mr-2")}
                                disabled={isLoading} // Disable button when loading
                            >
                                
                                <Text style={tw('text-sm font-medium')}>Quên mật khẩu?</Text>
                            </Button>
                        </View>

                        
                        <Button
                            disabled={isLoading}
                            style={tw('mt-4 bg-purple-600/100 border-0')}
                            size='large'
                            status="primary"
                            onPress={handleLogin} // Trigger login action
                            accessoryLeft={isLoading ? LoadingIndicator : undefined}
                        >
                            
                            <Text style={tw('text-white/100 font-bold')}>
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Text>
                        </Button>
                    </View>

                    
                    <View style={tw("flex-row items-center mt-8")}>
                        <Text style={tw('text-gray-600/100')}>Chưa có tài khoản? </Text> 
                        <Button
                            appearance='ghost'
                            status='primary'
                            size='small'
                            onPress={handleSignUp} // Navigate to Sign Up screen
                            style={tw('-ml-2')}
                            disabled={isLoading} // Disable button when loading
                        >
                             
                            <Text style={tw('font-semibold')}>Đăng ký</Text>
                        </Button>
                    </View>
                </Layout>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

//------------------------------------------------------
// StyleSheet
//------------------------------------------------------
const styles = StyleSheet.create({
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});