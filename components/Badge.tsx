import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
    default: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
    },
    success: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
    },
    warning: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    destructive: {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
    },
    outline: {
        bg: 'bg-transparent',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-300 dark:border-gray-600',
    },
};

export default function Badge({
    children,
    variant = 'default',
    className = '',
    style,
    textStyle,
}: BadgeProps) {
    const styles = variantStyles[variant];
    const hasBorder = !!styles.border;

    return (
        <View
            className={`px-2.5 py-1 rounded-full ${styles.bg} ${hasBorder ? `border ${styles.border}` : ''} ${className}`}
            style={style}
        >
            <Text
                className={`text-xs font-medium ${styles.text}`}
                style={textStyle}
            >
                {children}
            </Text>
        </View>
    );
}

// Utility function to get status badge config
export function getStatusBadgeConfig(status: 'active' | 'trial' | 'expiring'): {
    label: string;
    variant: BadgeVariant;
} {
    switch (status) {
        case 'active':
            return { label: 'Đang hoạt động', variant: 'success' };
        case 'trial':
            return { label: 'Dùng thử', variant: 'warning' };
        case 'expiring':
            return { label: 'Sắp hết hạn', variant: 'destructive' };
        default:
            return { label: status, variant: 'default' };
    }
}

// Utility function to get urgency badge config based on days remaining
export function getUrgencyBadgeConfig(daysUntil: number): {
    label: string;
    variant: BadgeVariant;
} {
    if (daysUntil <= 0) {
        return { label: 'Hôm nay', variant: 'destructive' };
    } else if (daysUntil === 1) {
        return { label: 'Mai', variant: 'destructive' };
    } else if (daysUntil <= 2) {
        return { label: `${daysUntil} ngày`, variant: 'destructive' };
    } else if (daysUntil <= 7) {
        return { label: `${daysUntil} ngày`, variant: 'warning' };
    } else {
        return { label: `${daysUntil} ngày`, variant: 'default' };
    }
}
