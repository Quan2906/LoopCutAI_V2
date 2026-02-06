// Generic API Wrappers
export interface ApiResponse<T> {
    code: number;
    statusCode: string;
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    statusCode: number;
    isSuccess: boolean;
    message: string;
}

// Auth & Account Models
export interface AccountResponse {
    id: string;
    email: string;
    fullName: string;
    address?: string;
    phoneNumber?: string;
    createdAt: string;
    role: 'Admin' | 'User';
    status: number;
}

export interface AuthResponse {
    token: string;
    userId: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    address?: string;
    phoneNumber?: string;
}

export interface AccountRequest {
    email: string;
    password?: string;
    fullName: string;
    address?: string;
    phoneNumber?: string;
}

export interface LoginGoogleRequest {
    idToken: string;
}

// ============================================
// Membership Types
// ============================================

export interface Membership {
    id: string;
    name: string;
    code: string;
    description: string;
    durationInMonths: number;
    price: number;
    status: number; // 0=Inactive, 1=Active
}

export interface UserMembership {
    id: string;
    userId: string;
    membershipId: string;
    membershipName: string;
    fullName: string;
    durationInMonths: number;
    startDate: string;
    endDate: string;
    status: number;
}

export interface MembershipDetail {
    membershipId: string;
    name: string;
    code: string;
    description: string;
    durationInMonths: number;
    price: number;
    status: number;
}

export interface UserMembershipDetail {
    userId: string;
    email: string;
    fullName: string;
    address: string;
    phoneNumber: string;
    createdAt: string;
    lastUpdatedAt: string | null;
    role: number;
    status: number;
    membership: MembershipDetail;
    startDate: string;
    endDate: string;
}

// ============================================
// Payment Types
// ============================================

export interface CreatePaymentRequest {
    userId: string;
    membershipId: string;
}

export interface PaymentResponse {
    checkoutUrl: string;
    orderCode: number;
    message: string;
}

export interface PaymentDetail {
    orderId: string;
    userId: string;
    email: string;
    fullName: string;
    membershipId: string;
    membershipName: string;
    price: number;
    description: string;
    status: PaymentStatus;
    createdAt: string;
    updateAt: string;
}

export enum PaymentStatus {
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Process = 3,
}

export enum MembershipStatus {
    Expired = 0,
    Active = 1,
}

// ============================================
// Paginated Response
// ============================================

export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    pageIndex: number;
    totalPages: number;
    pageSize: number;
}
