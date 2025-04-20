// useEditProfile.ts (Refactored for New Flow)
import {
    updateUserProfile, // For Name/Avatar PUT
    verifyOTPChangeEmail
} from "@/api/api";
import { useCallback, useReducer } from "react";
import { uploadImageToCloudinary } from "../utils/cloudinaryUploader";
import { ProfileData, UpdateUserRequest } from "../utils/types";

// --- State Type ---
type EditProfileState = {
    isVerifying: boolean; // Generic loading flag for any API call
    isSendingOtp: boolean; // Specific flag for OTP send
    isVerifyingOtp: boolean; // Specific flag for OTP verification
    isUpdatingProfile: boolean; // Specific flag for Name/Avatar update
    isUploadingAvatar: boolean;

    updateError: string | null; // General error from PUT /users
    otpError: string | null; // Specific error for OTP send/verify
    uploadError: string | null;

    // Edit Fields & Originals
    editName: string;
    originalName: string;
    editEmail: string;
    originalEmail: string;
    editAvatar: string;
    originalAvatar: string;
    localAvatarUri: string | null;

    // OTP Process
    otp: string;
    otpSent: boolean; // Has the OTP been successfully sent for the current editEmail?
    needsOtpVerification: boolean; // Is the current editEmail different from originalEmail?

    hasInitialized: boolean;
};

// --- Action Types ---
type EditAction =
    | { type: "INITIALIZE_FIELDS"; payload: ProfileData }
    | { type: "RESET_STATE" }
    | { type: "SET_FIELD"; payload: { field: "name" | "email"; value: string } } // Avatar separate
    | { type: "SET_LOCAL_AVATAR_URI"; payload: string | null } // New action for local URI
    | { type: "SET_OTP"; payload: string }
    | { type: "SEND_OTP_START" } | { type: "SEND_OTP_SUCCESS" } | { type: "SEND_OTP_ERROR"; payload: string }
    | { type: "VERIFY_OTP_START" } | { type: "VERIFY_OTP_SUCCESS"; payload: { verifiedEmail: string } } | { type: "VERIFY_OTP_ERROR"; payload: string }
    | { type: "UPLOAD_AVATAR_START" } | { type: "UPLOAD_AVATAR_SUCCESS"; payload: { uploadedUrl: string } } | { type: "UPLOAD_AVATAR_ERROR"; payload: string } // Avatar upload actions
    | { type: "UPDATE_PROFILE_START" } | { type: "UPDATE_PROFILE_SUCCESS"; payload: { updatedName: string; updatedAvatar: string } } | { type: "UPDATE_PROFILE_ERROR"; payload: string }
    | { type: "CLEAR_OTP_ERROR" } | { type: "CLEAR_UPDATE_ERROR" } | { type: "CLEAR_UPLOAD_ERROR" }; // Clear upload error


