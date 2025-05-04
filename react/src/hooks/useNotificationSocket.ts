// Filename: src/hooks/useNotificationSocket.ts
import { Client, Frame, Message } from '@stomp/stompjs'; // Use @stomp/stompjs for better ESM/TS support
import { useCallback, useRef } from 'react';
import Toast from 'react-native-toast-message';
import SockJS from 'sockjs-client';
import { BASE_URL, MAX_RECONNECT_ATTEMPTS, NOTIFICATION_TOPIC, RECONNECT_DELAY_BASE_MS, WebSocketConnectionStatus, WS_ENDPOINT } from '../services/WebSocketService';
import GlobalStorage from '../utils/GlobalStorage';
import { Notification_t } from '../utils/types';


// Định nghĩa kiểu dữ liệu cho các props của hook
interface UseNotificationSocketProps {
    onNotificationReceived: (notification: Notification_t) => void; // Callback khi nhận thông báo mới
    onStatusChange: (status: WebSocketConnectionStatus) => void; // Callback khi trạng thái kết nối thay đổi
    onConnect?: () => void; // Callback tùy chọn khi kết nối thành công
    onDisconnect?: () => void; // Callback tùy chọn khi ngắt kết nối (chủ động hoặc lỗi)
    onError?: (errorMsg: string) => void; // Callback khi có lỗi nghiêm trọng (vd: hết lần reconnect)
}

// Định nghĩa kiểu dữ liệu giá trị trả về của hook
interface UseNotificationSocketReturn {
    connect: () => void; // Hàm để bắt đầu kết nối
    disconnect: () => void; // Hàm để ngắt kết nối chủ động
}

/**
 * Hook quản lý kết nối WebSocket dùng STOMP qua SockJS cho thông báo.
 * @param props - Các callback để xử lý sự kiện từ WebSocket.
 * @returns Các hàm để điều khiển kết nối.
 */
