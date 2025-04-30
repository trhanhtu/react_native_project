// Filename: src/hooks/useNotifications.ts
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import {
  deleteOneNotification,
  fetchNotificationList,
  markAllNotificationsAsRead,
  markOneNotificationAsRead,
} from '@/api/api'; // <-- Đảm bảo đường dẫn đúng tới file API của bạn
import { useNotification } from '../context/NotificationProvider';
import { WebSocketConnectionStatus } from '../services/WebSocketService';
import { Notification_t } from '../utils/types';

// Định nghĩa kiểu dữ liệu giá trị trả về của hook
interface UseNotificationsReturn {
  notifications: Notification_t[]; // Danh sách thông báo
  loading: boolean; // Trạng thái tải lần đầu
  refreshing: boolean; // Trạng thái tải khi kéo làm mới
  loadingMore: boolean; // Trạng thái tải thêm khi cuộn xuống
  error: string | null; // Thông báo lỗi nếu có
  hasMore: boolean; // Còn trang để tải thêm hay không
  wsStatus: WebSocketConnectionStatus; // Trạng thái kết nối WebSocket (lấy từ context)
  fetchNotifications: (isRefresh?: boolean) => Promise<void>; // Hàm tải thông báo (dùng cho cả lần đầu và refresh)
  loadMoreNotifications: () => void; // Hàm tải thêm trang tiếp theo
  markAsRead: (id: number) => Promise<void>; // Hàm đánh dấu một thông báo đã đọc
  markAllAsRead: () => Promise<void>; // Hàm đánh dấu tất cả đã đọc
  deleteNotification: (id: number) => Promise<void>; // Hàm xóa một thông báo
}

const PAGE_SIZE = 15; // Kích thước trang, bạn có thể điều chỉnh

/**
 * Hook quản lý trạng thái và dữ liệu cho màn hình danh sách thông báo.
 * Tích hợp với NotificationContext để cập nhật số lượng chưa đọc.
 * @returns Object chứa trạng thái, dữ liệu và các hàm xử lý.
 */
