import CustomStyles from "@/src/utils/styles"
import { Card, Text } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'
import { useTailwind } from 'tailwind-rn'
import PodcastItem from './PodcastItem'

interface FavoritePodcastsCardProps {
    favoritePodcasts: any[], // array of FavoritePodcast_t; update type as needed
    onPressPodcast: (id: string) => void,
}

const FavoritePodcastsCard: React.FC<FavoritePodcastsCardProps> = ({ favoritePodcasts, onPressPodcast }) => {
    const tw = useTailwind()
    return (
        <Card style={[tw("mb-6 rounded-xl"), CustomStyles.shadow]}>
            <View style={tw("p-4")}>
                <Text style={tw("text-lg font-bold text-gray-800 mb-4")}>Favorite Podcasts</Text>
                {favoritePodcasts && favoritePodcasts.length > 0 ? (
                    <View>
                        {favoritePodcasts.map((fav) => (
                            <View key={fav.element.id}>
                                <PodcastItem
                                    item={fav.element}
                                    onPress={() => onPressPodcast(fav.element.id)}
                                />
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={tw("text-gray-500 italic")}>No favorite podcasts yet</Text>
                )}
            </View>
        </Card>
    )
}

export default FavoritePodcastsCard
