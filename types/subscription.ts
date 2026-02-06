// Billing cycle enum matching backend
export type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly';

// Service status enum
export type ServiceStatus = 'Active' | 'Inactive';

// Subscription status enum
export type SubscriptionStatus = 'Active' | 'Inactive' | 'Cancelled' | 'Expired' | 'ExpiringSoon';

// UI-friendly subscription status
export type UISubscriptionStatus = 'active' | 'trial' | 'expiring';

// Subscription type for categorization
export type SubscriptionType = 'online' | 'offline';

// Service Plan response from backend
export interface ServicePlan {
    id: string;
    planName: string;
    price: number;
    billingCycleEnums: BillingCycle;
    status: ServiceStatus;
    createdAt: string;
    lastUpdatedAt?: string;
    modifiedByName?: string;
}

// Service Definition response from backend
export interface ServiceDefinition {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    createdAt: string;
    lastUpdatedAt?: string;
    status: ServiceStatus;
    modifiedByName?: string;
    servicePlans?: ServicePlan[];
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    pageIndex: number;
    totalPages: number;
    pageSize: number;
}

// User Subscription (for local state - simplified version)
export interface Subscription {
    id: string;
    name: string;
    logo: string;
    price: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
    nextRenewal: string;
    status: UISubscriptionStatus;
    category: string;
    type: SubscriptionType;
    servicePlanId?: string;
    serviceDefinitionId?: string;
    startDate?: string;
    endDate?: string;
}

// Request to create a service definition (Admin only)
export interface CreateServiceRequest {
    name: string;
    description: string;
    logoUrl: string;
    servicePlans?: CreateServicePlanRequest[];
}

// Request to create a service plan
export interface CreateServicePlanRequest {
    planName: string;
    price: number;
    billingCycleEnums: BillingCycle;
}

// Helper to convert billing cycle to display text
export function getBillingCycleText(cycle: BillingCycle | 'monthly' | 'yearly'): string {
    switch (cycle) {
        case 'Monthly':
        case 'monthly':
            return '/ tháng';
        case 'Quarterly':
            return '/ quý';
        case 'Yearly':
        case 'yearly':
            return '/ năm';
        default:
            return '';
    }
}

// Helper to calculate days until a date
export function getDaysUntil(dateString: string): number {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper to format price in VND
export function formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + '₫';
}