// --- Initial State ---
const initialEditState: EditProfileState = {
    isVerifying: false, isSendingOtp: false, isVerifyingOtp: false, isUpdatingProfile: false, isUploadingAvatar: false, // <--- Added isUploadingAvatar
    updateError: null, otpError: null, uploadError: null, // <--- Added uploadError
    editName: "", originalName: "", editEmail: "", originalEmail: "", editAvatar: "", originalAvatar: "", localAvatarUri: null, // <--- Added localAvatarUri
    otp: "", otpSent: false, needsOtpVerification: false,
    hasInitialized: false,
};
// --- Reducer Function ---
// --- Reducer ---
function editProfileReducer(state: EditProfileState, action: EditAction): EditProfileState {
    switch (action.type) {
        case "INITIALIZE_FIELDS": /* unchanged */
            if (state.hasInitialized) return state;
            const profileData = action.payload;
            const initialAvatar = profileData.avatar || `https://picsum.photos/seed/${profileData.id || profileData.name}/200`;
            return {
                ...initialEditState, hasInitialized: true,
                editName: profileData.name, originalName: profileData.name,
                editEmail: profileData.email, originalEmail: profileData.email,
                editAvatar: initialAvatar, originalAvatar: initialAvatar,
                localAvatarUri: null, // Ensure local URI is null initially
            };
        case "RESET_STATE": return initialEditState;
        case "SET_FIELD": { /* Primarily for Name/Email now */
            const newState = { ...state };
            const { field, value } = action.payload;
            newState[field === "name" ? "editName" : "editEmail"] = value;
            if (field === 'email') {
                newState.needsOtpVerification = value !== state.originalEmail;
                if (value === state.originalEmail || newState.needsOtpVerification) {
                    newState.otpSent = false; newState.otp = ""; newState.otpError = null;
                }
            }
            return newState;
        }
        // --- Avatar Handling ---
        case "SET_LOCAL_AVATAR_URI":
            return { ...state, localAvatarUri: action.payload, uploadError: null }; // Clear previous upload error on new pick
        case "UPLOAD_AVATAR_START":
            return { ...state, isUploadingAvatar: true, isVerifying: true, uploadError: null };
        case "UPLOAD_AVATAR_SUCCESS":
            // Upload succeeded, update editAvatar with the new URL, clear local URI
            return { ...state, isUploadingAvatar: false, isVerifying: false, editAvatar: action.payload.uploadedUrl, localAvatarUri: null, uploadError: null };
        case "UPLOAD_AVATAR_ERROR":
            return { ...state, isUploadingAvatar: false, isVerifying: false, uploadError: action.payload, localAvatarUri: null }; // Clear local URI on error? Or keep it for retry? Let's clear it.

        case "SET_OTP": return { ...state, otp: action.payload, otpError: null };
        // --- OTP Send ---
        case "SEND_OTP_START": return { ...state, isSendingOtp: true, isVerifying: true, otpError: null, otpSent: false };
        case "SEND_OTP_SUCCESS": return { ...state, isSendingOtp: false, isVerifying: false, otpSent: true, needsOtpVerification: true };
        case "SEND_OTP_ERROR": return { ...state, isSendingOtp: false, isVerifying: false, otpError: action.payload };
        // --- OTP Verify ---
        case "VERIFY_OTP_START": return { ...state, isVerifyingOtp: true, isVerifying: true, otpError: null };
        case "VERIFY_OTP_SUCCESS": return { ...state, isVerifyingOtp: false, isVerifying: false, originalEmail: action.payload.verifiedEmail, needsOtpVerification: false, otpSent: false, otp: "", otpError: null };
        case "VERIFY_OTP_ERROR": return { ...state, isVerifyingOtp: false, isVerifying: false, otpError: action.payload };
        // --- Profile Update (Name/Avatar URL) ---
        case "UPDATE_PROFILE_START": return { ...state, isUpdatingProfile: true, isVerifying: true, updateError: null };
        case "UPDATE_PROFILE_SUCCESS": return { ...state, isUpdatingProfile: false, isVerifying: false, originalName: action.payload.updatedName, originalAvatar: action.payload.updatedAvatar, updateError: null };
        case "UPDATE_PROFILE_ERROR": return { ...state, isUpdatingProfile: false, isVerifying: false, updateError: action.payload };
        // --- Clear Errors ---
        case "CLEAR_OTP_ERROR": return { ...state, otpError: null };
        case "CLEAR_UPDATE_ERROR": return { ...state, updateError: null };
        case "CLEAR_UPLOAD_ERROR": return { ...state, uploadError: null };
        default: return state;
    }
}


// --- Custom Hook ---
interface UseEditProfileOptions {
    onProfileUpdateSuccess: (updatedProfileData: ProfileData) => void;
}

