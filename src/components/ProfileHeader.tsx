// ProfileHeader.tsx
import { Avatar, Text } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'
import { useTailwind } from 'tailwind-rn'

interface ProfileHeaderProps {
  avatar: string,
  name: string,
  email: string,
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ avatar, name, email }) => {
  const tw = useTailwind()
  return (
    // Add pt for status bar height if needed (using safe-area-view is better)
    <View style={tw("bg-purple-600/100 pt-12 pb-20 px-4")}>
      <View style={tw("flex-row items-center")}>
        <Avatar
          source={{ uri: avatar }}
          size="giant"
          style={tw("border-4 border-white/100 bg-purple-400/100")} // Added fallback bg
        />
        <View style={tw("ml-4 flex-shrink")}>
          <Text style={tw("text-2xl font-bold text-white/100")} numberOfLines={1} ellipsizeMode='tail'>{name}</Text>
          <Text style={tw("text-white/100 opacity-80")} numberOfLines={1} ellipsizeMode='tail'>{email}</Text>
        </View>
      </View>
    </View>
  )
}

export default ProfileHeader