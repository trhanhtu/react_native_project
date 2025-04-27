"use client"

import { deleteOneNotification, fetchNotificationList, markAllNotificationsAsRead, markOneNotificationAsRead } from "@/api/api";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { Notification_t } from "../utils/types";



const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification_t[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    // Calculate unread count whenever notifications change
    useEffect(() => {
        const count = notifications.filter((notification) => !notification.read).length
        setUnreadCount(count)
    }, [notifications])

    const fetchNotifications = useCallback(async (page = 1, pageSize = 10) => {
        try {
            if (page === 1) {
                setRefreshing(true)
            }
            setError(null)

            const data = await fetchNotificationList(page, pageSize)

            if (page === 1) {
                setNotifications(data.result)
            } else {
                setNotifications((prev) => [...prev, ...data.result])
            }

            setCurrentPage(data.meta.current)
            setHasMore(data.meta.current < data.meta.totalPages)
        } catch (err: any) {
            setError(err.message || "Failed to fetch notifications")
            console.error("Error fetching notifications:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    const loadMoreNotifications = useCallback(async () => {
        if (loadingMore || !hasMore) return

        setLoadingMore(true)
        try {
            await fetchNotifications(currentPage + 1)
        } finally {
            setLoadingMore(false)
        }
    }, [currentPage, hasMore, loadingMore, fetchNotifications])

    const markAsRead = useCallback(async (id: number) => {
        try {
            // Optimistic update
            setNotifications((prev) =>
                prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
            )

            await markOneNotificationAsRead(id)
        } catch (err: any) {
            // Revert optimistic update on error
            setNotifications((prev) =>
                prev.map((notification) => (notification.id === id ? { ...notification, read: false } : notification)),
            )
            Toast.show({
                type: "error",
                text1: "Failed to mark notification as read",
            })
            console.error("Error marking notification as read:", err)
        }
    }, [])

    const markAllAsRead = useCallback(async () => {
        try {
            // Optimistic update
            setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

            await markAllNotificationsAsRead()
            Toast.show({
                type: "success",
                text1: "All notifications marked as read",
            })
        } catch (err: any) {
            // Revert on error
            fetchNotifications() // Refetch to get correct state
            Toast.show({
                type: "error",
                text1: "Failed to mark all notifications as read",
            })
            console.error("Error marking all notifications as read:", err)
        }
    }, [fetchNotifications])

    const deleteNotification = useCallback(
        async (id: number) => {
            try {
                // Optimistic update
                setNotifications((prev) => prev.filter((notification) => notification.id !== id))

                await deleteOneNotification(id)
                Toast.show({
                    type: "success",
                    text1: "Notification deleted",
                })
            } catch (err: any) {
                // Revert optimistic update on error
                fetchNotifications() // Refetch to get correct state
                Toast.show({
                    type: "error",
                    text1: "Failed to delete notification",
                })
                console.error("Error deleting notification:", err)
            }
        },
        [fetchNotifications],
    )

    // Add a new notification (used by WebSocket)
    const addNotification = useCallback((notification: Notification_t) => {
        setNotifications((prev) => {
            // Check if notification already exists
            const exists = prev.some((n) => n.id === notification.id)
            if (exists) {
                return prev
            }
            // Add new notification at the beginning
            return [notification, ...prev]
        })

        // Show toast for new notification
        Toast.show({
            type: "info",
            text1: "New notification",
            text2: notification.message,
        })
    }, [])

    return {
        notifications,
        loading,
        refreshing,
        loadingMore,
        hasMore,
        error,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMoreNotifications,
        addNotification,
    }
}

export default useNotifications