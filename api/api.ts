import {
    ApiResponse,
    ChangePasswordRequest,
    CheckFavoriteElementResponse,
    CheckFavoritePodcastResponse,
    CreateDiscoveryRequest,
    CreateElementCommentRequest,
    CreateElementRequest,
    CreateMilestoneRequest,
    CreatePodcastCommentRequest,
    CreateScientistRequest,
    DetailElement_t,
    Discovery_t,
    ElementComment,
    FavoriteElement_t,
    FavoritePodcast_t,
    LikeResponse,
    LoginRequest,
    LoginResponse,
    Milestone_t,
    PageResult,
    Podcast_t,
    PodcastComment,
    ProfileData,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    Scientist_t,
    SendOTPRequest,
    ToggleActiveResponse,
    ToggleFavoriteElementResponse,
    ToggleFavoritePodcastResponse,
    UpdateDiscoveryRequest,
    UpdateElementCommentRequest,
    UpdateElementRequest,
    UpdateMilestoneRequest,
    UpdatePodcastCommentRequest,
    UpdateScientistRequest,
    UpdateUserRequest,
    UpdateUserRoleRequest,
    VerifyOTPRequest,
    VerifyOTPResponse,
    ViewedElement_t,
    ViewedPodcast_t
} from "@/src/utils/types";
import axios from "./axios-customize";

const base_url = process.env.EXPO_PUBLIC_BASE_URL;
const api_url = `${base_url}/api/v1`;




export const resendOTP = async (email: string):
    Promise<ApiResponse<any> | null> => {
    try {
        const sendOTPRequest: SendOTPRequest = {
            email: email,
        }
        const response = await axios.post(`${api_url}/auth/sendOTP`, sendOTPRequest);
        // console.log(response.data);
        return response.data;
    } catch (error: any) {
        console.error(error)
        return null;
    }
}




export const editUser = async (name: string, avatar: string): Promise<ApiResponse<any> | null> => {
    try {
        const updateUserRequest: UpdateUserRequest = {
            name: name,
            avatar: avatar
        }

        const response = await axios.put(`${api_url}/users`, updateUserRequest);
        return response.data;
    } catch (error: any) {
        console.error(error)
        return null;
    }
}

export async function searchElements(query: string, page = 1, pageSize = 10): Promise<PageResult<DetailElement_t> | null> {
    try {
        const response = await axios.get<ApiResponse<PageResult<DetailElement_t>>>(
            `${api_url}/elements?current=${page}&pageSize=${pageSize}&term=${encodeURIComponent(query)}`,
        )
        for (let item of response.data.data.result) {
            item.image = "https://picsum.photos/200";
        }
        return response.data.data;
    } catch (error) {
        console.error("Error fetching elements:", error)
        return null;
    }
}
export async function fetchAllElements(): Promise<DetailElement_t[]> {
    try {
        const response = await axios.get<ApiResponse<PageResult<DetailElement_t>>>(
            `${api_url}/elements?current=1&pageSize=999`,
        )
        const result = response.data.data.result.sort((a, b) => a.atomicNumber - b.atomicNumber);
        return result.map(item => { item.image = "https://picsum.photos/200"; return item; })
    } catch (error) {
        console.error("Error fetching elements:", error)
        return [];
    }
}

export const fetchElementDetails = async (
    elementId: number
): Promise<DetailElement_t | null> => {
    try {
        const response = await axios.get<ApiResponse<DetailElement_t>>(
            `${api_url}/elements/${elementId}`
        )
        response.data.data.image = "https://picsum.photos/200"
        return response.data.data;


    } catch (err) {
        console.error("Lỗi kết nối máy chủ:", err)
        return null
    }
}




