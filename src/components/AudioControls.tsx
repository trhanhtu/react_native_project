// Filename: AudioControls.tsx
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
// ... other imports
import CustomStyles from '@/src/utils/styles'; // Assuming path for CustomStyles
import { Spinner, Text } from '@ui-kitten/components'; // Added Spinner for loading state
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import { Href, router } from 'expo-router';
import React from 'react'; // Added React import for React.FC
import { ActivityIndicator, ColorValue, Text as RNText, StyleSheet, TouchableOpacity, View } from 'react-native'; // Use RNText for better styling control sometimes
import { useTailwind } from 'tailwind-rn';
import usePodcastFavorite from '../hooks/usePodcastFavorite'; // Hook might contain logic affecting display
import useRepeatMode from '../hooks/useRepeatMode'; // Hook likely provides 'repeatText' which may need translation inside the hook itself
import { RepeatMode } from '../utils/types';

interface Props {
    podcastId: number;
    isPlaying: boolean;
    isAudioLoading: boolean;
    formattedPosition: string;
    formattedDuration: string;
    playbackStatus: Partial<AVPlaybackStatusSuccess>;
    audioError: string | null; // Error message comes from parent, needs translation at the source if hardcoded English
    onPlayPause: () => void;
    onSeekStart: () => void;
    onSeekComplete: (value: number) => void;
    soundObject: Audio.Sound | null; // Pass the sound object down
    initialRepeatMode?: RepeatMode; // Optional: Allow parent to set initial mode
    onRepeatModeChange: (mode: RepeatMode) => void; // Callback to inform parent
}

