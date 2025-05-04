// useProfile.ts (Cleaned up for ProfileScreen)
import {
  fetchFavoriteElements,
  fetchFavoritePodcasts,
  fetchProfileData,
  fetchViewedElements,
  fetchViewedPodcasts,
  logout,
} from "@/api/api"; // Assuming API functions handle potential errors and return null/data

import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useReducer } from "react";
import { useNotificationContext } from "../context/NotificationProvider";
import authCheck from "../utils/authCheck"; // Assuming this utility exists and wraps logout
import {
  FavoriteElement_t,
  FavoritePodcast_t,
  ProfileData,
  ViewedElement_t,
  ViewedPodcast_t,
} from "../utils/types";

// --- State Type ---
// Only includes state needed for display in ProfileScreen
type ProfileState = {
  loading: boolean; // Initial load
  refreshing: boolean; // Pull-to-refresh
  profileData: ProfileData | null;
  viewedElementList: ViewedElement_t[] | null;
  viewedPodcastList: ViewedPodcast_t[] | null;
  favoriteElementList: FavoriteElement_t[] | null;
  favoritePodcastList: FavoritePodcast_t[] | null;
  error: string | null; // General fetch/logout error

  // Pagination State (internal, but parts exposed)
  viewedElementsPage: number;
  viewedPodcastsPage: number;
  favoriteElementsPage: number; // Still fetched, even if no load more UI
  favoritePodcastsPage: number; // Still fetched, even if no load more UI

  loadingMore: {
    elements: boolean; // Exposed
    podcasts: boolean; // Exposed
    favElements: boolean; // Internal state
    favPodcasts: boolean; // Internal state
  };
  hasMore: {
    elements: boolean; // Exposed
    podcasts: boolean; // Exposed
    favElements: boolean; // Internal state
    favPodcasts: boolean; // Internal state
  };
};

