import GlobalStorage from '@/src/utils/GlobalStorage';
import { useEffect, useState } from 'react';

export const useUserAvatar = () => {
    const [avatarUrl, setAvatarUrl] = useState<string>(`https://picsum.photos/200`);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAvatar = () => {
            const userName = GlobalStorage.getItem("name")
            try {
                setLoading(true);
                const storedAvatar = GlobalStorage.getItem('avatar');

                if (storedAvatar) {
                    setAvatarUrl(storedAvatar);
                } else {
                    setAvatarUrl(`https://picsum.photos/200?user=${userName}`);
                }
            } catch (error) {
                console.error('Error fetching avatar:', error);
                // Use fallback avatar on error
                setAvatarUrl(`https://picsum.photos/200?user=${userName}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAvatar();
    }, []);

    return { avatarUrl, loading };
};