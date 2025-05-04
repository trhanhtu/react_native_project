// Filename: profile.tsx
import { Button, Text } from '@ui-kitten/components';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

// Assuming component paths are correct
import AccountSettingsCard from '@/src/components/AccountSettingsCard'; // Might need internal translation
import EditProfileModal from '@/src/components/EditModal'; // Might need internal translation
import FavoriteElementsCard from '@/src/components/FavoriteElementsCard'; // Might need internal translation
import FavoritePodcastsCard from '@/src/components/FavoritePodcastsCard'; // Might need internal translation
import ProfileHeader from '@/src/components/ProfileHeader'; // Might need internal translation (if it adds labels)
import ViewedElementsCard from '@/src/components/ViewedElementsCard'; // Might need internal translation
import ViewedPodcastsCard from '@/src/components/ViewedPodcastsCard'; // Might need internal translation

// Assuming hook and type paths are correct
import useProfile from '@/src/hooks/useProfile';
import { ProfileData } from '@/src/utils/types';

const ProfileScreen: React.FC = () => {
  const tw = useTailwind();
  const {
    state: { profileData, loading, error, refreshing, hasMore, loadingMore, favoriteElementList, favoritePodcastList, viewedElementList, viewedPodcastList },
    fetchData,
    handleExitAccount, // Assumes this function handles the logout logic
    loadMoreViewedElements,
    loadMoreViewedPodcasts,
    navigateToElementDetail,
    navigateToPodcastDetail
  } = useProfile();

  // --- Local State for Modal Visibility ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // --- Callbacks for Modal Control ---
  const openEditModalHandler = useCallback(() => {
    // Check if profile data is loaded before trying to open the modal
    if (profileData) {
      setIsEditModalVisible(true);
    } else {
      console.warn("Cannot open edit modal: Profile data is not loaded yet.");
      // Optionally show an alert to the user here
      // Example: Alert.alert("Lỗi", "Không thể mở chỉnh sửa khi dữ liệu hồ sơ chưa tải xong.");
    }
  }, [profileData]); // Dependency: profileData ensures it exists when opening

  const closeEditModalHandler = useCallback(() => {
    setIsEditModalVisible(false);
  }, []);

  // --- Callback after successful profile update from EditModal ---
  const handleProfileUpdateSuccess = useCallback((updatedData: ProfileData) => {
    console.log("Profile updated successfully in parent screen:", updatedData);
    // Action after successful update:
    // 1. Close the modal
    closeEditModalHandler();
    // 2. Refresh the profile data to show the latest changes
    //    Using fetchData(true) forces a refresh including profileData
    fetchData(true);
    // Note: If you have more sophisticated state management (like Redux, Zustand, Jotai),
    // you might dispatch an action here instead of manually refreshing.
  }, [fetchData, closeEditModalHandler]); // Dependencies: functions called inside


  // --- Loading State ---
  // Show full screen loader only on initial load when no profile data is present yet
  if (loading && !profileData) {
    return (
      <View style={tw("flex-1 justify-center items-center bg-white/100")}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        
      </View>
    );
  }

  // --- Error State ---
  // Show error primarily if loading failed initially (no profileData)
  if (error && !profileData) {
    return (
      <View style={tw("flex-1 justify-center items-center bg-white/100 p-5")}>
        <Text style={tw("text-red-500/100 text-lg mb-4 text-center")}>
          
          {error || "Đã xảy ra lỗi khi tải hồ sơ của bạn."}
        </Text>
        
        <Button
          onPress={() => fetchData()} // Simple retry, doesn't force refresh state
          style={tw("bg-purple-600/100 border-0 w-1/2 mb-3")} // Added width/margin
          size='medium'
        >
          Thử lại 
        </Button>
        
        <Button
          onPress={handleExitAccount}
          style={tw("mt-2 bg-red-500/100 border-0 w-1/2")} // Added width/margin
          size='medium'
          status='danger' // Use status for semantic color
        >
          Đăng xuất 
        </Button>
      </View>
    );
  }

  // --- No Profile Data State ---
  // Handle the case where loading finished, there was no specific error reported,
  // but profileData is still null/undefined.
  if (!profileData) {
    return (
      <View style={tw("flex-1 justify-center items-center bg-white/100 p-5")}>
        <Text style={tw("text-gray-600/100 text-lg mb-4 text-center")}>
         
          Không thể tải dữ liệu hồ sơ. Vui lòng thử lại.
        </Text>
        <Button
          onPress={() => fetchData()}
          style={tw("bg-purple-600/100 border-0 w-1/2 mb-3")}
          size='medium'
        >
          Thử lại
        </Button>
        <Button
          onPress={handleExitAccount}
          style={tw("mt-2 bg-red-500/100 border-0 w-1/2")}
          size='medium'
          status='danger'
        >
          Đăng xuất
        </Button>
      </View>
    );
  }

  // --- Success State (Profile Data Loaded) ---
  return (
    // Using React.Fragment <> to wrap ScrollView and Modal
    <React.Fragment>
      <ScrollView
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
        style={tw("flex-1 bg-gray-100/100")} // Use a light gray background
        contentContainerStyle={tw("pb-8")} // Add padding at the bottom
        keyboardShouldPersistTaps="handled" // Better tap handling if inputs were present
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // State from hook
            onRefresh={() => fetchData(true)} // Force refresh on pull
            colors={["#8B5CF6"]} // Spinner color for Android
            tintColor={"#8B5CF6"} // Spinner color for iOS
          />
        }
      >
        
        <ProfileHeader
          // Use optional chaining and provide a fallback seed for picsum URL
          avatar={profileData.avatar || `https://picsum.photos/seed/${profileData.id || profileData.name}/200`}
          name={profileData.name}
          email={profileData.email}
        />

        
        <View style={tw("px-4 -mt-16")}>

          <AccountSettingsCard onEdit={openEditModalHandler} />

         
          <FavoriteElementsCard
            favoriteElements={favoriteElementList ?? []}
            onPressElement={navigateToElementDetail}
          />

          <FavoritePodcastsCard
            favoritePodcasts={favoritePodcastList ?? []}
            onPressPodcast={navigateToPodcastDetail}
          />

          <ViewedElementsCard
            viewedElements={viewedElementList ?? []}
            hasMore={hasMore.elements}
            loadingMore={loadingMore.elements}
            onLoadMore={loadMoreViewedElements}
            onPressElement={navigateToElementDetail}
          />

          
          <ViewedPodcastsCard
            viewedPodcasts={viewedPodcastList ?? []}
            hasMore={hasMore.podcasts}
            loadingMore={loadingMore.podcasts}
            onLoadMore={loadMoreViewedPodcasts}
            onPressPodcast={navigateToPodcastDetail}
          />

          
          <Button
            onPress={handleExitAccount}
            style={tw("mt-6 bg-red-500/100 border-0")}
            status='danger'
            size='large'
          >
            {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-bold')]}>Đăng xuất</Text>}
          </Button>

        </View>
      </ScrollView>

      
      {profileData && (
        <EditProfileModal
          visible={isEditModalVisible}
          currentProfileData={profileData}
          onClose={closeEditModalHandler}
          onProfileUpdateSuccess={handleProfileUpdateSuccess}
        />
      )}
    </React.Fragment>
  );
};

export default ProfileScreen;