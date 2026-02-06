import { apiClient } from './apiClient';

export interface ChatResponse {
    response: string;
}

export const chatService = {
    sendMessage: async (message: string) => {
        return apiClient.post<ChatResponse>('/api/v1/chat/send-message', { message });
    }
};
