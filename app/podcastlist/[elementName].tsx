import PodcastListItem from '@/src/components/PodcastListItem';
import TopBar from '@/src/components/PodcastListTopBar';
import { usePodcastsByElement } from '@/src/hooks/usePodcastByElement';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Button, Icon, Layout, Text } from '@ui-kitten/components';
import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

// Define the type for the route params
type PodcastScreenRouteParams = {
    elementName: string;
};

// Define the route prop type
type PodcastScreenRouteProp = RouteProp<{ Params: PodcastScreenRouteParams }, 'Params'>;

const PodcastScreen: React.FC = () => {
    const tailwind = useTailwind();

    const route = useRoute<PodcastScreenRouteProp>();
    const { elementName } = route.params;

    const {
        podcasts,
        loading,
        loadingMore,
        error,
        searchFilter,
        setSearchFilter,
        loadMorePodcasts,
        refreshPodcasts
    } = usePodcastsByElement(elementName);

    const handleSearch = (query: string) => {
        setSearchFilter(query);
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={tailwind('p-4 items-center')}>
                <ActivityIndicator size="small" />
            </View>
        );
    };

    const renderEmptyState = () => {
        if (loading) return null;
        return (
            <View style={tailwind('flex-1 justify-center items-center p-5')}>
                <Icon name='alert-circle-outline' width={48} height={48} fill={tailwind('text-gray-400/100').color} />
                <Text category='h6' style={tailwind('mt-4 text-center')}>
                    {error ? error : 'No podcasts found for this element.'}
                </Text>
                {error && (
                    <Button style={tailwind('mt-4')} onPress={() => refreshPodcasts()}>
                        Retry
                    </Button>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={tailwind('flex-1 bg-white/100')}>
            <Layout style={tailwind('flex-1')}>
                <TopBar onSearch={handleSearch} />
                {loading && podcasts.length === 0 ? (
                    <View style={tailwind('flex-1 justify-center items-center')}>
                        <ActivityIndicator size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={podcasts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <PodcastListItem item={item} />}
                        onEndReached={loadMorePodcasts}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmptyState}
                        contentContainerStyle={podcasts.length === 0 ? tailwind('flex-1') : null}
                    />
                )}
            </Layout>
        </SafeAreaView>
    );
};

export default PodcastScreen;