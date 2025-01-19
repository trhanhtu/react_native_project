import SquareImage from "@/src/components/SquareImage";
import useLogin from "@/src/hooks/useLogin";
import { Button, Icon, IconProps, Input, Layout, Text } from "@ui-kitten/components";
import { Pressable, View } from "react-native";
import { useTailwind } from "tailwind-rn";
export default function LoginScreen() {
    const tailwind = useTailwind();

    const {
        formData,
        handleChange,
        handleSignUp,
        handleLogin,
        secureTextEntry,
        setSecureTextEntry,
        handleForgotPassword
    } = useLogin();

    const renderIcon = (props: IconProps) => (
        <Pressable onPress={() => setSecureTextEntry((prev) => !prev)}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
        </Pressable>
    );
    return (
        <Layout style={tailwind('flex-1 items-center')}>
            {/* Header */}

            <SquareImage
                percent={0.7}
                src={require("../assets/images/login.png")}
                customStyle={tailwind(" mt-15p mb-10p rounded-xl")}
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
                    placeholder="Mật khẩu"
                    value={formData.password}
                    secureTextEntry={secureTextEntry}
                    textContentType={!secureTextEntry ? 'none' : 'password'}
                    accessoryRight={renderIcon}
                    onChangeText={(value) => handleChange('password', value)}
                    style={tailwind('mb-4')}
                />
                <View style={tailwind("flex flex-row  justify-end")}>
                    <Button appearance="ghost" status="basic" onPress={handleForgotPassword} style={tailwind("mr-3")}>Quên mật khẩu ?</Button>

                </View>

                <Button style={tailwind('mt-15p')} status="info" onPress={handleLogin}>
                    Đăng nhập
                </Button>
            </View>
            <View style={tailwind("flex flex-row flex-1 items-center")}>
                <Text>Chưa có tài khoản? </Text>
                <Text onPress={handleSignUp} status='primary' style={tailwind("underline")}>Đăng ký ngay</Text>
            </View>
        </Layout>
    )
}