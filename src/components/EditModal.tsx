// EditModal.tsx (Full Code using React Native Modal and Internal Hook)

import { Button, Input, Text } from "@ui-kitten/components"; // Keep using other UI Kitten components
import * as ImagePicker from 'expo-image-picker';
import React, { FC, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal, // Import for keyboard handling
  ScrollView,
  StyleSheet, // Import React Native's Modal
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTailwind } from "tailwind-rn";

// Assuming paths are correct for utils, hooks and types
import useEditProfile from "../hooks/useEditProfile"; // Import the hook that handles state and API calls
import { ProfileData } from "../utils/types";

// Props interface: Controls visibility and communication with the parent screen
interface EditProfileModalProps {
  visible: boolean; // Is the modal currently visible? (Controlled by parent)
  currentProfileData: ProfileData | null; // Initial data to populate the form
  onClose: () => void; // Function to call when the modal should close (Cancel or Backdrop)
  onProfileUpdateSuccess: (updatedProfileData: ProfileData) => void; // Function to call after successful save
}

const EditModal: FC<EditProfileModalProps> = ({
  visible,
  currentProfileData,
  onClose,
  onProfileUpdateSuccess,
}) => {
  const tw = useTailwind();

  // --- Internal Hook Usage ---
  // The modal manages its edit state entirely via this hook.
  const {
    state: {
      isVerifying, // Generic loading flag for any API call
      isSendingOtp, // Specific flags to potentially customize loading text/indicators
      isVerifyingOtp,
      isUpdatingProfile,
      isUploadingAvatar, // Get upload status
      updateError, // Error specifically from PUT /users API
      otpError,    // Error specifically from OTP send/verify APIs
      uploadError, // Error specifically from Cloudinary upload
      editName,
      editEmail,
      editAvatar, // Holds the *current* public URL (or original)
      localAvatarUri, // Holds the *newly picked* local URI, pending upload
      otp,
      otpSent,     // True if OTP has been successfully sent for the current editEmail
      needsOtpVerification, // True if editEmail is different from the original email
      hasInitialized, // Flag from hook to know if initial data has been set
    },
    // Actions:
    initializeFields, // Call when modal opens with data
    resetState,       // Call when modal closes
    setName,
    setEmail,
    setLocalAvatarUri, // Use the action that sets the local URI state
    setOtp,
    handleSaveChanges, // The single action handler for the primary button
    clearOtpError,     // Optional: Allow manually clearing errors
    clearUpdateError,
    clearUploadError,
  } = useEditProfile({ onProfileUpdateSuccess }); // Pass the success callback


  // --- Initialize/Reset Hook State based on Modal Visibility ---
  useEffect(() => {
    if (visible && currentProfileData && !hasInitialized) {
      // When modal becomes visible and has data, initialize the hook's state
      initializeFields(currentProfileData);
    } else if (!visible && hasInitialized) {
      // When modal closes after being initialized, reset the hook's state
      // This ensures fresh state next time it opens
      resetState();
    }
  }, [visible, currentProfileData, initializeFields, resetState, hasInitialized]);


  // --- Button Text and State Determination ---
  let primaryButtonText = "Save Changes";
  let loadingText = "Saving..."; // Default loading text

  // Determine button text based on the required action
  if (needsOtpVerification) {
    if (otpSent) {
      primaryButtonText = "Verify & Save";
      if (isVerifyingOtp) loadingText = "Verifying...";
    } else {
      primaryButtonText = "Send OTP & Save";
      if (isSendingOtp) loadingText = "Sending OTP...";
    }
  } else {
    // Show "Saving..." if either the profile update API or the avatar upload is running
    if (isUpdatingProfile || isUploadingAvatar) loadingText = "Saving...";
  }

  // If any operation is in progress, show the appropriate loading text
  if (isVerifying) { // isVerifying is the generic flag covering all async operations
    primaryButtonText = loadingText;
  }

  // Determine if the primary save button should be disabled
  const isSaveButtonDisabled =
    isVerifying || // Disable if any API call is running
    (needsOtpVerification && otpSent && (!otp || otp.length !== 6)); // Disable if OTP needed but invalid


  // --- Image Picker Logic ---
  const pickImage = useCallback(async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change the avatar.');
      return;
    }

    // Launch picker
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Allow user to crop/edit
        aspect: [1, 1],      // Enforce square aspect ratio
        quality: 0.8,        // Compress image
        base64: false,       // Explicitly request file URI
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        // Check if we actually got a file URI (sanity check)
        if (pickedUri && typeof pickedUri === 'string' && pickedUri.startsWith('file://')) {
          console.log("Image Picker success, got file URI:", pickedUri);
          setLocalAvatarUri(pickedUri); // Update state via hook action with the file URI
        } else {
          console.warn("Image picker did not return a valid file URI:", pickedUri);
          // Fallback or error handling - maybe try the ImageManipulator workaround here if needed
          Alert.alert('Image Error', 'Could not get a valid image file path. Please try again.');
          // setLocalAvatarUri(null); // Clear any previous selection maybe?
        }
      }
    } catch (error) {
      console.error("Image Picker Error:", error);
      Alert.alert('Image Error', 'Could not select image.');
    }
  }, [setLocalAvatarUri]); // Dependency is the stable setLocalAvatarUri action


  // --- Determine which Avatar URI to display in preview ---
  // Prioritize showing the newly picked local image, fall back to the current 'saved' URL
  const avatarSourceUri = localAvatarUri || editAvatar;


  // --- Handle Backdrop Press ---
  const handleBackdropPress = () => {
    // Only allow closing via backdrop if not currently verifying/saving/uploading
    if (!isVerifying) {
      onClose(); // Call parent's close handler
    }
  };

  // --- Conditional Rendering ---
  // Don't render anything if parent has set visible to false
  if (!visible) {
    return null;
  }

  // Show a minimal loading state if the modal is visible but the hook hasn't initialized
  if (!hasInitialized) {
    return (
      <RNModal visible={true} transparent={true} animationType="fade">
        <View style={styles.loadingBackdrop}>
          {/* Optional: Add a slightly more informative loading indicator */}
          <View style={tw("bg-white/100 p-4 rounded-lg items-center")}>
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text category='c1' style={tw("mt-2 text-gray-600/100")}>Loading...</Text>
          </View>
        </View>
      </RNModal>
    );
  }

  // --- Main Render Output ---
  return (
    <RNModal
      animationType="fade" // Or "slide"
      transparent={true} // Essential for custom background/styling
      visible={visible} // Controlled by parent prop
      onRequestClose={handleBackdropPress} // Handle Android back button press
      statusBarTranslucent={true} // Optional: Allow content potentially under status bar if needed
    >
      {/* Backdrop Container: Touchable for dismissal */}
      <TouchableWithoutFeedback onPress={handleBackdropPress} accessible={false}>
        <View style={styles.modalBackdrop}>

          {/* Keyboard Avoiding Wrapper: Adjusts view when keyboard appears */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined} // 'height' might be okay too
            style={tw("w-full items-center")} // Center content horizontally
          // keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Optional offset adjustment
          >
            {/* Prevent backdrop press from closing when tapping inside content */}
            <TouchableOpacity activeOpacity={1} style={[tw("bg-white/100 rounded-xl w-11/12 max-w-md overflow-hidden"), styles.modalContentShadow]}>
              {/* ScrollView for Content: Handles varying content height & keyboard */}
              <ScrollView
                style={tw("max-h-[85vh]")} // Limit max height relative to viewport height
                contentContainerStyle={tw("p-5")} // Padding inside the scrollable area
                keyboardShouldPersistTaps="handled" // Better tap handling within scrollview
              >

                {/* --- Modal Header --- */}
                <Text category='h6' style={tw("mb-6 text-center text-purple-600/100 font-bold")}>Edit Profile</Text>

                {/* --- Input Fields (using UI Kitten Input) --- */}
                <View style={tw("mb-4")}>
                  <Text category='label' style={tw("mb-1 text-gray-700/100")}>Name</Text>
                  <Input
                    value={editName}
                    onChangeText={setName}
                    placeholder="Your name"
                    style={tw("bg-gray-100/100 rounded-lg border-gray-300/100")}
                    textStyle={tw('text-gray-900/100')}
                    disabled={isVerifying}
                  // accessibilityLabel="Name Input"
                  />
                </View>

                <View style={tw("mb-4")}>
                  <Text category='label' style={tw("mb-1 text-gray-700/100")}>Email</Text>
                  <Input
                    value={editEmail}
                    onChangeText={setEmail}
                    placeholder="Your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={tw("bg-gray-100/100 rounded-lg border-gray-300/100")}
                    textStyle={tw('text-gray-900/100')}
                    disabled={isVerifying || (needsOtpVerification && otpSent)} // Disable email input once OTP sent for it
                  // accessibilityLabel="Email Input"
                  />
                  {/* Informational text about email change */}
                  {needsOtpVerification && !otpSent && !isVerifying && (
                    <Text category='c1' style={tw("text-blue-600/100 mt-1")}>
                      Changing email requires verification. Click "{primaryButtonText}" to proceed.
                    </Text>
                  )}
                </View>

                {/* --- Avatar Section --- */}
                <View style={tw("mb-4")}>
                  <Text category='label' style={tw("mb-1 text-gray-700/100")}>Avatar</Text>
                  <View style={tw("flex-row items-center")}>
                    <Button
                      appearance="ghost" status="primary" size="small"
                      onPress={pickImage}
                      disabled={isVerifying}
                      style={tw("p-0 m-0 mr-3")}
                    // accessibilityLabel="Change Avatar Button"
                    >
                      Change Image
                    </Button>
                    {/* Avatar Preview Area */}
                    <View style={styles.avatarContainer}>
                      {/* Display the appropriate image source */}
                      {avatarSourceUri ? (
                        <Image source={{ uri: avatarSourceUri }} style={styles.avatarPreview} accessibilityIgnoresInvertColors />
                      ) : (
                        <View style={[tw("bg-gray-200/100"), styles.avatarPreview]} /> // Placeholder
                      )}
                      {/* Show spinner overlay while uploading new avatar */}
                      {isUploadingAvatar && (
                        <View style={styles.avatarOverlay}>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </View>
                  {/* Display Upload Error */}
                  {uploadError && (
                    <Text category='c1' status='danger' style={tw("mt-1")}>
                      {uploadError}
                    </Text>
                  )}
                </View>

                {/* --- OTP Input Section (Conditional) --- */}
                {/* Show only if email requires OTP AND OTP has been successfully sent */}
                {needsOtpVerification && otpSent && (
                  <View style={tw("mb-4 p-3 bg-purple-50/100 rounded-lg border border-purple-200/100")}>
                    <Text category='s2' style={tw("mb-1 text-purple-800/100 font-semibold")}>Enter OTP</Text>
                    <Text category='c1' style={tw("text-purple-700/100 mb-2")}>
                      An OTP was sent to {editEmail}. Please check your email inbox and spam folder.
                    </Text>
                    <Input
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="6-digit OTP"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={tw("bg-white/100 rounded-lg border-purple-300/100")}
                      textStyle={tw('text-gray-900/100 text-center tracking-widest text-lg')}
                      disabled={isVerifying} // Disable while any action is running
                      status={otpError ? 'danger' : 'basic'} // Highlight border if OTP error
                      // Show error message directly below input using caption
                      caption={otpError ? () => <Text category='c1' status='danger' style={tw("mt-1")}>{otpError}</Text> : undefined}
                    // accessibilityLabel="OTP Input"
                    />
                  </View>
                )}

                {/* --- General Update Error Display --- */}
                {/* Show general update error only if it exists and there are no specific OTP or Upload errors */}
                {updateError && !otpError && !uploadError && (
                  <Text category='c1' status='danger' style={tw("text-center mt-1 mb-3")}>
                    {updateError}
                  </Text>
                )}

                {/* --- Action Buttons (using UI Kitten Button) --- */}
                <View style={tw("flex-row justify-end mt-4 pt-3 border-t border-gray-200/100")}>
                  {/* Cancel Button */}
                  <Button
                    appearance='ghost' // Less prominent styling
                    status='basic' // Neutral color
                    style={tw("mr-2")}
                    onPress={onClose} // Use the callback prop from parent
                    disabled={isVerifying} // Disable while any action is running
                  // accessibilityLabel="Cancel Button"
                  >
                    Cancel
                  </Button>
                  {/* Primary Action Button (Save / Send OTP / Verify OTP) */}
                  <Button
                    style={tw("bg-purple-600/100 border-0 min-w-[120px]")} // Ensure minimum width
                    onPress={handleSaveChanges} // Call the central action handler from the hook
                    disabled={isSaveButtonDisabled} // Use calculated disabled state
                    // Show spinner if any relevant action is in progress
                    accessoryLeft={isVerifying
                      ? () => <ActivityIndicator style={tw("mr-2")} color={"#FFFFFF"} size="small" />
                      : undefined
                    }
                  // accessibilityLabel={`Primary action button: ${primaryButtonText}`}
                  >
                    {/* Button text dynamically changes based on state */}
                    {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-semibold')]}>{primaryButtonText}</Text>}
                  </Button>
                </View>

              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>

        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

// Styles using StyleSheet for things potentially harder with Tailwind or for clarity
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)", // Semi-transparent backdrop
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  modalContentShadow: { // Apply shadow using StyleSheet for potentially better control
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8, // for Android
  },
  avatarContainer: { // Container for positioning overlay spinner
    position: 'relative',
    marginLeft: 8,
  },
  avatarPreview: {
    width: 48, // Slightly larger preview
    height: 48,
    borderRadius: 24, // Keep it circular
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)", // Subtle border
  },
  avatarOverlay: { // Style for spinner overlay when uploading avatar
    ...StyleSheet.absoluteFillObject, // Cover the container
    backgroundColor: 'rgba(0,0,0,0.4)', // Dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24, // Match preview rounding
  },
  loadingBackdrop: { // Style for the simple loading indicator shown before initialization
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditModal;