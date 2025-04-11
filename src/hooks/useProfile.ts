import { fetchFavoritePodcasts, fetchProfileData, fetchViewedElements, resendOTP, verifyOTP } from "@/api/api"
import { Href, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import authCheck from "../utils/authCheck"
import { ProfileData, UpdateUserRequest } from "../utils/types"

export default function useProfile() {
  const router = useRouter()

  // State
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Edit profile modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false)
  const [editName, setEditName] = useState<string>("")
  const [editEmail, setEditEmail] = useState<string>("")
  const [editAvatar, setEditAvatar] = useState<string>("")

  // OTP verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [otp, setOtp] = useState<string>("")
  const [otpSent, setOtpSent] = useState<boolean>(false)
  const [otpError, setOtpError] = useState<string | null>(null)

  // Pagination state
  const [viewedElementsPage, setViewedElementsPage] = useState<number>(1)
  const [viewedPodcastsPage, setViewedPodcastsPage] = useState<number>(1)
  const [loadingMore, setLoadingMore] = useState<{
    elements: boolean
    podcasts: boolean
  }>({ elements: false, podcasts: false })
  const [hasMore, setHasMore] = useState<{
    elements: boolean
    podcasts: boolean
  }>({ elements: true, podcasts: true })

  // Fetch profile data
  const fetchData = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true)
        } else if (!profileData) {
          setLoading(true)
        }

        const data = await fetchProfileData()

        if (data !== null) {
          setProfileData(data)
          setEditName(data.name)
          setEditEmail(data.email)
          setEditAvatar(data.avatar || "https://picsum.photos/200")
          setError(null)
        } else {
          setError("Failed to fetch profile data")
        }
      } catch (err) {
        setError("An error occurred while fetching profile data")
        console.error(err)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [profileData],
  )

  // Load more viewed elements
  const loadMoreViewedElements = useCallback(async () => {
    if (loadingMore.elements || !hasMore.elements) return

    try {
      setLoadingMore((prev) => ({ ...prev, elements: true }))


      // If we've loaded all items, set hasMore to false
      if (viewedElementsPage >= 3) {
        setHasMore((prev) => ({ ...prev, elements: false }))
      } else {
        setViewedElementsPage((prev) => prev + 1)

        // Add more dummy data
        if (profileData) {
          const newElement = await fetchViewedElements(viewedElementsPage)
          if (!newElement) return
          setProfileData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              viewedElements: [...prev.viewedElements, newElement],
            } as ProfileData
          })
        }
      }
    } catch (err) {
      console.error("Error loading more viewed elements:", err)
    } finally {
      setLoadingMore((prev) => ({ ...prev, elements: false }))
    }
  }, [loadingMore.elements, hasMore.elements, viewedElementsPage, profileData])

  // Load more viewed podcasts
  const loadMoreViewedPodcasts = useCallback(async () => {
    if (loadingMore.podcasts || !hasMore.podcasts) return

    try {
      setLoadingMore((prev) => ({ ...prev, podcasts: true }))

      // In a real app, we would fetch more data from the API
      // For demo purposes, we'll just simulate loading more data

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // If we've loaded all items, set hasMore to false
      if (viewedPodcastsPage >= 3) {
        setHasMore((prev) => ({ ...prev, podcasts: false }))
      } else {
        setViewedPodcastsPage((prev) => prev + 1)

        // Add more dummy data
        if (profileData) {
          const newPodcast = await fetchFavoritePodcasts(viewedPodcastsPage);
          if (!newPodcast) return
          setProfileData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              viewedPodcasts: [...prev.viewedPodcasts, newPodcast],
            } as ProfileData
          })
        }
      }
    } catch (err) {
      console.error("Error loading more viewed podcasts:", err)
    } finally {
      setLoadingMore((prev) => ({ ...prev, podcasts: false }))
    }
  }, [loadingMore.podcasts, hasMore.podcasts, viewedPodcastsPage, profileData])

  // Open edit profile modal
  const openEditModal = useCallback(() => {
    if (profileData) {
      setEditName(profileData.name)
      setEditEmail(profileData.email)
      setEditAvatar(profileData.avatar || "https://picsum.photos/200")
      setIsEditModalVisible(true)
    }
  }, [profileData])

  // Close edit profile modal
  const closeEditModal = useCallback(() => {
    setIsEditModalVisible(false)
    setOtp("")
    setOtpSent(false)
    setOtpError(null)
    setIsVerifying(false)
  }, [])

  // Send OTP
  const handleSendOTP = useCallback(async () => {
    try {
      setIsVerifying(true)
      setOtpError(null)

      const success = await resendOTP(editEmail)

      if (success) {
        setOtpSent(true)
      } else {
        setOtpError("Failed to send OTP. Please try again.")
      }
    } catch (err) {
      setOtpError("An error occurred while sending OTP")
      console.error(err)
    } finally {
      setIsVerifying(false)
    }
  }, [editEmail])

  // Verify OTP
  const handleVerifyOTP = useCallback(async () => {
    try {
      setIsVerifying(true)
      setOtpError(null)

      const response = await verifyOTP(editEmail, otp)

      if (response && response.data.verifyStatus === "verified") {
        // Update profile after verification
        await handleUpdateProfile()
        closeEditModal()
      } else {
        setOtpError("Invalid OTP. Please try again.")
      }
    } catch (err) {
      setOtpError("An error occurred while verifying OTP")
      console.error(err)
    } finally {
      setIsVerifying(false)
    }
  }, [editEmail, otp, closeEditModal])

  // Update profile
  const handleUpdateProfile = useCallback(async () => {
    try {
      setIsVerifying(true)

      const updateData: UpdateUserRequest = {
        name: editName,
        avatar: editAvatar,
      }

      // const updatedUser = await updateUserProfile(updateData)

      // if (updatedUser && profileData) {
      //   setProfileData({
      //     ...profileData,
      //     user: {
      //       ...profileData.user,
      //       name: updatedUser.name,
      //       avatar: updatedUser.avatar,
      //     },
      //   })

      //   return true
      // }

      return false
    } catch (err) {
      console.error("Error updating profile:", err)
      return false
    } finally {
      setIsVerifying(false)
    }
  }, [editName, editAvatar, profileData])

  // Navigate to element detail
  const navigateToElementDetail = useCallback(
    (elementId: string) => {
      router.push(`detailelement/${elementId}` as Href)
    },
    [router],
  )

  // Navigate to podcast detail
  const navigateToPodcastDetail = useCallback(
    (podcastId: string) => {
      router.push(`detailpodcast/${podcastId}` as Href)
    },
    [router],
  )

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [])
  const handleExitAccount = () => {
    authCheck.logout().then(() => router.replace("/login"));
  };
  return {
    // Data
    profileData,
    loading,
    refreshing,
    error,

    // Edit profile
    isEditModalVisible,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editAvatar,
    setEditAvatar,
    openEditModal,
    closeEditModal,

    // OTP verification
    otp,
    setOtp,
    otpSent,
    otpError,
    isVerifying,
    handleSendOTP,
    handleVerifyOTP,

    // Pagination
    loadingMore,
    hasMore,
    loadMoreViewedElements,
    loadMoreViewedPodcasts,

    // Navigation
    navigateToElementDetail,
    navigateToPodcastDetail,
    handleExitAccount,
    // Actions
    fetchData,
    handleUpdateProfile,
  }
}

