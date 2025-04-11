import { Button, Card, Input, Modal, Text } from "@ui-kitten/components"
import type { FC } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useTailwind } from "tailwind-rn"

interface EditProfileModalProps {
  visible: boolean
  name: string
  email: string
  avatar: string
  otp: string
  otpSent: boolean
  otpError: string | null
  isVerifying: boolean
  onChangeName: (name: string) => void
  onChangeEmail: (email: string) => void
  onChangeAvatar: (avatar: string) => void
  onChangeOtp: (otp: string) => void
  onSendOtp: () => void
  onVerifyOtp: () => void
  onClose: () => void
}

const EditProfileModal: FC<EditProfileModalProps> = ({
  visible,
  name,
  email,
  avatar,
  otp,
  otpSent,
  otpError,
  isVerifying,
  onChangeName,
  onChangeEmail,
  onChangeAvatar,
  onChangeOtp,
  onSendOtp,
  onVerifyOtp,
  onClose,
}) => {
  const tw = useTailwind()

  return (
    <Modal visible={visible} backdropStyle={styles.backdrop} onBackdropPress={onClose}>
      <Card disabled style={tw("w-11/12 rounded-xl bg-white/100")}>
        <Text style={tw("text-2xl font-bold mb-4 text-center text-purple-600/100")}>Edit Profile</Text>

        <View style={tw("mb-4")}>
          <Text style={tw("text-sm font-medium mb-1 text-gray-700/100")}>Name</Text>
          <Input
            value={name}
            onChangeText={onChangeName}
            placeholder="Your name"
            style={tw("bg-gray-50/100 rounded-lg")}
          />
        </View>

        <View style={tw("mb-4")}>
          <Text style={tw("text-sm font-medium mb-1 text-gray-700/100")}>Email</Text>
          <Input
            value={email}
            onChangeText={onChangeEmail}
            placeholder="Your email"
            keyboardType="email-address"
            style={tw("bg-gray-50/100 rounded-lg")}
            disabled={otpSent}
          />
        </View>

        <View style={tw("mb-4")}>
          <Text style={tw("text-sm font-medium mb-1 text-gray-700/100")}>Avatar URL</Text>
          <Input
            value={avatar}
            onChangeText={onChangeAvatar}
            placeholder="Avatar URL"
            style={tw("bg-gray-50/100 rounded-lg")}
          />
        </View>

        {otpSent ? (
          <View style={tw("mb-4")}>
            <Text style={tw("text-sm font-medium mb-1 text-gray-700/100")}>Enter OTP sent to your email</Text>
            <Input
              value={otp}
              onChangeText={onChangeOtp}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              style={tw("bg-gray-50/100 rounded-lg")}
            />
            {otpError && <Text style={tw("text-red-500/100 text-xs mt-1")}>{otpError}</Text>}
          </View>
        ) : null}

        <View style={tw("flex-row justify-end mt-2")}>
          <Button style={tw("mr-2 bg-gray-300/100 border-0")} onPress={onClose} disabled={isVerifying}>
            Cancel
          </Button>

          {otpSent ? (
            <Button
              style={tw("bg-purple-600/100 border-0")}
              onPress={onVerifyOtp}
              disabled={isVerifying || !otp}
              accessoryLeft={isVerifying ? () => <ActivityIndicator color="white" size="small" /> : undefined}
            >
              {isVerifying ? "Verifying" : "Verify OTP"}
            </Button>
          ) : (
            <Button
              style={tw("bg-purple-600/100 border-0")}
              onPress={onSendOtp}
              disabled={isVerifying || !email}
              accessoryLeft={isVerifying ? () => <ActivityIndicator color="white" size="small" /> : undefined}
            >
              {isVerifying ? "Sending" : "Send OTP"}
            </Button>
          )}
        </View>
      </Card>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
})

export default EditProfileModal

