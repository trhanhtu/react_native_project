"use client"

import { Icon, Text } from "@ui-kitten/components"
import { LinearGradient } from "expo-linear-gradient"
import type React from "react"
import { View } from "react-native"
import { useTailwind } from "tailwind-rn"

const EmptyNotifications: React.FC = () => {
  const tw = useTailwind()

  return (
    <View style={tw("flex-1 justify-center items-center py-16 px-4")}>
      <LinearGradient
        colors={["rgba(139, 92, 246, 0.1)", "rgba(99, 102, 241, 0.1)"]}
        style={tw("w-20 h-20 rounded-full items-center justify-center mb-4")}
      >
        <Icon name="bell-outline" width={40} height={40} fill="#8B5CF6" />
      </LinearGradient>
      <Text style={tw("text-lg font-bold text-gray-800/100 mb-2")}>No notifications yet</Text>
      <Text style={tw("text-center text-gray-500/100")}>
        When you receive notifications about elements, podcasts, or system updates, they'll appear here.
      </Text>
    </View>
  )
}

export default EmptyNotifications
