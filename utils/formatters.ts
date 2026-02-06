/**
 * Format a number as Vietnamese Dong (VND) currency
 */
export const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

/**
 * Format price with shorter notation (e.g., "99.000đ")
 */
export const formatVNDShort = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

/**
 * Calculate days remaining until a given date
 */
export const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

/**
 * Format membership duration in Vietnamese
 */
export const formatDuration = (months: number): string => {
    if (months === 1) return '1 tháng';
    if (months === 12) return '1 năm';
    if (months === 24) return '2 năm';
    if (months % 12 === 0) return `${months / 12} năm`;
    return `${months} tháng`;
};

/**
 * Format a date string to Vietnamese locale
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

/**
 * Format a date string to relative time (e.g., "Còn 30 ngày")
 */
export const formatDaysRemaining = (endDate: string): string => {
    const days = getDaysRemaining(endDate);
    if (days === 0) return 'Hết hạn hôm nay';
    if (days === 1) return 'Còn 1 ngày';
    if (days < 0) return 'Đã hết hạn';
    return `Còn ${days} ngày`;
};

/**
 * Check if a membership is expiring soon (within 7 days)
 */
export const isExpiringSoon = (endDate: string): boolean => {
    const days = getDaysRemaining(endDate);
    return days > 0 && days <= 7;
};

/**
 * Check if a membership has expired
 */
export const isExpired = (endDate: string): boolean => {
    return getDaysRemaining(endDate) <= 0;
};
