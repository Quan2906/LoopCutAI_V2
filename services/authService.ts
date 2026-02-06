import { apiClient } from './apiClient';
import {
    AccountResponse,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    AccountRequest,
    LoginGoogleRequest,
    ApiResponse
} from '../types/api';

export const authService = {
    async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        return apiClient.post('/api/v1/auth/login', data);
    },

    async register(data: RegisterRequest): Promise<ApiResponse<string>> { // Assuming register returns ID or success message
        return apiClient.post('/api/v1/accounts', data);
    },

    async getCurrentUser(): Promise<ApiResponse<AccountResponse>> {
        return apiClient.get('/api/v1/auth/current-user');
    },

    async loginGoogle(data: LoginGoogleRequest): Promise<ApiResponse<AuthResponse>> {
        return apiClient.post('/api/v1/auth/login-google', data);
    },

    async updateProfile(id: string, data: AccountRequest): Promise<ApiResponse<AccountResponse>> {
        return apiClient.put(`/api/v1/accounts/${id}`, data);
    }
};
