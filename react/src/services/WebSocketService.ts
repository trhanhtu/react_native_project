// Filename: src/config/websocket.ts
// Các hằng số cấu hình WebSocket
export const WS_ENDPOINT = '/ws'; // Đường dẫn WebSocket endpoint trên server
export const NOTIFICATION_TOPIC = '/topic/notifications'; // Topic STOMP để lắng nghe thông báo
export const RECONNECT_DELAY_BASE_MS = 5000; // Thời gian chờ cơ bản trước khi kết nối lại (5 giây)
export const MAX_RECONNECT_ATTEMPTS = 5; // Số lần thử kết nối lại tối đa
// Lấy base URL từ biến môi trường, cần đảm bảo biến này được cấu hình đúng trong Expo
export const BASE_URL: string | undefined = process.env.EXPO_PUBLIC_BASE_URL;

// Định nghĩa trạng thái kết nối WebSocket
export enum WebSocketConnectionStatus {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    ERROR = 'ERROR', // Trạng thái lỗi chung hoặc sau khi hết số lần kết nối lại
}