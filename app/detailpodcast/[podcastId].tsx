import AudioControls from '@/src/components/AudioControls';
import CommentInput from '@/src/components/CommentInput';
import CommentItem from '@/src/components/CommentItem';
import PodcastPlayerImage from '@/src/components/PodcastPlayerImage';
import TranscriptItem from '@/src/components/TranscriptItem';
import { useAudioPlayer } from '@/src/hooks/useAudioPlayer';
import { useDetailPodcast } from '@/src/hooks/useDetailPodcast';
import { usePodcastComments } from '@/src/hooks/usePodcastComments';
import { PodcastComment, Podcast_t } from '@/src/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { Tab, TabView } from '@ui-kitten/components';
import { AVPlaybackStatusSuccess } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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

// --- Helper Functions / Sub-Components (defined within the same file) ---

// --- Loading State ---
const LoadingIndicator = ({ tailwind }: { tailwind: any }) => (
    <SafeAreaView style={[styles.container, tailwind('flex-1 justify-center items-center bg-gray-900/100')]}>
        <ActivityIndicator size="large" color={tailwind('text-purple-500/100').color as ColorValue} />
        <Text style={tailwind('text-white/100 mt-4 font-medium')}>Đang tải thông tin podcast...</Text>
    </SafeAreaView>
);

// --- Error State ---
interface ErrorDisplayProps {
    tailwind: any;
    error: string | null;
    onBack: () => void;
}
const ErrorDisplay = ({ tailwind, error, onBack }: ErrorDisplayProps) => (
    <SafeAreaView style={[styles.container, tailwind('flex-1 justify-center items-center bg-gray-900/100')]}>
        <Ionicons name="alert-circle" size={48} color={tailwind('text-red-500/100').color as ColorValue} />
        <Text style={tailwind('text-red-500/100 text-center px-4 mt-4')}>Lỗi: {error || 'Đã có lỗi xảy ra.'}</Text>
        <TouchableOpacity
            style={tailwind('mt-6 bg-purple-600/100 px-6 py-3 rounded-full')}
            onPress={onBack}
        >
            <Text style={tailwind('text-white/100 font-medium')}>Quay lại</Text>
        </TouchableOpacity>
    </SafeAreaView>
);

// --- Screen Header ---
interface ScreenHeaderProps {
    tailwind: any;
    onBack: () => void;
}
const ScreenHeader = ({ tailwind, onBack }: ScreenHeaderProps) => (
    <View style={tailwind('flex-row items-center px-4 py-2')}>
        <TouchableOpacity
            onPress={onBack}
            style={tailwind('w-10 h-10 rounded-full bg-gray-800/100 items-center justify-center')}
        >
            <Ionicons name="chevron-back" size={24} color={tailwind('text-purple-400/100').color as ColorValue} />
        </TouchableOpacity>
        <Text style={tailwind('text-white/100 text-lg font-medium ml-3')}>Nghe Podcast</Text>
    </View>
);

// --- Podcast Info Card ---
interface PodcastInfoCardProps {
    tailwind: any;
    podcastData: Podcast_t | null;
    podcastId: string | undefined;
}
const PodcastInfoCard = ({ tailwind, podcastData, podcastId }: PodcastInfoCardProps) => (
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
);

// --- Audio Player Controls Wrapper ---
interface AudioPlayerControlsWrapperProps {
    tailwind: any;
    audioUrl: string | undefined;
    isPlaying: boolean;
    isAudioLoading: boolean;
    audioError: string | null;
    playbackStatus: Partial<AVPlaybackStatusSuccess>;
    formattedPosition: string;
    formattedDuration: string;
    handlePlayPause: () => void;
    handleSeekStart: () => void;
    handleSeekComplete: (value: number) => void;
}
const AudioPlayerControlsWrapper = ({
    tailwind, audioUrl, isPlaying, isAudioLoading, audioError,
    playbackStatus, formattedPosition, formattedDuration,
    handlePlayPause, handleSeekStart, handleSeekComplete
}: AudioPlayerControlsWrapperProps) => {
    if (!audioUrl) {
        return null;
    }
    return (
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
    );
};

