import { Text } from '@ui-kitten/components'
import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { useTailwind } from 'tailwind-rn'

interface ElementItemProps {
  item: any, // Replace `any` with your DetailElement_t type when available
  isFavorite?: boolean,
  onPress: () => void,
  lastSeen?: string,
}

const ElementItem: React.FC<ElementItemProps> = ({ item, isFavorite = true, onPress, lastSeen }) => {
  const tw = useTailwind()
  return (
    <TouchableOpacity style={tw("mr-4 w-24 items-center")} onPress={onPress}>
      <View style={tw("w-20 h-20 rounded-lg overflow-hidden bg-gray-200 mb-2")}>
        <Image source={{ uri: item.image }} style={tw("w-full h-full")} resizeMode="cover" />
      </View>
      <Text style={tw("text-center font-bold text-gray-800")}>{item.symbol}</Text>
      <Text style={tw("text-center text-xs text-gray-600")}>{item.name}</Text>
      {!isFavorite && lastSeen && (
        <Text style={tw("text-center text-xs text-gray-500 mt-1")}>
          {new Date(lastSeen).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  )
}

export default ElementItem