// --- Action Types ---
// Actions focused on fetching, pagination, and logout
type Action =
  | { type: "FETCH_INIT_START"; payload: { refresh: boolean } }
  | {
    type: "FETCH_INIT_SUCCESS";
    payload: {
      profileData: ProfileData | null;
      viewedElementsRes: Awaited<ReturnType<typeof fetchViewedElements>>;
      viewedPodcastsRes: Awaited<ReturnType<typeof fetchViewedPodcasts>>;
      favoriteElementsRes: Awaited<ReturnType<typeof fetchFavoriteElements>>;
      favoritePodcastsRes: Awaited<ReturnType<typeof fetchFavoritePodcasts>>;
    };
  }
  | { type: "FETCH_INIT_ERROR"; payload: string }
  | { type: "LOAD_MORE_START"; payload: { listType: 'elements' | 'podcasts' } } // Only relevant types
  | {
    type: "LOAD_MORE_SUCCESS";
    payload: {
      listType: 'elements' | 'podcasts'; // Only relevant types
      data: ViewedElement_t[] | ViewedPodcast_t[] | null; // Specific types
      meta: { current: number; totalPages: number };
    };
  }
  | {
    type: "LOAD_MORE_ERROR";
    payload: { listType: 'elements' | 'podcasts'; error?: string }; // Only relevant types
  }
  | { type: "LOGOUT_START" }
  | { type: "LOGOUT_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

// --- Initial State ---
const initialState: ProfileState = {
  loading: true,
  refreshing: false,
  profileData: null,
  viewedElementList: null,
  viewedPodcastList: null,
  favoriteElementList: null,
  favoritePodcastList: null,
  error: null,
  viewedElementsPage: 1,
  viewedPodcastsPage: 1,
  favoriteElementsPage: 1,
  favoritePodcastsPage: 1,
  loadingMore: { elements: false, podcasts: false, favElements: false, favPodcasts: false },
  hasMore: { elements: true, podcasts: true, favElements: true, favPodcasts: true },
};

// --- Reducer Function ---
function profileReducer(state: ProfileState, action: Action): ProfileState {
  switch (action.type) {
    case "FETCH_INIT_START":
      return {
        ...state,
        loading: !state.profileData, // Show initial spinner only if no data exists
        refreshing: action.payload.refresh,
        error: null,
        ...(action.payload.refresh && { // Reset lists and pagination on refresh
          viewedElementList: null,
          viewedPodcastList: null,
          favoriteElementList: null,
          favoritePodcastList: null,
          viewedElementsPage: 1,
          viewedPodcastsPage: 1,
          favoriteElementsPage: 1,
          favoritePodcastsPage: 1,
          hasMore: { ...initialState.hasMore }, // Reset all hasMore flags
          loadingMore: { ...initialState.loadingMore }, // Reset all loadingMore flags
        }),
      };

    case "FETCH_INIT_SUCCESS": {
      const { profileData, viewedElementsRes, viewedPodcastsRes, favoriteElementsRes, favoritePodcastsRes } = action.payload;
      const newProfileData = profileData ?? state.profileData;
      const profileError = !profileData ? "Failed to fetch profile data." : state.error;

      const getHasMore = (res: { meta?: { current: number; totalPages: number } } | null | undefined): boolean =>
        res?.meta ? res.meta.current < res.meta.totalPages : false;

      return {
        ...state,
        loading: false,
        refreshing: false,
        profileData: newProfileData,
        viewedElementList: viewedElementsRes?.result ?? [],
        viewedPodcastList: viewedPodcastsRes?.result ?? [],
        favoriteElementList: favoriteElementsRes?.result ?? [],
        favoritePodcastList: favoritePodcastsRes?.result ?? [],
        // Update all hasMore/loadingMore based on initial fetch
        hasMore: {
          elements: getHasMore(viewedElementsRes),
          podcasts: getHasMore(viewedPodcastsRes),
          favElements: getHasMore(favoriteElementsRes),
          favPodcasts: getHasMore(favoritePodcastsRes),
        },
        // Reset loadingMore flags after initial fetch
        loadingMore: { ...initialState.loadingMore },
        // Keep existing pages (all are 1 after initial fetch/refresh)
        viewedElementsPage: viewedElementsRes?.meta?.current ?? 1,
        viewedPodcastsPage: viewedPodcastsRes?.meta?.current ?? 1,
        favoriteElementsPage: favoriteElementsRes?.meta?.current ?? 1,
        favoritePodcastsPage: favoritePodcastsRes?.meta?.current ?? 1,
        error: profileError, // Prioritize profile fetch error
      };
    }

    case "FETCH_INIT_ERROR":
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: action.payload,
        // Ensure lists are empty arrays on error if they were null
        viewedElementList: state.viewedElementList ?? [],
        viewedPodcastList: state.viewedPodcastList ?? [],
        favoriteElementList: state.favoriteElementList ?? [],
        favoritePodcastList: state.favoritePodcastList ?? [],
      };

    case "LOAD_MORE_START": {
      const listType = action.payload.listType; // 'elements' or 'podcasts'
      return { ...state, loadingMore: { ...state.loadingMore, [listType]: true } };
    }

    case "LOAD_MORE_SUCCESS": {
      const { listType, data, meta } = action.payload;
      const listKey = listType === 'elements' ? 'viewedElementList' : 'viewedPodcastList';
      const pageKey = listType === 'elements' ? 'viewedElementsPage' : 'viewedPodcastsPage';
      const currentList = state[listKey] ?? [];

      return {
        ...state,
        [listKey]: data ? [...currentList, ...(data as any[])] : currentList, // Append new data
        [pageKey]: data ? meta.current : state[pageKey], // Update page number from meta
        hasMore: { ...state.hasMore, [listType]: data ? meta.current < meta.totalPages : false },
        loadingMore: { ...state.loadingMore, [listType]: false },
      };
    }

    case "LOAD_MORE_ERROR": {
      const listType = action.payload.listType;
      return {
        ...state,
        loadingMore: { ...state.loadingMore, [listType]: false },
        hasMore: { ...state.hasMore, [listType]: false }, // Stop trying to load more
        error: action.payload.error || state.error, // Optionally set general error
      };
    }

    case "LOGOUT_START":
      return { ...state, loading: true, error: null }; // Show loading indicator during logout attempt

    case "LOGOUT_ERROR":
      return { ...state, loading: false, error: action.payload }; // Reset loading on error

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

// --- Custom Hook ---
export default function useProfile() { // Renamed back to useProfile
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const router = useRouter();
  const { disconnectSocket } = useNotificationContext();
  // --- Data Fetching ---
  const fetchData = useCallback(async (refresh = false) => {
    dispatch({ type: "FETCH_INIT_START", payload: { refresh } });
    try {
      // Fetch all required data concurrently
      const [pdata, viewedElementsRes, viewedPodcastsRes, favoriteElementsRes, favoritePodcastsRes] =
        await Promise.all([
          fetchProfileData(),
          // Fetch page 1 for all lists initially
          fetchViewedElements(1, 5), // Adjust page size as needed
          fetchViewedPodcasts(1, 5),
          fetchFavoriteElements(1, 999), // Fetch all favorites? Or paginate? Assuming fetch all for now
          fetchFavoritePodcasts(1, 5),
        ]);

      dispatch({
        type: "FETCH_INIT_SUCCESS",
        payload: { profileData: pdata, viewedElementsRes, viewedPodcastsRes, favoriteElementsRes, favoritePodcastsRes },
      });
    } catch (err: any) {
      console.error("fetchData error:", err);
      // Improve error message if possible
      const errorMessage = err?.message || "An error occurred while fetching data.";
      dispatch({ type: "FETCH_INIT_ERROR", payload: errorMessage });
    }
  }, [dispatch]); // Dispatch is stable

  // --- Load More Logic ---
  const loadMore = useCallback(async (listType: 'elements' | 'podcasts') => {
    if (state.loadingMore[listType] || !state.hasMore[listType]) return;

    dispatch({ type: "LOAD_MORE_START", payload: { listType } });
    const pageKey = listType === 'elements' ? 'viewedElementsPage' : 'viewedPodcastsPage';
    const nextPage = state[pageKey] + 1;
    const pageSize = 5; // Consistent page size for loading more

    try {
      let response;
      if (listType === 'elements') {
        response = await fetchViewedElements(nextPage, pageSize);
      } else { // podcasts
        response = await fetchViewedPodcasts(nextPage, pageSize);
      }

      if (response?.result && response?.meta) {
        dispatch({
          type: "LOAD_MORE_SUCCESS",
          payload: { listType, data: response.result, meta: response.meta },
        });
      } else {
        console.error(`Failed to load more ${listType} - API response missing data or meta`);
        dispatch({ type: "LOAD_MORE_ERROR", payload: { listType } });
      }
    } catch (err) {
      console.error(`Error loading more ${listType}:`, err);
      const errorMsg = `Failed to load more ${listType}.`;
      dispatch({ type: "LOAD_MORE_ERROR", payload: { listType, error: errorMsg } });
    }
  }, [dispatch, state.loadingMore, state.hasMore, state.viewedElementsPage, state.viewedPodcastsPage]);

  // Specific load more functions exposed to the UI
  const loadMoreViewedElements = useCallback(() => loadMore("elements"), [loadMore]);
  const loadMoreViewedPodcasts = useCallback(() => loadMore("podcasts"), [loadMore]);

  // --- Navigation ---
  const navigateToElementDetail = useCallback((atomicNumber: number) => {
    router.push(`/detailelement/${atomicNumber}` as Href); // Added Href type
  }, [router]);

  const navigateToPodcastDetail = useCallback((podcastId: number) => {
    router.push(`/detailpodcast/${podcastId}` as Href); // Added Href type
  }, [router]);

  // --- Logout ---
  const handleExitAccount = useCallback(async () => {
    disconnectSocket();
    dispatch({ type: "LOGOUT_START" });
    await logout();
    authCheck.logout().then(() => {
      router.replace("/login"); // Use replace to prevent back navigation
      // No need for success dispatch, state is gone
    }).catch(err => {
      console.error("Logout error:", err);
      dispatch({ type: "LOGOUT_ERROR", payload: "An error occurred during logout." });
    });
  }, [router, dispatch]);


  // --- Initial data fetch on mount ---
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is memoized


  // --- Return exactly what ProfileScreen needs ---
  return {
    state,

    // Actions
    fetchData,
    handleExitAccount,
    loadMoreViewedElements,
    loadMoreViewedPodcasts,
    navigateToElementDetail,
    navigateToPodcastDetail,

    // NOTE: openEditModal is intentionally removed.
    // ProfileScreen should manage its modal visibility state locally.
  };
}