// --- Comments Section Header ---
interface CommentsHeaderProps {
    tailwind: any;
    isCommentsLoading: boolean;
    commentsError: string | null;
}
const CommentsHeader = ({ tailwind, isCommentsLoading, commentsError }: CommentsHeaderProps) => (
    <View style={tailwind('pb-2')}>
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
);

// --- Comments List Footer (Loading More Indicator) ---
interface CommentsListFooterProps {
    tailwind: any;
    isFetchingMore: boolean;
}
const CommentsListFooter = ({ tailwind, isFetchingMore }: CommentsListFooterProps) => {
    if (isFetchingMore) {
        return (
            <View style={tailwind('py-6 items-center')}>
                <ActivityIndicator size="small" color={tailwind('text-purple-400/100').color as ColorValue} />
            </View>
        );
    }
    return <View style={tailwind('h-8')} />;
};

// --- Comments Empty State ---
interface CommentsEmptyStateProps {
    tailwind: any;
}
const CommentsEmptyState = ({ tailwind }: CommentsEmptyStateProps) => (
    <View style={[tailwind('items-center py-8 px-4 bg-gray-800/100 rounded-xl mt-2'), CustomStyles.shadow]}>
        <Ionicons name="chatbubbles-outline" size={40} color={tailwind('text-gray-500/100').color as ColorValue} />
        <Text style={tailwind('text-gray-400/100 text-center mt-3')}>Chưa có bình luận nào.</Text>
        <TouchableOpacity style={tailwind('mt-4 bg-purple-600/100 px-5 py-2 rounded-full')}>
            <Text style={tailwind('text-white/100')}>Thêm bình luận đầu tiên</Text>
        </TouchableOpacity>
    </View>
);

// --- Transcript Empty State ---
interface TranscriptEmptyStateProps {
    tailwind: any;
}
const TranscriptEmptyState = ({ tailwind }: TranscriptEmptyStateProps) => (
    <View style={[tailwind('items-center py-8 px-4 bg-gray-800/100 rounded-xl mt-2'), CustomStyles.shadow]}>
        <Ionicons name="document-text-outline" size={40} color={tailwind('text-gray-500/100').color as ColorValue} />
        <Text style={tailwind('text-gray-400/100 text-center mt-3')}>Không có lời thoại cho podcast này.</Text>
    </View>
);

// --- Tab Title Components ---
const CommentsTabTitle = ({ tailwind }: { tailwind: any }) => (
    <View style={tailwind('flex-row items-center justify-center')}>
        <Ionicons name="chatbubble-ellipses" size={18} color={tailwind('text-purple-400/100').color as ColorValue} />
        <Text style={tailwind('text-purple-400/100 ml-2 font-medium')}>Bình luận</Text>
    </View>
);

const TranscriptTabTitle = ({ tailwind }: { tailwind: any }) => (
    <View style={tailwind('flex-row items-center justify-center')}>
        <Ionicons name="document-text" size={18} color={tailwind('text-purple-400/100').color as ColorValue} />
        <Text style={tailwind('text-purple-400/100 ml-2 font-medium')}>Lời thoại</Text>
    </View>
);

