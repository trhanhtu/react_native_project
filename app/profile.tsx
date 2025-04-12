// profile.tsx
import AccountSettingsCard from '@/src/components/AccountSettingsCard';
import EditProfileModal from '@/src/components/EditModal'; // Corrected path casing assumed
import FavoriteElementsCard from '@/src/components/FavoriteElementsCard';
import FavoritePodcastsCard from '@/src/components/FavoritePodcastsCard';
import ProfileHeader from '@/src/components/ProfileHeader';
import ViewedElementsCard from '@/src/components/ViewedElementsCard';
import ViewedPodcastsCard from '@/src/components/ViewedPodcastsCard';
import useProfile from '@/src/hooks/useProfile';

import { Button, Text } from '@ui-kitten/components';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';






const ProfileScreen: React.FC = () => {
  const tw = useTailwind()
  const {
    profileData,
    loading,
    refreshing,
    error,
    isEditModalVisible,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editAvatar,
    setEditAvatar,
    otp,
    setOtp,
    otpSent,
    otpError,
    isVerifying,
    openEditModal,
    closeEditModal,
    loadingMore,
    hasMore,
    loadMoreViewedElements,
    loadMoreViewedPodcasts,
    navigateToElementDetail,
    navigateToPodcastDetail,
    fetchData,
    handleExitAccount,
    favoriteElementList, // Assume this is now AugmentedFavoriteElement[] | null from hook
    favoritePodcastList, // Assume this is now AugmentedFavoritePodcast[] | null from hook
    handleVerifyOTPForEmailChange,
    initiateUpdateProfile,
    loadMoreFavoriteElements,
    loadMoreFavoritePodcasts,
    needsOtpVerification,
    viewedElementList, // Assume this is now AugmentedViewedElement[] | null from hook
    viewedPodcastList, // Assume this is now AugmentedViewedPodcast[] | null from hook
  } = useProfile()

  if (loading) {
    return (
      <View style={tw("flex-1 justify-center items-center bg-white/100")}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    )
  }

  if (error || !profileData) {
    return (
      <View style={tw("flex-1 justify-center items-center bg-white/100 p-4")}>
        <Text style={tw("text-red-500/100 text-lg mb-4")}>{error || "Failed to load profile data"}</Text>
        <Button onPress={() => fetchData()} style={tw("bg-purple-600/100 border-0")}>
          Retry
        </Button>
        <Button
          onPress={handleExitAccount}
          style={tw("mt-4 bg-red-500/100 border-0")}
        >
          Logout
        </Button>
      </View>
    )
  }

  return (
    <ScrollView
      style={tw("flex-1 bg-gray-100/100")} // Changed background color slightly
      contentContainerStyle={tw("pb-8")}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={["#8B5CF6"]} tintColor={"#8B5CF6"} />}
    >
      {/* Use seeded picsum URL or actual avatar */}
      <ProfileHeader
        avatar={profileData.avatar || `https://picsum.photos/seed/${profileData.name}/200`}
        name={profileData.name}
        email={profileData.email}
      />
      <View style={tw("px-4 -mt-16")}>
        <AccountSettingsCard onEdit={openEditModal} />

        {/* Pass augmented data and correct ID types */}
        <FavoriteElementsCard
          favoriteElements={favoriteElementList ?? []}
          onPressElement={(atomicNumber) => navigateToElementDetail(atomicNumber)} // Expects number
        />
        <FavoritePodcastsCard
          favoritePodcasts={favoritePodcastList ?? []}
          onPressPodcast={(id) => navigateToPodcastDetail(id)}
        />
        <ViewedElementsCard
          viewedElements={viewedElementList ?? []}
          hasMore={hasMore.elements}
          loadingMore={loadingMore.elements}
          onLoadMore={loadMoreViewedElements}
          onPressElement={(atomicNumber) => navigateToElementDetail(atomicNumber)} // Expects number
        />
        <ViewedPodcastsCard
          viewedPodcasts={viewedPodcastList ?? []}
          hasMore={hasMore.podcasts}
          loadingMore={loadingMore.podcasts}
          onLoadMore={loadMoreViewedPodcasts}
          onPressPodcast={(id) => navigateToPodcastDetail(id)}
        />

        <Button
          onPress={handleExitAccount}
          style={tw("mt-6 bg-red-500/100 border-0")} // Added margin top
        >
          {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-bold')]}>Logout</Text>}
        </Button>

      </View>

      <EditProfileModal
        visible={isEditModalVisible}
        name={editName}
        email={editEmail}
        avatar={editAvatar}
        otp={otp}
        otpSent={otpSent} // Determines if OTP input is shown
        otpError={otpError}
        isVerifying={isVerifying} // Loading state
        needsOtpVerification={needsOtpVerification} // Determines button logic (Send OTP vs Verify OTP)
        onChangeName={setEditName}
        onChangeEmail={setEditEmail}
        onChangeAvatar={setEditAvatar}
        onChangeOtp={setOtp}
        onInitiateUpdate={initiateUpdateProfile} // Renamed prop
        onVerifyOtpForEmailChange={handleVerifyOTPForEmailChange} // Renamed prop
        onClose={closeEditModal}
      />
    </ScrollView>
  )
}

export default ProfileScreen