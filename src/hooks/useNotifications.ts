"use client"

import { deleteOneNotification, fetchNotificationList, markAllNotificationsAsRead, markOneNotificationAsRead } from "@/api/api"
import { useCallback, useEffect, useState } from "react"
import Toast from "react-native-toast-message"
import { decrementUnreadCount, refreshUnreadCount, updateUnreadCount } from "../components/UnreadNotificationIcon"
import type { Notification_t } from "../utils/types"

// API functions
const fetchNotificationsApi = async (current = 1, pageSize = 10) => {
  const response = await fetch(`/api/v1/notifications?current=${current}&pageSize=${pageSize}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`)
  }
  return await response.json()
}

const markNotificationAsReadApi = async (id: number) => {
  const response = await fetch(`/api/v1/notifications/${id}/read`, {
    method: "PATCH",
  })
  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: ${response.status}`)
  }
  return await response.json()
}

const markAllNotificationsAsReadApi = async () => {
  const response = await fetch(`/api/v1/notifications/read-all`, {
    method: "PATCH",
  })
  if (!response.ok) {
    throw new Error(`Failed to mark all notifications as read: ${response.status}`)
  }
  return await response.json()
}

const deleteNotificationApi = async (id: number) => {
  const response = await fetch(`/api/v1/notifications/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(`Failed to delete notification: ${response.status}`)
  }
}

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
        // Update global unread count when fetching notifications
        const unreadCount = data.result.filter((n: Notification_t) => !n.read).length
        await refreshUnreadCount()
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

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        // Check if notification is already read
        const notification = notifications.find((n) => n.id === id)
        const wasUnread = notification && !notification.read

        // Optimistic update
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )

        // If notification was unread, decrement the global counter
        if (wasUnread) {
          decrementUnreadCount()
        }

        await markOneNotificationAsRead(id)
      } catch (err: any) {
        // Revert optimistic update on error
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? { ...notification, read: false } : notification)),
        )

        // Refresh the global counter to ensure accuracy
        refreshUnreadCount()

        Toast.show({
          type: "error",
          text1: "Failed to mark notification as read",
        })
        console.error("Error marking notification as read:", err)
      }
    },
    [notifications],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      // Count unread notifications before marking all as read
      const unreadNotifications = notifications.filter((n) => !n.read)
      const unreadCount = unreadNotifications.length

      // Optimistic update
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

      // Update global counter to zero since all are now read
      if (unreadCount > 0) {
        await refreshUnreadCount()
      }
      updateUnreadCount(0);
      await markAllNotificationsAsRead()
      Toast.show({
        type: "success",
        text1: "All notifications marked as read",
      })
    } catch (err: any) {
      // Revert on error
      fetchNotificationList() // Refetch to get correct state

      // Refresh the global counter to ensure accuracy
      refreshUnreadCount()

      Toast.show({
        type: "error",
        text1: "Failed to mark all notifications as read",
      })
      console.error("Error marking all notifications as read:", err)
    }
  }, [notifications, fetchNotifications])

  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        // Check if notification is unread before deleting
        const notification = notifications.find((n) => n.id === id)
        const wasUnread = notification && !notification.read

        // Optimistic update
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))

        // If we're deleting an unread notification, decrement the counter
        if (wasUnread) {
          decrementUnreadCount()
        }

        await deleteOneNotification(id)
        Toast.show({
          type: "success",
          text1: "Notification deleted",
        })
      } catch (err: any) {
        // Revert optimistic update on error
        fetchNotifications() // Refetch to get correct state

        // Refresh the global counter to ensure accuracy
        refreshUnreadCount()

        Toast.show({
          type: "error",
          text1: "Failed to delete notification",
        })
        console.error("Error deleting notification:", err)
      }
    },
    [notifications, fetchNotifications],
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
