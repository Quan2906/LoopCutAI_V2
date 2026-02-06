import { apiClient } from './apiClient';
import {
    Subscription,
    BillingCycle,
    ServiceDefinition
} from '../types/subscription';

// --- Backend DTOs ---

interface SubscriptionRequest {
    servicePlanId?: string | null;
    subscriptionsName: string;
    startDate: string; // ISO Date
    endDate: string; // ISO Date
    price: number;
    remiderDays: number; // Backend typo: RemiderDays
}

interface SubscriptionResponseV1 {
    id: string;
    servicePlanId?: string | null;
    subscriptionsName: string;
    startDate: string;
    endDate?: string | null;
    price: number;
    remiderDays: number;
    status: number; // Enum integer
    planId?: string | null;
    planName: string;
    planPrice: number;
    billingCycleEnums: string; // "Monthly", "Yearly"
    serviceId?: string | null;
    serviceName: string;
}

interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string;
}

interface PaginatedList<T> {
    items: T[];
    pageIndex: number;
    totalItems: number;
    totalPages: number;
}

export const subscriptionService = {
    /**
     * CATALOG: Get all memberships (Catalog) for auto-complete
     */
    async getMemberships(pageIndex: number = 1, pageSize: number = 20): Promise<ServiceDefinition[]> {
        try {
            const response = await apiClient.get<ApiResponse<PaginatedList<any>>>(
                `/api/v1/memberships?pageIndex=${pageIndex}&pageSize=${pageSize}`
            );

            // Handle potential variations in response structure safely
            const raw = response as any;
            const data = raw.data || raw;
            const items = data.items || [];

            return items.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description || '',
                logoUrl: '',
                status: 'Active',
                servicePlans: [{
                    id: item.id,
                    planName: 'Standard',
                    price: 0,
                    billingCycleEnums: 'Monthly'
                }]
            }));
        } catch (error) {
            console.error('Failed to fetch memberships', error);
            return [];
        }
    },

    /**
     * GET: Get all subscriptions for the current user
     */
    async getSubscriptions(pageIndex: number = 1, pageSize: number = 20): Promise<Subscription[]> {
        try {
            const response = await apiClient.get<ApiResponse<PaginatedList<SubscriptionResponseV1>>>(
                `/api/v1/me/subscriptions?pageIndex=${pageIndex}&pageSize=${pageSize}`
            );

            const raw = response as any;
            const data = raw.data || raw;
            const items = data.items || [];

            return items.map((item: SubscriptionResponseV1) => mapResponseToSubscription(item));
        } catch (error) {
            console.error('Failed to fetch subscriptions', error);
            return [];
        }
    },

    /**
     * GET: Get subscription by ID
     */
    async getSubscription(id: string): Promise<Subscription | null> {
        try {
            const response = await apiClient.get<ApiResponse<SubscriptionResponseV1>>(
                `/api/v1/me/subscriptions/${id}`
            );
            const raw = response as any;
            const item = raw.data || raw;
            return mapResponseToSubscription(item as SubscriptionResponseV1);
        } catch (error) {
            console.error(`Failed to fetch subscription ${id}`, error);
            return null;
        }
    },

    /**
     * POST: Create a new subscription
     */
    async addSubscription(subscription: Partial<Subscription>): Promise<Subscription | null> {
        try {
            // Logic: Next Renewal is the End Date. Start Date is calculated backwards.
            let endDate = subscription.nextRenewal
                ? new Date(subscription.nextRenewal)
                : new Date(new Date().setMonth(new Date().getMonth() + 1));

            // Validate date
            if (isNaN(endDate.getTime())) {
                endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
            }

            const startDate = new Date(endDate);
            if (subscription.billingCycle === 'yearly') {
                startDate.setFullYear(startDate.getFullYear() - 1);
            } else {
                // Default to monthly
                startDate.setMonth(startDate.getMonth() - 1);
            }

            // Calculate reminderDays (Difference between End Date and Now)
            const now = new Date();
            const diffTime = endDate.getTime() - now.getTime();
            let reminderDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Ensure reminderDays is at least 1 to satisfy backend validation
            if (reminderDays < 1) reminderDays = 1;

            const request: SubscriptionRequest = {
                servicePlanId: subscription.servicePlanId || null,
                subscriptionsName: subscription.name || 'Unnamed Subscription',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                price: subscription.price || 0,
                remiderDays: reminderDays
            };

            const response = await apiClient.post<ApiResponse<SubscriptionResponseV1>>(
                '/api/v1/me/subscriptions',
                request
            );

            const raw = response as any;
            const item = raw.data || raw;
            return mapResponseToSubscription(item);
        } catch (error) {
            console.error('Failed to create subscription', error);
            throw error;
        }
    },

    /**
     * PUT: Update a subscription
     */
    async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
        try {
            const request: SubscriptionRequest = {
                servicePlanId: updates.servicePlanId || null,
                subscriptionsName: updates.name || '',
                startDate: new Date().toISOString(), // Use existing start date logic if available
                endDate: updates.nextRenewal ? new Date(updates.nextRenewal).toISOString() : new Date().toISOString(),
                price: updates.price || 0,
                remiderDays: 0
            };

            const response = await apiClient.put<ApiResponse<SubscriptionResponseV1>>(
                `/api/v1/me/subscriptions/${id}`,
                request
            );

            const raw = response as any;
            const item = raw.data || raw;
            return mapResponseToSubscription(item);
        } catch (error) {
            console.error('Failed to update subscription', error);
            throw error;
        }
    },

    /**
     * DELETE: Delete a subscription
     */
    async deleteSubscription(id: string): Promise<void> {
        try {
            await apiClient.delete(`/api/v1/me/subscriptions/${id}`);
        } catch (error) {
            console.error('Failed to delete subscription', error);
            throw error;
        }
    }
};

// Helper: Map Backend Response to UI Model
function mapResponseToSubscription(item: SubscriptionResponseV1): Subscription {
    let uiStatus: 'active' | 'expiring' | 'trial' = 'active';

    let billingCycle: 'monthly' | 'yearly' = 'monthly';
    if (item.billingCycleEnums?.toLowerCase().includes('year')) {
        billingCycle = 'yearly';
    }

    return {
        id: item.id || '',
        name: item.subscriptionsName,
        logo: '',
        price: item.price,
        currency: '₫',
        billingCycle: billingCycle,
        nextRenewal: item.endDate || new Date().toISOString(),
        status: uiStatus,
        category: 'General',
        type: 'online',
        servicePlanId: item.servicePlanId || undefined,
        startDate: item.startDate,
    };
}
