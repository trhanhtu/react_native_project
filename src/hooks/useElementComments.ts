// hooks/useElementComments.ts
import { createElementComment, fetchElementComments, likeElementComment } from '@/api/api';
import { useCallback, useEffect, useState } from 'react';
import { CreateElementCommentRequest, ElementComment, LikeResponse, PageResult, PaginationMeta } from '../utils/types';

export const useElementComments = (ElementId: number, initialPageSize = 5) => {
    const [comments, setComments] = useState<ElementComment[]>([]);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
    const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingLikeCommentId, setLoadingLikeCommentId] = useState<number>(Infinity)
    // Hàm fetch bình luận (gọi API function và xử lý kết quả null)
    const fetchCommentsPage = useCallback(async (id: number, page = 1, pageSize = 5, appending = false) => {
        if (!appending) {
            setIsLoadingInitial(true);
            // Không reset error ở đây ngay, chỉ reset nếu fetch thành công
        } else {
            setIsFetchingMore(true);
        }

        // Gọi hàm API đã có sẵn try-catch
        const result: PageResult<ElementComment> | null = await fetchElementComments(page, pageSize, undefined, ElementId);

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
        if (ElementId) {
            // Reset state trước khi fetch
            setComments([]);
            setPaginationMeta(null);
            setError(null); // Reset lỗi khi ID thay đổi
            fetchCommentsPage(ElementId, 1, initialPageSize, false);
        } else {
            setError("Không tìm thấy ID Element để tải bình luận.");
            setIsLoadingInitial(false);
            setComments([]);
            setPaginationMeta(null);
        }
    }, [ElementId, initialPageSize, fetchCommentsPage]);

    // Hàm để gọi fetch trang tiếp theo
    const fetchMoreComments = useCallback(() => {
        if (!isFetchingMore && paginationMeta && paginationMeta.current < paginationMeta.totalPages && ElementId) {
            console.log("Hook: Đang tải thêm bình luận trang:", paginationMeta.current + 1);
            fetchCommentsPage(ElementId, paginationMeta.current + 1, paginationMeta.pageSize, true);
        }
    }, [ElementId, isFetchingMore, paginationMeta, fetchCommentsPage]);

    const handleCommentSubmit = async (text: string) => {
        await createElementComment({ elementId: ElementId, content: text } as CreateElementCommentRequest)
        await fetchCommentsPage(ElementId ?? "1", 1, 5);
    };

    const onLikeElementComment = useCallback(async (commentId: number) => {
        // Optional: Add a loading state specific to this comment ID if needed for UI feedback
        setLoadingLikeCommentId(commentId);

        try {
            // Call the API function to like the comment
            const response: LikeResponse | null = await likeElementComment(commentId);

            if (response !== null) {
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment.id === commentId
                            ? { ...comment, likes: response.likes } // Update with the count from API response
                            : comment
                    )
                );
                // ------------------------------------

                // Optional: Show a success message
                // toastShow("Comment liked!", "success");

            } else {
                // Handle the case where the API call returns null (likely an error)
                setError("Failed to like comment. Please try again.");
            }
        } catch (error) {
            setError("An error occurred while liking the comment.");
        } finally {
            // Optional: Clear the specific loading state if you added one
            setLoadingLikeCommentId(Infinity);
        }
    }, [setComments, setError]);

    return {
        comments,
        paginationMeta,
        isLoadingInitial,
        isFetchingMore,
        error,
        fetchMoreComments,
        handleCommentSubmit,
        loadingLikeCommentId,
        onLikeElementComment,
    };
};