export const useNotificationSocket = ({
    onNotificationReceived,
    onStatusChange,
    onConnect,
    onDisconnect,
    onError,
}: UseNotificationSocketProps): UseNotificationSocketReturn => {
    //------------------------------------------------------
    // Refs & State
    //------------------------------------------------------
    // Ref giữ đối tượng client STOMP, không làm component re-render khi thay đổi
    const stompClientRef = useRef<Client | null>(null);
    // Ref giữ timeout ID để hủy bỏ nếu cần
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Ref đếm số lần thử kết nối lại
    const reconnectAttemptsRef = useRef<number>(0);

    //------------------------------------------------------
    // Helper Functions
    //------------------------------------------------------

    // Hàm dọn dẹp timeout đang chờ
    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    // Hàm xử lý ngắt kết nối và dọn dẹp
    const handleDisconnect = useCallback(
        (notify: boolean = true) => {
            clearReconnectTimeout(); // Hủy timeout nếu đang chờ kết nối lại
            if (stompClientRef.current?.active) {
                stompClientRef.current.deactivate(); // Ngắt kết nối STOMP
            }
            stompClientRef.current = null; // Xóa client
            reconnectAttemptsRef.current = 0; // Reset số lần thử
            if (notify) {
                onStatusChange(WebSocketConnectionStatus.DISCONNECTED);
                onDisconnect?.(); // Gọi callback tùy chọn
            }
            console.log('WebSocket: Disconnected.');
        },
        [clearReconnectTimeout, onStatusChange, onDisconnect]
    );

    // Hàm xử lý khi nhận được tin nhắn từ topic
    const handleMessage = useCallback(
        (message: Message) => {
            try {
                // Parse nội dung tin nhắn từ JSON
                const notification: Notification_t = JSON.parse(message.body);
                console.log('WebSocket: Received Notification:', notification);
                // TODO: Có thể thêm validation schema ở đây để đảm bảo đúng cấu trúc Notification_t
                onNotificationReceived(notification); // Gọi callback xử lý thông báo
            } catch (error) {
                console.error('WebSocket: Failed to parse notification message:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi Thông Báo',
                    text2: 'Nhận được dữ liệu thông báo không hợp lệ.',
                });
            }
        },
        [onNotificationReceived]
    );

    // Hàm thực hiện kết nối lại với cơ chế exponential backoff
    const scheduleReconnect = useCallback(() => {
        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            console.error(`WebSocket: Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
            onStatusChange(WebSocketConnectionStatus.ERROR);
            onError?.(`Không thể kết nối sau ${MAX_RECONNECT_ATTEMPTS} lần thử.`);
            handleDisconnect(false); // Dọn dẹp mà không thông báo DISCONNECTED nữa
            return;
        }

        // Tính toán thời gian chờ (exponential backoff + jitter)
        const delay = RECONNECT_DELAY_BASE_MS * Math.pow(2, reconnectAttemptsRef.current) + Math.random() * 1000;
        reconnectAttemptsRef.current += 1;

        console.log(`WebSocket: Connection attempt ${reconnectAttemptsRef.current}. Retrying in ${delay.toFixed(0)}ms...`);

        clearReconnectTimeout(); // Xóa timeout cũ nếu có
        reconnectTimeoutRef.current = setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            connect(); // Gọi lại hàm connect chính
        }, delay);
    }, [clearReconnectTimeout, handleDisconnect, onError, onStatusChange]);

    // Hàm xử lý lỗi kết nối hoặc lỗi STOMP
    const handleConnectionError = useCallback(
        (error?: Frame | CloseEvent | string) => {
            // Frame là lỗi STOMP, CloseEvent là lỗi WebSocket bị đóng
            let errorMessage = 'Connection closed unexpectedly';
            if (typeof error === 'string') {
                errorMessage = error;
            }
            if (error instanceof CloseEvent) {
                errorMessage = `WebSocket closed with code ${error.code} (${error.reason})`;
            }
            if (error && 'headers' in (error as unknown as Frame)) {
                errorMessage = `STOMP error: ${(error as unknown as Frame).headers['message'] || 'Unknown STOMP error'}`;
            }
            console.error('WebSocket: Connection Error -', errorMessage, error);
            onStatusChange(WebSocketConnectionStatus.DISCONNECTED); // Tạm thời coi là disconnected khi có lỗi
            onDisconnect?.(); // Gọi callback tùy chọn

            // Chỉ kết nối lại nếu lỗi không phải do người dùng chủ động ngắt
            if (stompClientRef.current?.connected === false || !stompClientRef.current) {
                scheduleReconnect();
            } else {
                // Nếu client vẫn đang active (vd lỗi STOMP nhưng WS chưa đóng), thử deactivate trước
                handleDisconnect(false); // Dọn dẹp trước khi thử lại
                scheduleReconnect();
            }
        },
        [onStatusChange, scheduleReconnect, onDisconnect, handleDisconnect]
    );

    //------------------------------------------------------
    // Connection Logic
    //------------------------------------------------------
    const connect = useCallback(() => {
        // Ngăn kết nối lại nếu đang có timeout chờ
        if (reconnectTimeoutRef.current) {
            console.log("WebSocket: Reconnect attempt already scheduled. Skipping new connect request.");
            return;
        }
        // Ngăn kết nối nếu đã có client đang hoạt động
        if (stompClientRef.current?.active) {
            console.log('WebSocket: Already connected or connecting.');
            return;
        }

        clearReconnectTimeout(); // Xóa timeout nếu có từ lần trước

        // === Guard Clauses: Kiểm tra điều kiện cần thiết ===
        if (!BASE_URL) {
            console.error('WebSocket: EXPO_PUBLIC_BASE_URL is not defined. Cannot connect.');
            onError?.('Lỗi cấu hình: Thiếu địa chỉ máy chủ.');
            onStatusChange(WebSocketConnectionStatus.ERROR);
            return;
        }

        const jwtToken = GlobalStorage.getItem('access_token'); // Lấy token (đồng bộ)
        if (!jwtToken) {
            console.warn('WebSocket: No access token found. Skipping connection.');
            // Không nên báo lỗi ở đây, có thể người dùng chưa đăng nhập
            onStatusChange(WebSocketConnectionStatus.DISCONNECTED);
            return;
        }
        // === Kết thúc Guard Clauses ===

        console.log('WebSocket: Attempting to connect...');
        onStatusChange(WebSocketConnectionStatus.CONNECTING);

        try {
            // Tạo URL đầy đủ cho SockJS
            const socketUrl = `${BASE_URL}${WS_ENDPOINT}`;

            // Tạo client STOMP mới
            const client = new Client({
                // Cung cấp một factory để tạo WebSocket, dùng SockJS ở đây
                webSocketFactory: () => new SockJS(socketUrl),
                // Headers để xác thực khi kết nối STOMP
                connectHeaders: {
                    Authorization: `Bearer ${jwtToken}`,
                },
                // Callback khi kết nối STOMP thành công
                onConnect: (frame: Frame) => {
                    console.log('WebSocket: STOMP Connected!', frame);
                    stompClientRef.current = client; // Lưu lại client vào ref *sau khi* kết nối thành công
                    reconnectAttemptsRef.current = 0; // Reset số lần thử khi kết nối thành công
                    onStatusChange(WebSocketConnectionStatus.CONNECTED);
                    onConnect?.(); // Gọi callback tùy chọn

                    // Đăng ký lắng nghe topic thông báo
                    client.subscribe(NOTIFICATION_TOPIC, handleMessage, {
                        // Có thể thêm headers cho subscription nếu cần
                        // id: 'notification-subscription' // ID tùy chọn cho subscription
                    });
                    console.log(`WebSocket: Subscribed to ${NOTIFICATION_TOPIC}`);
                },
                // Callback khi có lỗi STOMP (vd: server từ chối frame)
                onStompError: (frame: Frame) => {
                    handleConnectionError(frame);
                },
                // Callback khi WebSocket bị đóng (bất kể lý do gì)
                onWebSocketClose: (event: CloseEvent) => {
                    console.warn('WebSocket: Connection closed.', event.code, event.reason);
                    // Chỉ thử kết nối lại nếu không phải là đóng bình thường (code 1000) hoặc chưa đạt max attempts
                    if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                        handleConnectionError('WebSocket closed unexpectedly');
                    } else if (event.code === 1000) {
                        // Đóng bình thường (có thể do server hoặc client disconnect)
                        handleDisconnect(true); // Thông báo disconnect
                    } else {
                        // Đã đạt max attempts hoặc lỗi không xác định khác
                        handleConnectionError(`WebSocket closed with code ${event.code}`);
                    }
                },
                // Tắt log debug của STOMP (khá nhiều)
                debug: (str) => {
                    // console.log('STOMP Debug:', str); // Bật nếu cần debug sâu
                },
                // Thời gian chờ kết nối lại (STOMPjs tự quản lý nếu không bị ngắt hẳn)
                reconnectDelay: RECONNECT_DELAY_BASE_MS, // STOMP tự thử lại nếu mất kết nối tạm thời
                // heartbeat (giữ kết nối): [client sends ping, server expects ping] ms
                // Giá trị 0 0 để tắt heartbeat từ client, dựa vào server nếu có
                heartbeatIncoming: 4000, // Client mong nhận heartbeat từ server mỗi 4s
                heartbeatOutgoing: 4000, // Client sẽ gửi ping mỗi 4s
            });

            // Bắt đầu quá trình kết nối
            client.activate();
            // Lưu client vào ref ngay lập tức để có thể ngắt kết nối nếu cần trước khi onConnect được gọi
            stompClientRef.current = client;

        } catch (error) {
            console.error("WebSocket: Error during initial setup:", error);
            // Lỗi này thường là cấu hình sai (vd: URL không hợp lệ), không nên thử kết nối lại
            onError?.("Lỗi cấu hình WebSocket.");
            onStatusChange(WebSocketConnectionStatus.ERROR);
            handleDisconnect(false); // Dọn dẹp
        }

    }, [BASE_URL, onStatusChange, onError, onConnect, handleMessage, handleConnectionError, handleDisconnect, clearReconnectTimeout]);

    // Hàm ngắt kết nối chủ động
    const disconnect = useCallback(() => {
        console.log('WebSocket: Disconnecting manually...');
        handleDisconnect(true); // Gọi hàm dọn dẹp và thông báo
    }, [handleDisconnect]);
    // Trả về các hàm điều khiển connect/disconnect
    return { connect, disconnect };
};