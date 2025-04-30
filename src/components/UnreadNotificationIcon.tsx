// Filename: src/components/UnreadNotificationIcon.tsx
import { Text } from '@ui-kitten/components'; // Hoặc Text từ react-native
import React from 'react';
import { useTailwind } from 'tailwind-rn';
import { useNotification } from '../context/NotificationProvider';

const UnreadNotificationIcon = (props: {
    color: string // props này có thể không cần thiết nữa nếu style cố định
    size: number // props này có thể không cần thiết nữa nếu style cố định
    focused: boolean // props này có thể vẫn hữu ích cho styling
}): JSX.Element | null => { // Thay đổi return type thành JSX.Element | null
    const tailwind = useTailwind();
    const { unreadCount } = useNotification(); // <-- Lấy count trực tiếp từ context

    // Không render gì nếu count là 0
    if (unreadCount === 0) {
        return null; // Trả về null thay vì undefined
    }

    // Ví dụ sử dụng tailwind cho badge:
    return (
        <Text category="c1" status="control" style={tailwind("bg-red-500/100 text-white/100 rounded-full px-1 text-center min-w-[16px]")}>
            {unreadCount > 9 ? '9+' : unreadCount}
        </Text>
    );
};

export default UnreadNotificationIcon; // Đảm bảo export component