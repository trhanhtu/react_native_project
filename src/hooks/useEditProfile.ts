// src/hooks/useEditProfile.ts (Full Code with Cloudinary Upload Logic)

import {
    sendOTP,
    updateUserProfile, // For Name/Avatar PUT
    verifyOTPChangeEmail, // For Email POST verification
} from "@/api/api"; // Assuming API function paths are correct
import { router } from "expo-router";
import { useCallback, useReducer } from "react";
import { uploadImageToCloudinary } from "../utils/cloudinaryUploader"; // Import the helper function
import { ProfileData, UpdateUserRequest } from "../utils/types"; // Assuming type paths are correct

// --- State Type Definition ---
type EditProfileState = {
    // Loading States
    isVerifying: boolean;       // Generic loading flag for any async operation
    isSendingOtp: boolean;      // Specific flag for OTP send API call
    isVerifyingOtp: boolean;    // Specific flag for OTP verification API call
    isUploadingAvatar: boolean; // Specific flag for Cloudinary upload API call
    isUpdatingProfile: boolean; // Specific flag for profile update (PUT /users) API call

    // Error States
    updateError: string | null; // Error from PUT /users API
    otpError: string | null;    // Error from OTP send/verify APIs
    uploadError: string | null; // Error from Cloudinary upload API

    // Edit Fields & Original Values for Comparison
    editName: string;
    originalName: string;
    editEmail: string;
    originalEmail: string;
    editAvatar: string;       // Holds the *current* public URL (or original)
    originalAvatar: string;
    localAvatarUri: string | null; // Holds the *newly picked* local URI, pending upload

    // OTP Process State
    otp: string;
    otpSent: boolean;           // Has the OTP been successfully sent for the current editEmail?
    needsOtpVerification: boolean; // Is the current editEmail different from originalEmail?

    hasInitialized: boolean; // Flag to track if initial data has been loaded
};

// --- Action Type Definition ---
type EditAction =
    | { type: "INITIALIZE_FIELDS"; payload: ProfileData }
    | { type: "RESET_STATE" }
    | { type: "SET_FIELD"; payload: { field: "name" | "email"; value: string } } // Name/Email updates
    | { type: "SET_LOCAL_AVATAR_URI"; payload: string | null } // Set newly picked local avatar URI
    | { type: "SET_OTP"; payload: string } // Set OTP input value

    // OTP Sending Flow Actions
    | { type: "SEND_OTP_START" }
    | { type: "SEND_OTP_SUCCESS" }
    | { type: "SEND_OTP_ERROR"; payload: string }

    // OTP Verification Flow Actions
    | { type: "VERIFY_OTP_START" }
    | { type: "VERIFY_OTP_SUCCESS"; payload: { verifiedEmail: string } } // Email is now verified
    | { type: "VERIFY_OTP_ERROR"; payload: string }

    // Avatar Upload Flow Actions
    | { type: "UPLOAD_AVATAR_START" }
    | { type: "UPLOAD_AVATAR_SUCCESS"; payload: { uploadedUrl: string } } // Upload succeeded, new URL provided
    | { type: "UPLOAD_AVATAR_ERROR"; payload: string }

    // Name/Avatar Update (PUT /users) Flow Actions
    | { type: "UPDATE_PROFILE_START" }
    | { type: "UPDATE_PROFILE_SUCCESS"; payload: { updatedName: string; updatedAvatar: string } } // Name/Avatar updated
    | { type: "UPDATE_PROFILE_ERROR"; payload: string }

    // Error Clearing Actions
    | { type: "CLEAR_OTP_ERROR" }
    | { type: "CLEAR_UPDATE_ERROR" }
    | { type: "CLEAR_UPLOAD_ERROR" };


// --- Initial State ---
const initialEditState: EditProfileState = {
    isVerifying: false, isSendingOtp: false, isVerifyingOtp: false, isUpdatingProfile: false, isUploadingAvatar: false,
    updateError: null, otpError: null, uploadError: null,
    editName: "", originalName: "", editEmail: "", originalEmail: "", editAvatar: "", originalAvatar: "", localAvatarUri: null,
    otp: "", otpSent: false, needsOtpVerification: false,
    hasInitialized: false,
};

