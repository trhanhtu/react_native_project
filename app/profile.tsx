import SquareImage from "@/src/components/SquareImage";
import useProfile from "@/src/hooks/useProfile";
import { Button, Icon, Layout, Text } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";

/**
 * Component ProfileInfo: hiển thị thông tin của người dùng
 * Sự kiện onPress của nút “Chỉnh sửa thông tin” sẽ gọi hàm pickImage để thay đổi ảnh
 */
type ProfileInfoProps = {
    avatar: string;
    name: string;
    pickImage: () => Promise<void>;
    handleConfirmEdit: () => Promise<void>;
    isEditing: boolean;
};

const ProfileInfo: React.FC<ProfileInfoProps> = React.memo(
    ({ avatar, name, pickImage, handleConfirmEdit, isEditing }) => {
        const tailwind = useTailwind();

        return (
            <Layout style={tailwind("flex-row bg-white/100 p-3")}>
                {/* Phần hiển thị ảnh đại diện */}
                <View style={tailwind("justify-center")}>
                    <SquareImage
                        customStyle={tailwind("rounded-lg bg-gray-700/100")}
                        percent={0.2}
                        src={{ uri: avatar }}
                    />
                </View>
                {/* Phần hiển thị thông tin người dùng */}
                <View style={tailwind("justify-center pl-2")}>
                    <Text category="h1">{name}</Text>
                    <Layout style={tailwind("flex pt-4 items-center")}>
                        {/* Nút chọn ảnh mới */}
                        <Button
                            style={tailwind("w-auto")}
                            accessoryRight={(props) => <Icon {...props} name="edit-outline" />}
                            status="info"
                            size="small"
                            onPress={pickImage}
                        >
                            Chọn ảnh mới
                        </Button>
                        {/* Nếu đang chỉnh sửa, hiển thị nút xác nhận */}
                        {isEditing && (
                            <Button
                                style={tailwind("w-auto mt-2")}
                                accessoryRight={(props) => <Icon {...props} name="checkmark-outline" />}
                                status="success"
                                size="small"
                                onPress={handleConfirmEdit}
                            >
                                Xác nhận chỉnh sửa
                            </Button>
                        )}
                    </Layout>
                </View>
            </Layout>
        );
    }
);

/**
 * Component ProfileScreen: Màn hình hiển thị thông tin profile của người dùng
 */
export default function ProfileScreen() {
    const tailwind = useTailwind();
    const { handleExitAccount, pickImage, handleConfirmEdit, avatar, name, isEditing } = useProfile();

    return (
        <Layout style={tailwind("flex-1")}>
            {/* Phần hiển thị thông tin profile */}
            <View style={tailwind("flex-1 bg-white p-5")}>
                <ProfileInfo
                    avatar={avatar}
                    name={name}
                    pickImage={pickImage}
                    handleConfirmEdit={handleConfirmEdit}
                    isEditing={isEditing}
                />
            </View>
            {/* Nút đăng xuất */}
            <Button status="danger" appearance="outline" onPress={handleExitAccount}>
                Thoát
            </Button>
        </Layout>
    );
}