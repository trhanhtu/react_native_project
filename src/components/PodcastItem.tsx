import { Text } from '@ui-kitten/components'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useTailwind } from 'tailwind-rn'

interface PodcastItemProps {
    item: any, // Replace `any` with your Podcast_t type when available
    isFavorite?: boolean,
    onPress: () => void,
    lastSeen?: string,
}

const PodcastItem: React.FC<PodcastItemProps> = ({ item, isFavorite = true, onPress, lastSeen }) => {
    const tw = useTailwind()
    return (
        <TouchableOpacity style={tw("mb-4 p-3 bg-gray-50 rounded-lg")} onPress={onPress}>
            <Text style={tw("font-bold text-gray-800")}>{item.title}</Text>
            <Text style={tw("text-xs text-gray-600 mt-1")} numberOfLines={2}>
                {item.transcript.substring(0, 100)}...
            </Text>
            {!isFavorite && lastSeen && (
                <Text style={tw("text-xs text-gray-500 mt-2")}>
                    Listened on {new Date(lastSeen).toLocaleDateString()}
                </Text>
            )}
        </TouchableOpacity>
    )
}

export default PodcastItem