// --- Reducer Function ---
function editProfileReducer(state: EditProfileState, action: EditAction): EditProfileState {
    // Set the generic isVerifying flag whenever any specific async operation starts
    const isStartingAsync = [
        "SEND_OTP_START", "VERIFY_OTP_START", "UPLOAD_AVATAR_START", "UPDATE_PROFILE_START"
    ].includes(action.type);
    // Clear the generic isVerifying flag whenever any specific async operation ends (success or error)
    const isEndingAsync = [
        "SEND_OTP_SUCCESS", "SEND_OTP_ERROR", "VERIFY_OTP_SUCCESS", "VERIFY_OTP_ERROR",
        "UPLOAD_AVATAR_SUCCESS", "UPLOAD_AVATAR_ERROR", "UPDATE_PROFILE_SUCCESS", "UPDATE_PROFILE_ERROR"
    ].includes(action.type);

    // Base state for updates, incorporating the generic isVerifying flag logic
    let nextState = {
        ...state,
        isVerifying: isStartingAsync ? true : isEndingAsync ? false : state.isVerifying,
    };

    switch (action.type) {
        case "INITIALIZE_FIELDS":
            if (state.hasInitialized) return state; // Prevent re-initialization
            const profileData = action.payload;
            const initialAvatar = profileData.avatar || `https://picsum.photos/seed/${profileData.id || profileData.name}/200`;
            // Reset everything to initial + populate fields
            return {
                ...initialEditState, hasInitialized: true,
                editName: profileData.name, originalName: profileData.name,
                editEmail: profileData.email, originalEmail: profileData.email,
                editAvatar: initialAvatar, originalAvatar: initialAvatar,
                localAvatarUri: null,
            };

        case "RESET_STATE":
            return initialEditState; // Reset all state

        case "SET_FIELD": { // Handle Name/Email changes
            const { field, value } = action.payload;
            nextState[field === "name" ? "editName" : "editEmail"] = value;
            // Check if email needs verification when email field changes
            if (field === 'email') {
                const emailChanged = value !== state.originalEmail;
                nextState.needsOtpVerification = emailChanged;
                // If email changed (either way), reset any pending OTP state
                if (emailChanged || value === state.originalEmail) {
                    nextState.otpSent = false;
                    nextState.otp = "";
                    nextState.otpError = null;
                }
            }
            return nextState;
        }

        // --- Avatar Handling ---
        case "SET_LOCAL_AVATAR_URI":
            // Update the local URI state and clear previous upload errors
            return { ...nextState, localAvatarUri: action.payload, uploadError: null };

        case "UPLOAD_AVATAR_START":
            // Set specific upload flag, generic isVerifying is handled above
            return { ...nextState, isUploadingAvatar: true, uploadError: null };

        case "UPLOAD_AVATAR_SUCCESS":
            // Upload succeeded. Update editAvatar with the Cloudinary URL. Clear local URI.
            return { ...nextState, isUploadingAvatar: false, editAvatar: action.payload.uploadedUrl, localAvatarUri: null };

        case "UPLOAD_AVATAR_ERROR":
            // Upload failed. Clear specific flag. Keep local URI? Clear it for now to prevent retries without re-picking.
            return { ...nextState, isUploadingAvatar: false, uploadError: action.payload, localAvatarUri: null };

        // --- OTP Input ---
        case "SET_OTP":
            // Update OTP value and clear OTP error when user types
            return { ...nextState, otp: action.payload, otpError: null };

        // --- OTP Send Flow ---
        case "SEND_OTP_START":
            // Set specific flag, clear errors, reset otpSent status
            return { ...nextState, isSendingOtp: true, otpError: null, otpSent: false };
        case "SEND_OTP_SUCCESS":
            // Set specific flag off, mark OTP as sent, ensure verification needed
            return { ...nextState, isSendingOtp: false, otpSent: true, needsOtpVerification: true };
        case "SEND_OTP_ERROR":
            // Set specific flag off, set error message
            return { ...nextState, isSendingOtp: false, otpError: action.payload };

        // --- OTP Verify Flow ---
        case "VERIFY_OTP_START":
            // Set specific flag, clear errors
            return { ...nextState, isVerifyingOtp: true, otpError: null };
        case "VERIFY_OTP_SUCCESS":
            // OTP verified, email changed on backend. Update originalEmail locally. Reset OTP state.
            return {
                ...nextState,
                isVerifyingOtp: false,
                originalEmail: action.payload.verifiedEmail, // Sync original email
                needsOtpVerification: false, // Verification no longer needed
                otpSent: false, otp: "", otpError: null, // Reset OTP fields
            };
        case "VERIFY_OTP_ERROR":
            // Set specific flag off, set error message
            return { ...nextState, isVerifyingOtp: false, otpError: action.payload };

        // --- Profile Update (PUT /users) Flow ---
        case "UPDATE_PROFILE_START":
            // Set specific flag, clear errors
            return { ...nextState, isUpdatingProfile: true, updateError: null };
        case "UPDATE_PROFILE_SUCCESS":
            // Profile updated. Sync original values for name and avatar.
            return {
                ...nextState,
                isUpdatingProfile: false,
                originalName: action.payload.updatedName,
                originalAvatar: action.payload.updatedAvatar,
                updateError: null,
            };
        case "UPDATE_PROFILE_ERROR":
            // Set specific flag off, set error message
            return { ...nextState, isUpdatingProfile: false, updateError: action.payload };

        // --- Error Clearing ---
        case "CLEAR_OTP_ERROR": return { ...nextState, otpError: null };
        case "CLEAR_UPDATE_ERROR": return { ...nextState, updateError: null };
        case "CLEAR_UPLOAD_ERROR": return { ...nextState, uploadError: null };

        default:
            // Ensures state is returned even if action type isn't matched
            // Helps catch potential issues with unhandled actions
            return nextState;
    }
}


