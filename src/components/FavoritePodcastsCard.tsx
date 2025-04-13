// FavoritePodcastsCard.tsx
import CustomStyles from "@/src/utils/styles";
// MISSING: Similar to ViewedPodcastsCard, needs augmented data with `id: string`.
// Assumes `favoritePodcasts` is `AugmentedFavoritePodcast[]`.
// type AugmentedFavoritePodcast = FavoritePodcast_t & { id: string };
import { FavoritePodcast_t } from "@/src/utils/types"; // Corrected path
import { Card, Text } from '@ui-kitten/components';
import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import PodcastItem from './PodcastItem'; // Assuming PodcastItem expects `id: string`



interface FavoritePodcastsCardProps {
    favoritePodcasts: FavoritePodcast_t[], // Use augmented type
    onPressPodcast: (id: number) => void, // ID is string
}

const FavoritePodcastsCard: React.FC<FavoritePodcastsCardProps> = ({ favoritePodcasts, onPressPodcast }) => {
    const tw = useTailwind()
    return (
        <Card style={[tw("mb-6 rounded-xl bg-white/100"), CustomStyles.shadow]}>
            <View style={tw("p-4")}>
                <Text style={tw("text-lg font-bold text-gray-800/100 mb-4")}>Favorite Podcasts</Text>
                {favoritePodcasts && favoritePodcasts.length > 0 ? (
                    <View>
                        {/* Use podcast ID (string) as key */}
                        {favoritePodcasts.map((fav) => (
                            <View key={`favpod${fav.podcastId}`} style={tw("mb-3")}>
                                <PodcastItem
                                    // Pass necessary props to PodcastItem
                                    item={{
                                        podcastId: fav.podcastId,
                                        title: fav.title,
                                        elementName: fav.elementName,
                                        // Add other fields PodcastItem expects
                                    }}
                                    isFavorite={true} // These are favorites
                                    onPress={() => onPressPodcast(fav.podcastId)} // Pass string ID
                                />
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={tw("text-gray-500/100 italic text-center py-4")}>No favorite podcasts yet</Text>
                )}
            </View>
        </Card>
    )
}

export default FavoritePodcastsCard