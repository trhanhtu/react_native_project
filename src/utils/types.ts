export type str<T extends string> = string & { __brand: T };
export type ViewElement_t = {
    isLightOn: boolean,
    atomicNumber: number,
    symbol: string,
    image: string,
    groupNumber: Group_t
    period: Period_t,
    block: Block_t,
    classification: Classification_t,
    meltingPoint: number,
    boilingPoint: number,
    yearDiscovered: number,
}

export interface ApiResponse<T> {
    statusCode: number,
    message: string,
    data: T,
    error: string,
}
export interface SearchResult {
    meta: {
        current: number
        pageSize: number
        totalPages: number
        totalItems: number
    }
    result: DetailElement_t[]
}
export type DetailElement_t = {
    atomicNumber: number,
    symbol: string,
    image: string,
    groupNumber: string
    period: string,
    block: string,
    classification: Classification_t,
    name: string,
    atomicMass: string,
    electronicConfiguration: string,
    electronegativity: number,
    atomicRadius: number,
    ionRadius: number,
    vanDelWaalsRadius: number,
    ionizationEnergy: number,
    electronAffinity: number,
    oxidationStates: number[],
    standardState: string,
    bondingType: string,
    meltingPoint: number,
    boilingPoint: number,
    density: number,
    yearDiscovered: number
}

export type TabScreen_t = {
    icon: React.ReactNode,
    name: string,
    component: React.ReactNode,
}

export interface RegisterResponse {
    name: string,
    email: string,
    status: string
}

export interface RegisterRequest {
    name: string,
    email: string,
    password: string
}

export interface VerifyOTPResponse {
    email: string,
    verifyStatus: string,
}

export interface VerifyOTPRequest {
    email: string,
    otp: string,
}

export interface SendOTPRequest {
    email: string;
}

export interface LoginResponse {
    id: number,
    email: string,
    name: string,
    avatar: string,
    accessToken: string,
    role: string,
    isActive: boolean,
}

export interface LoginRequest {
    email: string,
    password: string
}

export interface ResetPasswordRequest {
    email: string,
    password: string,
    passwordConfirm: string,
    otp: string
}

export interface UpdateUserRequest {
    name: string,
    avatar: string
}


export type Classification_t = "-" | "kim loại" | "phi kim" | "trung tính";
export type Block_t = "-" | "s" | "p" | "d" | "f";
export type Group_t = "-" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "lan" | "act";
export type Period_t = "-" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "lan" | "act"