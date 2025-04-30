"use client"

import { fetchNotificationList } from "@/api/api"
import { Text } from "@ui-kitten/components"
import { useEffect, useState } from "react"
import { useTailwind } from "tailwind-rn"
import WebSocketService from "../services/WebSocketService"
import type { Notification_t } from "../utils/types"

// Global state for unread count (to share across components)
let globalUnreadCount = 0
const listeners = new Set<(count: number) => void>()

// Function to update all listeners
export const updateUnreadCount = (count: number) => {
  globalUnreadCount = count
  listeners.forEach((listener) => listener(count))
}

// Function to decrement the unread count
export const decrementUnreadCount = () => {
  if (globalUnreadCount > 0) {
    updateUnreadCount(globalUnreadCount - 1)
  }
}

// Function to increment the unread count
export const incrementUnreadCount = () => {
  updateUnreadCount(globalUnreadCount + 1)
}

// Function to refresh the unread count from the API
export const refreshUnreadCount = async () => {
  try {
    const response = await fetchNotificationList(1, 100) // Get more notifications to count accurately
    console.log("Fetched notifications:", response);
    
    const unreadCount = response.result.filter((n: Notification_t) => !n.read).length
    updateUnreadCount(unreadCount)
    return unreadCount
  } catch (error) {
    console.error("Failed to refresh unread count:", error)
    return globalUnreadCount
  }
}

// Hook to access the unread count
export const useUnreadNotificationCount = () => {
  const [count, setCount] = useState(globalUnreadCount)

  useEffect(() => {
    const listener = (newCount: number) => {
      setCount(newCount)
    }

    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return count
}

// Initialize WebSocket connection and counter
export const initializeNotificationSystem = async () => {
  try {
    // Fetch initial unread count
    await refreshUnreadCount()

    // Connect WebSocket for real-time updates
    await WebSocketService.connect()
    WebSocketService.subscribeToNotifications((notification: Notification_t) => {
      if (!notification.read) {
        incrementUnreadCount()
      }
    })
  } catch (error) {
    console.error("Failed to initialize notification system:", error)
  }
}

// Component for the drawer icon
const UnreadNotificationIcon = (props: {
  color: string
  size: number
  focused: boolean
}): JSX.Element | undefined => {
  const tailwind = useTailwind()
  const count = useUnreadNotificationCount()

  if (count === 0) {
    return undefined
  }

  return (
    <Text category="h6" style={tailwind("bg-red-500/100 text-white/100 rounded-full px-3")}>
      {count}
    </Text>
  )
}

export default UnreadNotificationIcon
