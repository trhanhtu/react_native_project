import { editUser } from '@/api/api';
import { useLayout } from '@/src/context/ApplicationLayoutProvider';
import authCheck from '@/src/utils/authCheck';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import GlobalStorage from '../utils/GlobalStorage';
import { str } from '../utils/types';


/**
 * Hook useProfile: Xử lý các logic liên quan đến profile
 */
export default function useProfile() {
  const router = useRouter();
  const { lockPortrait } = useLayout();

  // Khóa chế độ dọc khi component mount
  useEffect(() => {
    lockPortrait();
  }, []);

  // Lấy tên và avatar từ GlobalStorage hoặc dùng giá trị mặc định
  const [name, setName] = useState<str<"name">>(
    (GlobalStorage.getItem("name") || "empty_User_name") as str<"name">
  );
  const [email, setEmail] = useState(
    (GlobalStorage.getItem("email") || "empty_User_email") as str<"email">
  );
  const [avatar, setAvatar] = useState(
    (GlobalStorage.getItem("avatar") ||
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Male_Avatar.jpg/1200px-Male_Avatar.jpg'
    ) as str<"avatar">
  );
  // Trạng thái đánh dấu khi người dùng đang chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Hàm mở thư viện ảnh để chọn ảnh mới
   */
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    // Nếu người dùng chọn ảnh thành công thì cập nhật avatar và chuyển sang trạng thái chỉnh sửa
    if (!result.canceled) {
      setAvatar(result.assets[0].uri as str<"avatar">);
      setIsEditing(true);
    }
  };

  /**
   * Hàm upload ảnh lên server (ví dụ: Cloudinary)
   * @param imageUri Đường dẫn của ảnh
   * @returns URL ảnh sau khi upload thành công
   */
  const uploadImage = async (imageUri: string) => {
    try {
      let formData = new FormData();
      // Tạo file upload với tên file dựa vào phần mở rộng (có thể cần điều chỉnh thêm)
      formData.append('file', {
        uri: imageUri,
        name: `${imageUri.split(".")[1]}.jpg`,
        type: 'image/jpeg',
      } as any);
      formData.append('upload_preset', process.env.EXPO_PUBLIC_UPLOAD_PRESET || '');

      let response = await fetch(process.env.EXPO_PUBLIC_CLOUDINARY_URL || '', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      let data = await response.json();
      // console.log("Đường dẫn ảnh sau upload:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  /**
   * Hàm xác nhận chỉnh sửa thông tin: upload ảnh mới và cập nhật backend
   */
  const handleConfirmEdit = async () => {
    const imageUrl = await uploadImage(avatar);
    if (!imageUrl) return;
    setAvatar(imageUrl);
    const response = await editUser(name, imageUrl);
    // console.log("Kết quả cập nhật:", response);
    // Sau khi cập nhật thành công, tắt trạng thái chỉnh sửa
    setIsEditing(false);
  };

  /**
   * Hàm đăng xuất
   */
  const handleExitAccount = () => {
    lockPortrait();
    authCheck.logout().then(() => router.replace("/login"));
  };

  return {
    name,
    email,
    avatar,
    setName,
    isEditing,
    pickImage,
    setIsEditing,
    handleExitAccount,
    handleConfirmEdit,
  };
}

