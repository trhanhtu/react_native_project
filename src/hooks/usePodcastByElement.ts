import { fetchPodcasts } from '@/api/api';
import { Podcast_t } from '@/src/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { useLayout } from '../context/ApplicationLayoutProvider';

export const usePodcastsByElement = (elementName: string) => {
    const [podcasts, setPodcasts] = useState<Podcast_t[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState<string>('');
    const { lockPortrait } = useLayout();
    const fetchElementPodcasts = useCallback(async (page: number, search: string = '', initialLoad = false) => {
        if (loading || loadingMore) return;

        console.log(`Fetching podcasts for element ${elementName}, page ${page}, search: "${search}"`);
        setLoading(initialLoad);
        setLoadingMore(!initialLoad);
        setError(null);

        try {
            // Construct filter string: require elementName, optionally add search term for title
            const filterParts = [`element:eq:${elementName}`];
            if (search) {
                filterParts.push(`title:like:${search}`);
            }
            const filterString = filterParts.join(',');

            const response = await fetchPodcasts(page, 10, elementName);

            if (response) {
                const { result, meta } = response;
                setPodcasts((prev) => (page === 1 ? result : [...prev, ...result]));
                setCurrentPage(meta.current);
                setTotalPages(meta.totalPages);
            } else {
                setError('Failed to fetch podcasts. Please try again.');
                if (page === 1) setPodcasts([]);
            }
        } catch (err: any) {
            console.error('Error fetching podcasts:', err);
            setError(err.message || 'An unexpected error occurred.');
            if (page === 1) setPodcasts([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [elementName, loading, loadingMore]);

    // Load initial podcasts when elementName changes or on initial mount
    useEffect(() => {
        fetchElementPodcasts(1, searchFilter, true);
    }, [elementName, searchFilter]);
    useEffect(() => {
        lockPortrait();
    }, [])
    // Load more podcasts when reaching end
    const loadMorePodcasts = () => {
        if (!loading && !loadingMore && currentPage < totalPages) {
            console.log('Loading more podcasts...');
            fetchElementPodcasts(currentPage + 1, searchFilter);
        }
    };

    // Refresh podcasts (for retry button)
    const refreshPodcasts = () => {
        fetchElementPodcasts(1, searchFilter, true);
    };

    return {
        podcasts,
        loading,
        loadingMore,
        error,
        searchFilter,
        setSearchFilter,
        loadMorePodcasts,
        refreshPodcasts
    };
};

function fetchPodcast(page: number, arg1: number) {
    throw new Error('Function not implemented.');
}