export default function useEditProfile({ onProfileUpdateSuccess }: UseEditProfileOptions) {
    const [state, dispatch] = useReducer(editProfileReducer, initialEditState);

    // --- Actions exposed by the hook ---
    const initializeFields = useCallback((data: ProfileData) => { if (data) dispatch({ type: "INITIALIZE_FIELDS", payload: data }); }, [dispatch]);
    const resetState = useCallback(() => dispatch({ type: "RESET_STATE" }), [dispatch]);

    // --- Field Setters ---
    const setName = useCallback((value: string) => dispatch({ type: "SET_FIELD", payload: { field: "name", value } }), [dispatch]);
    const setEmail = useCallback((value: string) => dispatch({ type: "SET_FIELD", payload: { field: "email", value } }), [dispatch]);
    // Renamed: This now only sets the *local* URI state, upload happens later
    const setLocalAvatarUri = useCallback((uri: string | null) => dispatch({ type: "SET_LOCAL_AVATAR_URI", payload: uri }), [dispatch]);
    const setOtp = useCallback((value: string) => dispatch({ type: "SET_OTP", payload: value }), [dispatch]);

    // --- API Call Functions ---
    const handleSendOTP = useCallback(async () => {/* unchanged */
        if (!state.needsOtpVerification) return;
        dispatch({ type: "SEND_OTP_START" });
        try { /* ... */ dispatch({ type: "SEND_OTP_SUCCESS" }); /* ... */ }
        catch (e) { /* ... */ dispatch({ type: "SEND_OTP_ERROR", payload: "..." }); }
    }, [dispatch, state.editEmail, state.needsOtpVerification]);

    const handleVerifyOTP = useCallback(async () => { /* unchanged logic, maybe update payload */
        if (!state.otp || state.otp.length !== 6) {/* ... */ return false; }
        dispatch({ type: "VERIFY_OTP_START" });
        let success = false;
        try {
            const res = await verifyOTPChangeEmail({ email: state.editEmail, otp: state.otp });
            if (res !== null) { dispatch({ type: "VERIFY_OTP_SUCCESS", payload: { verifiedEmail: state.editEmail } }); success = true; }
            else { dispatch({ type: "VERIFY_OTP_ERROR", payload: "Incorrect OTP." }); }
        } catch (e) { /* ... */ dispatch({ type: "VERIFY_OTP_ERROR", payload: "..." }); }
        return success;
    }, [dispatch, state.editEmail, state.otp]);

    // --- Modified Update Profile Logic ---
    const handleUpdateProfile = useCallback(async () => {
        let avatarUrlToSave = state.editAvatar; // Start with current URL

        // Step 1: Upload avatar if a new local URI exists
        if (state.localAvatarUri) {
            dispatch({ type: "UPLOAD_AVATAR_START" });
            const uploadedUrl = await uploadImageToCloudinary(state.localAvatarUri);
            if (uploadedUrl) {
                // Upload success: update the URL to save and clear local state
                avatarUrlToSave = uploadedUrl;
                dispatch({ type: "UPLOAD_AVATAR_SUCCESS", payload: { uploadedUrl } }); // Updates editAvatar state
            } else {
                // Upload failed: dispatch error, stop the update process
                dispatch({ type: "UPLOAD_AVATAR_ERROR", payload: "Failed to upload new avatar." });
                return false; // Indicate overall failure
            }
        }

        // Step 2: Check if Name or (now potentially updated) Avatar URL actually changed
        const nameChanged = state.editName !== state.originalName;
        // Use the potentially updated avatarUrlToSave for comparison
        const avatarChanged = avatarUrlToSave !== state.originalAvatar;

        if (!nameChanged && !avatarChanged) {
            console.log("No Name/Avatar changes detected after potential upload.");
            // If only avatar was uploaded but resulted in same URL somehow, or no changes at all.
            const finalData: ProfileData = {
                name: state.originalName, email: state.originalEmail, avatar: state.originalAvatar,
            } as ProfileData;
            onProfileUpdateSuccess(finalData); // Notify success even if no PUT call needed
            return true; // Indicate overall success
        }

        // Step 3: Call PUT /users API if necessary
        dispatch({ type: "UPDATE_PROFILE_START" });
        let profileUpdatedSuccessfully = false;
        try {
            const updateData: UpdateUserRequest = { name: state.editName, avatar: avatarUrlToSave };
            const updatedProfileData = await updateUserProfile(updateData);
            if (updatedProfileData) {
                const finalName = updatedProfileData.name;
                const finalAvatar = updatedProfileData.avatar || avatarUrlToSave; // Prefer returned avatar URL
                dispatch({ type: "UPDATE_PROFILE_SUCCESS", payload: { updatedName: finalName, updatedAvatar: finalAvatar } });
                const finalData: ProfileData = {
                    id: updatedProfileData.id, name: finalName, email: state.originalEmail, avatar: finalAvatar,
                    active: updatedProfileData.active,
                    role: updatedProfileData.role,
                };
                onProfileUpdateSuccess(finalData);
                profileUpdatedSuccessfully = true;
            } else {
                dispatch({ type: "UPDATE_PROFILE_ERROR", payload: "Failed to save profile changes." });
            }
        } catch (err) {
            dispatch({ type: "UPDATE_PROFILE_ERROR", payload: "An error occurred saving profile." });
        }
        return profileUpdatedSuccessfully;
    }, [
        dispatch, state.editName, state.originalName, state.editAvatar, state.originalAvatar,
        state.localAvatarUri, state.originalEmail, onProfileUpdateSuccess
    ]); // Dependencies updated


    // --- Combined Action Trigger ---
    const handleSaveChanges = useCallback(async () => {
        // Case 1: Verify OTP if needed and ready
        if (state.needsOtpVerification && state.otpSent) {
            const emailVerified = await handleVerifyOTP();
            if (emailVerified) {
                // Email verified, now handle potential Name/Avatar update
                await handleUpdateProfile(); // This calls onProfileUpdateSuccess internally
            }
            // else: OTP verification failed, error state is set, do nothing more
        }
        // Case 2: Send OTP if needed and not already sent
        else if (state.needsOtpVerification && !state.otpSent) {
            await handleSendOTP();
            // Wait for user to input OTP and click again
        }
        // Case 3: No OTP needed, just update Name/Avatar (if changed)
        else {
            await handleUpdateProfile(); // This handles upload and PUT /users, calls onProfileUpdateSuccess
        }
    }, [state.needsOtpVerification, state.otpSent, handleVerifyOTP, handleSendOTP, handleUpdateProfile]); // Dependencies updated


    const clearOtpError = useCallback(() => dispatch({ type: 'CLEAR_OTP_ERROR' }), [dispatch]);
    const clearUpdateError = useCallback(() => dispatch({ type: 'CLEAR_UPDATE_ERROR' }), [dispatch]);
    const clearUploadError = useCallback(() => dispatch({ type: 'CLEAR_UPLOAD_ERROR' }), [dispatch]);


    // --- Return state and actions ---
    return {
        // State
        state,
        // Actions
        initializeFields, resetState,
        setName, setEmail, setLocalAvatarUri, // <-- Expose local URI setter
        setOtp, handleSaveChanges,
        clearOtpError, clearUpdateError, clearUploadError, // <-- expose upload error clearer
    };
}