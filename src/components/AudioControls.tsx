import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { AVPlaybackStatusSuccess } from 'expo-av';
import React from 'react';
import { ActivityIndicator, ColorValue, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface Props {
    isPlaying: boolean;
    isAudioLoading: boolean;
    formattedPosition: string;
    formattedDuration: string;
    playbackStatus: Partial<AVPlaybackStatusSuccess>;
    audioError: string | null;
    onPlayPause: () => void;
    onSeekStart: () => void;
    onSeekComplete: (value: number) => void;
}

const AudioControls: React.FC<Props> = ({
    isPlaying,
    isAudioLoading,
    formattedPosition,
    formattedDuration,
    playbackStatus,
    audioError,
    onPlayPause,
    onSeekStart,
    onSeekComplete,
}) => {
    const tailwind = useTailwind();

    const positionMillis = playbackStatus.positionMillis ?? 0;
    const durationMillis = playbackStatus.durationMillis ?? 1;

    // Calculate progress percentage for visual indicator
    const progressPercent = Math.min(100, Math.round((positionMillis / durationMillis) * 100));

    return (
        <View style={tailwind('w-full px-5')}>
            {/* Progress bar with percentage */}
            <View style={tailwind('flex-row items-center justify-between mb-1')}>
                <Text style={tailwind('text-purple-400/100 text-xs font-medium')}>{formattedPosition}</Text>
                <Text style={tailwind('text-purple-400/100 text-xs font-medium bg-gray-700/100 px-2 py-1 rounded-full')}>
                    {progressPercent}%
                </Text>
                <Text style={tailwind('text-purple-400/100 text-xs font-medium')}>{formattedDuration}</Text>
            </View>

            {/* Slider */}
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={durationMillis}
                value={positionMillis}
                minimumTrackTintColor="#9333ea" // Purple color
                maximumTrackTintColor="#3f3f46" // Gray color
                thumbTintColor="#d8b4fe" // Light purple
                disabled={isAudioLoading || !!audioError || !playbackStatus.durationMillis}
                onSlidingStart={onSeekStart}
                onSlidingComplete={onSeekComplete}
            />

            {/* Error message */}
            {audioError && (
                <View style={tailwind('bg-red-900/100 rounded-lg p-2 my-2')}>
                    <Text style={tailwind('text-red-300/100 text-center text-sm')}>
                        {audioError}
                    </Text>
                </View>
            )}

            {/* Control buttons */}
            <View style={tailwind('flex-row items-center justify-center mt-3')}>
                <TouchableOpacity style={tailwind('p-2 rounded-full bg-gray-700/100 mx-3')}>
                    <Ionicons name="play-back" size={22} color={tailwind('text-gray-300/100').color as ColorValue} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onPlayPause}
                    disabled={!!audioError}
                    style={[
                        tailwind('p-4 rounded-full items-center justify-center w-16 h-16 mx-3'),
                        isPlaying
                            ? tailwind('bg-purple-600/100')
                            : tailwind('bg-purple-500/100'),
                        CustomStyles.shadow
                    ]}
                >
                    {isAudioLoading ? (
                        <ActivityIndicator size="large" color="#ffffff" />
                    ) : (
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={28}
                            color="#ffffff"
                            style={isPlaying ? {} : { marginLeft: 3 }}
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={tailwind('p-2 rounded-full bg-gray-700/100 mx-3')}>
                    <Ionicons name="play-forward" size={22} color={tailwind('text-gray-300/100').color as ColorValue} />
                </TouchableOpacity>
            </View>

            {/* Additional controls */}
            <View style={tailwind('flex-row justify-between mt-4')}>
                <TouchableOpacity style={tailwind('items-center')}>
                    <Ionicons name="repeat" size={18} color={tailwind('text-gray-400/100').color as ColorValue} />
                    <Text style={tailwind('text-gray-400/100 text-xs mt-1')}>Lặp lại</Text>
                </TouchableOpacity>

                <TouchableOpacity style={tailwind('items-center')}>
                    <Ionicons name="shuffle" size={18} color={tailwind('text-gray-400/100').color as ColorValue} />
                    <Text style={tailwind('text-gray-400/100 text-xs mt-1')}>Ngẫu nhiên</Text>
                </TouchableOpacity>

                <TouchableOpacity style={tailwind('items-center')}>
                    <Ionicons name="download-outline" size={18} color={tailwind('text-gray-400/100').color as ColorValue} />
                    <Text style={tailwind('text-gray-400/100 text-xs mt-1')}>Tải về</Text>
                </TouchableOpacity>

                <TouchableOpacity style={tailwind('items-center')}>
                    <Ionicons name="share-social-outline" size={18} color={tailwind('text-gray-400/100').color as ColorValue} />
                    <Text style={tailwind('text-gray-400/100 text-xs mt-1')}>Chia sẻ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    slider: {
        width: '100%',
        height: 40,
    },
});

const CustomStyles = {
    shadow: {
        shadowColor: '#9333ea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    }
};

export default AudioControls;