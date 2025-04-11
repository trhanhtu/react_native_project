import CustomStyles from "@/src/utils/styles"
import { Button, Card, Text } from '@ui-kitten/components'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useTailwind } from 'tailwind-rn'
import { ViewedPodcast_t } from "../utils/types"
import PodcastItem from './PodcastItem'

interface ViewedPodcastsCardProps {
  viewedPodcasts: ViewedPodcast_t[], // array of ViewedPodcast_t; update type as needed
  hasMore: boolean,
  loadingMore: boolean,
  onLoadMore: () => void,
  onPressPodcast: (id: string) => void,
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
    <Card style={[tw("mb-6 rounded-xl"), CustomStyles.shadow]}>
      <View style={tw("p-4")}>
        <Text style={tw("text-lg font-bold text-gray-800/100 mb-4")}>Recently Viewed Podcasts</Text>
        {viewedPodcasts && viewedPodcasts.length > 0 ? (
          <View>
            {viewedPodcasts.map((item) => (
              <View key={item.podcast.id}>
                <PodcastItem
                  item={item.podcast}
                  isFavorite={false}
                  onPress={() => onPressPodcast(item.podcast.id)}
                  lastSeen={item.lastSeen}
                />
              </View>
            ))}
            {hasMore && (
              <Button
                onPress={onLoadMore}
                style={tw("mt-4 bg-gray-200/100 border-0")}
                disabled={loadingMore}
                accessoryLeft={
                  loadingMore ? () => <ActivityIndicator size="small" color="#8B5CF6" /> : undefined
                }
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            )}
          </View>
        ) : (
          <Text style={tw("text-gray-500/100 italic")}>No viewed podcasts yet</Text>
        )}
      </View>
    </Card>
  )
}

export default ViewedPodcastsCard
