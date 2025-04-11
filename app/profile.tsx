import AccountSettingsCard from '@/src/components/AccountSettingsCard'
import EditProfileModal from '@/src/components/EditModal'
import FavoriteElementsCard from '@/src/components/FavoriteElementsCard'
import FavoritePodcastsCard from '@/src/components/FavoritePodcastsCard'
import ProfileHeader from '@/src/components/ProfileHeader'
import ViewedElementsCard from '@/src/components/ViewedElementsCard'
import ViewedPodcastsCard from '@/src/components/ViewedPodcastsCard'
import useProfile from '@/src/hooks/useProfile'
import { Button, Text } from '@ui-kitten/components'
import React from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native'
import { useTailwind } from 'tailwind-rn'

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
    handleSendOTP,
    handleVerifyOTP,
    loadingMore,
    hasMore,
    loadMoreViewedElements,
    loadMoreViewedPodcasts,
    navigateToElementDetail,
    navigateToPodcastDetail,
    fetchData,
    handleExitAccount,
  } = useProfile()

  if (loading) {
    return (
      <View style={tw("flex-1 justify-center items-center bg-white")}>
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
        {/* Logout Button - Nút đăng xuất */}
        <Button
          onPress={handleExitAccount}
          style={tw("mt-4 bg-red-500/100 border-0")}
        >
          Logout
        </Button>
      </View>
    )
  }

  // Destructure profile-related arrays
  const { favoriteElements, favoritePodcasts, viewedElements, viewedPodcasts } = profileData

  return (
    <ScrollView
      style={tw("flex-1 bg-gray-200/100")}
      contentContainerStyle={tw("pb-8")}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />}
    >
      <ProfileHeader avatar={profileData.avatar || "https://picsum.photos/200"} name={profileData.name} email={profileData.email} />
      <View style={tw("px-4 -mt-16")}>
        <AccountSettingsCard onEdit={openEditModal} />
        <FavoriteElementsCard
          favoriteElements={favoriteElements}
          onPressElement={(atomicNumber) => navigateToElementDetail(atomicNumber)}
        />
        <FavoritePodcastsCard
          favoritePodcasts={favoritePodcasts}
          onPressPodcast={(id) => navigateToPodcastDetail(id)}
        />
        <ViewedElementsCard
          viewedElements={viewedElements}
          hasMore={hasMore.elements}
          loadingMore={loadingMore.elements}
          onLoadMore={loadMoreViewedElements}
          onPressElement={(atomicNumber) => navigateToElementDetail(atomicNumber)}
        />
        <ViewedPodcastsCard
          viewedPodcasts={viewedPodcasts}
          hasMore={hasMore.podcasts}
          loadingMore={loadingMore.podcasts}
          onLoadMore={loadMoreViewedPodcasts}
          onPressPodcast={(id) => navigateToPodcastDetail(id)}
        />
        {/* Logout Button - Nút đăng xuất */}
        <Button
          onPress={handleExitAccount}
          style={tw("mt-4 bg-red-500/100 border-0")}
        >
          Logout
        </Button>

      </View>
      <EditProfileModal
        visible={isEditModalVisible}
        name={editName}
        email={editEmail}
        avatar={editAvatar}
        otp={otp}
        otpSent={otpSent}
        otpError={otpError}
        isVerifying={isVerifying}
        onChangeName={setEditName}
        onChangeEmail={setEditEmail}
        onChangeAvatar={setEditAvatar}
        onChangeOtp={setOtp}
        onSendOtp={handleSendOTP}
        onVerifyOtp={handleVerifyOTP}
        onClose={closeEditModal}
      />
    </ScrollView>
  )
}

export default ProfileScreen
