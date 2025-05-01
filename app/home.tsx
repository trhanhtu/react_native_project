// Filename: HomeScreen.tsx
"use client"

import CommentsSummaryCard from "@/src/components/CommentsSummaryCard"; // Might need internal translation
import EpisodeList from "@/src/components/EpisodeList"; // Might need internal translation
import FeaturedElementCard from "@/src/components/FeaturedElementCard"; // Might need internal translation
import SectionTitle from "@/src/components/SectionTitle"
import UpdateBanner from "@/src/components/UpdateBanner"; // Might need internal translation
import { useHomeData } from "@/src/hooks/useHomeData"
import { Href, useRouter } from "expo-router"
import type React from "react"
import { useState } from "react"
import { RefreshControl, ScrollView, View } from "react-native"
import { useTailwind } from "tailwind-rn"

//------------------------------------------------------
// Main Screen Component: HomeScreen
//------------------------------------------------------
// Component chính cho màn hình Home
const HomeScreen: React.FC = () => {
    const tw = useTailwind()
    const [showUpdateBanner, setShowUpdateBanner] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const router = useRouter()

    //----------------------------------
    // Hooks & State
    //----------------------------------
    // Sử dụng custom hook để lấy dữ liệu
    const {
        featuredElement,
        latestEpisodes,
        recentComments,
        elementLoading,
        episodesLoading,
        commentsLoading,
        elementError,
        episodesError,
        commentsError,
        refreshData,
    } = useHomeData()

    //----------------------------------
    // Event Handlers
    //----------------------------------
    // Hàm xử lý khi người dùng kéo xuống để làm mới
    const onRefresh = async () => {
        setRefreshing(true)
        try {
            await refreshData()
        } finally {
            setRefreshing(false)
        }
    }

    //----------------------------------
    // Main Render
    //----------------------------------
    return (
        <View style={tw("flex-1 bg-gray-100/100")}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw("flex-grow")}
                style={tw("p-4")}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#9333ea"]} // Màu tím phù hợp với theme
                        tintColor={"#9333ea"} // Ensure consistency for iOS
                    />
                }
            >
                {/* Thông báo cập nhật mới */}
                {showUpdateBanner && (
                    <UpdateBanner
                        // Translated update text
                        updateText="Cập nhật mới: Hãy xem các tính năng mới nhất!"
                        onClose={() => setShowUpdateBanner(false)}
                    />
                )}

                {/* Phần nguyên tố nổi bật */}
                {/* Translated section title */}
                <SectionTitle title="Nguyên tố nổi bật" />
                <FeaturedElementCard
                    element={featuredElement}
                    onPress={() => {
                        // Navigate safely, ensuring featuredElement exists
                        if (featuredElement?.atomicNumber) {
                            router.push(`/detailelement/${featuredElement.atomicNumber}` as Href)
                        }
                    }}
                    isLoading={elementLoading}
                    error={elementError} // Propagate error state to the card
                />

                {/* Phần podcast mới nhất */}
                {/* Translated section title */}
                <SectionTitle title="Các tập Podcast mới nhất" />
                <EpisodeList
                    episodes={latestEpisodes}
                    onEpisodePress={(episode) => router.push(`/detailpodcast/${episode.id}` as Href)}
                    isLoading={episodesLoading}
                    error={episodesError} // Propagate error state to the list
                />

                {/* Phần tóm tắt bình luận podcast */}
                {/* Translated section title */}
                <SectionTitle title="Bình luận Podcast" />
                <CommentsSummaryCard
                    comments={recentComments}
                    // Assuming "CommentsDetail" is the route name for seeing all comments
                    onPress={() => router.push("CommentsDetail" as Href)} // Update route name if different
                    isLoading={commentsLoading}
                    error={commentsError} // Propagate error state to the card
                />
                {/* Add some padding at the bottom */}
                <View style={tw('h-8')} />
            </ScrollView>
        </View>
    )
}

export default HomeScreen