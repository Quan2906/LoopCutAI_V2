import { apiClient } from './apiClient';
import {
    ApiResponse,
    Membership,
    UserMembershipDetail,
    CreatePaymentRequest,
    PaymentResponse,
    PaymentDetail,
    PaginatedResponse
} from '../types/api';

export const membershipService = {
    /**
     * Get all available membership plans
     */
    getAllMemberships: async (pageIndex = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<Membership>>> => {
        return apiClient.get(`/api/v1/memberships?pageIndex=${pageIndex}&pageSize=${pageSize}`);
    },

    /**
     * Get a specific membership by ID
     */
    getMembershipById: async (id: string): Promise<ApiResponse<Membership>> => {
        return apiClient.get(`/api/v1/memberships/${id}`);
    },

    /**
     * Get the current user's active membership details
     */
    getUserActiveMembership: async (userId: string): Promise<ApiResponse<UserMembershipDetail>> => {
        return apiClient.get(`/api/v1/user-membership/detail/user/${userId}`);
    },

    /**
     * Create a PayOS payment link for membership purchase
     * Returns a checkout URL to redirect the user to
     */
    createPaymentLink: async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
        return apiClient.post('/api/v1/payment/create_payment_link', data);
    },

    /**
     * Get payment information by order code
     * Used to check payment status after returning from PayOS
     */
    getPaymentInfo: async (orderCode: string): Promise<ApiResponse<PaymentDetail>> => {
        return apiClient.get(`/api/v1/payment/${orderCode}`);
    },
};
