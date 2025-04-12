// useProfile.ts
import {
  fetchFavoriteElements,
  fetchFavoritePodcasts,
  fetchProfileData,
  fetchViewedElements,
  fetchViewedPodcasts,
  resendOTP,
  updateUserProfile,
  verifyOTPChangeEmail
} from "@/api/api"; // Assuming api.ts exports all necessary functions
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import authCheck from "../utils/authCheck"; // Assuming this utility exists and wraps logout
import {
  ApiResponse, // Corrected type import
  FavoriteElement_t, // Added import
  FavoritePodcast_t,
  ProfileData,
  UpdateUserRequest, // Added import
  VerifyOTPRequest, // Added import for clarity
  VerifyOTPResponse,
  ViewedElement_t,
  ViewedPodcast_t, // Corrected type import
} from "../utils/types"; // Assuming types.ts exports all necessary types

export default function useProfile() {
  const router = useRouter()

  // State
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [viewedElementList, setViewedElementList] = useState<ViewedElement_t[] | null>(null)
  const [viewedPodcastList, setViewedPodcastList] = useState<ViewedPodcast_t[] | null>(null) // Corrected type
  const [favoriteElementList, setFavoriteElementList] = useState<FavoriteElement_t[] | null>(null) // Added state
  const [favoritePodcastList, setFavoritePodcastList] = useState<FavoritePodcast_t[] | null>(null) // Added state
  const [error, setError] = useState<string | null>(null)

  // Edit profile modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false)
  const [editName, setEditName] = useState<string>("")
  const [editEmail, setEditEmail] = useState<string>("") // Keep original email for OTP verification context if needed
  const [originalEmail, setOriginalEmail] = useState<string>("") // Store original email
  const [editAvatar, setEditAvatar] = useState<string>("")

  // OTP verification state (assuming only for email change verification now based on handleVerifyOTP call)
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [otp, setOtp] = useState<string>("")
  const [otpSent, setOtpSent] = useState<boolean>(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [needsOtpVerification, setNeedsOtpVerification] = useState<boolean>(false)

  // Pagination state
  const [viewedElementsPage, setViewedElementsPage] = useState<number>(1)
  const [viewedPodcastsPage, setViewedPodcastsPage] = useState<number>(1)
  const [favoriteElementsPage, setFavoriteElementsPage] = useState<number>(1) // Added state
  const [favoritePodcastsPage, setFavoritePodcastsPage] = useState<number>(1) // Added state

  const [loadingMore, setLoadingMore] = useState<{
    elements: boolean
    podcasts: boolean
    favElements: boolean // Added state
    favPodcasts: boolean // Added state
  }>({ elements: false, podcasts: false, favElements: false, favPodcasts: false })

  const [hasMore, setHasMore] = useState<{
    elements: boolean
    podcasts: boolean
    favElements: boolean // Added state
    favPodcasts: boolean // Added state
  }>({ elements: true, podcasts: true, favElements: true, favPodcasts: true })

  // Fetch initial data
  const fetchData = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true)
        // Reset pagination on refresh
        setViewedElementsPage(1)
        setViewedPodcastsPage(1)
        setFavoriteElementsPage(1)
        setFavoritePodcastsPage(1)
        setHasMore({ elements: true, podcasts: true, favElements: true, favPodcasts: true })
        setViewedElementList(null) // Clear lists on refresh for cleaner loading state
        setViewedPodcastList(null)
        setFavoriteElementList(null)
        setFavoritePodcastList(null)
      } else if (!profileData) {
        // Only show initial loading spinner if no data exists yet
        setLoading(true)
      }
      setError(null) // Clear previous errors

      try {
        // Fetch all data concurrently
        const [pdata, viewedElementsRes, viewedPodcastsRes, favoriteElementsRes, favoritePodcastsRes] =
          await Promise.all([
            fetchProfileData(),
            fetchViewedElements(1, 5), // Fetch first page
            fetchViewedPodcasts(1, 5), // Fetch first page
            fetchFavoriteElements(1, 5), // Fetch first page
            fetchFavoritePodcasts(1, 5), // Fetch first page
          ])

        // Process Profile Data
        if (pdata) {
          setProfileData(pdata)
          setEditName(pdata.name)
          setEditEmail(pdata.email)
          setOriginalEmail(pdata.email) // Store original email
          setEditAvatar(pdata.avatar || `https://picsum.photos/seed/${pdata.id || pdata.name}/200`) // Use ID or name for seed
        } else {
          setError("Failed to fetch profile data.")
        }

        // Process Viewed Elements
        if (viewedElementsRes?.result) {
          setViewedElementList(viewedElementsRes.result)
          setHasMore((prev) => ({ ...prev, elements: viewedElementsRes.meta.current < viewedElementsRes.meta.totalPages }))
        } else {
           setViewedElementList([]) // Set to empty array if fetch failed or returned no data
           setHasMore(prev => ({...prev, elements: false}));
           // Optionally set an error if needed: setError(prev => prev + " Failed to fetch viewed elements.");
        }

        // Process Viewed Podcasts
        if (viewedPodcastsRes?.result) {
          setViewedPodcastList(viewedPodcastsRes.result)
          setHasMore((prev) => ({ ...prev, podcasts: viewedPodcastsRes.meta.current < viewedPodcastsRes.meta.totalPages }))
        } else {
          setViewedPodcastList([]) // Set to empty array
          setHasMore(prev => ({...prev, podcasts: false}));
          // Optionally set an error: setError(prev => prev + " Failed to fetch viewed podcasts.");
        }

         // Process Favorite Elements
         if (favoriteElementsRes?.result) {
          setFavoriteElementList(favoriteElementsRes.result);
          setHasMore(prev => ({ ...prev, favElements: favoriteElementsRes.meta.current < favoriteElementsRes.meta.totalPages }));
        } else {
          setFavoriteElementList([]);
          setHasMore(prev => ({ ...prev, favElements: false }));
        }

        // Process Favorite Podcasts
        if (favoritePodcastsRes?.result) {
          setFavoritePodcastList(favoritePodcastsRes.result);
          setHasMore(prev => ({ ...prev, favPodcasts: favoritePodcastsRes.meta.current < favoritePodcastsRes.meta.totalPages }));
        } else {
          setFavoritePodcastList([]);
          setHasMore(prev => ({ ...prev, favPodcasts: false }));
        }


      } catch (err: any) {
        setError("An error occurred while fetching data.")
        console.error("fetchData error:", err)
        // Ensure lists are at least empty arrays on error
        if (!viewedElementList) setViewedElementList([]);
        if (!viewedPodcastList) setViewedPodcastList([]);
        if (!favoriteElementList) setFavoriteElementList([]);
        if (!favoritePodcastList) setFavoritePodcastList([]);
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [profileData], // Dependency includes profileData to trigger re-check loading state correctly
  )

  // --- Load More Functions ---

  const loadMoreViewedElements = useCallback(async () => {
    if (loadingMore.elements || !hasMore.elements) return

    setLoadingMore((prev) => ({ ...prev, elements: true }))
    const nextPage = viewedElementsPage + 1
    try {
      const response = await fetchViewedElements(nextPage, 5)
      if (response?.result) {
         setViewedElementList((prev) => [...(prev ?? []), ...response.result])
         setViewedElementsPage(nextPage)
         setHasMore((prev) => ({ ...prev, elements: response.meta.current < response.meta.totalPages }))
      } else {
        setHasMore((prev) => ({ ...prev, elements: false })) // Stop trying if API fails or returns null/empty
         // Optionally set an error specific to loading more
         console.error("Failed to load more viewed elements");
      }
    } catch (err) {
        console.error("Error loading more viewed elements:", err);
        // Optionally set a general error state
        // setError("Failed to load more viewed elements.");
        setHasMore((prev) => ({ ...prev, elements: false })); // Stop trying on error
    } finally {
      setLoadingMore((prev) => ({ ...prev, elements: false }))
    }
  }, [
    loadingMore.elements,
    hasMore.elements,
    viewedElementsPage,
    viewedElementList, // Add list as dependency for correct appending
  ])

  const loadMoreViewedPodcasts = useCallback(async () => {
    if (loadingMore.podcasts || !hasMore.podcasts) return

    setLoadingMore((prev) => ({ ...prev, podcasts: true }))
    const nextPage = viewedPodcastsPage + 1
    try {
        const response = await fetchViewedPodcasts(nextPage, 5)
        if (response?.result) {
          setViewedPodcastList((prev) => [...(prev ?? []), ...response.result])
          setViewedPodcastsPage(nextPage)
          setHasMore((prev) => ({ ...prev, podcasts: response.meta.current < response.meta.totalPages }))
        } else {
          setHasMore((prev) => ({ ...prev, podcasts: false }))
          console.error("Failed to load more viewed podcasts");
        }
    } catch (err) {
        console.error("Error loading more viewed podcasts:", err);
        setHasMore((prev) => ({ ...prev, podcasts: false }));
    } finally {
      setLoadingMore((prev) => ({ ...prev, podcasts: false }))
    }
  }, [
    loadingMore.podcasts,
    hasMore.podcasts,
    viewedPodcastsPage,
    viewedPodcastList, // Add list as dependency
  ])

  const loadMoreFavoriteElements = useCallback(async () => {
    if (loadingMore.favElements || !hasMore.favElements) return;

    setLoadingMore(prev => ({ ...prev, favElements: true }));
    const nextPage = favoriteElementsPage + 1;
    try {
        const response = await fetchFavoriteElements(nextPage, 5);
        if (response?.result) {
            setFavoriteElementList(prev => [...(prev ?? []), ...response.result]);
            setFavoriteElementsPage(nextPage);
            setHasMore(prev => ({ ...prev, favElements: response.meta.current < response.meta.totalPages }));
        } else {
            setHasMore(prev => ({ ...prev, favElements: false }));
            console.error("Failed to load more favorite elements");
        }
    } catch (err) {
        console.error("Error loading more favorite elements:", err);
        setHasMore(prev => ({ ...prev, favElements: false }));
    } finally {
        setLoadingMore(prev => ({ ...prev, favElements: false }));
    }
  }, [loadingMore.favElements, hasMore.favElements, favoriteElementsPage, favoriteElementList]);

  const loadMoreFavoritePodcasts = useCallback(async () => {
    if (loadingMore.favPodcasts || !hasMore.favPodcasts) return;

    setLoadingMore(prev => ({ ...prev, favPodcasts: true }));
    const nextPage = favoritePodcastsPage + 1;
     try {
        const response = await fetchFavoritePodcasts(nextPage, 5);
        if (response?.result) {
            setFavoritePodcastList(prev => [...(prev ?? []), ...response.result]);
            setFavoritePodcastsPage(nextPage);
            setHasMore(prev => ({ ...prev, favPodcasts: response.meta.current < response.meta.totalPages }));
        } else {
            setHasMore(prev => ({ ...prev, favPodcasts: false }));
            console.error("Failed to load more favorite podcasts");
        }
    } catch (err) {
        console.error("Error loading more favorite podcasts:", err);
        setHasMore(prev => ({ ...prev, favPodcasts: false }));
    } finally {
        setLoadingMore(prev => ({ ...prev, favPodcasts: false }));
    }
  }, [loadingMore.favPodcasts, hasMore.favPodcasts, favoritePodcastsPage, favoritePodcastList]);


  // --- Edit Profile Modal Logic ---

  const openEditModal = useCallback(() => {
    if (profileData) {
      setEditName(profileData.name)
      setEditEmail(profileData.email)
      setOriginalEmail(profileData.email) // Ensure original email is set when opening
      setEditAvatar(profileData.avatar || `https://picsum.photos/seed/${profileData.id || profileData.name}/200`)
      setNeedsOtpVerification(false) // Reset OTP requirement
      setOtpSent(false) // Reset OTP sent status
      setOtp("")
      setOtpError(null)
      setIsEditModalVisible(true)
    } else {
      setError("Cannot edit profile: Profile data not loaded.")
    }
  }, [profileData])

  const closeEditModal = useCallback(() => {
    setIsEditModalVisible(false)
    setOtp("")
    setOtpSent(false)
    setOtpError(null)
    setIsVerifying(false)
    setNeedsOtpVerification(false)
    // Optional: Reset edit fields to profileData if desired
    // if (profileData) {
    //   setEditName(profileData.name);
    //   setEditEmail(profileData.email);
    //   setEditAvatar(profileData.avatar || `https://picsum.photos/seed/${profileData.id || profileData.name}/200`);
    // }
  }, [])




  // Send OTP specifically for email change
  const handleSendOTPForEmailChange = useCallback(async () => {
    //MISSING: API endpoint for sending OTP for *changing* email?
    // Current `resendOTP` seems generic. Assuming it can be used, but might need a dedicated endpoint.
    // Using `resendOTP` for now. Need to target the *new* email (`editEmail`).
    setIsVerifying(true)
    setOtpError(null)
    setOtpSent(false)
    try {
      // We need an API call that sends OTP to the *new* email address for verification
      // Let's assume `resendOTP` can handle this or a similar function exists, e.g., `sendChangeEmailOTP`
      // If using resendOTP, it might be intended for *existing* email verification.
      // For now, we proceed assuming resendOTP works for the new email.
      const result: ApiResponse<any> | null = await resendOTP(editEmail) // Send to NEW email

      if (result && result.statusCode >= 200 && result.statusCode < 300) {
         // Check statusCode for success from ApiResponse
        setOtpSent(true)
        // Keep modal open, waiting for OTP input
      } else {
        // Handle specific API error message if available
        setOtpError(result?.message || result?.error || "Failed to send OTP to the new email. Please try again.")
        setOtpSent(false) // Ensure otpSent is false on failure
      }
    } catch (err: any) {
      setOtpError("An error occurred while sending OTP.")
      console.error("Send OTP error:", err)
      setOtpSent(false)
    } finally {
      setIsVerifying(false)
    }
  }, [editEmail]) // Depends only on the new email

  // Update profile - called directly or after OTP verification
  const handleUpdateProfile = useCallback(async (otpVerified: boolean) => {
    // Note: The backend PUT /users might handle email change *itself* after OTP verification is done separately.
    // Or, the PUT request might need the OTP as part of its payload if email is changing.
    // Assuming the PUT /users only updates name/avatar for now, as email change verification is separate.
    // If PUT /users *also* changes email, it might need adjustment.

    setIsVerifying(true) // Show loading state during update
    let success = false;
    try {
      const updateData: UpdateUserRequest = {
        name: editName,
        avatar: editAvatar,
        // Do NOT include email here unless the PUT endpoint specifically handles it
        // And if it does, it might require the OTP again, which complicates things.
        // Safest assumption: email change is confirmed by verifyOTPChangeEmail,
        // and this PUT only handles other fields.
      }

      const updatedProfileData = await updateUserProfile(updateData)

      if (updatedProfileData) {
        setProfileData(updatedProfileData) // Update local state with response
        // Update edit fields to reflect saved state
        setEditName(updatedProfileData.name)
        setEditEmail(updatedProfileData.email) // Email *might* have been updated by backend implicitly
        setOriginalEmail(updatedProfileData.email) // Update original email baseline
        setEditAvatar(updatedProfileData.avatar || `https://picsum.photos/seed/${updatedProfileData.id || updatedProfileData.name}/200`)
        success = true;
        closeEditModal() // Close modal on success
      } else {
         setError("Failed to update profile. Please try again.")
      }
    } catch (err: any) {
      setError("An error occurred while updating profile.")
      console.error("Error updating profile:", err)
    } finally {
      setIsVerifying(false)
    }
    return success; // Indicate success/failure
  }, [editName, editAvatar, closeEditModal]) // Removed profileData dependency, uses fresh data from API

  // Verify OTP after email change request
  const handleVerifyOTPForEmailChange = useCallback(async () => {
    //MISSING: API endpoint for verifying OTP for *changing* email?
    // `verifyOTP` is generic. `verifyOTPChangeEmail` exists in api-raw.txt. Let's use that.
    if (!otp) {
      setOtpError("Please enter the OTP.")
      return
    }
    setIsVerifying(true)
    setOtpError(null)
    try {
      const requestData: VerifyOTPRequest = { email: editEmail, otp } // Verify the NEW email
      const response: VerifyOTPResponse | null = await verifyOTPChangeEmail(requestData) // Use specific API

      if (response !== null && response.verifyStatus === "success") { // Check response structure
        // OTP verified for new email, now proceed with the actual profile update
        await handleUpdateProfile(true); // Pass true indicating OTP was verified
      } else {
         setOtpError("Invalid OTP or verification failed. Please try again.")
      }
    } catch (err: any) {
      setOtpError("An error occurred while verifying OTP.")
      console.error("Verify OTP error:", err)
    } finally {
      setIsVerifying(false)
    }
  }, [editEmail, otp, handleUpdateProfile]) // Depends on new email, OTP, and the update function



  // Decide if update needs OTP (if email changed) and trigger OTP or direct update
  const initiateUpdateProfile = useCallback(async () => {
    if (!profileData) {
      setError("Cannot update profile: Profile data not loaded.")
      return
    }

    const emailChanged = editEmail !== originalEmail;
    setNeedsOtpVerification(emailChanged);

    if (emailChanged) {
      // Email changed, need to send OTP first
      await handleSendOTPForEmailChange();
    } else {
      // Email didn't change, update directly
      await handleUpdateProfile(false); // Pass false indicating no OTP was needed/verified
    }
  }, [editEmail, originalEmail, profileData, handleSendOTPForEmailChange, handleUpdateProfile]);
  // --- Navigation ---

  const navigateToElementDetail = useCallback(
    // Assuming atomicNumber is the identifier for the route
    (atomicNumber: number) => {
      router.push(`/detailelement/${atomicNumber}` as Href)
    },
    [router],
  )

  const navigateToPodcastDetail = useCallback(
    (podcastId: number) => {
      router.push(`/detailpodcast/${podcastId}` as Href)
    },
    [router],
  )

  // --- Logout ---
  const handleExitAccount = useCallback(() => {
      setLoading(true); // Show loading indicator during logout
      authCheck.logout().then(() => {
              router.replace("/login");
      }).catch(err => {
          setError("An error occurred during logout.");
          console.error("Logout error:", err);
      }).finally(() => {
         setLoading(false);
      });
  }, [router]); // Added router as dependency


  // Initial data fetch on mount
  useEffect(() => {
    fetchData()
  }, [fetchData]) // fetchData is memoized, safe dependency

  return {
    // Data
    profileData,
    viewedElementList,
    viewedPodcastList,
    favoriteElementList,
    favoritePodcastList,
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
    initiateUpdateProfile, // Use this to start the update process

    // OTP verification (primarily for email change flow now)
    otp,
    setOtp,
    otpSent, // Indicates if OTP has been *sent* for email change
    otpError,
    isVerifying, // General loading state for OTP/Update actions
    needsOtpVerification, // Flag indicating UI should show OTP input
    // handleSendOTP, // Renamed/refactored into initiateUpdateProfile/handleSendOTPForEmailChange
    handleVerifyOTPForEmailChange, // Use this when user submits OTP for email change

    // Pagination
    loadingMore,
    hasMore,
    loadMoreViewedElements,
    loadMoreViewedPodcasts,
    loadMoreFavoriteElements, // Added
    loadMoreFavoritePodcasts, // Added

    // Navigation
    navigateToElementDetail,
    navigateToPodcastDetail,

    // Actions
    fetchData, // Expose for pull-to-refresh
    handleExitAccount,
    // handleUpdateProfile, // Not typically exposed directly, use initiateUpdateProfile
  }
}

// --- MISSING API Calls mentioned in comments above ---
// - Need clarification on API for sending OTP for *changing* email (used resendOTP as placeholder).
// - `verifyOTPChangeEmail` exists and is now used.
// - Need confirmation if PUT /users endpoint handles email change implicitly or requires OTP/specific handling. Assumed it does *not* change email directly for now.