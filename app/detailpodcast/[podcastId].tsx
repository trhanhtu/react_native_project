import AudioControls from '@/src/components/AudioControls';
import CommentItem from '@/src/components/CommentItem';
import PodcastPlayerImage from '@/src/components/PodcastPlayerImage';
import { useAudioPlayer } from '@/src/hooks/useAudioPlayer';
import { useDetailPodcast } from '@/src/hooks/useDetailPodcast';
import { usePodcastComments } from '@/src/hooks/usePodcastComments';
import { PodcastComment } from '@/src/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ColorValue,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTailwind } from 'tailwind-rn';

const PodcastPlayerScreen: React.FC = () => {
    const tailwind = useTailwind();
    const router = useRouter();
    const params = useLocalSearchParams<{ podcastId?: string }>();
    const podcastId = params.podcastId;

    // --- Custom Hooks ---
    const {
        podcastData,
        isLoading: isPodcastLoading,
        error: podcastError
    } = useDetailPodcast(podcastId);

    const {
        comments,
        isLoadingInitial: isCommentsLoading,
        isFetchingMore: isFetchingMoreComments,
        error: commentsError,
        fetchMoreComments
    } = usePodcastComments(podcastId);

    const {
        isPlaying,
        isAudioLoading,
        audioError,
        playbackStatus,
        formattedPosition,
        formattedDuration,
        handlePlayPause,
        handleSeekStart,
        handleSeekComplete,
    } = useAudioPlayer(podcastData?.audioUrl);

    // --- Render Loading State ---
    if (isPodcastLoading) {
        return (
            <SafeAreaView style={[styles.container, tailwind('flex-1 justify-center items-center bg-gray-900/100')]}>
                <ActivityIndicator size="large" color={tailwind('text-purple-500/100').color as ColorValue} />
                <Text style={tailwind('text-white/100 mt-4 font-medium')}>Đang tải thông tin podcast...</Text>
            </SafeAreaView>
        );
    }

    // --- Render Error State ---
    if (podcastError) {
        return (
            <SafeAreaView style={[styles.container, tailwind('flex-1 justify-center items-center bg-gray-900/100')]}>
                <Ionicons name="alert-circle" size={48} color={tailwind('text-red-500/100').color as ColorValue} />
                <Text style={tailwind('text-red-500/100 text-center px-4 mt-4')}>Lỗi: {podcastError}</Text>
                <TouchableOpacity 
                    style={tailwind('mt-6 bg-purple-600/100 px-6 py-3 rounded-full')}
                    onPress={() => router.back()}
                >
                    <Text style={tailwind('text-white/100 font-medium')}>Quay lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    
    // --- Render Main UI ---
    return (
        <SafeAreaView style={[styles.container, tailwind('flex-1 bg-gray-900/100')]}>
            {/* Header with back button */}
            <View style={tailwind('flex-row items-center px-4 py-2')}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={tailwind('w-10 h-10 rounded-full bg-gray-800/100 items-center justify-center')}
                >
                    <Ionicons name="chevron-back" size={24} color={tailwind('text-purple-400/100').color as ColorValue} />
                </TouchableOpacity>
                <Text style={tailwind('text-white/100 text-lg font-medium ml-3')}>Nghe Podcast</Text>
            </View>
            
            <FlatList
                ListHeaderComponent={
                    <View style={tailwind('px-4')}> 
                        {/* Podcast Image and Info */}
                        <View style={[tailwind('items-center pt-6 pb-4 rounded-3xl mt-2 bg-gray-800/100'), CustomStyles.shadow]}>
                            <PodcastPlayerImage
                                imageUrl={podcastData?.audioUrl ? `https://picsum.photos/300/300?random=${podcastId}` : 'https://via.placeholder.com/240'}
                                size={220}
                            />
                            {podcastData && (
                                <React.Fragment>
                                    <Text style={tailwind('text-white/100 text-xl font-bold mt-6 text-center px-4')}>
                                        {podcastData.title}
                                    </Text>
                                    <View style={tailwind('flex-row items-center mt-2 bg-purple-900/100 px-4 py-1 rounded-full')}>
                                        <Ionicons name="flame" size={16} color={tailwind('text-purple-300/100').color as ColorValue} />
                                        <Text style={tailwind('text-purple-300/100 text-base ml-1 font-medium')}>
                                            Nguyên tố: {podcastData.element}
                                        </Text>
                                    </View>
                                </React.Fragment>
                            )}
                        </View>

                        {/* Audio Controls */}
                        {podcastData?.audioUrl && ( 
                            <View style={[tailwind('mt-4 rounded-2xl bg-gray-800/100 py-3'), CustomStyles.shadow]}>
                                <AudioControls
                                    isPlaying={isPlaying}
                                    isAudioLoading={isAudioLoading}
                                    formattedPosition={formattedPosition}
                                    formattedDuration={formattedDuration}
                                    playbackStatus={playbackStatus}
                                    audioError={audioError}
                                    onPlayPause={handlePlayPause}
                                    onSeekStart={handleSeekStart}
                                    onSeekComplete={handleSeekComplete}
                                />
                            </View>
                        )}

                        {/* Comments Header */}
                        <View style={tailwind('pt-6 pb-2')}>
                            <View style={tailwind('flex-row items-center')}>
                                <Ionicons name="chatbubble-ellipses" size={22} color={tailwind('text-purple-400/100').color as ColorValue} />
                                <Text style={tailwind('text-white/100 text-lg font-semibold ml-2')}>
                                    Bình luận
                                </Text>
                            </View>
                            
                            {isCommentsLoading && (
                                <View style={tailwind('py-6 items-center w-full')}>
                                    <ActivityIndicator size="small" color={tailwind('text-purple-400/100').color as ColorValue} />
                                    <Text style={tailwind('text-gray-400/100 mt-2')}>Đang tải bình luận...</Text>
                                </View>
                            )}
                            
                            {commentsError && !isCommentsLoading && (
                                <View style={tailwind('bg-red-900/100 rounded-lg p-3 mt-3')}>
                                    <Text style={tailwind('text-red-300/100 text-center')}>
                                        Lỗi tải bình luận: {commentsError}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                }
                data={comments}
                renderItem={({ item }: { item: PodcastComment }) => (
                    <View style={tailwind('px-4 mb-2')}>
                        <CommentItem comment={item} />
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={fetchMoreComments}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => (
                    isFetchingMoreComments ? (
                        <View style={tailwind('py-6 items-center')}>
                            <ActivityIndicator size="small" color={tailwind('text-purple-400/100').color as ColorValue} />
                        </View>
                    ) : <View style={tailwind('h-8')} />
                )}
                ListEmptyComponent={() => (
                    !isCommentsLoading && !commentsError && comments.length === 0 ? (
                        <View style={[tailwind('items-center py-8 px-4 mx-4 bg-gray-800/100 rounded-xl mt-2'), CustomStyles.shadow]}>
                            <Ionicons name="chatbubbles-outline" size={40} color={tailwind('text-gray-500/100').color as ColorValue} />
                            <Text style={tailwind('text-gray-400/100 text-center mt-3')}>Chưa có bình luận nào.</Text>
                            <TouchableOpacity style={tailwind('mt-4 bg-purple-600/100 px-5 py-2 rounded-full')}>
                                <Text style={tailwind('text-white/100')}>Thêm bình luận đầu tiên</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                )}
                style={isPodcastLoading || podcastError ? styles.hidden : {}}
                contentContainerStyle={tailwind('pb-6')}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hidden: {
        display: 'none',
    },
});

const CustomStyles = {
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    }
};

export default PodcastPlayerScreen;