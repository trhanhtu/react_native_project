import { Card, Divider, Icon, Text } from "@ui-kitten/components"
import type React from "react"
import { FlatList, Image, TouchableOpacity, View } from "react-native"
import { useTailwind } from "tailwind-rn"
import { PodcastComment } from "../utils/types"


interface CommentsSummaryCardProps {
    comments: PodcastComment[]
    onPress: () => void
    isLoading?: boolean
    error?: string | null
}

// Component hiển thị tóm tắt bình luận
const CommentsSummaryCard: React.FC<CommentsSummaryCardProps> = ({
    comments,
    onPress,
    isLoading = false,
    error = null,
}) => {
    const tw = useTailwind()

    // Hiển thị trạng thái loading
    if (isLoading) {
        return (
            <Card style={tw("mb-6 bg-white/100")}>
                <View style={tw("h-32 items-center justify-center")}>
                    <Text>Đang tải bình luận...</Text>
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
    if (comments.length === 0) {
        return (
            <Card style={tw("mb-6 bg-white/100")}>
                <View style={tw("h-32 items-center justify-center")}>
                    <Text>Không có bình luận nào</Text>
                </View>
            </Card>
        )
    }

    // Hàm định dạng ngày tháng
    const formatDate = (dateString: Date) => {
        return dateString.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Render từng item bình luận
    const renderCommentItem = ({ item }: { item: PodcastComment }) => (
        <View style={tw("mb-4")}>
            <View style={tw("flex-row mb-2")}>
                <Image
                    source={{ uri: item.userAvatar || "https://via.placeholder.com/40" }}
                    style={tw("w-10 h-10 rounded-full")}
                />

                <View style={tw("flex-1 ml-3")}>
                    <Text category="s1" style={tw("font-bold")}>
                        {item.userName}
                    </Text>

                    <Text category="c1" style={tw("text-gray-500")}>
                        {new Date(item.createdAt).toLocaleString()} • {item.podcastTitle}
                    </Text>
                </View>
            </View>

            <Text numberOfLines={2} style={tw("text-gray-700 mb-2")}>
                {item.content}
            </Text>

            <View style={tw("flex-row items-center")}>
                <Icon name="heart-outline" style={tw("w-4 h-4")} fill="#6b7280" />
                <Text category="c1" style={tw("ml-1 text-gray-500")}>
                    {item.likes}
                </Text>
            </View>

            <Divider style={tw("mt-4")} />
        </View>
    )

    return (
        <Card style={tw("mb-6 bg-white/100")}>
            <FlatList
                data={comments.slice(0, 5)} // Chỉ hiển thị 5 bình luận đầu tiên
                renderItem={renderCommentItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ListFooterComponent={
                    <TouchableOpacity
                        onPress={onPress}
                        style={tw("flex-row justify-center items-center mt-2")}
                        activeOpacity={0.7}
                    >
                        <Text category="s1" style={tw("text-purple-600 font-bold")}>
                            Xem tất cả bình luận
                        </Text>
                        <Icon name="arrow-forward-outline" style={tw("w-4 h-4 ml-1")} fill="#9333ea" />
                    </TouchableOpacity>
                }
            />
        </Card>
    )
}

export default CommentsSummaryCard

