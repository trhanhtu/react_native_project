// Filename: AccountSettingsCard.tsx
import CustomStyles from "@/src/utils/styles"
import { Button, Card, Text } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'
import { useTailwind } from 'tailwind-rn'

interface AccountSettingsCardProps {
  onEdit: () => void
}

const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({ onEdit }) => {
  const tw = useTailwind()
  return (
    // Card container with shadow and rounded corners
    <Card style={[tw("mb-6 rounded-xl"), CustomStyles.shadow]}>
      <View style={tw("p-4")}>
        
        <Text style={tw("text-lg font-bold text-gray-800/100 mb-4")}>
            Cài đặt tài khoản
        </Text>
        
        <Button onPress={onEdit} style={tw("bg-purple-600/100 border-0")}>
            Chỉnh sửa hồ sơ
        </Button>
      </View>
    </Card>
  )
}

export default AccountSettingsCard