export const useNotifications = (): UseNotificationsReturn => {
  //------------------------------------------------------
  // Context Access
  //------------------------------------------------------
  const {
    status: wsStatus, // Lấy trạng thái WS từ context
    setUnreadCount, // Hàm đặt lại số lượng chưa đọc trong context
    decrementUnreadCount, // Hàm giảm số lượng chưa đọc trong context
    // Có thể lấy thêm incrementUnreadCount nếu cần
  } = useNotification();

  //------------------------------------------------------
  // Internal State
  //------------------------------------------------------
  const [notifications, setNotifications] = useState<Notification_t[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading ban đầu
  const [refreshing, setRefreshing] = useState<boolean>(false); // Pull-to-refresh
  const [loadingMore, setLoadingMore] = useState<boolean>(false); // Infinite scroll
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1); // Trang hiện tại để fetch
  const [hasMore, setHasMore] = useState<boolean>(true); // Còn dữ liệu để load more

  //------------------------------------------------------
  // Data Fetching Logic
  //------------------------------------------------------
  const fetchNotifications = useCallback(
    async (isRefresh: boolean = false) => {
      // Xác định trang cần fetch và trạng thái loading tương ứng

      const currentPage = isRefresh ? 1 : page;
      console.log(`WorkspaceNotifications START: isRefresh=${isRefresh}, currentPage=${currentPage}, currentLoadingState=${loading}, currentRefreshingState=${refreshing}`);
      if (isRefresh) {
        setRefreshing(true);
        setError(null); // Xóa lỗi cũ khi refresh
        setHasMore(true); // Giả định có thể có dữ liệu mới khi refresh
      } else if (currentPage === 1) {
        setLoading(true); // Loading lần đầu
      } else {
        setLoadingMore(true); // Loading trang tiếp theo
      }

      try {
        const response = await fetchNotificationList(currentPage, PAGE_SIZE);

        // Tính toán số lượng chưa đọc từ dữ liệu trả về *của trang này*
        const newUnreadInPage = response.result.filter(n => !n.read).length;

        setNotifications(prev =>
          isRefresh ? response.result : [...prev, ...response.result]
        );
        setHasMore(response.meta.current < response.meta.totalPages);
        setPage(response.meta.current + 1); // Cập nhật trang tiếp theo cần fetch
        setError(null); // Xóa lỗi nếu fetch thành công

        // *** Cập nhật Unread Count trong Context ***
        if (isRefresh) {
          // Nếu là refresh (trang 1), lấy tổng số chưa đọc từ meta.totalItems (nếu API hỗ trợ)
          // hoặc tính toán lại từ toàn bộ danh sách mới fetch được (nếu chỉ có dữ liệu trang 1)
          // Giả sử API không trả về tổng số chưa đọc, ta tính từ trang 1 trả về:
          console.log("Refreshing: Setting unread count to:", newUnreadInPage);
          setUnreadCount(newUnreadInPage); // Chỉ đặt count dựa trên trang 1 mới nhất
        }
        // Lưu ý: Khi load more, ta KHÔNG cập nhật lại tổng count từ context ở đây,
        // vì việc đó đã được xử lý khi thông báo mới đến qua WebSocket hoặc khi người dùng đánh dấu đã đọc.

      } catch (err: any) {
        console.error("Failed to fetch notifications:", err);
        const errorMsg = err?.response?.data?.message || err?.message || "Không thể tải thông báo";
        setError(errorMsg);
        // Không đặt lại notifications khi lỗi để giữ lại dữ liệu cũ nếu có
        Toast.show({ type: 'error', text1: 'Lỗi Tải Dữ Liệu', text2: errorMsg });
      } finally {
        console.log(`WorkspaceNotifications FINALLY: Entered. isRefresh=${isRefresh}, currentPage=${currentPage}`);

        // *** CORRECTED LOGIC ***
        if (isRefresh) {
          console.log("fetchNotifications FINALLY: Condition -> isRefresh === true. Setting refreshing=false");
          setRefreshing(false);
          // *** ALSO set loading false if it was the initial load (currentPage=1) ***
          if (currentPage === 1) {
            console.log("fetchNotifications FINALLY: Condition -> isRefresh === true AND currentPage === 1. Setting loading=false");
            setLoading(false); // <--- Make sure initial loading is turned off
          }
        } else if (currentPage === 1) {
          // This case is less likely if initial load uses isRefresh=true, but keep for safety
          console.log("fetchNotifications FINALLY: Condition -> isRefresh === false AND currentPage === 1. Setting loading=false");
          setLoading(false);
        } else {
          console.log("fetchNotifications FINALLY: Condition -> Not initial load/refresh. Setting loadingMore=false");
          setLoadingMore(false);
        }
        console.log(`WorkspaceNotifications FINALLY EXIT: Attempted state updates.`);
      }
    },
    [page, setUnreadCount] // Phụ thuộc vào page và hàm context
  );

  // Hàm load more đơn giản
  const loadMoreNotifications = useCallback(() => {
    // Chỉ load more nếu còn dữ liệu và không đang load
    if (hasMore && !loadingMore && !refreshing && !loading) {
      console.log("Loading more notifications...");
      fetchNotifications(false); // Fetch trang tiếp theo
    }
  }, [hasMore, loadingMore, refreshing, loading, fetchNotifications]);

  //------------------------------------------------------
  // Mutation Logic (Mark Read, Delete)
  //------------------------------------------------------

  const markAsRead = useCallback(
    async (id: number) => {
      const originalNotifications = [...notifications]; // Sao lưu trạng thái cũ để rollback nếu lỗi
      const notificationIndex = originalNotifications.findIndex(n => n.id === id);
      if (notificationIndex === -1) return; // Không tìm thấy thông báo

      const wasUnread = !originalNotifications[notificationIndex].read;

      // Cập nhật UI trước để tạo cảm giác nhanh nhạy
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );

      // Nếu nó chưa đọc, giảm count trong context ngay lập tức
      if (wasUnread) {
        decrementUnreadCount(1);
      }

      try {
        await markOneNotificationAsRead(id); // Gọi API
        // Thành công: không cần làm gì thêm vì UI đã cập nhật
      } catch (error: any) {
        console.error("Failed to mark notification as read:", error);
        // Rollback lại trạng thái UI và context nếu lỗi
        setNotifications(originalNotifications);
        if (wasUnread) {
          // Nếu đã giảm count mà lỗi -> tăng lại count (hoặc fetch lại count tổng)
          // Đơn giản nhất là fetch lại trang đầu để đồng bộ count
          fetchNotifications(true); // Hoặc dùng incrementUnreadCount(1) nếu có
        }
        const errorMsg = error?.response?.data?.message || "Đánh dấu đã đọc thất bại";
        Toast.show({ type: 'error', text1: 'Lỗi Cập Nhật', text2: errorMsg });
      }
    },
    [notifications, decrementUnreadCount, fetchNotifications] // Thêm fetchNotifications vào dependency
  );

  const markAllAsRead = useCallback(
    async () => {
      const originalNotifications = [...notifications];
      const wereAnyUnread = originalNotifications.some(n => !n.read);

      // Cập nhật UI trước
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Đặt count về 0 trong context
      if (wereAnyUnread) {
        setUnreadCount(0);
      }

      try {
        await markAllNotificationsAsRead(); // Gọi API
      } catch (error: any) {
        console.error("Failed to mark all notifications as read:", error);
        // Rollback UI và context
        setNotifications(originalNotifications);
        if (wereAnyUnread) {
          // Fetch lại để đảm bảo count đúng
          fetchNotifications(true);
        }
        const errorMsg = error?.response?.data?.message || "Đánh dấu tất cả đã đọc thất bại";
        Toast.show({ type: 'error', text1: 'Lỗi Cập Nhật', text2: errorMsg });
      }
    },
    [notifications, setUnreadCount, fetchNotifications] // Thêm fetchNotifications vào dependency
  );

  const deleteNotification = useCallback(
    async (id: number) => {
      const originalNotifications = [...notifications];
      const notificationToDelete = originalNotifications.find(n => n.id === id);
      if (!notificationToDelete) return;

      const wasUnread = !notificationToDelete.read;

      // Cập nhật UI trước
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Giảm count nếu nó chưa đọc
      if (wasUnread) {
        decrementUnreadCount(1);
      }

      try {
        await deleteOneNotification(id); // Gọi API
      } catch (error: any) {
        console.error("Failed to delete notification:", error);
        // Rollback UI và context
        setNotifications(originalNotifications);
        if (wasUnread) {
          fetchNotifications(true); // Fetch lại để đồng bộ count
        }
        const errorMsg = error?.response?.data?.message || "Xóa thông báo thất bại";
        Toast.show({ type: 'error', text1: 'Lỗi Cập Nhật', text2: errorMsg });
      }
    },
    [notifications, decrementUnreadCount, fetchNotifications] // Thêm fetchNotifications vào dependency
  );

  //------------------------------------------------------
  // Initial Fetch Effect
  //------------------------------------------------------
  useEffect(() => {
    console.log("useNotifications mounted. Fetching initial data...");
    fetchNotifications(true); // Fetch trang đầu tiên khi hook được sử dụng lần đầu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  //------------------------------------------------------
  // Return Values
  //------------------------------------------------------
  return {
    notifications,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    wsStatus, // Trả về trạng thái WS để component sử dụng nếu cần
    fetchNotifications, // Trả về hàm fetch để dùng cho onRefresh
    loadMoreNotifications, // Trả về hàm load more cho onEndReached
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};