"use client"

import CommentsSummaryCard from "@/src/components/CommentsSummaryCard"
import EpisodeList from "@/src/components/EpisodeList"
import FeaturedElementCard from "@/src/components/FeaturedElementCard"
import SectionTitle from "@/src/components/SectionTitle"
import UpdateBanner from "@/src/components/UpdateBanner"
import { useHomeData } from "@/src/hooks/useHomeData"
import { Href, useRouter } from "expo-router"
import type React from "react"
import { useState } from "react"
import { RefreshControl, ScrollView, View } from "react-native"
import { useTailwind } from "tailwind-rn"






// Component chính cho màn hình Home
const HomeScreen: React.FC = () => {
    const tw = useTailwind()
    const [showUpdateBanner, setShowUpdateBanner] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const router = useRouter()
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

    // Hàm xử lý khi người dùng kéo xuống để làm mới
    const onRefresh = async () => {
        setRefreshing(true)
        await refreshData()
        setRefreshing(false)
    }

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
                    />
                }
            >
                {/* Thông báo cập nhật mới */}
                {showUpdateBanner && (
                    <UpdateBanner
                        updateText="New update: Check out the latest features!"
                        onClose={() => setShowUpdateBanner(false)}
                    />
                )}

                {/* Phần nguyên tố nổi bật */}
                <SectionTitle title="Featured Element" />
                <FeaturedElementCard
                    element={featuredElement}
                    onPress={() => {
                        router.push(`/detailelement/${featuredElement?.atomicNumber ?? 1}` as Href)
                    }}
                    isLoading={elementLoading}
                    error={elementError}
                />

                {/* Phần podcast mới nhất */}
                <SectionTitle title="Latest Podcast Episodes" />
                <EpisodeList
                    episodes={latestEpisodes}
                    onEpisodePress={(episode) => router.push(`/detailpodcast/${episode.id}` as Href)}
                    isLoading={episodesLoading}
                    error={episodesError}
                />

                {/* Phần tóm tắt bình luận podcast */}
                <SectionTitle title="Podcast Comments" />
                <CommentsSummaryCard
                    comments={recentComments}
                    onPress={() => router.push("CommentsDetail" as Href)}
                    isLoading={commentsLoading}
                    error={commentsError}
                />
            </ScrollView>
        </View>
    )
}

export default HomeScreen

