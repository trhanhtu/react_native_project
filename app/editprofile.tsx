import { Button, Input, Layout } from "@ui-kitten/components";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { sendOTP, updateProfile } from "../services/api";
import { uploadImageToCloudinary } from "../utils/cloudinary";

export default function EditProfileScreen() {
    const tailwind = useTailwind();
    const { control, handleSubmit, setValue } = useForm();
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        
        if (!result.canceled) {
            setLoading(true);
            const imageUrl = await uploadImageToCloudinary(result.assets[0].uri);
            setAvatar(imageUrl);
            setLoading(false);
        }
    };
    
    const onSubmit = async (data) => {
        setLoading(true);
        if (avatar) {
            data.avatar = avatar;
        }
        await updateProfile(data);
        setLoading(false);
    };
    
    return (
        <Layout style={tailwind("flex-1 p-4 bg-white")}>  
            <View style={tailwind("items-center mb-4")}>  
                {avatar && <Image source={{ uri: avatar }} style={tailwind("w-24 h-24 rounded-full")} />}  
                <Button onPress={pickImage} style={tailwind("mt-2")} disabled={loading}>
                    {loading ? "Đang tải..." : "Chọn ảnh đại diện"}
                </Button>
            </View>

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                    <Input
                        style={tailwind("mb-4")}
                        placeholder="Email"
                        keyboardType="email-address"
                        value={value}
                        onChangeText={onChange}
                    />
                )}
            />
            
            <Button onPress={() => sendOTP(control.getValues("email"))} style={tailwind("mb-4")}>Gửi OTP</Button>
            
            <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                    <Input
                        style={tailwind("mb-4")}
                        placeholder="Số điện thoại"
                        keyboardType="phone-pad"
                        value={value}
                        onChangeText={onChange}
                    />
                )}
            />
            
            <Button onPress={handleSubmit(onSubmit)} disabled={loading}>
                {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </Button>
        </Layout>
    );
}
