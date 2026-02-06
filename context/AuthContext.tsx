import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AccountResponse, LoginRequest, LoginGoogleRequest } from '../types/api';
import { authService } from '../services/authService';
import { Storage } from '../utils/storage';

interface AuthContextType {
    user: AccountResponse | null;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => { },
    loginWithGoogle: async () => { },
    logout: async () => { },
    refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AccountResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    // Check for token and load user on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await Storage.getItem('token');
                if (token) {
                    const response = await authService.getCurrentUser();
                    setUser(response.data);
                }
            } catch (error) {
                // Token invalid or expired
                await Storage.removeItem('token');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            await Storage.setItem('token', response.data.token);

            // Fetch fresh user details immediately
            const userResponse = await authService.getCurrentUser();
            setUser(userResponse.data);

            // Navigate to Dashboard/Home
            router.replace('/');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (idToken: string) => {
        setIsLoading(true);
        try {
            const response = await authService.loginGoogle({ idToken });
            await Storage.setItem('token', response.data.token);

            const userResponse = await authService.getCurrentUser();
            setUser(userResponse.data);

            router.replace('/');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await Storage.removeItem('token');
        setUser(null);
        router.replace('/(auth)/login');
    };

    const refreshUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            setUser(response.data);
        } catch (error) {
            // If refresh fails, user may need to re-login
            await Storage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, loginWithGoogle, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