const AudioControls: React.FC<Props> = ({
    podcastId,
    isPlaying,
    isAudioLoading,
    formattedPosition,
    formattedDuration,
    playbackStatus,
    audioError, // Displayed directly, translation should happen before passing to this component if needed
    onPlayPause,
    onSeekStart,
    onSeekComplete,
    soundObject, // Get the sound object
    initialRepeatMode = 'off', // Default to 'off'
    onRepeatModeChange, // Get the callback
}) => {
    const tailwind = useTailwind();
    // Use the new hook for favorite logic
    const { isFavorited, isTogglingFavorite, handleToggleFavorite } = usePodcastFavorite(podcastId);

    const positionMillis = playbackStatus.positionMillis ?? 0;
    const durationMillis = GetDurationMillis(playbackStatus.durationMillis);
    const progressPercent = durationMillis > 1 ? Math.min(100, Math.round((positionMillis / durationMillis) * 100)) : 0; // Avoid division by zero/invalid duration

    // Hook provides repeat icon and text. Translation for "Off", "Repeat All", "Repeat One" should happen *inside* useRepeatMode hook.
    const { repeatIconName,
        repeatMode,
        repeatText, // This text comes from the hook
        handleToggleRepeat
    } = useRepeatMode(soundObject, initialRepeatMode, onRepeatModeChange);

    // Component to render favorite icon or spinner
    const FavoriteIcon = ({ size, color }: { size: number; color: ColorValue }) => {
        if (isTogglingFavorite) {
            // Show spinner while toggling
            return <Spinner size="tiny" status="basic" />;
        }
        // Show filled heart if favorited, outline if not or status is unknown
        return <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={size} color={isFavorited ? tailwind('text-red-500/100').color as ColorValue : color} />;
    };

    // Determine Repeat Button Appearance
    const repeatIconColor = repeatMode !== 'off'
        ? (tailwind('text-purple-400/100').color as ColorValue) // Active color
        : (tailwind('text-gray-400/100').color as ColorValue); // Inactive color

    return (
        // Main container with padding and background
        <View style={tailwind('w-full px-5 pb-4 pt-2 bg-gray-800/100 rounded-t-2xl')}>
            
            <View style={tailwind('flex-row items-center justify-between mb-1')}>
                <Text style={tailwind('text-purple-300/100 text-xs font-medium w-12 text-center')}>{formattedPosition}</Text>

                <View style={tailwind('bg-gray-700/100 px-2 py-0.5 rounded-full')}>
                    <Text style={tailwind('text-purple-300/100 text-xs font-medium')}>
                        {progressPercent}%
                    </Text>
                </View>
                <Text style={tailwind('text-purple-300/100 text-xs font-medium w-12 text-center')}>{formattedDuration}</Text>
            </View>

            
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={durationMillis}
                value={positionMillis}
                minimumTrackTintColor={tailwind('text-purple-500/100').color as string}
                maximumTrackTintColor={tailwind('text-gray-600/100').color as string}
                thumbTintColor={tailwind('text-purple-300/100').color as string}
                disabled={isAudioLoading || !!audioError || durationMillis <= 1} // Disable slider if duration is invalid
                onSlidingStart={onSeekStart}
                onSlidingComplete={onSeekComplete}
            />

            
            {audioError && (
                <View style={tailwind('bg-red-900/100 rounded-lg p-2 my-2')}>
                    <Text style={tailwind('text-red-300/100 text-center text-sm')}>
                        
                        {audioError}
                    </Text>
                </View>
            )}

            
            <View style={tailwind('flex-row items-center justify-center mt-3')} >
                
                <TouchableOpacity
                    style={tailwind('p-2 rounded-full bg-gray-700/100 mx-3')}
                    onPress={() => { if (podcastId - 1 >= 1) router.replace(`detailpodcast/${podcastId - 1}` as Href) }} // Use Href<any> or specific type
                    // Disable if ID is 1 or less (or invalid)
                    disabled={isNaN(podcastId) || podcastId <= 1}
                >
                    <Ionicons name="play-skip-back" size={22} color={(isNaN(podcastId) || podcastId <= 1) ? tailwind('text-gray-500/100').color as ColorValue : tailwind('text-gray-300/100').color as ColorValue} />
                </TouchableOpacity>

                
                <TouchableOpacity
                    onPress={onPlayPause}
                    disabled={!!audioError || isAudioLoading} // Disable also when loading audio
                    style={[
                        tailwind('p-4 rounded-full items-center justify-center w-16 h-16 mx-3'),
                        isPlaying
                            ? tailwind('bg-purple-600/100')
                            : tailwind('bg-purple-500/100'),
                        (!!audioError || isAudioLoading) ? tailwind('opacity-50') : {}, // Add opacity when disabled
                        CustomStyles.shadow // Use imported shadow style
                    ]}
                >
                    {isAudioLoading ? (
                        <ActivityIndicator size="large" color="#ffffff" />
                    ) : (
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={28}
                            color="#ffffff"
                            style={isPlaying ? {} : { marginLeft: 3 }} // Adjust play icon alignment
                        />
                    )}
                </TouchableOpacity>

                
                <TouchableOpacity
                    style={tailwind('p-2 rounded-full bg-gray-700/100 mx-3')}
                    onPress={() => router.replace(`detailpodcast/${podcastId + 1}` as Href)} // Use Href<any> or specific type
                // Optionally disable if it's the last podcast (needs total count)
                >
                    <Ionicons name="play-skip-forward" size={22} color={tailwind('text-gray-300/100').color as ColorValue} />
                </TouchableOpacity>
            </View>

            
            <View style={tailwind('flex-row justify-around items-center mt-5')}>
                
                <TouchableOpacity
                    style={tailwind('items-center p-2')}
                    onPress={handleToggleFavorite}
                    // Disable while checking status (isFavorited === null) or toggling
                    disabled={isFavorited === null || isTogglingFavorite}
                >
                    <FavoriteIcon size={20} color={tailwind('text-gray-400/100').color as ColorValue} />
                    
                    <RNText style={[
                        tailwind('text-xs mt-1'),
                        isFavorited === null ? tailwind('text-gray-500/100') : tailwind('text-gray-300/100'), // Dim text while loading status
                        isFavorited ? tailwind('text-red-400/100') : {} // Highlight text when favorited
                    ]}>
                        
                        {isTogglingFavorite ? '...' : (isFavorited ? 'Đã thích' : 'Yêu thích')}
                    </RNText>
                </TouchableOpacity>

                
                <TouchableOpacity
                    onPress={handleToggleRepeat}
                    style={tailwind('items-center p-2')}>
                    <Ionicons name={repeatIconName} size={20} color={repeatIconColor} />
                    
                    {repeatMode === 'one' && (
                        <View style={tailwind('absolute top-1 right-1 bg-purple-500/100 rounded-full w-3 h-3 items-center justify-center border border-gray-800/100')}>
                            <RNText style={tailwind('text-white/100 text-[8px] font-bold')}>1</RNText>
                        </View>
                    )}
                    <RNText style={[
                        tailwind('text-xs mt-1'),
                        repeatMode !== 'off' ? tailwind('text-purple-300/100') : tailwind('text-gray-400/100')
                    ]}>
                        
                        {repeatText}
                    </RNText>
                </TouchableOpacity>

                
                <TouchableOpacity style={tailwind('items-center p-2')}>
                    <Ionicons name="shuffle" size={20} color={tailwind('text-gray-400/100').color as ColorValue} />
                    
                    <RNText style={tailwind('text-gray-300/100 text-xs mt-1')}>Trộn bài</RNText>
                </TouchableOpacity>

                
                <TouchableOpacity style={tailwind('items-center p-2')}>
                    <Ionicons name="share-social-outline" size={20} color={tailwind('text-gray-400/100').color as ColorValue} />
                    
                    <RNText style={tailwind('text-gray-300/100 text-xs mt-1')}>Chia sẻ</RNText>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- Helper Functions ---
const styles = StyleSheet.create({
    slider: {
        width: '100%',
        height: 30, // Reduced height slightly
    },
    indicator: { // For spinner in buttons
        justifyContent: 'center',
        alignItems: 'center',
    },
});

// Removed duplicate CustomStyles definition, assuming it's imported correctly

// Helper to get valid duration, preventing division by zero
function GetDurationMillis(durationMillis?: number): number {
    // Return 1 if duration is invalid to prevent division by zero in progress calculation
    if (!durationMillis || isNaN(durationMillis) || durationMillis <= 0) {
        return 1;
    }
    return durationMillis;
}

export default AudioControls;