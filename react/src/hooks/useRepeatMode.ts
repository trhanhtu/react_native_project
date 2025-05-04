import { Audio } from "expo-av";
import { useCallback, useState } from "react";
import { RepeatMode } from "../utils/types";

export default function useRepeatMode(
    soundObject: Audio.Sound | null,
    initialRepeatMode: RepeatMode,
    onRepeatModeChange: (mode: RepeatMode) => void
) {
    const [repeatMode, setRepeatMode] = useState<RepeatMode>(initialRepeatMode);
    const handleToggleRepeat = useCallback(() => {
        let nextMode: RepeatMode;
        switch (repeatMode) {
            case 'off':
                nextMode = 'all';
                break;
            case 'all':
                nextMode = 'one';
                break;
            case 'one':
                nextMode = 'off';
                break;
            default:
                nextMode = 'off';
        }
        setRepeatMode(nextMode);
        onRepeatModeChange(nextMode); // Notify parent component

        // --- Directly handle "Repeat One" ---
        if (soundObject) {
            soundObject.setIsLoopingAsync(nextMode === 'one')
                .catch(error => console.error("Error setting looping state:", error));
        }
        // ------------------------------------

    }, [repeatMode, onRepeatModeChange, soundObject]);
    // --------------------------



    const repeatIconName: "repeat" = repeatMode === 'one' ? "repeat" : "repeat";
    const repeatText = repeatMode === 'one' ? "Repeat 1" : "Repeat";

    return {
        repeatIconName,
        repeatMode,
        repeatText,
        handleToggleRepeat,
    }
}