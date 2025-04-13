import { Podcast_t } from '@/src/utils/types';
import { Icon, Text } from '@ui-kitten/components';
import { Href, router } from 'expo-router';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface PodcastListItemProps {
  item: Podcast_t;
}

const PodcastListItem: React.FC<PodcastListItemProps> = ({ item }) => {
  const tailwind = useTailwind();

  const placeholderImageUrl = `https://picsum.photos/seed/${item.element}/80/80`;

  const handlePodcastPress = () => {
    // Navigate to podcast details screen
    router.push(`detailpodcast/${item.id}` as Href);
  };

  const handlePlayPress = () => {
    // Play the podcast directly or navigate to player
    console.log('Play podcast:', item.id);
    
  };

  return (
    <TouchableOpacity
      style={tailwind('p-4 border-b border-gray-200/100 flex-row items-center')}
      onPress={handlePodcastPress}
    >
      <Image
        source={{ uri: placeholderImageUrl }}
        style={{ width: 60, height: 60, borderRadius: 8 }}
      />
      <View style={tailwind('ml-4 flex-1')}>
        <Text category="s1" numberOfLines={1}>{item.title}</Text>
        <Text appearance="hint" numberOfLines={2}>
          {item.transcript ? item.transcript.substring(0, 100) + '...' : 'No description available'}
        </Text>
        <Text appearance='hint' category='c1'>Element: {item.element} - {item.active ? 'Active' : 'Inactive'}</Text>
      </View>
      <TouchableOpacity onPress={handlePlayPress}>
        <Icon name='play-circle-outline' width={32} height={32} fill='#007AFFFF' />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default PodcastListItem;