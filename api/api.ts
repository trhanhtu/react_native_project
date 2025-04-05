import { ApiResponse, DetailElement_t, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest, SearchResult, SendOTPRequest, UpdateUserRequest, VerifyOTPRequest, VerifyOTPResponse } from "@/src/utils/types";
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

export async function searchElements(query: string, page = 1, pageSize = 10): Promise<SearchResult | null> {
    try {
        const response = await axios.get<ApiResponse<SearchResult>>(
            `${api_url}/elements?current=${page}&pageSize=${pageSize}&term=${encodeURIComponent(query)}`,
        )
        return response.data.data;
    } catch (error) {
        console.error("Error fetching elements:", error)
        return null;
    }
}
export async function fetchAllElements(): Promise<DetailElement_t[]> {
    try {
        const response = await axios.get<ApiResponse<SearchResult>>(
            `${api_url}/elements?current=1&pageSize=999`,
        )
        return response.data.data.result.sort((a, b) => a.atomicNumber - b.atomicNumber);
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

        if (response.data.statusCode === 200) {
            return response.data.data
        }

        console.warn("Lỗi từ API:", response.data.error)
        return null
    } catch (err) {
        console.error("Lỗi kết nối máy chủ:", err)
        return null
    }
}

// ============================================================== //