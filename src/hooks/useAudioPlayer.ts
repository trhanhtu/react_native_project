// hooks/useAudioPlayer.ts
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatMillisToTime } from '../utils/formatTime';

export const useAudioPlayer = (audioUrl: string | undefined) => {
    const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState<Partial<AVPlaybackStatusSuccess>>({});
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);

    const isSeeking = useRef(false);
    const shouldPlayAfterSeek = useRef(false);

    // --- Ref for the status update handler ---
    // This ref will hold the function that updates state based on playback status.
    const onPlaybackStatusUpdateRef = useRef<(status: AVPlaybackStatus) => void>(() => { });

    // --- Effect to define and update the *content* of the ref ---
    // This effect runs when dependencies like `soundObject` change,
    // ensuring the ref always holds a function that uses the latest state/props.
    // Crucially, updating the ref's '.current' property does NOT trigger component re-renders or other effects.
    useEffect(() => {
        onPlaybackStatusUpdateRef.current = (status: AVPlaybackStatus) => {
            // Logic to update state based on the status received
            // console.log('Ref Callback Status Update:', status.isLoaded, status.isLoaded ? status.positionMillis : 'N/A');
            if (status.isLoaded) {
                if (!isSeeking.current) {
                    setPlaybackStatus({
                        positionMillis: status.positionMillis,
                        durationMillis: status.durationMillis,
                        isBuffering: status.isBuffering,
                    });
                }
                setIsPlaying(status.isPlaying);
                if (status.didJustFinish) {
                    console.log('Audio didJustFinish (via ref callback)');
                    // Use the soundObject state variable directly.
                    // React guarantees it's up-to-date in handlers triggered after render.
                    soundObject?.setPositionAsync(0);
                    setIsPlaying(false);
                    setPlaybackStatus(prev => ({ ...prev, positionMillis: 0 }));
                }
            } else {
                if (status.error) {
                    console.error(`Ref Callback - Lỗi playback: ${status.error}`);
                    setAudioError(`Lỗi playback: ${status.error}`);
                    setIsPlaying(false);
                }
                // Reset status if unloaded (e.g., due to error or explicit unload)
                setPlaybackStatus({});
                setIsPlaying(false);
            }
        };
        // This effect depends on soundObject so setPositionAsync targets the correct instance
    }, [soundObject]); // Re-create the function in the ref if soundObject changes


    // --- Effect for Loading/Unloading Audio ---
    // This effect now ONLY depends on the audioUrl.
    useEffect(() => {
        let isMounted = true; // Flag to prevent state updates after unmount
        let currentSoundObject: Audio.Sound | null = null;

        const loadAudio = async () => {
            if (!audioUrl) {
                console.log("loadAudio: No audioUrl. Cleaning up.");
                // If URL becomes null/undefined, ensure cleanup happens
                setSoundObject(prevSound => {
                    prevSound?.unloadAsync();
                    return null;
                });
                setPlaybackStatus({});
                setIsPlaying(false);
                setIsAudioLoading(false);
                setAudioError(null);
                return;
            }

            console.log(`loadAudio: Loading URL: ${audioUrl}`);
            if (!isMounted) return; // Check before setting loading state
            setIsAudioLoading(true);
            setAudioError(null);
            setIsPlaying(false);
            setPlaybackStatus({});

            // Explicitly unload previous sound before creating a new one
            // This helps prevent potential resource conflicts or leaks
            setSoundObject(prevSound => {
                if (prevSound) {
                    console.log("loadAudio: Unloading previous sound object.");
                    prevSound.unloadAsync();
                }
                return null; // Set to null immediately
            });


            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                });

                // Wrapper function that calls the *current* function stored in the ref
                const handleStatusUpdate = (status: AVPlaybackStatus) => {
                    if (isMounted && onPlaybackStatusUpdateRef.current) {
                        onPlaybackStatusUpdateRef.current(status);
                    }
                };

                console.log("loadAudio: Creating new sound object...");
                const { sound, status: initialStatus } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { shouldPlay: false, progressUpdateIntervalMillis: 500 },
                    handleStatusUpdate // Pass the stable wrapper
                );
                console.log("loadAudio: Sound object created.");

                if (!isMounted) { // Check again after async operation
                    console.log("loadAudio: Component unmounted during sound creation. Unloading.");
                    sound.unloadAsync();
                    return;
                }

                currentSoundObject = sound; // Store for cleanup
                setSoundObject(sound); // Set the new sound object state

                if (initialStatus.isLoaded) {
                    console.log("loadAudio: Initial status loaded.", initialStatus.durationMillis);
                    setPlaybackStatus({
                        positionMillis: initialStatus.positionMillis,
                        durationMillis: initialStatus.durationMillis,
                        isBuffering: initialStatus.isBuffering,
                    });
                } else {
                    console.warn("loadAudio: Initial status NOT loaded! Possible issue with audio source.");
                    setAudioError("Tệp audio có thể không hợp lệ hoặc không tải được trạng thái ban đầu.");
                }

            } catch (error: any) {
                console.error("Lỗi load audio:", error);
                if (isMounted) {
                    setAudioError(`Không thể tải file audio. Lỗi: ${error.message}`);
                    setSoundObject(null); // Ensure state is null on error
                }
            } finally {
                if (isMounted) {
                    setIsAudioLoading(false);
                }
            }
        };

        loadAudio();

        // Cleanup function
        return () => {
            isMounted = false; // Set flag on unmount
            console.log("Cleanup: Unloading sound for effect instance associated with URL:", audioUrl);
            // Use the sound object captured in this effect's closure for cleanup
            currentSoundObject?.unloadAsync();
        };
        // Effect now *only* depends on audioUrl
    }, [audioUrl]);

    // Control functions (handlePlayPause, handleSeek*) remain mostly the same.
    // They use the `soundObject` state, which is correctly managed by the effects above.

    const handlePlayPause = useCallback(async () => {
        console.log('handlePlayPause called. Sound:', soundObject ? 'Exists' : 'null', 'Loading:', isAudioLoading);
        if (!soundObject || isAudioLoading) {
            console.log('handlePlayPause: Aborted (no sound or loading)');
            return;
        }
        // ... (rest of play/pause logic is fine)
        try {
            const status = await soundObject.getStatusAsync();
            if (!status.isLoaded) { /*...*/ return; }
            if (status.isPlaying) {
                await soundObject.pauseAsync();
            } else {
                if (status.didJustFinish) { await soundObject.setPositionAsync(0); }
                await soundObject.playAsync();
            }
        } catch (error) { /*...*/ setAudioError("Đã xảy ra lỗi khi điều khiển audio."); }
    }, [soundObject, isAudioLoading]); // Correct dependencies


    const handleSeekStart = useCallback(() => {
        if (!soundObject) return;
        // ... (rest of seek start logic is fine)
        isSeeking.current = true;
        shouldPlayAfterSeek.current = isPlaying;
        if (isPlaying) { soundObject.pauseAsync(); }
    }, [isPlaying, soundObject]); // Correct dependencies


    const handleSeekComplete = useCallback(async (value: number) => {
        if (!soundObject || playbackStatus.durationMillis === undefined) return;
        // ... (rest of seek complete logic is fine)
        isSeeking.current = false;
        try {
            const seekPosition = Math.max(0, Math.min(value, playbackStatus.durationMillis));
            setPlaybackStatus(prev => ({ ...prev, positionMillis: seekPosition }));
            await soundObject.setStatusAsync({ positionMillis: seekPosition });
            if (shouldPlayAfterSeek.current) {
                await soundObject.playAsync();
            } else {
                const currentStatus = await soundObject.getStatusAsync();
                if (onPlaybackStatusUpdateRef.current) {
                    onPlaybackStatusUpdateRef.current(currentStatus); // Manually update state if paused
                }
            }
        } catch (error) { /*...*/ setAudioError("Lỗi khi tua audio."); }
    }, [soundObject, playbackStatus.durationMillis]); // Correct dependencies


    // Format time (no change)
    const formattedPosition = formatMillisToTime(playbackStatus.positionMillis);
    const formattedDuration = formatMillisToTime(playbackStatus.durationMillis);

    return {
        isPlaying,
        isAudioLoading,
        audioError,
        playbackStatus,
        formattedPosition,
        formattedDuration,
        handlePlayPause,
        handleSeekStart,
        handleSeekComplete,
    };
};