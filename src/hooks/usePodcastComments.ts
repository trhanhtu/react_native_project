// hooks/usePodcastComments.ts
import { fetchPodcastComments, postPodcastComment } from '@/api/api';
import { useCallback, useEffect, useState } from 'react';
import { PageResult, PaginationMeta, PodcastComment } from '../utils/types';

export const usePodcastComments = (podcastId: number, initialPageSize = 5) => {
    const [comments, setComments] = useState<PodcastComment[]>([]);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
    const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Hàm fetch bình luận (gọi API function và xử lý kết quả null)
    const fetchCommentsPage = useCallback(async (id: number, page = 1, pageSize = 5, appending = false) => {
        if (!appending) {
            setIsLoadingInitial(true);
            // Không reset error ở đây ngay, chỉ reset nếu fetch thành công
        } else {
            setIsFetchingMore(true);
        }

        // Gọi hàm API đã có sẵn try-catch
        const result: PageResult<PodcastComment> | null = await fetchPodcastComments(page, pageSize, undefined, podcastId);

        // Xử lý kết quả
        if (result !== null) {
            // Thành công
            const { result: newComments, meta } = result;
            if (appending) {
                setComments(prevComments => [...prevComments, ...newComments]);
            } else {
                setComments(newComments);
            }
            setPaginationMeta(meta);
            setError(null); // Xóa lỗi nếu fetch thành công
        } else {
            // Thất bại
            // Chỉ đặt lỗi nếu là lần tải đầu tiên hoặc nếu chưa có lỗi trước đó
            // để tránh ghi đè lỗi cụ thể hơn bằng lỗi tải thêm
            if (!appending || !error) {
                setError('Không thể tải bình luận. Vui lòng thử lại.');
            }
            // Không thay đổi comments hoặc paginationMeta khi fetch lỗi
        }

        // Kết thúc loading
        if (!appending) {
            setIsLoadingInitial(false);
        }
        setIsFetchingMore(false);

    }, [error]); // Thêm error vào dependency để tránh set lỗi trùng lặp không cần thiết

    // useEffect để fetch trang đầu tiên
    useEffect(() => {
        if (podcastId) {
            // Reset state trước khi fetch
            setComments([]);
            setPaginationMeta(null);
            setError(null); // Reset lỗi khi ID thay đổi
            fetchCommentsPage(podcastId, 1, initialPageSize, false);
        } else {
            setError("Không tìm thấy ID podcast để tải bình luận.");
            setIsLoadingInitial(false);
            setComments([]);
            setPaginationMeta(null);
        }
    }, [podcastId, initialPageSize, fetchCommentsPage]);

    // Hàm để gọi fetch trang tiếp theo
    const fetchMoreComments = useCallback(() => {
        if (!isFetchingMore && paginationMeta && paginationMeta.current < paginationMeta.totalPages && podcastId) {
            console.log("Hook: Đang tải thêm bình luận trang:", paginationMeta.current + 1);
            fetchCommentsPage(podcastId, paginationMeta.current + 1, paginationMeta.pageSize, true);
        }
    }, [podcastId, isFetchingMore, paginationMeta, fetchCommentsPage]);

    const handleCommentSubmit = async (text: string) => {
        await postPodcastComment(podcastId, text)
        await fetchCommentsPage(podcastId ?? "1", 1, 5);
    };
    return {
        comments,
        paginationMeta,
        isLoadingInitial,
        isFetchingMore,
        error,
        fetchMoreComments,
        handleCommentSubmit
    };
};