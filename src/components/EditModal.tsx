// EditModal.tsx
import { Button, Card, Input, Modal, Text } from "@ui-kitten/components"
import type { FC } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useTailwind } from "tailwind-rn"
import CustomStyles from "../utils/styles"

interface EditProfileModalProps {
  visible: boolean
  name: string
  email: string
  avatar: string
  otp: string
  otpSent: boolean // True if OTP has been sent (via initiateUpdateProfile if email changed)
  otpError: string | null
  isVerifying: boolean // General loading state for actions
  needsOtpVerification: boolean // True if email was changed and OTP flow is required
  onChangeName: (name: string) => void
  onChangeEmail: (email: string) => void
  onChangeAvatar: (avatar: string) => void
  onChangeOtp: (otp: string) => void
  onInitiateUpdate: () => void // Starts the update process (sends OTP if needed, otherwise updates)
  onVerifyOtpForEmailChange: () => void // Verifies the OTP for email change
  onClose: () => void
}

const EditProfileModal: FC<EditProfileModalProps> = ({
  visible,
  name,
  email,
  avatar,
  otp,
  otpSent, // If true, show OTP input
  otpError,
  isVerifying,
  needsOtpVerification, // If true, the main action button becomes "Verify OTP" after OTP is sent
  onChangeName,
  onChangeEmail,
  onChangeAvatar,
  onChangeOtp,
  onInitiateUpdate, // This function decides whether to send OTP or update directly
  onVerifyOtpForEmailChange, // This function is called when the user enters OTP
  onClose,
}) => {
  const tw = useTailwind()

  // Determine button text and action based on state
  const primaryButtonAction = needsOtpVerification && otpSent ? onVerifyOtpForEmailChange : onInitiateUpdate;
  const primaryButtonText = isVerifying
    ? (needsOtpVerification && otpSent ? "Verifying..." : "Saving...") // More specific loading text
    : (needsOtpVerification && otpSent ? "Verify OTP & Save" : "Save Changes"); // Or "Send OTP & Save" if email changed


  return (
    <Modal visible={visible} backdropStyle={styles.backdrop} onBackdropPress={isVerifying ? undefined : onClose}>
      <Card disabled style={[tw("w-11/12 rounded-xl bg-white/100"),CustomStyles.shadow]}>
        <Text style={tw("text-xl font-bold mb-5 text-center text-purple-600/100")}>Edit Profile</Text>

        {/* Inputs */}
        <View style={tw("mb-4")}>
          <Text style={tw("text-sm font-medium mb-1 text-gray-700/100")}>Name</Text>
          <Input
            value={name}
            onChangeText={onChangeName}
            placeholder="Your name"
            style={tw("bg-gray-100/100 rounded-lg border-gray-300/100")}
            textStyle={tw('text-gray-900/100')}
            disabled={isVerifying}
          />
        </View>

        <View style={tw("mb-4")}>
          <Text style={tw("text-sm font-medium mb-1 text-gray-700/100")}>Email</Text>
          <Input
            value={email}
            onChangeText={onChangeEmail}
            placeholder="Your email"
            keyboardType="email-address"
            style={tw("bg-gray-100/100 rounded-lg border-gray-300/100")}
            textStyle={tw('text-gray-900/100')}
            // Disable email input if OTP has been sent for verification
            disabled={isVerifying || (needsOtpVerification && otpSent)}
          />
           {needsOtpVerification && !otpSent && <Text style={tw("text-blue-600/100 text-xs mt-1")}>Changing email requires OTP verification.</Text>}
        </View>

        <View style={tw("mb-4")}>
          <Text style={tw("text-sm font-medium mb-1 text-gray-700/100")}>Avatar URL</Text>
          <Input
            value={avatar}
            onChangeText={onChangeAvatar}
            placeholder="Avatar URL (optional)"
            style={tw("bg-gray-100/100 rounded-lg border-gray-300/100")}
             textStyle={tw('text-gray-900/100')}
            disabled={isVerifying}
          />
        </View>

        {/* OTP Input Section - Show only if OTP has been sent */}
        {otpSent && needsOtpVerification && (
          <View style={tw("mb-4 p-3 bg-purple-50/100 rounded-lg border border-purple-200/100")}>
            <Text style={tw("text-sm font-medium mb-1 text-purple-800/100")}>Enter OTP</Text>
             <Text style={tw("text-xs text-purple-700/100 mb-2")}>An OTP has been sent to {email}.</Text>
            <Input
              value={otp}
              onChangeText={onChangeOtp}
              placeholder="6-digit OTP"
              keyboardType="number-pad"
              maxLength={6}
              style={tw("bg-white/100 rounded-lg border-purple-300/100")}
              textStyle={tw('text-gray-900/100 text-center tracking-widest')} // Center OTP text
              disabled={isVerifying}
            />
            {otpError && <Text style={tw("text-red-600/100 text-xs mt-1")}>{otpError}</Text>}
          </View>
        )}

        {/* Action Buttons */}
        <View style={tw("flex-row justify-end mt-4")}>
          <Button
             appearance='ghost' // Use ghost appearance for cancel
             status='basic'
             style={tw("mr-2")} // Removed bg/border
             onPress={onClose}
             disabled={isVerifying}
          >
            Cancel
          </Button>

          <Button
            style={tw("bg-purple-600/100 border-0")}
            onPress={primaryButtonAction}
            // Disable button if verifying OR if OTP is required but not entered
            disabled={isVerifying || (needsOtpVerification && otpSent && (!otp || otp.length !== 6))}
            accessoryLeft={isVerifying ? () => <ActivityIndicator color="white" size="small" /> : undefined}
          >
            {/* Pass style to Text component inside Button */}
            {(evaProps) => <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-semibold')]}>{primaryButtonText}</Text>}
          </Button>
        </View>
      </Card>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Slightly darker backdrop
  },
})

export default EditProfileModal