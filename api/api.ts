import { ApiResponse, DetailElement_t, FavoriteElement_t, LoginRequest, LoginResponse, PageResult, Podcast_t, PodcastComment, ProfileData, RegisterRequest, RegisterResponse, ResetPasswordRequest, SendOTPRequest, UpdateUserRequest, VerifyOTPRequest, VerifyOTPResponse } from "@/src/utils/types";
import axios from "./axios-customize";

const base_url = process.env.EXPO_PUBLIC_BASE_URL;
const api_url = `${base_url}/api/v1`;

export const register = async (name: string, email: string, password: string):
    Promise<ApiResponse<RegisterResponse> | null> => {
    try {
        const registerRequest: RegisterRequest = {
            name: name,
            email: email,
            password: password
        };
        const response = await axios.post(`${api_url}/auth/register`, registerRequest);
        return response.data;
    } catch (error: any) {
        console.error(error)
        return null;
    }
}

export const verifyOTP = async (email: string, otp: string):
    Promise<ApiResponse<VerifyOTPResponse> | null> => {
    try {
        const verifyOTPRequest: VerifyOTPRequest = {
            email: email,
            otp: otp
        }
        const response = await axios.post(`${api_url}/auth/verify`, verifyOTPRequest);
        // console.log(response.data);
        return response.data;
    } catch (error: any) {
        console.error(error)
        return null;
    }
}

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

export const resetPassword = async (email: string, password: string,
    passwordConfirm: string, otp: string): Promise<ApiResponse<any> | null> => {
    try {
        const resetPasswordRequest: ResetPasswordRequest = {
            email: email,
            password: password,
            passwordConfirm: passwordConfirm,
            otp: otp
        }
        const response = await axios.post(`${api_url}/auth/reset-password`, resetPasswordRequest);
        // console.log(response.data);
        return response.data;
    } catch (error: any) {
        console.error(error)
        return null;
    }
}

export const login = async (email: string, password: string):
    Promise<ApiResponse<LoginResponse> | null> => {
    try {
        const loginRequest: LoginRequest = {
            email: email,
            password: password
        }
        // console.log(`${api_url}/auth/login`);
        const response = await axios.post(`${api_url}/auth/login`, loginRequest);
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
export const fetchPodcasts = async (page: number, pageSize: number): Promise<PageResult<Podcast_t> | null> => {
    try {
        const response = await axios.get<ApiResponse<PageResult<Podcast_t>>>(
            `${api_url}/podcasts?current=${page}&pageSize=${pageSize}&sortBy=id&sortDirection=desc`
        )
        return response.data.data;
    } catch (error) {
        return null;
    }
}



export const fetchPodcastDetailsAPI = async (id: string): Promise<Podcast_t | null> => {
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
export const fetchCommentsAPI = async (id: string | undefined, page: number, pageSize: number): Promise<PageResult<PodcastComment> | null> => {
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

export const postPodcastComment = async (podcastId: string | undefined, text: string): Promise<void> => {
    try {
        await axios.post(`${api_url}/comments/podcasts`, {
            content: text,
            podcastId: Number(podcastId) ?? 1
        })
    } catch (error) {
        return;
    }
}

export const fetchFavoriteElementDetail = async (elementId: number): Promise<FavoriteElement_t | null> => {

    try {
        let responseFavor = await axios.get<ApiResponse<PageResult<FavoriteElement_t>>>(
            `${api_url}/favorite-elements?current=${1}&pageSize=${9999}`,
        )
        let result = responseFavor.data.data.result.findIndex(item => item.element.atomicNumber === elementId);
        if (result !== -1) {
            const element = responseFavor.data.data.result.at(result)!;
            element.element.image = `https://picsum.photos/200?element=${element.element.atomicNumber}`
            return element;
        }
        const responseDetail = await axios.get<ApiResponse<DetailElement_t>>(
            `${api_url}/elements/${elementId}`
        )
        responseDetail.data.data.image = `https://picsum.photos/200?element=${responseDetail.data.data.atomicNumber}`
        return {
            element: responseDetail.data.data,
            active: false
        };
    } catch (error) {
        console.error("Error fetching elements:", error)
        return null;
    }

}
// ============================================================== //

export const fetchFavoriteElements = async (page = 1, pageSize = 10): Promise<PageResult<FavoriteElement_t> | null> => {
    try {
        const response = await axios.get<ApiResponse<PageResult<FavoriteElement_t>>>(
            `${api_url}/favorite-elements?current=${page}&pageSize=${pageSize}`,
        )
        return response.data.data;
    } catch (error) {
        console.error("Error fetching elements:", error)
        return null;
    }
}

export const fetchFavoritePodcasts = async (page = 1, pageSize = 10): Promise<PageResult<Podcast_t> | null> => {
    try {
        const response = await fetch
            (
                `https://raw.githubusercontent.com/trhanhtu/dummyjson/refs/heads/main/podcast_${page}_${pageSize}.json`
            )
        const dataResponse = await response.json();
        return dataResponse.result;
    } catch (error) {
        return null;
    }
}

// History related API calls
export const fetchViewedElements = async (page = 1, pageSize = 10): Promise<PageResult<DetailElement_t> | null> => {
    try {
        const response = await axios.get<ApiResponse<PageResult<DetailElement_t>>>(
            `${api_url}/elements?current=${page}&pageSize=${pageSize}`,
        )
        return response.data.data;
    } catch (error) {
        console.error("Error fetching elements:", error)
        return null;
    }
}

export const fetchViewedPodcasts = async (page = 1, pageSize = 5): Promise<PageResult<Podcast_t> | null> => {
    try {
        // const response = await axios.get<ApiResponse<PageResult<Podcast>>>
        const response = await fetch
            (
                // `${api_url}/comments/podcasts?current=${page}&pageSize=${pageSize}`,
                `https://raw.githubusercontent.com/trhanhtu/dummyjson/refs/heads/main/podcast_${page}_${pageSize}.json`
            )
        const dataResponse = await response.json();
        return dataResponse.result;
    } catch (error) {
        return null;
    }
}


export const fetchProfileData = async (): Promise<ProfileData | null> => {
    try {

        const response = await axios.get<ApiResponse<ProfileData>>(`${api_url}/users/profile`)
        if (response.data.data.avatar === null) {
            response.data.data.avatar = "https://picsum.photos/200"
            for (let item of response.data.data.favoriteElements) {
                item.element.image = `https://picsum.photos/100?element=${item.element.atomicNumber}`;
            }
            response.data.data.viewedElements = Array.from(
                new Map(
                    response.data.data.viewedElements.map(
                        obj => {
                            obj.element.image = `https://picsum.photos/100?element=${obj.element.atomicNumber}`;
                            return [obj.element.atomicNumber, obj]
                        }
                    )
                ).values()
            );

        }
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
export const postThisPodcastIsViewed = async (podcastId: string): Promise<void> => {
    try {
        await axios.post<ApiResponse<any>>(`${api_url}/viewed-podcasts/podcasts/${podcastId}`, {})
    } catch (error) {
        console.error("Error posting viewed element:", error)

    }
}
export const postThisElementFavoriteToggle = async (atomicNumber: number): Promise<void> => {
    try {
        await axios.post<ApiResponse<any>>(`${api_url}/favorite-elements/elements/${atomicNumber}`, {})
    } catch (error) {
        console.error("Error posting viewed element:", error)

    }
}