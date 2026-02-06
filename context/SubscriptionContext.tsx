import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Subscription, getDaysUntil } from '../types/subscription';
import { Storage } from '../utils/storage';
import { Platform } from 'react-native';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
    subscriptions: Subscription[];
    isLoading: boolean;
    addSubscription: (subscription: Subscription) => Promise<void>;
    updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
    deleteSubscription: (id: string) => Promise<void>;
    getSubscription: (id: string) => Subscription | undefined;
    totalMonthlySpending: number;
    upcomingRenewals: (Subscription & { daysUntil: number })[];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'loopcut-subscriptions';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load subscriptions from API on mount
    const loadSubscriptions = async () => {
        setIsLoading(true);
        try {
            const data = await subscriptionService.getSubscriptions();
            setSubscriptions(data);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadSubscriptions();
        }
    }, [user]);

    // Helper to refresh data
    const refreshData = useCallback(() => {
        loadSubscriptions();
    }, []);

    const addSubscription = useCallback(async (subscription: Subscription) => {
        try {
            await subscriptionService.addSubscription(subscription);
            refreshData();
        } catch (err) {
            console.error(err);
        }
    }, [refreshData]);

    const updateSubscription = useCallback(async (id: string, updates: Partial<Subscription>) => {
        try {
            await subscriptionService.updateSubscription(id, updates);
            setSubscriptions(prev =>
                prev.map(sub => (sub.id === id ? { ...sub, ...updates } : sub))
            );
            refreshData(); // Refresh to get server calculation/updates
        } catch (err) {
            console.error(err);
        }
    }, [refreshData]);

    const deleteSubscription = useCallback(async (id: string) => {
        try {
            await subscriptionService.deleteSubscription(id);
            refreshData();
        } catch (err) {
            console.error(err);
        }
    }, [refreshData]);

    const getSubscription = useCallback((id: string) => {
        return subscriptions.find(sub => sub.id === id);
    }, [subscriptions]);

    // Calculate total monthly spending
    const totalMonthlySpending = useMemo(() => {
        return subscriptions.reduce((sum, sub) => {
            return sum + (sub.billingCycle === 'monthly' ? sub.price : sub.price / 12);
        }, 0);
    }, [subscriptions]);

    // Calculate upcoming renewals sorted by days until renewal
    const upcomingRenewals = useMemo(() => {
        return subscriptions
            .map(sub => ({
                ...sub,
                daysUntil: getDaysUntil(sub.nextRenewal)
            }))
            .sort((a, b) => a.daysUntil - b.daysUntil);
    }, [subscriptions]);

    const contextValue = useMemo(() => ({
        subscriptions,
        isLoading,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        getSubscription,
        totalMonthlySpending,
        upcomingRenewals,
    }), [subscriptions, isLoading, addSubscription, updateSubscription, deleteSubscription, getSubscription, totalMonthlySpending, upcomingRenewals]);

    return (
        <SubscriptionContext.Provider value={contextValue}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscriptions() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscriptions must be used within SubscriptionProvider');
    }
    return context;
}
