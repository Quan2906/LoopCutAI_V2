import axios, { AxiosError } from 'axios';
import { Storage } from '../utils/storage';
import { ApiErrorResponse } from '../types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://loopcutai.onrender.com';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await Storage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
            await Storage.removeItem('token');
            // We might need a way to notify the app to redirect to login
            // For now, removing the token ensures subsequent checks fail
        }

        const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
        return Promise.reject(new Error(errorMessage));
    }
);
