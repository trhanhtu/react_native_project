import SquareImage from '@/src/components/SquareImage';
import useSignUp from '@/src/hooks/useSignUp';
import { Button, Icon, IconProps, Input, Layout, Text } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';

export default function SignUpScreen() {
    const tailwind = useTailwind();
    const router = useRouter();
    const {
        formData,
        handleChange,
        secureTextEntry,
        toggleSecureEntry,
        handleSignUp,
    } = useSignUp();

    const renderIcon = (props: IconProps) => (
        <Pressable onPress={toggleSecureEntry}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
        </Pressable>
    );

    return (
        <Layout style={tailwind('flex-1 items-center')}>
            {/* Header */}

            <SquareImage
                percent={0.7}
                src={require("../assets/images/signup.png")}
                customStyle={tailwind(" mt-15p mb-10p rounded")}
            />
            {/* Form Section */}
            <View style={tailwind('w-full px-6')}>
                <Input
                    placeholder="Tên của bạn"
                    value={formData.userName}
                    onChangeText={(value) => handleChange('userName', value)}
                    style={tailwind('mb-4')}
                />
                <Input
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={(value) => handleChange('email', value)}
                    keyboardType="email-address"
                    style={tailwind('mb-4')}
                />
                <Input
                    placeholder="Mật khẩu"
                    value={formData.password}
                    secureTextEntry={secureTextEntry}
                    textContentType={!secureTextEntry ? 'none' : 'password'}
                    accessoryRight={renderIcon}
                    onChangeText={(value) => handleChange('password', value)}
                    style={tailwind('mb-4')}
                />
                <Input
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    secureTextEntry={true}
                    textContentType={'password'}
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    style={tailwind('mb-4')}
                />
                <Button style={tailwind('mt-4')} status="info" onPress={() => handleSignUp(router)}>
                    Đăng ký ngay
                </Button>
            </View>
            <View style={tailwind("flex flex-row flex-1 items-center")}>
                <Text>Đã có tài khoản? </Text>
                <Text onPress={() => router.replace("/login")} status='primary' style={tailwind("underline")}>Đăng nhập ngay</Text>
            </View>
        </Layout>
    );
}
