// EditModal.tsx (Updated for Cloudinary Upload)
import { Button, Card, Input, Modal, Text } from "@ui-kitten/components";
import * as ImagePicker from 'expo-image-picker';
import React, { FC, useCallback, useEffect } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, View } from 'react-native';
import { useTailwind } from "tailwind-rn";

import useEditProfile from '../hooks/useEditProfile';
import CustomStyles from "../utils/styles";
import { ProfileData } from "../utils/types";

interface EditProfileModalProps {
  visible: boolean;
  currentProfileData: ProfileData | null;
  onClose: () => void;
  onProfileUpdateSuccess: (updatedProfileData: ProfileData) => void;
}

const EditModal: FC<EditProfileModalProps> = ({
  visible,
  currentProfileData,
  onClose,
  onProfileUpdateSuccess,
}) => {
  const tw = useTailwind();

  const {
    // State:
    state: {
      hasInitialized,
      needsOtpVerification,
      isVerifying, isVerifyingOtp, isSendingOtp, isUpdatingProfile, isUploadingAvatar,
      editName, editEmail, editAvatar, localAvatarUri, otpSent, otp, otpError, originalAvatar, originalEmail, originalName, updateError, uploadError
    },
    // Actions:
    initializeFields, resetState,
    setName, setEmail, setLocalAvatarUri, // <-- Use local URI setter
    setOtp, handleSaveChanges,
    clearOtpError, clearUpdateError, clearUploadError, // <-- Use upload error clearer
  } = useEditProfile({ onProfileUpdateSuccess });


  useEffect(() => { /* ... initialization/reset logic ... */
    if (visible && currentProfileData && !hasInitialized) {
      initializeFields(currentProfileData);
    } else if (!visible && hasInitialized) {
      resetState();
    }
  }, [visible, currentProfileData, initializeFields, resetState, hasInitialized]);


  // --- Button Text/State --- (Mostly unchanged, uses isVerifying)
  let primaryButtonText = "Save Changes";
  let loadingText = "Saving...";
  if (needsOtpVerification) {
    if (otpSent) { primaryButtonText = "Verify & Save"; if (isVerifyingOtp) loadingText = "Verifying..."; }
    else { primaryButtonText = "Send OTP & Save"; if (isSendingOtp) loadingText = "Sending OTP..."; }
  } else { if (isUpdatingProfile || isUploadingAvatar) loadingText = "Saving..."; } // Show saving if uploading avatar too
  if (isVerifying) primaryButtonText = loadingText;
  const isSaveButtonDisabled = isVerifying || (needsOtpVerification && otpSent && (!otp || otp.length !== 6));


  // --- Image Picker ---
  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change the avatar.');
      return;
    }
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: false, // *** ADD THIS OPTION *** Ensure we get a file URI, not Base64
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const pickedUri = result.assets[0].uri;
            // Log again to confirm the change
            console.log("--- Image Picker Result URI (After base64:false) ---");
            console.log("URI:", pickedUri);
            console.log("Type of URI:", typeof pickedUri);
            setLocalAvatarUri(pickedUri); // Update state via hook action
        }
    } catch (error) {
        console.error("Image Picker Error:", error);
        Alert.alert('Image Error', 'Could not select image.');
    }
  }, [setLocalAvatarUri]);


  // --- Determine which Avatar URI to display ---
  const avatarSourceUri = localAvatarUri || editAvatar; // Prioritize newly picked local URI


  // --- Render Logic ---
  if (!visible) return null; // Don't render if not visible

  // Show loading indicator if initializing
  if (!hasInitialized && visible) {
    return (<Modal visible={visible} backdropStyle={styles.backdrop}><Card style={styles.loadingCard}><ActivityIndicator size="small" color="#8B5CF6" /></Card></Modal>);
  }


  return (
    <Modal visible={visible} backdropStyle={styles.backdrop} onBackdropPress={isVerifying ? undefined : onClose}>
      <Card disabled style={[tw("w-11/12 rounded-xl bg-white/100"), CustomStyles.shadow]}>
        <Text category='h6' style={tw("mb-5 text-center text-purple-600/100 font-bold")}>Edit Profile</Text>

        {/* Inputs: Name, Email (unchanged) */}
        <View style={tw("mb-4")}>
          <Text category='label' style={tw("mb-1 text-gray-700/100")}>Name</Text>
          <Input value={editName} onChangeText={setName} /* ... */ disabled={isVerifying} />
        </View>
        <View style={tw("mb-4")}>
          <Text category='label' style={tw("mb-1 text-gray-700/100")}>Email</Text>
          <Input value={editEmail} onChangeText={setEmail} /* ... */ disabled={isVerifying || (needsOtpVerification && otpSent)} />
          {needsOtpVerification && !otpSent && !isVerifying && (<Text category='c1' style={tw("text-blue-600/100 mt-1")}>...</Text>)}
        </View>

        {/* --- Avatar Section --- */}
        <View style={tw("mb-4")}>
          <Text category='label' style={tw("mb-1 text-gray-700/100")}>Avatar</Text>
          <View style={tw("flex-row items-center")}>
            <Button appearance="ghost" status="primary" size="small" onPress={pickImage} disabled={isVerifying} style={tw("p-0 m-0 mr-3")}> Change Image </Button>
            {/* Avatar Preview Area */}
            <View style={styles.avatarContainer}>
              {avatarSourceUri ? (
                <Image source={{ uri: avatarSourceUri }} style={styles.avatarPreview} />
              ) : (
                <View style={[tw("bg-gray-200/100"), styles.avatarPreview]} /> // Placeholder
              )}
              {/* Show spinner overlay while uploading */}
              {isUploadingAvatar && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </View>
          </View>
          {/* Display Upload Error */}
          {uploadError && (
            <Text category='c1' status='danger' style={tw("mt-1")}>{uploadError}</Text>
          )}
        </View>

        {/* OTP Input Section (Conditional) */}
        {needsOtpVerification && otpSent && (<View style={tw("mb-4 p-3 bg-purple-50/100 rounded-lg border border-purple-200/100")}> {/* ... OTP Input ... */} <Input value={otp} onChangeText={setOtp} /* ... */ status={otpError ? 'danger' : 'basic'} caption={otpError ? () => <Text category='c1' status='danger' style={tw("mt-1")}>{otpError}</Text> : undefined} /> </View>)}

        {/* General Update Error Display */}
        {updateError && !otpError && !uploadError && (<Text category='c1' status='danger' style={tw("text-center mt-1 mb-3")}>{updateError}</Text>)}

        {/* Action Buttons */}
        <View style={tw("flex-row justify-end mt-4 pt-2 border-t border-gray-200/100")}>
          <Button appearance='ghost' status='basic' style={tw("mr-2")} onPress={onClose} disabled={isVerifying}> Cancel </Button>
          <Button style={tw("bg-purple-600/100 border-0 min-w-[120px]")} onPress={handleSaveChanges} disabled={isSaveButtonDisabled} accessoryLeft={isVerifying ? () => <ActivityIndicator style={tw("mr-2")} color={"#FFFFFF"} size="small" /> : undefined} >
            {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-semibold')]}>{primaryButtonText}</Text>}
          </Button>
        </View>
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0, 0, 0, 0.6)" },
  avatarContainer: { // Added container for positioning overlay
    position: 'relative',
    marginLeft: 8, // Use Tailwind ml-2 is equivalent
  },
  avatarPreview: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)" },
  avatarOverlay: { // Style for spinner overlay
    ...StyleSheet.absoluteFillObject, // Cover the container
    backgroundColor: 'rgba(0,0,0,0.4)', // Dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24, // Match preview rounding
  },
  loadingCard: { // Style for the card when hook is initializing
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100, // Give it some size
  }
});

export default EditModal;