export const fetchPodcastDetailsAPI = async (id: number): Promise<Podcast_t | null> => {
    try {
        const response = await axios.get<ApiResponse<Podcast_t>>(`/api/v1/podcasts/${id}`);
        // Kiểm tra response và status code thành công
        if (response.data && response.data.statusCode === 200 && response.data.data) {
            return response.data.data; // Trả về dữ liệu nếu thành công
        } else {
            // Ghi log lỗi từ server nếu có
            console.error("Lỗi API fetchPodcastDetails:", response.data?.message || response.data?.error || 'Phản hồi không hợp lệ');
            return null; // Trả về null nếu response không hợp lệ
        }
    } catch (error: any) {
        // Ghi log lỗi mạng hoặc lỗi trong quá trình xử lý request
        console.error("Lỗi mạng hoặc hệ thống khi fetchPodcastDetails:", error.message || error);
        return null; // Trả về null nếu có lỗi mạng hoặc lỗi khác
    }
};

/**
 * Hàm gọi API để lấy danh sách bình luận phân trang.
 * Xử lý lỗi và trả về kết quả phân trang hoặc null nếu có lỗi.
 * @param id - ID của podcast.
 * @param page - Số trang cần lấy.
 * @param pageSize - Số lượng bình luận trên mỗi trang.
 * @returns Dữ liệu PageResult<PodcastComment> hoặc null.
 */
export const fetchCommentsAPI = async (id: number, page: number, pageSize: number): Promise<PageResult<PodcastComment> | null> => {
    try {
        const podcast_query = id ? `&podcastId=${id}` : ""
        const response = await axios.get<ApiResponse<PageResult<PodcastComment>>>(
            `${api_url}/comments/podcasts?current=${page}&pageSize=${pageSize}${podcast_query}`
        );
        for (let item of response.data.data.result) {
            item.userAvatar = `https://picsum.photos/200?user=${item.userName}`
        }
        return response.data.data;

    } catch (error: any) {
        // Ghi log lỗi mạng hoặc lỗi trong quá trình xử lý request
        console.error("Lỗi mạng hoặc hệ thống khi fetchComments:", error.message || error);
        return null; // Trả về null nếu có lỗi mạng hoặc lỗi khác
    }
};

export const fetchDummyPodcastComments = async (page: number, pageSize: number): Promise<PageResult<PodcastComment> | null> => {
    try {
        // const response = await axios.get<ApiResponse<PageResult<PodcastComment>>>
        const response = await fetch
            (
                // `${api_url}/comments/podcasts?current=${page}&pageSize=${pageSize}`,

                `https://raw.githubusercontent.com/trhanhtu/dummyjson/refs/heads/main/podcastcomment_${1}_${5}.json`
            )
        const dataResponse = await response.json();

        return dataResponse;

    } catch (error) {
        return null;
    }
}

export const postPodcastComment = async (podcastId: number, text: string): Promise<void> => {
    try {
        await axios.post(`${api_url}/comments/podcasts`, {
            content: text,
            podcastId: podcastId
        })
    } catch (error) {
        return;
    }
}


// ============================================================== //










export const fetchProfileData = async (): Promise<ProfileData | null> => {
    try {

        const response = await axios.get<ApiResponse<ProfileData>>(`${api_url}/users/profile`)
        return response.data.data
    } catch (error) {
        console.error("Error fetching profile data:", error)
        return null
    }
}

export const postThisElementIsViewed = async (atomicNumber: number): Promise<void> => {
    try {
        await axios.post<ApiResponse<any>>(`${api_url}/viewed-elements/element/${atomicNumber}`, {})
    } catch (error) {
        console.error("Error posting viewed element:", error)

    }
}
export const postThisPodcastIsViewed = async (podcastId: number): Promise<void> => {
    try {
        await axios.post<ApiResponse<any>>(`${api_url}/viewed-podcasts/podcasts/${podcastId}`, {})
    } catch (error) {
        console.error("Error posting viewed element:", error)

    }
}
export const postThisElementFavoriteToggle = async (atomicNumber: number): Promise<boolean | null> => {
    try {
        await axios.post<ApiResponse<any>>(`${api_url}/favorite-elements/elements/${atomicNumber}`, {})
        return true;
    } catch (error) {
        console.error("Error posting viewed element:", error)
        return null
    }
}
export const postThisPodcastFavoriteToggle = async (atomicNumber: number): Promise<void> => {
    try {
        await axios.post<ApiResponse<any>>(`${api_url}/favorite-podcasts/${atomicNumber}`, {})
    } catch (error) {
        console.error("Error posting viewed element:", error)

    }
}

