// Filename: PodcastScreen.tsx
import PodcastListItem from '@/src/components/PodcastListItem';
import TopBar from '@/src/components/PodcastListTopBar'; // Assuming this component might need translation internally
import { usePodcastsByElement } from '@/src/hooks/usePodcastByElement';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Button, Icon, Layout, Text } from '@ui-kitten/components';
import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

//------------------------------------------------------
// Type Definitions
//------------------------------------------------------
// Define the type for the route params
type PodcastScreenRouteParams = {
    elementName: string;
};

// Define the route prop type
type PodcastScreenRouteProp = RouteProp<{ Params: PodcastScreenRouteParams }, 'Params'>;

//------------------------------------------------------
// Main Screen Component: PodcastScreen
//------------------------------------------------------
const PodcastScreen: React.FC = () => {
    const tailwind = useTailwind();

    //----------------------------------
    // Navigation & Hooks
    //----------------------------------
    const route = useRoute<PodcastScreenRouteProp>();
    const { elementName } = route.params;

    const {
        podcasts,
        loading,
        loadingMore,
        error,
        searchFilter, // Assuming search logic handles Vietnamese characters if needed
        setSearchFilter,
        loadMorePodcasts,
        refreshPodcasts
    } = usePodcastsByElement(elementName);

    //----------------------------------
    // Event Handlers
    //----------------------------------
    const handleSearch = (query: string) => {
        setSearchFilter(query);
    };

    //----------------------------------
    // Render Functions
    //----------------------------------
    const renderFooter = () => {
        // Guard clause: Don't render if not loading more
        if (!loadingMore) return null;

        return (
            <View style={tailwind('p-4 items-center')}>
                
                <ActivityIndicator size="small" color={tailwind('text-purple-600/100').color as string} />
                 
            </View>
        );
    };

    const renderEmptyState = () => {
        // Guard clause: Don't render empty state during initial load
        if (loading && podcasts.length === 0) return null; // Adjusted condition to avoid showing during initial load

        const emptyMessage = error ? error : 'Không tìm thấy podcast nào cho nguyên tố này.'; // Translated default message

        return (
            <View style={tailwind('flex-1 justify-center items-center p-5')}>
                <Icon name='alert-circle-outline' width={48} height={48} fill={tailwind('text-gray-400/100').color} />
                <Text category='h6' style={tailwind('mt-4 text-center text-gray-500/100')}>
                    
                    {emptyMessage}
                </Text>
                
                {error && (
                    <Button
                        style={tailwind('mt-4')}
                        onPress={() => refreshPodcasts()}
                        appearance='outline'
                        status='primary'
                    >
                        Thử lại 
                    </Button>
                )}
            </View>
        );
    };

    //----------------------------------
    // Main Render
    //----------------------------------
    return (
        <SafeAreaView style={tailwind('flex-1 bg-white/100')}>
            <Layout style={tailwind('flex-1')}>
                
                
                <TopBar onSearch={handleSearch} />

                
                {loading && podcasts.length === 0 ? (
                     // Initial loading state
                    <View style={tailwind('flex-1 justify-center items-center')}>
                        <ActivityIndicator size="large" color={tailwind('text-purple-600/100').color as string} />
                         
                    </View>
                ) : (
                    // Podcast list
                    <FlatList
                        data={podcasts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <PodcastListItem item={item} />} // PodcastListItem might need internal translations
                        onEndReached={loadMorePodcasts}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmptyState} // Handles empty list or error display
                        contentContainerStyle={podcasts.length === 0 ? tailwind('flex-1') : null} // Ensure empty state fills screen
                    />
                )}
            </Layout>
        </SafeAreaView>
    );
};

export default PodcastScreen;