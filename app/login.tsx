// login.tsx

import SquareImage from "@/src/components/SquareImage";
import useLogin from "@/src/hooks/useLogin"; // Correct hook import
import { Button, Icon, IconProps, Input, Layout, Spinner, Text } from "@ui-kitten/components"; // Added Spinner
import React from "react"; // Import React
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function LoginScreen() {
    const tw = useTailwind(); // Renamed for consistency

    const {
        formData,
        handleChange,
        handleSignUp,
        handleLogin,
        secureTextEntry,
        // setSecureTextEntry, // Use toggleSecureEntry instead
        toggleSecureEntry, // Use the function from the hook
        handleForgotPassword,
        // loginButtonIsPressed, // Use isLoading instead
        isLoading, // Use the correct loading state from the hook
    } = useLogin();

    // Render Password Eye Icon
    const renderIcon = (props: IconProps): React.ReactElement => ( // Added React.ReactElement return type
        // Use Pressable for better feedback, ensure it triggers the toggle function
        <Pressable onPress={toggleSecureEntry}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} fill={tw('text-gray-500/100').color as string} />
        </Pressable>
    );

    // Loading Indicator for Button
    const LoadingIndicator = (props: any): React.ReactElement => (
        <View style={[props.style, styles.indicator]}>
            <Spinner size='small' status='control' /> {/* Use Spinner with control status for white color */}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw("flex-1 bg-white/100")} // Added background color
        >
            <ScrollView
                contentContainerStyle={tw("flex-grow")}
                keyboardShouldPersistTaps="handled" // Good for handling taps outside inputs
                showsVerticalScrollIndicator={false}
            >
                {/* Use Layout for UI Kitten theming context */}
                <Layout style={tw('flex-1 items-center bg-transparent pt-16 pb-8')}>
                    {/* Header Image */}
                    <SquareImage
                        percent={0.6} // Adjusted size slightly
                        src={require("@/assets/images/login.png")} // Corrected path prefix
                        customStyle={tw("mb-10 rounded-xl")} // Simplified margins
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
                            autoCapitalize="none" // Good practice for email
                            style={tw('mb-4 bg-gray-100/100 border-gray-300/100 rounded-lg')}
                            textStyle={tw('text-gray-900/100')}
                            size='large' // Make inputs larger
                        />
                        <Input
                            placeholder="Password"
                            value={formData.password}
                            secureTextEntry={secureTextEntry}
                            // textContentType={secureTextEntry ? 'password' : 'none'} // Use 'password' or 'none'
                            accessoryRight={renderIcon}
                            onChangeText={(value) => handleChange('password', value)}
                            style={tw('mb-2 bg-gray-100/100 border-gray-300/100 rounded-lg')} // Reduced bottom margin
                            textStyle={tw('text-gray-900/100')}
                            size='large'
                        />
                        {/* Forgot Password Button */}
                        <View style={tw("flex-row justify-end mb-6")}>
                            <Button
                                appearance="ghost" // Subtle button style
                                status="primary" // Use primary color for links
                                onPress={handleForgotPassword}
                                size='small' // Smaller touch target might be okay here
                                style={tw("-mr-2")} // Adjust margin for touch area
                            >
                                {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-sm')]}>Forgot Password?</Text>}
                            </Button>
                        </View>

                        {/* Login Button */}
                        <Button
                            disabled={isLoading} // Use isLoading state
                            style={tw('mt-4 bg-purple-600/100 border-0')} // Adjusted margin
                            size='large' // Larger button
                            status="primary" // Consistent status
                            onPress={handleLogin}
                            accessoryLeft={isLoading ? LoadingIndicator : undefined} // Show spinner when loading
                        >
                           {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-bold')]}>{isLoading ? 'Logging In...' : 'Login'}</Text>}
                        </Button>
                    </View>

                    {/* Sign Up Link */}
                    {/* Use View for layout, Text for non-touchable part, Button for touchable part */}
                    <View style={tw("flex-row items-center mt-8")}>
                        <Text style={tw('text-gray-600/100')}>Don't have an account? </Text>
                        <Button appearance='ghost' status='primary' size='small' onPress={handleSignUp} style={tw('-ml-2')}>
                            {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('font-semibold')]}>Sign Up</Text>}
                        </Button>
                    </View>
                </Layout>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Add StyleSheet for spinner positioning if needed
const styles = StyleSheet.create({
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});