// --- Auth API ---

export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<VerifyOTPResponse>>(
            `${api_url}/auth/verify`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return null;
    }
};

export const verifyOTPRegister = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<VerifyOTPResponse>>(
            `${api_url}/auth/verify-register`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error verifying OTP for register:", error);
        return null;
    }
};

export const verifyOTPChangeEmail = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<VerifyOTPResponse>>(
            `${api_url}/auth/verify-change-email`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error verifying OTP for change email:", error);
        return null;
    }
};

export const sendOTP = async (data: SendOTPRequest): Promise<SendOTPRequest | null> => {
    // Assuming response mirrors request based on Swagger example
    try {
        const response = await axios.post<ApiResponse<SendOTPRequest>>(
            `${api_url}/auth/sendOTP`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return null;
    }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<VerifyOTPResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<VerifyOTPResponse>>(
            `${api_url}/auth/reset-password`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        return null;
    }
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<RegisterResponse>>(
            `${api_url}/auth/register`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error registering user:", error);
        return null;
    }
};

export const login = async (data: LoginRequest): Promise<LoginResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<LoginResponse>>(
            `${api_url}/auth/login`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error logging in:", error);
        return null;
    }
};

export const logout = async (): Promise<boolean | null> => {
    try {
        await axios.get<ApiResponse<{}>>(`${api_url}/auth/logout`);
        return true; // Indicate success
    } catch (error) {
        console.error("Error logging out:", error);
        return null;
    }
};

// --- Milestone API ---

export const getMilestone = async (id: number): Promise<Milestone_t | null> => {
    try {
        const response = await axios.get<ApiResponse<Milestone_t>>(
            `${api_url}/milestones/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching milestone ${id}:`, error);
        return null;
    }
};

export const updateMilestone = async (id: number, data: UpdateMilestoneRequest): Promise<Milestone_t | null> => {
    try {
        const response = await axios.put<ApiResponse<Milestone_t>>(
            `${api_url}/milestones/${id}`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error updating milestone ${id}:`, error);
        return null;
    }
};

export const fetchMilestones = async (
    current = 1,
    pageSize = 20,
    term = "",
    searchBy = "" // Assuming searchBy field exists based on example, adjust if needed
): Promise<PageResult<Milestone_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        if (searchBy) params.append('searchBy', searchBy);

        const response = await axios.get<ApiResponse<PageResult<Milestone_t>>>(
            `${api_url}/milestones?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching milestones:", error);
        return null;
    }
};

export const createMilestone = async (data: CreateMilestoneRequest): Promise<Milestone_t | null> => {
    try {
        const response = await axios.post<ApiResponse<Milestone_t>>(
            `${api_url}/milestones`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error creating milestone:", error);
        return null;
    }
};

export const toggleMilestoneActive = async (id: number): Promise<ToggleActiveResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<ToggleActiveResponse>>(
            `${api_url}/milestones/${id}/toggle-active`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling active for milestone ${id}:`, error);
        return null;
    }
};


// --- Podcast API ---

export const getPodcast = async (id: number): Promise<Podcast_t | null> => {
    // Assuming response matches Podcast_t structure based on example
    try {
        const response = await axios.get<ApiResponse<Podcast_t>>(
            `${api_url}/podcasts/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching podcast ${id}:`, error);
        return null;
    }
};

export const updatePodcast = async (id: number, data: CreatePodcastCommentRequest): Promise<Podcast_t | null> => {
    // Assuming request/response structure similar to create/get
    try {
        const response = await axios.put<ApiResponse<Podcast_t>>(
            `${api_url}/podcasts/${id}`,
            data // Assuming request body fields match CreatePodcastCommentRequest based on example
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error updating podcast ${id}:`, error);
        return null;
    }
};

