import { Icon, Text } from "@ui-kitten/components"
import type React from "react"
import { TouchableOpacity, View } from "react-native"
import { useTailwind } from "tailwind-rn"

interface UpdateBannerProps {
  updateText: string
  onClose?: () => void
}

// Component hiển thị thông báo cập nhật mới
const UpdateBanner: React.FC<UpdateBannerProps> = ({ updateText, onClose }) => {
  const tw = useTailwind()

  return (
    <View style={tw("bg-blue-100/100 rounded-lg p-4 mb-4 flex-row justify-between items-center")}>
      <View style={tw("flex-row items-center")}>
        <Icon name="info-outline" style={tw("w-5 h-5 text-blue-500")} fill="#3b82f6" />
        <Text style={tw("ml-2 text-blue-800 flex-shrink")}>{updateText}</Text>
      </View>

      {onClose && (
        <TouchableOpacity onPress={onClose} style={tw("ml-2")}>
          <Icon name="close-outline" style={tw("w-5 h-5")} fill="#4b5563" />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default UpdateBanner

