// ViewedPodcastsCard.tsx
import CustomStyles from "@/src/utils/styles";
// MISSING: The parent component (profile.tsx) needs to provide an array of podcasts
// where each object includes the `id: string` field, which is missing from the base `ViewedPodcast_t`.
// This component assumes `viewedPodcasts` is `AugmentedViewedPodcast[]` (defined in profile.tsx or types.ts).
// type AugmentedViewedPodcast = ViewedPodcast_t & { id: string };
import { ViewedPodcast_t } from "@/src/utils/types"; // Corrected path
import { Button, Card, Text } from '@ui-kitten/components';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import PodcastItem from './PodcastItem';



interface ViewedPodcastsCardProps {
  viewedPodcasts: ViewedPodcast_t[], // Use augmented type
  hasMore: boolean,
  loadingMore: boolean,
  onLoadMore: () => void,
  onPressPodcast: (id: number) => void, // ID is string for podcast
}

const ViewedPodcastsCard: React.FC<ViewedPodcastsCardProps> = ({
  viewedPodcasts,
  hasMore,
  loadingMore,
  onLoadMore,
  onPressPodcast,
}) => {
  const tw = useTailwind()
  return (
    <Card style={[tw("mb-6 rounded-xl bg-white/100"), CustomStyles.shadow]}>
      <View style={tw("p-4")}>
        <Text style={tw("text-lg font-bold text-gray-800/100 mb-4")}>Recently Viewed Podcasts</Text>
        {viewedPodcasts && viewedPodcasts.length > 0 ? (
          <View>
            {/* Use podcast ID (string) as key */}
            {viewedPodcasts.map((item) => (
              <View key={item.id} style={tw("mb-3")}>
                <PodcastItem
                  // MISSING: PodcastItem might need more props than available in AugmentedViewedPodcast
                  // It likely needs title, elementName, etc.
                  item={{
                      id: item.id,
                      title: item.title,
                      elementName: item.elementName,
                      // Add other fields PodcastItem expects, potentially from a fetch if needed
                  }}
                  isFavorite={false} // Viewed items are not necessarily favorite
                  onPress={() => onPressPodcast(item.id)} // Pass string ID
                  lastSeen={item.lastSeen} // Pass lastSeen if PodcastItem uses it
                />
              </View>
            ))}
            {hasMore && (
              <Button
                onPress={onLoadMore}
                style={tw("mt-4 bg-gray-200/100 border-0")} // Adjusted color slightly
                disabled={loadingMore}
                appearance='ghost' // Less prominent load more button
                status='basic'
                accessoryLeft={
                  loadingMore ? () => <ActivityIndicator size="small" color="#8B5CF6" /> : undefined
                }
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            )}
          </View>
        ) : (
          <Text style={tw("text-gray-500/100 italic text-center py-4")}>No viewed podcasts yet</Text>
        )}
      </View>
    </Card>
  )
}

export default ViewedPodcastsCard