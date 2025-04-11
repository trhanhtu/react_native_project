import { Card, Text } from "@ui-kitten/components"
import type React from "react"
import { FlatList, Image, TouchableOpacity, View } from "react-native"
import { useTailwind } from "tailwind-rn"
import { Podcast_t } from "../utils/types"

interface EpisodeListProps {
  episodes: Podcast_t[]
  onEpisodePress: (episode: Podcast_t) => void
  isLoading?: boolean
  error?: string | null
}

// Component hiển thị danh sách podcast
const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, onEpisodePress, isLoading = false, error = null }) => {
  const tw = useTailwind()

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <Card style={tw("mb-6 bg-white/100")}>
        <View style={tw("h-32 items-center justify-center")}>
          <Text>Đang tải danh sách podcast...</Text>
        </View>
      </Card>
    )
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <Card style={tw("mb-6 bg-white/100")}>
        <View style={tw("h-32 items-center justify-center")}>
          <Text status="danger">{error}</Text>
        </View>
      </Card>
    )
  }

  // Hiển thị thông báo khi không có dữ liệu
  if (episodes.length === 0) {
    return (
      <Card style={tw("mb-6 bg-white/100")}>
        <View style={tw("h-32 items-center justify-center")}>
          <Text>Không có podcast nào</Text>
        </View>
      </Card>
    )
  }

  // Hàm định dạng ngày tháng


  // Render từng item podcast
  const renderEpisodeItem = ({ item }: { item: Podcast_t }) => (
    <Card style={tw("bg-white/100")}>
      <TouchableOpacity onPress={() => onEpisodePress(item)} activeOpacity={0.7} style={tw("mb-3")}>
        <View style={tw("flex-row")}>
          <Image
            source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjyXwqhQtILhLrXLuyZZQ03dz0mFaxX150MA&s" }}
            style={tw("w-16 h-16 rounded-lg")}
          />

          <View style={tw("flex-1 ml-3")}>
            <Text category="h6" numberOfLines={1} style={tw("font-bold")}>
              {item.title}
            </Text>

            <Text category="s2" style={tw("text-gray-500/100 mb-1")}>
              {item.element}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  )

  return (
    <View style={tw("mb-6")}>
      <FlatList
        data={episodes}
        renderItem={renderEpisodeItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />
    </View>
  )
}

export default EpisodeList