// --- Main Screen Component ---
const PodcastPlayerScreen: React.FC = () => {
    const tailwind = useTailwind();
    const router = useRouter();
    const params = useLocalSearchParams<{ podcastId?: string }>();
    const podcastId = params.podcastId;

    // State for active tab
    const [selectedIndex, setSelectedIndex] = useState(0);

    // --- Custom Hooks ---
    const { podcastData, isLoading: isPodcastLoading, error: podcastError, } = useDetailPodcast(podcastId);
    const { comments, isLoadingInitial: isCommentsLoading, isFetchingMore: isFetchingMoreComments, error: commentsError, fetchMoreComments,handleCommentSubmit } = usePodcastComments(podcastId);
    const { isPlaying,
        isAudioLoading,
        audioError,
        playbackStatus,
        formattedPosition,
        formattedDuration,
        handlePlayPause,
        handleSeekStart,
        handleSeekComplete, } = useAudioPlayer(podcastData?.audioUrl);

    // --- Render Loading State ---
    if (isPodcastLoading) {
        return <LoadingIndicator tailwind={tailwind} />;
    }

    // --- Render Error State ---
    if (podcastError) {
        return <ErrorDisplay tailwind={tailwind} error={podcastError} onBack={() => router.back()} />;
    }

    // --- Render Function for Empty Comments ---
    const renderEmptyComments = () => {
        if (!isCommentsLoading && !commentsError && comments && comments.length === 0) {
            return <CommentsEmptyState tailwind={tailwind} />;
        }
        return null;
    };

    // --- Render Function for Empty Transcript ---
    const renderEmptyTranscript = () => {
        if (!podcastData?.transcript) {
            return <TranscriptEmptyState tailwind={tailwind} />;
        }
        return null;
    };

    // --- Render Main UI ---
    return (
        <SafeAreaView style={[styles.container, tailwind('flex-1 bg-gray-900/100')]}>
            <ScreenHeader tailwind={tailwind} onBack={() => router.back()} />

            {/* Podcast Info and Audio Controls */}
            <View style={tailwind('px-4')}>
                <PodcastInfoCard
                    tailwind={tailwind}
                    podcastData={podcastData}
                    podcastId={podcastId}
                />
                <AudioPlayerControlsWrapper
                    tailwind={tailwind}
                    audioUrl={podcastData?.audioUrl}
                    isPlaying={isPlaying}
                    isAudioLoading={isAudioLoading}
                    audioError={audioError}
                    playbackStatus={playbackStatus}
                    formattedPosition={formattedPosition}
                    formattedDuration={formattedDuration}
                    handlePlayPause={handlePlayPause}
                    handleSeekStart={handleSeekStart}
                    handleSeekComplete={handleSeekComplete}
                />
            </View>

            {/* UI Kitten TabView */}
            <View style={tailwind('flex-1 px-4 mt-4')}>
                <TabView
                    selectedIndex={selectedIndex}
                    onSelect={index => setSelectedIndex(index)}
                    style={[tailwind('flex-1 rounded-xl overflow-hidden'), CustomStyles.shadow]}
                    tabBarStyle={tailwind('bg-gray-800/100')}
                    indicatorStyle={tailwind('bg-purple-600/100')}
                >
                    <Tab title={() => <CommentsTabTitle tailwind={tailwind} />}>
                        <View style={tailwind('flex-1 bg-gray-900/100 p-2')}>
                            <CommentsHeader
                                tailwind={tailwind}
                                isCommentsLoading={isCommentsLoading}
                                commentsError={commentsError}
                            />

                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={comments}
                                renderItem={({ item }: { item: PodcastComment }) => (
                                    <View style={tailwind('mb-2')}>
                                        <CommentItem comment={item} />
                                    </View>
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                onEndReached={fetchMoreComments}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={
                                    <>
                                        {isFetchingMoreComments && (
                                            <View style={tailwind('py-6 items-center')}>
                                                <ActivityIndicator size="small" color={tailwind('text-purple-400/100').color as ColorValue} />
                                            </View>
                                        )}
                                        <View style={tailwind('h-4')} />
                                    </>
                                }
                                ListEmptyComponent={renderEmptyComments}
                                contentContainerStyle={tailwind('pb-20')} // Add more padding to accommodate the input
                            />

                            {/* Add the comment input at the bottom */}
                            <View style={tailwind('absolute bottom-0 left-0 right-0 px-2 pb-2 bg-gray-900/100')}>
                                <CommentInput onSubmit={handleCommentSubmit} />
                            </View>
                        </View>
                    </Tab>
                    <Tab title={() => <TranscriptTabTitle tailwind={tailwind} />}>
                        <View style={tailwind('flex-1 bg-gray-900/100 p-2')}>
                            {podcastData?.transcript ? (
                                <TranscriptItem transcript={podcastData.transcript} />
                            ) : (
                                renderEmptyTranscript()
                            )}
                        </View>
                    </Tab>
                </TabView>
            </View>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
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