export const fetchPodcasts = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = [],
    sortDirection: string[] = [],
    active?: boolean
): Promise<PageResult<Podcast_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());


        const response = await axios.get<ApiResponse<PageResult<Podcast_t>>>(
            `${api_url}/podcasts?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching podcasts:", error);
        return null;
    }
};

export const createPodcast = async (data: CreatePodcastCommentRequest): Promise<Podcast_t | null> => {
    // Assuming request body maps to CreatePodcastCommentRequest based on example fields
    try {
        const response = await axios.post<ApiResponse<Podcast_t>>(
            `${api_url}/podcasts`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error creating podcast:", error);
        return null;
    }
};

export const togglePodcastActive = async (id: number): Promise<ToggleActiveResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<ToggleActiveResponse>>(
            `${api_url}/podcasts/${id}/toggle-active`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling active for podcast ${id}:`, error);
        return null;
    }
};

export const fetchPodcastsByElementId = async (
    elementId: number,
    current = 1,
    pageSize = 20
): Promise<PageResult<Podcast_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });

        const response = await axios.get<ApiResponse<PageResult<Podcast_t>>>(
            `${api_url}/podcasts/by-element/${elementId}?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching podcasts for element ${elementId}:`, error);
        return null;
    }
};

// --- Viewed Pocast API ---

export const createOrUpdateViewedPodcast = async (podcastId: number): Promise<ViewedPodcast_t | null> => {
    try {
        // Assuming the response structure matches ViewedPodcast_t
        // Note: Swagger example shows full Podcast object within 'podcast', matching ViewedPodcast_t
        const response = await axios.post<ApiResponse<ViewedPodcast_t>>(
            `${api_url}/viewed-podcasts/podcasts/${podcastId}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error creating/updating viewed podcast ${podcastId}:`, error);
        return null;
    }
};

// Provided example function structure fits here
export const fetchViewedPodcasts = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = ['lastSeen'], // Default sort from example
    sortDirection: string[] = ['desc'], // Default direction
    active?: boolean // Assuming active filter applies to the podcast itself
): Promise<PageResult<ViewedPodcast_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());

        const response = await axios.get<ApiResponse<PageResult<ViewedPodcast_t>>>(
            `${api_url}/viewed-podcasts?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching viewed podcasts:", error);
        return null;
    }
};


// --- Scientist API ---

export const getScientist = async (id: number): Promise<Scientist_t | null> => {
    try {
        const response = await axios.get<ApiResponse<Scientist_t>>(
            `${api_url}/scientists/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching scientist ${id}:`, error);
        return null;
    }
};

export const updateScientist = async (id: number, data: UpdateScientistRequest): Promise<Scientist_t | null> => {
    try {
        const response = await axios.put<ApiResponse<Scientist_t>>(
            `${api_url}/scientists/${id}`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error updating scientist ${id}:`, error);
        return null;
    }
};

export const fetchScientists = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = [],
    sortDirection: string[] = [],
    active?: boolean
): Promise<PageResult<Scientist_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());

        const response = await axios.get<ApiResponse<PageResult<Scientist_t>>>(
            `${api_url}/scientists?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching scientists:", error);
        return null;
    }
};

export const createScientist = async (data: CreateScientistRequest): Promise<Scientist_t | null> => {
    try {
        const response = await axios.post<ApiResponse<Scientist_t>>(
            `${api_url}/scientists`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error creating scientist:", error);
        return null;
    }
};

export const toggleScientistActive = async (id: number): Promise<ToggleActiveResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<ToggleActiveResponse>>(
            `${api_url}/scientists/${id}/toggle-active`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling active for scientist ${id}:`, error);
        return null;
    }
};


// --- Discovery API ---

export const getDiscovery = async (id: number): Promise<Discovery_t | null> => {
    try {
        const response = await axios.get<ApiResponse<Discovery_t>>(
            `${api_url}/discoveries/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching discovery ${id}:`, error);
        return null;
    }
};

