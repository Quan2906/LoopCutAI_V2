import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Membership, UserMembershipDetail, PaginatedResponse } from '../types/api';
import { membershipService } from '../services/membershipService';
import { useAuth } from './AuthContext';

interface MembershipContextType {
    // Available membership plans
    memberships: Membership[];
    // User's current active membership (null if none)
    userMembership: UserMembershipDetail | null;
    // Loading states
    isLoadingMemberships: boolean;
    isLoadingUserMembership: boolean;
    // Error states
    membershipError: string | null;
    userMembershipError: string | null;
    // Actions
    fetchMemberships: () => Promise<void>;
    fetchUserMembership: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

const MembershipContext = createContext<MembershipContextType>({
    memberships: [],
    userMembership: null,
    isLoadingMemberships: false,
    isLoadingUserMembership: false,
    membershipError: null,
    userMembershipError: null,
    fetchMemberships: async () => { },
    fetchUserMembership: async () => { },
    refreshAll: async () => { },
});

export const useMembership = () => useContext(MembershipContext);

export const MembershipProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();

    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [userMembership, setUserMembership] = useState<UserMembershipDetail | null>(null);

    const [isLoadingMemberships, setIsLoadingMemberships] = useState(false);
    const [isLoadingUserMembership, setIsLoadingUserMembership] = useState(false);

    const [membershipError, setMembershipError] = useState<string | null>(null);
    const [userMembershipError, setUserMembershipError] = useState<string | null>(null);

    const fetchMemberships = useCallback(async () => {
        setIsLoadingMemberships(true);
        setMembershipError(null);
        try {
            const response = await membershipService.getAllMemberships(1, 20);
            if (response.data && response.data.items) {
                setMemberships(response.data.items);
            }
        } catch (error: any) {
            console.error('Failed to fetch memberships:', error);
            setMembershipError(error.message || 'Failed to load membership plans');
        } finally {
            setIsLoadingMemberships(false);
        }
    }, []);

    const fetchUserMembership = useCallback(async () => {
        if (!user?.id) {
            setUserMembership(null);
            return;
        }

        setIsLoadingUserMembership(true);
        setUserMembershipError(null);
        try {
            const response = await membershipService.getUserActiveMembership(user.id);
            // API returns null data if user has no membership
            if (response.data && response.data.membership) {
                setUserMembership(response.data);
            } else {
                setUserMembership(null);
            }
        } catch (error: any) {
            // A 404 or similar means no active membership - not an error
            if (error.message?.includes('not found') || error.message?.includes('404')) {
                setUserMembership(null);
            } else {
                console.error('Failed to fetch user membership:', error);
                setUserMembershipError(error.message || 'Failed to load membership status');
            }
        } finally {
            setIsLoadingUserMembership(false);
        }
    }, [user?.id]);

    const refreshAll = useCallback(async () => {
        await Promise.all([fetchMemberships(), fetchUserMembership()]);
    }, [fetchMemberships, fetchUserMembership]);

    // Fetch memberships on mount
    useEffect(() => {
        fetchMemberships();
    }, [fetchMemberships]);

    // Fetch user membership when user changes
    useEffect(() => {
        if (user?.id) {
            fetchUserMembership();
        } else {
            setUserMembership(null);
        }
    }, [user?.id, fetchUserMembership]);

    return (
        <MembershipContext.Provider
            value={{
                memberships,
                userMembership,
                isLoadingMemberships,
                isLoadingUserMembership,
                membershipError,
                userMembershipError,
                fetchMemberships,
                fetchUserMembership,
                refreshAll,
            }}
        >
            {children}
        </MembershipContext.Provider>
    );
};
