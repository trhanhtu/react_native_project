// Add near the top of AudioControls.tsx or in a separate hooks file
import {
    checkFavoritePodcastStatus,
    toggleFavoritePodcast
} from "@/api/api"; // Adjust path if needed
import { useToast } from '@/src/context/ToastProvider'; // Adjust path if needed
import {
    CheckFavoritePodcastResponse,
    ToggleFavoritePodcastResponse
} from "@/src/utils/types"; // Adjust path if needed
import { useCallback, useEffect, useState } from 'react';

const usePodcastFavorite = (podcastId: number) => {
    const [isFavorited, setIsFavorited] = useState<boolean | null>(null); // null = loading/unknown
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const { toastShow } = useToast(); // Optional: For user feedback

    // Fetch initial favorite status
    useEffect(() => {
        let isActive = true; // Prevent state update on unmounted component
        setIsFavorited(null); // Reset on ID change

        const fetchStatus = async () => {
            if (isNaN(podcastId)) return; // Avoid API call if ID is invalid

            try {
                const response: CheckFavoritePodcastResponse | null = await checkFavoritePodcastStatus(podcastId);
                if (isActive) {
                    if (response !== null) {
                        setIsFavorited(response.active);
                    } else {
                        setIsFavorited(false); // Assume not favorited if status check fails? Or keep null?
                        console.warn(`Could not fetch favorite status for podcast ${podcastId}.`);
                    }
                }
            } catch (error) {
                if (isActive) {
                    console.error("Error fetching favorite status:", error);
                    setIsFavorited(false); // Or null
                    toastShow("Failed to check favorite status.", "error");
                }
            }
        };

        fetchStatus();

        return () => { isActive = false; }; // Cleanup function
    }, []); 

    // Toggle favorite status
    const handleToggleFavorite = useCallback(async () => {
        if (isFavorited === null || isNaN(podcastId)) return; // Don't toggle if status unknown or ID invalid

        setIsTogglingFavorite(true);
        try {
            const response: ToggleFavoritePodcastResponse | null = await toggleFavoritePodcast(podcastId);
            if (response !== null) {
                setIsFavorited(response.active); // Update state based on API response
                toastShow(response.active ? "Podcast added to favorites" : "Podcast removed from favorites", "success");
            } else {
                toastShow("Failed to update favorite status.", "error");
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            toastShow("An error occurred.", "error");
        } finally {
            setIsTogglingFavorite(false);
        }
    }, [podcastId, isFavorited, toastShow]);

    return {
        isFavorited,
        isTogglingFavorite,
        handleToggleFavorite,
    };
};

export default usePodcastFavorite