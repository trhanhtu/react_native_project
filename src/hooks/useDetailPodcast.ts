// hooks/useDetailPodcast.ts
import { fetchPodcastDetailsAPI, postThisPodcastIsViewed } from '@/api/api';
import { useCallback, useEffect, useState } from 'react';
import { Podcast_t } from '../utils/types';

export const useDetailPodcast = (podcastId: number) => {
    const [podcastData, setPodcastData] = useState<Podcast_t | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPodcastDetails = useCallback(async (id: number) => {
        setIsLoading(true);
        setError(null);
        setPodcastData(null);
        postThisPodcastIsViewed(id);
        // Gọi hàm API đã có sẵn try-catch
        const result = await fetchPodcastDetailsAPI(id);

        // Xử lý kết quả trả về từ API function
        if (result !== null) {
            setPodcastData(result); // Thành công: cập nhật dữ liệu
            setError(null); // Xóa lỗi nếu trước đó có lỗi
        } else {
            // Thất bại: đặt thông báo lỗi
            setError('Không thể tải dữ liệu podcast. Vui lòng thử lại.');
            setPodcastData(null); // Đảm bảo data là null khi có lỗi
        }

        setIsLoading(false); // Luôn kết thúc loading dù thành công hay thất bại
    }, []);

    useEffect(() => {
        if (podcastId) {
            fetchPodcastDetails(podcastId);
        } else {
            setError("Không tìm thấy ID của podcast.");
            setIsLoading(false);
            setPodcastData(null);
        }
    }, [podcastId, fetchPodcastDetails]);

    return { podcastData, isLoading, error };
};