export const updateDiscovery = async (id: number, data: UpdateDiscoveryRequest): Promise<Discovery_t | null> => {
    try {
        const response = await axios.put<ApiResponse<Discovery_t>>(
            `${api_url}/discoveries/${id}`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error updating discovery ${id}:`, error);
        return null;
    }
};

export const fetchDiscoveries = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = [],
    sortDirection: string[] = [],
    active?: boolean
): Promise<PageResult<Discovery_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());

        const response = await axios.get<ApiResponse<PageResult<Discovery_t>>>(
            `${api_url}/discoveries?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching discoveries:", error);
        return null;
    }
};

export const createDiscovery = async (data: CreateDiscoveryRequest): Promise<Discovery_t | null> => {
    try {
        const response = await axios.post<ApiResponse<Discovery_t>>(
            `${api_url}/discoveries`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error creating discovery:", error);
        return null;
    }
};

export const toggleDiscoveryActive = async (id: number): Promise<ToggleActiveResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<ToggleActiveResponse>>(
            `${api_url}/discoveries/${id}/toggle-active`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling active for discovery ${id}:`, error);
        return null;
    }
};


// --- Viewed Element API ---

export const createOrUpdateViewedElement = async (elementId: number): Promise<ViewedElement_t | null> => {
    try {
        // Assuming the response structure matches ViewedElement_t
        const response = await axios.post<ApiResponse<ViewedElement_t>>(
            `${api_url}/viewed-elements/element/${elementId}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error creating/updating viewed element ${elementId}:`, error);
        return null;
    }
};

export const fetchViewedElements = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = ['lastSeen'], // Default from example
    sortDirection: string[] = ['desc'], // Default from example
    active?: boolean // Assuming active filter applies to the element itself
): Promise<PageResult<ViewedElement_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());

        const response = await axios.get<ApiResponse<PageResult<ViewedElement_t>>>(
            `${api_url}/viewed-elements?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching viewed elements:", error);
        return null;
    }
};


// --- Element Comment API ---

export const getElementComment = async (id: number): Promise<ElementComment | null> => {
    try {
        const response = await axios.get<ApiResponse<ElementComment>>(
            `${api_url}/comments/elements/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching element comment ${id}:`, error);
        return null;
    }
};

export const updateElementComment = async (id: number, data: UpdateElementCommentRequest): Promise<ElementComment | null> => {
    try {
        const response = await axios.put<ApiResponse<ElementComment>>(
            `${api_url}/comments/elements/${id}`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error updating element comment ${id}:`, error);
        return null;
    }
};

export const fetchElementComments = async (
    current = 1,
    pageSize = 20,
    term = "",
    elementId?: number,
    userId?: number
): Promise<PageResult<ElementComment> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        if (elementId !== undefined) params.append('elementId', elementId.toString());
        if (userId !== undefined) params.append('userId', userId.toString());

        const response = await axios.get<ApiResponse<PageResult<ElementComment>>>(
            `${api_url}/comments/elements?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching element comments:", error);
        return null;
    }
};

export const createElementComment = async (data: CreateElementCommentRequest): Promise<ElementComment | null> => {
    try {
        const response = await axios.post<ApiResponse<ElementComment>>(
            `${api_url}/comments/elements`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error creating element comment:", error);
        return null;
    }
};

export const toggleElementCommentActive = async (id: number): Promise<ToggleActiveResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<ToggleActiveResponse>>(
            `${api_url}/comments/elements/${id}/toggle-active`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling active for element comment ${id}:`, error);
        return null;
    }
};

export const likeElementComment = async (id: number): Promise<LikeResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<LikeResponse>>(
            `${api_url}/comments/elements/${id}/like`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error liking element comment ${id}:`, error);
        return null;
    }
};


// --- Element API ---

export const getElement = async (id: number): Promise<DetailElement_t | null> => {
    try {
        // Response matches DetailElement_t based on Swagger example
        const response = await axios.get<ApiResponse<DetailElement_t>>(
            `${api_url}/elements/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching element ${id}:`, error);
        return null;
    }
};

export const updateElement = async (id: number, data: UpdateElementRequest): Promise<DetailElement_t | null> => {
    try {
        const response = await axios.put<ApiResponse<DetailElement_t>>(
            `${api_url}/elements/${id}`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error updating element ${id}:`, error);
        return null;
    }
};

export const fetchElements = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = [],
    sortDirection: string[] = [],
    active?: boolean
): Promise<PageResult<DetailElement_t> | null> => {
    // Using DetailElement_t for result array based on response example
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());

        const response = await axios.get<ApiResponse<PageResult<DetailElement_t>>>(
            `${api_url}/elements?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching elements:", error);
        return null;
    }
};

export const createElement = async (data: CreateElementRequest): Promise<DetailElement_t | null> => {
    try {
        const response = await axios.post<ApiResponse<DetailElement_t>>(
            `${api_url}/elements`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error creating element:", error);
        return null;
    }
};

export const toggleElementActive = async (id: number): Promise<ToggleActiveResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<ToggleActiveResponse>>(
            `${api_url}/elements/${id}/toggle-active`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling active for element ${id}:`, error);
        return null;
    }
};

// --- Podcast Comment API ---

export const getPodcastComment = async (id: number): Promise<PodcastComment | null> => {
    try {
        const response = await axios.get<ApiResponse<PodcastComment>>(
            `${api_url}/comments/podcasts/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching podcast comment ${id}:`, error);
        return null;
    }
};

export const updatePodcastComment = async (id: number, data: UpdatePodcastCommentRequest): Promise<PodcastComment | null> => {
    try {
        const response = await axios.put<ApiResponse<PodcastComment>>(
            `${api_url}/comments/podcasts/${id}`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error updating podcast comment ${id}:`, error);
        return null;
    }
};

export const fetchPodcastComments = async (
    current = 1,
    pageSize = 20,
    term = "",
    podcastId?: number,
    userId?: number
): Promise<PageResult<PodcastComment> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        if (podcastId !== undefined) params.append('podcastId', podcastId.toString());
        if (userId !== undefined) params.append('userId', userId.toString());

        const response = await axios.get<ApiResponse<PageResult<PodcastComment>>>(
            `${api_url}/comments/podcasts?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching podcast comments:", error);
        return null;
    }
};

export const createPodcastComment = async (data: CreatePodcastCommentRequest): Promise<PodcastComment | null> => {
    try {
        const response = await axios.post<ApiResponse<PodcastComment>>(
            `${api_url}/comments/podcasts`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error creating podcast comment:", error);
        return null;
    }
};

export const togglePodcastCommentActive = async (id: number): Promise<ToggleActiveResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<ToggleActiveResponse>>(
            `${api_url}/comments/podcasts/${id}/toggle-active`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling active for podcast comment ${id}:`, error);
        return null;
    }
};

