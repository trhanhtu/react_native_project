import SquareImage from "@/src/components/SquareImage";
import useProfile from "@/src/hooks/useProfile";
import { Button, Icon, Layout, Text } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function ProfileScreen() {
    const tailwind = useTailwind();
    const {
        handleExitAccount,
    } = useProfile();
    return (
        <Layout style={tailwind("flex-1")}>

            <View style={tailwind("flex-1 bg-white p-5")}>
                <ProfileInfo />
            </View>
            <Button
                status="danger"
                appearance="outline"
                onPress={handleExitAccount}
            >
                Thoát
            </Button>
        </Layout>

    )
}

const ProfileInfo: React.FC = React.memo(
    () => {
        const tailwind = useTailwind();
        return (
            <Layout style={tailwind("flex-row bg-white-500/100 ")}>
                <View style={tailwind("bg-white/100 justify-center")}>
                    <SquareImage
                        customStyle={tailwind(" rounded-lg bg-gray-700/100")}
                        percent={0.2}
                        src={require("@/assets/images/react-logo.png")}
                    />
                </View>
                <View style={tailwind("justify-center bg-white/100 pl-2")}>
                    <Text category="h1">Tester vô đối</Text>
                    <Text category="s1">email_nha_lam_@tienlen.com.vn</Text>
                    <Layout style={tailwind("flex pt-4 items-center")}>
                        <Button 
                        style={tailwind("w-auto")}
                        accessoryRight={
                            (props) => (
                                <Icon {...props} name="edit-outline" />
                            )
                        } status="info" size="small">Chỉnh sửa thông tin</Button>
                    </Layout>
                </View >
            </Layout>
        )
    }
)