import { Text } from "@ui-kitten/components"
import type React from "react"
import { View } from "react-native"
import { useTailwind } from "tailwind-rn"

interface SectionTitleProps {
  title: string
}

// Component hiển thị tiêu đề cho các phần
const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  const tw = useTailwind()

  return (
    <View style={tw("mb-3")}>
      <Text category="h5" style={tw("font-bold")}>
        {title}
      </Text>
      <View style={tw("h-1 w-16 bg-purple-500/100 rounded mt-1")} />
    </View>
  )
}

export default SectionTitle