export const likePodcastComment = async (id: number): Promise<LikeResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<LikeResponse>>(
            `${api_url}/comments/podcasts/${id}/like`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error liking podcast comment ${id}:`, error);
        return null;
    }
};


// --- User Controller ---

export const fetchUsers = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = [],
    sortDirection: string[] = [],
    active?: boolean
): Promise<PageResult<ProfileData> | null> => {
    // Assuming response type based on context
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());

        const response = await axios.get<ApiResponse<PageResult<ProfileData>>>(
            `${api_url}/users?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;
    }
};

export const updateUserProfile = async (data: UpdateUserRequest): Promise<ProfileData | null> => {
    // Assuming response is the updated ProfileData
    try {
        const response = await axios.put<ApiResponse<ProfileData>>(
            `${api_url}/users`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        return null;
    }
};

export const changePassword = async (data: ChangePasswordRequest): Promise<boolean | null> => {
    // Assuming simple success/fail, return boolean
    // Request body structure ChangePasswordRequest is assumed
    try {
        await axios.post<ApiResponse<{}>>( // Assuming empty success response
            `${api_url}/users/change-password`,
            data
        );
        return true;
    } catch (error) {
        console.error("Error changing password:", error);
        return null;
    }
};

export const toggleUserActive = async (id: number): Promise<ToggleActiveResponse | null> => {
    try {
        const response = await axios.patch<ApiResponse<ToggleActiveResponse>>(
            `${api_url}/users/${id}/toggle-active`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling active for user ${id}:`, error);
        return null;
    }
};

export const updateUserRole = async (id: number, data: UpdateUserRoleRequest): Promise<ProfileData | null> => {
    // Assuming response is updated ProfileData
    // Request body UpdateUserRoleRequest is assumed
    try {
        const response = await axios.patch<ApiResponse<ProfileData>>(
            `${api_url}/users/${id}/roles`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error updating role for user ${id}:`, error);
        return null;
    }
};

export const getUser = async (id: number): Promise<ProfileData | null> => {
    try {
        const response = await axios.get<ApiResponse<ProfileData>>(
            `${api_url}/users/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        return null;
    }
};

export const getProfile = async (): Promise<ProfileData | null> => {
    try {
        const response = await axios.get<ApiResponse<ProfileData>>(
            `${api_url}/users/profile`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};


// --- Favorite Podcast Controller ---

export const checkFavoritePodcastStatus = async (podcastId: number): Promise<CheckFavoritePodcastResponse | null> => {
    try {
        const response = await axios.get<ApiResponse<CheckFavoritePodcastResponse>>(
            `${api_url}/favorite-podcasts/podcasts/${podcastId}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error checking favorite status for podcast ${podcastId}:`, error);
        // It might return 404 or similar if not favorited, but the API seems designed to return status.
        // Handle specific HTTP status codes if needed outside this function.
        return null; // Return null on network/server errors as requested
    }
};

export const toggleFavoritePodcast = async (podcastId: number): Promise<ToggleFavoritePodcastResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<ToggleFavoritePodcastResponse>>(
            `${api_url}/favorite-podcasts/podcasts/${podcastId}`
            // No request body needed for this toggle based on Swagger
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling favorite status for podcast ${podcastId}:`, error);
        return null;
    }
};

export const fetchFavoritePodcasts = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = [],
    sortDirection: string[] = [],
    active?: boolean // Filter by the favorite status itself (true = only active favorites)
): Promise<PageResult<FavoritePodcast_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());

        const response = await axios.get<ApiResponse<PageResult<FavoritePodcast_t>>>(
            `${api_url}/favorite-podcasts?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching favorite podcasts:", error);
        return null;
    }
};


// --- Favorite Element Controller ---

export const checkFavoriteElementStatus = async (elementId: number): Promise<CheckFavoriteElementResponse | null> => {
    try {
        const response = await axios.get<ApiResponse<CheckFavoriteElementResponse>>(
            `${api_url}/favorite-elements/elements/${elementId}`
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error checking favorite status for element ${elementId}:`, error);
        // Handle specific HTTP status codes if needed outside this function.
        return null; // Return null on network/server errors as requested
    }
};

export const toggleFavoriteElement = async (elementId: number): Promise<ToggleFavoriteElementResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<ToggleFavoriteElementResponse>>(
            `${api_url}/favorite-elements/elements/${elementId}`
            // No request body needed for this toggle based on Swagger
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error toggling favorite status for element ${elementId}:`, error);
        return null;
    }
};

export const fetchFavoriteElements = async (
    current = 1,
    pageSize = 20,
    term = "",
    sortBy: string[] = [],
    sortDirection: string[] = [],
    active?: boolean // Filter by the favorite status itself (true = only active favorites)
): Promise<PageResult<FavoriteElement_t> | null> => {
    try {
        const params = new URLSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
        if (term) params.append('term', term);
        sortBy.forEach(s => params.append('sortBy', s));
        sortDirection.forEach(d => params.append('sortDirection', d));
        if (active !== undefined) params.append('active', active.toString());

        const response = await axios.get<ApiResponse<PageResult<FavoriteElement_t>>>(
            `${api_url}/favorite-elements?${params.toString()}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching favorite elements:", error);
        return null;
    }
};