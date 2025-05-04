"use client"

import { fetchCommentsAPI, fetchElementDetails, fetchPodcasts } from "@/api/api"
import { useEffect, useState } from "react"
import type { DetailElement_t, Podcast_t, PodcastComment } from "../utils/types"

// Custom hook để lấy dữ liệu cho màn hình Home
export const useHomeData = () => {
    // Khai báo các state cho dữ liệu
    const [featuredElement, setFeaturedElement] = useState<DetailElement_t | null>(null)
    const [latestEpisodes, setLatestEpisodes] = useState<Podcast_t[]>([])
    const [recentComments, setRecentComments] = useState<PodcastComment[]>([])

    // Khai báo các state cho trạng thái loading
    const [elementLoading, setElementLoading] = useState<boolean>(true)
    const [episodesLoading, setEpisodesLoading] = useState<boolean>(true)
    const [commentsLoading, setCommentsLoading] = useState<boolean>(true)

    // Khai báo các state cho lỗi
    const [elementError, setElementError] = useState<string | null>(null)
    const [episodesError, setEpisodesError] = useState<string | null>(null)
    const [commentsError, setCommentsError] = useState<string | null>(null)

    // Hàm lấy nguyên tố ngẫu nhiên
    const fetchRandomElement = async () => {
        try {
            setElementLoading(true)
            // Chọn một số nguyên tử ngẫu nhiên từ 1-118
            const randomAtomicNumber = Math.floor(Math.random() * 118) + 1

            const response = await fetchElementDetails(randomAtomicNumber)
            if (!response) {
                setElementError("Không thể lấy dữ liệu nguyên tố")
                setElementError("Không thể lấy dữ liệu nguyên tố")
            }
            else {
                setFeaturedElement(response)
            }

        } catch (err) {
            setElementError("Đã xảy ra lỗi khi kết nối với máy chủ")
            console.error("Error fetching random element:", err)
        } finally {
            setElementLoading(false)
        }
    }

    // Hàm lấy danh sách podcast mới nhất
    const fetchLatestPodcasts = async () => {
        try {
            setEpisodesLoading(true)
            const response = await fetchPodcasts(1, 5);


            if (!response) {
                setEpisodesError("Không thể lấy dữ liệu podcast")
            } else {
                setLatestEpisodes(response.result)
            }
        } catch (err) {
            setEpisodesError("Đã xảy ra lỗi khi kết nối với máy chủ")
            console.error("Error fetching podcasts:", err)
        } finally {
            setEpisodesLoading(false)
        }
    }

    // Hàm lấy danh sách bình luận gần đây
    const fetchRecentComments = async () => {
        try {
            setCommentsLoading(true)
            const response = await fetchCommentsAPI(undefined, 1, 5)

            if (response) {
                setRecentComments(response.result)
            } else {
                setCommentsError("Không thể lấy dữ liệu bình luận")
            }
        } catch (err) {
            setCommentsError("Đã xảy ra lỗi khi kết nối với máy chủ")
            console.error("Error fetching comments:", err)
        } finally {
            setCommentsLoading(false)
        }
    }

    // Gọi các hàm fetch dữ liệu khi component được mount
    useEffect(() => {
        fetchRandomElement()
        fetchLatestPodcasts()
        fetchRecentComments()
    }, [])

    return {
        featuredElement,
        latestEpisodes,
        recentComments,
        elementLoading,
        episodesLoading,
        commentsLoading,
        elementError,
        episodesError,
        commentsError,
        refreshData: () => {
            fetchRandomElement()
            fetchLatestPodcasts()
            fetchRecentComments()
        },
    }
}

