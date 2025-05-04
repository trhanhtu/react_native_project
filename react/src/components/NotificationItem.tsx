"use client"

import { Icon, Text } from "@ui-kitten/components"
import type React from "react"
import { useState } from "react"
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native"
import { Swipeable } from "react-native-gesture-handler"
import { useTailwind } from "tailwind-rn"
import type { Notification_t } from "../utils/types"

interface NotificationItemProps {
  notification: Notification_t
  onPress: () => void
  onDelete: () => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress, onDelete }) => {
  const tw = useTailwind()
  const [swiping, setSwiping] = useState(false)

  // Format the date
  const formattedDate = formatDate(notification.createdAt)

  // Get icon and color based on notification type
  const { icon, color, backgroundColor } = getNotificationStyle(notification.type)

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    })

    return (
      <Animated.View style={{ transform: [{ translateX: trans }] }}>
        <TouchableOpacity
          style={[tw("bg-red-500/100 justify-center items-center"), { width: 80, height: "100%" }]}
          onPress={onDelete}
        >
          <Icon name="trash-2-outline" width={24} height={24} fill="#FFFFFF" />
          <Text style={tw("text-white/100 text-xs mt-1")}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => setSwiping(true)}
      onSwipeableClose={() => setSwiping(false)}
    >
      <TouchableOpacity
        style={[
          tw("flex-row p-4 border-b border-gray-200/100"),
          notification.read ? tw("bg-white/100") : tw("bg-purple-50/100"),
          swiping && styles.swiping,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[tw("mr-3 rounded-full p-2"), { backgroundColor }]}>
          <Icon name={icon} width={20} height={20} fill={color} />
        </View>

        <View style={tw("flex-1")}>
          <View style={tw("flex-row items-center justify-between")}>
            <Text style={tw("text-sm text-gray-500/100 mb-1")}>{getNotificationTypeLabel(notification.type)}</Text>
            {!notification.read && <View style={tw("w-2 h-2 rounded-full bg-purple-600/100")} />}
          </View>

          <Text style={tw("text-gray-800/100 mb-1")}>{notification.message}</Text>

          <Text style={tw("text-xs text-gray-500/100")}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  )
}

// Helper functions
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true })
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a")
    }
  } catch (e) {
    return dateString
  }
}

const getNotificationTypeLabel = (type: string) => {
  switch (type.toLowerCase()) {
    case "element":
      return "Element Update"
    case "podcast":
      return "New Podcast"
    case "system":
      return "System"
    case "user":
      return "User"
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

const getNotificationStyle = (type: string) => {
  switch (type.toLowerCase()) {
    case "element":
      return {
        icon: "cube-outline",
        color: "#FFFFFF",
        backgroundColor: "#10B981",
      }
    case "podcast":
      return {
        icon: "headphones-outline",
        color: "#FFFFFF",
        backgroundColor: "#F59E0B",
      }
    case "system":
      return {
        icon: "bell-outline",
        color: "#FFFFFF",
        backgroundColor: "#6366F1",
      }
    case "user":
      return {
        icon: "person-outline",
        color: "#FFFFFF",
        backgroundColor: "#8B5CF6",
      }
    default:
      return {
        icon: "bell-outline",
        color: "#FFFFFF",
        backgroundColor: "#6B7280",
      }
  }
}

const styles = StyleSheet.create({
  swiping: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
})

export default NotificationItem


// Custom date formatting functions
const formatDistanceToNow = (date: Date, { addSuffix = false }: { addSuffix?: boolean } = {}) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    let result = '';
    if (diffSecs < 60) result = 'less than a minute';
    else if (diffMins < 60) result = `${diffMins} minute${diffMins === 1 ? '' : 's'}`;
    else if (diffHours < 24) result = `${diffHours} hour${diffHours === 1 ? '' : 's'}`;

    return addSuffix ? `${result} ago` : result;
};

const format = (date: Date, formatStr: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    return formatStr
        .replace('MMM', months[date.getMonth()])
        .replace('d', date.getDate().toString())
        .replace('yyyy', date.getFullYear().toString())
        .replace('h', (hours % 12 || 12).toString())
        .replace('mm', minutes.toString().padStart(2, '0'))
        .replace('a', ampm);
};

