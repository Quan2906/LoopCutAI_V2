import React from 'react';
import { View, Text, Pressable, Image, Platform } from 'react-native';
import { Calendar, Trash2 } from 'lucide-react-native';
import { Subscription, getBillingCycleText } from '../types/subscription';
import Badge, { getStatusBadgeConfig } from './Badge';
import { useTheme } from '../context/ThemeContext';

interface SubscriptionCardProps {
    subscription: Subscription;
    onPress?: () => void;
    onDelete?: () => void;
}

export default function SubscriptionCard({ subscription, onPress, onDelete }: SubscriptionCardProps) {
    const { isDark } = useTheme();
    const statusConfig = getStatusBadgeConfig(subscription.status);

    // Format next renewal date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <Pressable
            onPress={onPress}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
            style={({ pressed }) => [
                {
                    shadowColor: '#7c3aed',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                },
                Platform.OS === 'web' ? {
                    ...(onPress ? { cursor: 'pointer' } : {}),
                    opacity: pressed ? 0.95 : 1,
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                    transition: 'all 0.2s ease',
                } : {}
            ]}
        >
            <View className="flex-row items-start gap-4">
                {/* Logo */}
                <View
                    className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center shrink-0"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    {subscription.logo ? (
                        <Image
                            source={{ uri: subscription.logo }}
                            className="w-8 h-8"
                            resizeMode="contain"
                        />
                    ) : (
                        <Text className="text-2xl">📦</Text>
                    )}
                </View>

                {/* Content */}
                <View className="flex-1 min-w-0">
                    {/* Header: Name + Badge + Trash */}
                    <View className="flex-row items-start justify-between gap-2 mb-2">
                        <Text
                            className="font-semibold text-gray-900 dark:text-white flex-1 text-base mr-1"
                            numberOfLines={1}
                        >
                            {subscription.name}
                        </Text>

                        {/* Desktop: Badge inline; Mobile: might wrap if needed, but keeping inline is usually fine for badge */}
                        <View className="flex-row gap-2 shrink-0">
                            {Platform.OS === 'web' && (
                                <Badge variant={statusConfig.variant}>
                                    {statusConfig.label}
                                </Badge>
                            )}
                            {onDelete && (
                                <Pressable
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="p-1 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20"
                                >
                                    <Trash2 size={16} color="#ef4444" />
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {/* Mobile: Badge below name if not desktop */}
                    {Platform.OS !== 'web' && (
                        <View className="flex-row mb-2">
                            <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                            </Badge>
                        </View>
                    )}

                    {/* Price and Details */}
                    <View className="flex-row sm:items-center justify-between flex-wrap gap-y-3">
                        <View className="flex-row items-baseline">
                            <Text className="text-xl sm:text-2xl font-bold text-primary">
                                {subscription.currency}{subscription.price.toLocaleString()}
                            </Text>
                            <Text className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1">
                                {getBillingCycleText(subscription.billingCycle)}
                            </Text>
                        </View>

                        <View
                            className={`flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 ${Platform.OS === 'web' ? 'self-start mt-1 sm:mt-0 sm:self-auto' : 'self-start sm:self-auto'}`}
                        >
                            <Calendar size={14} color="#9ca3af" />
                            <Text className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(subscription.nextRenewal)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}