// --- Custom Hook Definition ---
interface UseEditProfileOptions {
    // Callback to notify parent screen upon successful completion of all updates
    onProfileUpdateSuccess: (updatedProfileData: ProfileData) => void;
}

export default function useEditProfile({ onProfileUpdateSuccess }: UseEditProfileOptions) {
    const [state, dispatch] = useReducer(editProfileReducer, initialEditState);

    // --- Actions exposed by the hook ---
    const initializeFields = useCallback((currentProfileData: ProfileData) => {
        if (currentProfileData) dispatch({ type: "INITIALIZE_FIELDS", payload: currentProfileData });
    }, [dispatch]);

    const resetState = useCallback(() => {
        dispatch({ type: "RESET_STATE" });
    }, [dispatch]);

    // --- Field Setters ---
    const setName = useCallback((value: string) => {
        dispatch({ type: "SET_FIELD", payload: { field: "name", value } });
    }, [dispatch]);

    const setEmail = useCallback((value: string) => {
        dispatch({ type: "SET_FIELD", payload: { field: "email", value } });
    }, [dispatch]);

    // Renamed: This sets the local URI selected by the user, triggering an upload later
    const setLocalAvatarUri = useCallback((uri: string | null) => {
        dispatch({ type: "SET_LOCAL_AVATAR_URI", payload: uri });
    }, [dispatch]);

    const setOtp = useCallback((value: string) => {
        dispatch({ type: "SET_OTP", payload: value });
    }, [dispatch]);

    // --- API Call Functions ---

    // 1. Send OTP API Call
    const handleSendOTP = useCallback(async () => {
        if (!state.needsOtpVerification) {
            console.warn("handleSendOTP called when needsOtpVerification is false.");
            return; // Should not happen based on UI logic, but good safeguard
        }
        dispatch({ type: "SEND_OTP_START" });
        try {
            const res = await sendOTP({ email: state.editEmail });
            if (res !== null) {
                dispatch({ type: "SEND_OTP_SUCCESS" });
            } else {
                dispatch({ type: "SEND_OTP_ERROR", payload: "Failed to send OTP. Please try again." });
            }
        } catch (e) {
            console.log("Send OTP API error:", e);
            dispatch({ type: "SEND_OTP_ERROR", payload: "An error occurred while sending OTP." });
        }
    }, [dispatch, state.editEmail, state.needsOtpVerification]); // Include all state dependencies

    // 2. Verify OTP API Call
    const handleVerifyOTP = useCallback(async (): Promise<boolean> => { // Return boolean success status
        if (!state.otp || state.otp.length !== 6) {
            dispatch({ type: "VERIFY_OTP_ERROR", payload: "Please enter the 6-digit OTP." });
            return false; // Indicate failure
        }
        dispatch({ type: "VERIFY_OTP_START" });
        let emailVerifiedSuccessfully = false;
        try {
            const res = await verifyOTPChangeEmail({ email: state.editEmail, otp: state.otp });
            if (res !== null) {
                dispatch({ type: "VERIFY_OTP_SUCCESS", payload: { verifiedEmail: state.editEmail } });
                emailVerifiedSuccessfully = true; // Mark email as verified for this operation
                router.replace("/login"); // Redirect to login after successful verification
            } else {
                dispatch({ type: "VERIFY_OTP_ERROR", payload: "Incorrect OTP. Please try again." });
            }
        } catch (e) {
            console.log("Verify OTP API error:", e);
            dispatch({ type: "VERIFY_OTP_ERROR", payload: "An error occurred during OTP verification." });
        }
        return emailVerifiedSuccessfully; // Return success/failure
    }, [dispatch, state.editEmail, state.otp]); // Include all state dependencies

    // 3. Update Profile (Name/Avatar) API Call (potentially after avatar upload)
    const handleUpdateProfileAPI = useCallback(async (nameToSave: string, avatarUrlToSave: string): Promise<boolean> => { // Return boolean success status
        dispatch({ type: "UPDATE_PROFILE_START" });
        let profileUpdatedSuccessfully = false;
        try {
            const updateData: UpdateUserRequest = { name: nameToSave, avatar: avatarUrlToSave };
            const updatedProfileData = await updateUserProfile(updateData); // Call PUT /users

            if (updatedProfileData) {
                // Extract final values from response if possible, otherwise use what was sent
                const finalName = updatedProfileData.name ?? nameToSave;
                const finalAvatar = updatedProfileData.avatar ?? avatarUrlToSave;
                dispatch({ type: "UPDATE_PROFILE_SUCCESS", payload: { updatedName: finalName, updatedAvatar: finalAvatar } });

                // Construct final combined data for the parent callback
                // NOTE: Assumes ID doesn't change, or gets it from response
                const finalData: ProfileData = {
                    id: updatedProfileData.id,
                    name: finalName,
                    email: state.originalEmail, // Email is the *verified* email at this point
                    avatar: finalAvatar,
                    active: updatedProfileData.active,
                    role: updatedProfileData.role,
                };
                onProfileUpdateSuccess(finalData); // Notify parent screen
                profileUpdatedSuccessfully = true;
            } else {
                dispatch({ type: "UPDATE_PROFILE_ERROR", payload: "Failed to save profile changes." });
            }
        } catch (err) {
            console.log("Update Profile API error:", err);
            dispatch({ type: "UPDATE_PROFILE_ERROR", payload: "An error occurred saving profile." });
        }
        return profileUpdatedSuccessfully;
    }, [dispatch, state.originalEmail, onProfileUpdateSuccess]); // Only depends on dispatch, originalEmail (for final data), and callback

    // --- Combined Save Action Trigger ---
    // This function orchestrates the necessary steps based on the current state
    const handleSaveChanges = useCallback(async () => {
        let finalAvatarUrl = state.editAvatar; // Start with the current avatar URL
        let uploadOk = true; // Assume upload is okay unless it fails

        // Step 1: Upload new avatar if selected
        if (state.localAvatarUri) {
            dispatch({ type: "UPLOAD_AVATAR_START" });
            const uploadedUrl = await uploadImageToCloudinary(state.localAvatarUri);
            if (uploadedUrl) {
                finalAvatarUrl = uploadedUrl; // Use the new URL for saving
                dispatch({ type: "UPLOAD_AVATAR_SUCCESS", payload: { uploadedUrl } }); // Update state
            } else {
                dispatch({ type: "UPLOAD_AVATAR_ERROR", payload: "Failed to upload new avatar." });
                uploadOk = false; // Stop the process if upload fails
            }
        }

        // Stop if upload failed
        if (!uploadOk) return;

        // Step 2: Handle Email Verification or Direct Update
        let overallSuccess = false;
        if (state.needsOtpVerification && state.otpSent) {
            // --- Verify OTP Flow ---
            const emailVerified = await handleVerifyOTP();
            if (emailVerified) {
                // Email is good, now check if Name/Avatar *also* need updating
                const nameChanged = state.editName !== state.originalName;
                const avatarChanged = finalAvatarUrl !== state.originalAvatar; // Compare final URL
                if (nameChanged || avatarChanged) {
                    // Update name/avatar AFTER successful email verification
                    overallSuccess = await handleUpdateProfileAPI(state.editName, finalAvatarUrl);
                } else {
                    // Only email changed and was verified successfully
                    // Construct final data manually as handleUpdateProfileAPI wasn't called
                    const finalData: ProfileData = {
                        // ID might need updating if backend changes it on verify?
                        name: state.originalName,
                        email: state.originalEmail, // Now reflects the verified email due to VERIFY_OTP_SUCCESS action
                        avatar: state.originalAvatar,
                    } as ProfileData;
                    onProfileUpdateSuccess(finalData); // Notify parent
                    overallSuccess = true;
                }
            }

        } else if (state.needsOtpVerification && !state.otpSent) {
            // --- Send OTP Flow ---
            await handleSendOTP(); // Send OTP, don't proceed further this time
            overallSuccess = false; // Not finished yet

        } else {
            // --- Direct Update Flow (No Email Change) ---
            // Check if Name or Avatar actually changed
            const nameChanged = state.editName !== state.originalName;
            const avatarChanged = finalAvatarUrl !== state.originalAvatar; // Use final URL after potential upload

            if (nameChanged || avatarChanged) {
                overallSuccess = await handleUpdateProfileAPI(state.editName, finalAvatarUrl);
            } else {
                console.log("handleSaveChanges: No changes detected.");
                overallSuccess = true; // No changes, but no failure either
                // Optionally call onClose here if you want the modal to close even if nothing changed
            }
        }

        // Consider closing modal only on overall success? Parent handles closing via onProfileUpdateSuccess callback for now.
        console.log("handleSaveChanges completed, overall success:", overallSuccess);

    }, [
        state.localAvatarUri, state.editAvatar, state.needsOtpVerification, state.otpSent,
        state.editName, state.originalName, state.originalAvatar, state.originalEmail, // Include originals for comparison checks
        dispatch, handleSendOTP, handleVerifyOTP, handleUpdateProfileAPI, onProfileUpdateSuccess // Include dependent functions/callbacks
    ]);

    // --- Error Clearers ---
    const clearOtpError = useCallback(() => dispatch({ type: 'CLEAR_OTP_ERROR' }), [dispatch]);
    const clearUpdateError = useCallback(() => dispatch({ type: 'CLEAR_UPDATE_ERROR' }), [dispatch]);
    const clearUploadError = useCallback(() => dispatch({ type: 'CLEAR_UPLOAD_ERROR' }), [dispatch]);


    // --- Return state and actions needed by the EditModal component ---
    return {
        // State
        state,
        // Actions
        initializeFields,
        resetState,
        setName,
        setEmail,
        setLocalAvatarUri, // Use this to set the URI from image picker
        setOtp,
        handleSaveChanges, // *** Main action for the primary button ***
        clearOtpError,
        clearUpdateError,
        clearUploadError,
    };
}