// Filename: src/context/NotificationContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { WebSocketConnectionStatus } from '../services/WebSocketService';
import { Notification_t } from '../utils/types';


// Giả sử bạn có một hook hoặc cách để lấy số lượng thông báo chưa đọc ban đầu
// import { useInitialUnreadCount } from '@/hooks/useInitialUnreadCount';

// Định nghĩa kiểu dữ liệu cho Context
interface NotificationContextType {
    status: WebSocketConnectionStatus; // Trạng thái kết nối hiện tại
    latestNotification: Notification_t | null; // Thông báo mới nhất nhận được
    unreadCount: number; // Số lượng thông báo chưa đọc
    connectSocket: () => void; // Hàm để bắt đầu kết nối (gọi sau khi login)
    disconnectSocket: () => void; // Hàm để ngắt kết nối (gọi khi logout)
    markNotificationAsHandled: () => void; // Hàm để đánh dấu thông báo mới nhất đã được xử lý (ví dụ: sau khi Toast biến mất)
    incrementUnreadCount: (amount?: number) => void; // Hàm tăng số lượng chưa đọc
    decrementUnreadCount: (amount?: number) => void; // Hàm giảm số lượng chưa đọc
    setUnreadCount: (count: number) => void; // Hàm đặt lại số lượng chưa đọc (ví dụ: sau khi fetch hoặc đánh dấu tất cả đã đọc)
}

// Tạo Context với giá trị mặc định
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Định nghĩa props cho Provider
interface NotificationProviderProps {
    children: ReactNode;
}

/**
 * Provider quản lý trạng thái và kết nối WebSocket cho thông báo.
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [status, setStatus] = useState<WebSocketConnectionStatus>(WebSocketConnectionStatus.DISCONNECTED);
    const [latestNotification, setLatestNotification] = useState<Notification_t | null>(null);
    const [unreadCount, setUnreadCount] = useState<number>(0); // Khởi tạo là 0, cần cập nhật sau khi fetch lần đầu

    // TODO: Lấy số lượng chưa đọc ban đầu khi Provider được mount (ví dụ: từ API hoặc storage)
    // const initialCount = useInitialUnreadCount();
    // useEffect(() => {
    //     setUnreadCount(initialCount);
    // }, [initialCount]);

    // Callback khi hook báo trạng thái thay đổi
    const handleStatusChange = useCallback((newStatus: WebSocketConnectionStatus) => {
        setStatus(newStatus);
        if (newStatus === WebSocketConnectionStatus.ERROR) {
             // Có thể hiển thị Toast lỗi cố định ở đây nếu muốn
             Toast.show({
                 type: 'error',
                 text1: 'Lỗi Kết Nối Real-time',
                 text2: 'Không thể nhận thông báo mới. Vui lòng thử lại sau.',
                 visibilityTime: 5000,
             });
        }
    }, []);

     // Callback khi hook báo có thông báo mới
     const handleNotificationReceived = useCallback((notification: Notification_t) => {
        setLatestNotification(notification);
        // Chỉ tăng số lượng chưa đọc nếu thông báo đó thực sự chưa đọc
        // Giả định server gửi đúng trạng thái 'read' ban đầu là false cho thông báo mới
        if (!notification.read) {
            setUnreadCount((prevCount) => prevCount + 1);
        }
        // Hiển thị Toast thông báo
        Toast.show({
            type: 'info', // Hoặc 'success' tùy bạn
            text1: `Thông báo mới: ${notification.type}`,
            text2: notification.message,
            visibilityTime: 4000, // Thời gian hiển thị Toast (ms)
            position: 'top',
            // onPress: () => { /* Có thể điều hướng đến màn hình thông báo */ }
        });
        // Gọi callback bạn muốn ở đây, ví dụ: cập nhật giao diện nào đó ngay lập tức
        // YOUR_CALLBACK_FUNCTION(notification);
    }, []);

    // Callback khi hook báo lỗi nghiêm trọng (vd: hết lần reconnect)
    const handleError = useCallback((errorMsg: string) => {
         Toast.show({
             type: 'error',
             text1: 'Lỗi Kết Nối Real-time',
             text2: errorMsg,
             visibilityTime: 10000, // Hiển thị lâu hơn cho lỗi nghiêm trọng
             position: 'bottom',
         });
    }, []);


    // Sử dụng hook WebSocket nội bộ
    const { connect, disconnect } = useNotificationSocket({
        onNotificationReceived: handleNotificationReceived,
        onStatusChange: handleStatusChange,
        onError: handleError,
        // onConnect: () => console.log("Provider notified of connection"),
        // onDisconnect: () => console.log("Provider notified of disconnection"),
    });

    // Hàm đánh dấu thông báo đã xử lý (xóa khỏi state latestNotification)
    const markNotificationAsHandled = useCallback(() => {
        setLatestNotification(null);
    }, []);

    // Các hàm tiện ích để quản lý unreadCount từ bên ngoài Context nếu cần
     const incrementUnreadCount = useCallback((amount = 1) => {
         setUnreadCount(prev => prev + amount);
     }, []);

     const decrementUnreadCount = useCallback((amount = 1) => {
         setUnreadCount(prev => Math.max(0, prev - amount)); // Đảm bảo không âm
     }, []);

     const setUnreadCountExplicitly = useCallback((count: number) => {
         setUnreadCount(Math.max(0, count)); // Đảm bảo không âm
     }, []);


    // Tạo giá trị context, dùng useMemo để tối ưu
    const contextValue = useMemo(
        () => ({
            status,
            latestNotification,
            unreadCount,
            connectSocket: connect, // Expose connect từ hook
            disconnectSocket: disconnect, // Expose disconnect từ hook
            markNotificationAsHandled,
            incrementUnreadCount,
            decrementUnreadCount,
            setUnreadCount: setUnreadCountExplicitly,
        }),
        [
            status,
            latestNotification,
            unreadCount,
            connect,
            disconnect,
            markNotificationAsHandled,
            incrementUnreadCount,
            decrementUnreadCount,
            setUnreadCountExplicitly,
        ]
    );

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

// Hook tiện ích để sử dụng context dễ dàng hơn
export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};