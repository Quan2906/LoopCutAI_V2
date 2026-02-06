import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check, Sparkles } from 'lucide-react-native';
import { Membership } from '../../types/api';
import { formatVNDShort, formatDuration } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface MembershipCardProps {
    membership: Membership;
    isCurrentPlan?: boolean;
    isPopular?: boolean;
    onPurchase: (membership: Membership) => void;
    disabled?: boolean;
    loading?: boolean;
}

export default function MembershipCard({
    membership,
    isCurrentPlan = false,
    isPopular = false,
    onPurchase,
    disabled = false,
    loading = false,
}: MembershipCardProps) {
    const { isDark } = useTheme();

    const handlePress = () => {
        if (!disabled && !loading && !isCurrentPlan) {
            onPurchase(membership);
        }
    };

    // Features parsed from description (split by newlines or use default)
    const features = membership.description
        ? membership.description.split('\n').filter(f => f.trim())
        : ['Truy cập đầy đủ tính năng', 'Hỗ trợ ưu tiên'];

    return (
        <View
            className={`rounded-2xl overflow-hidden mb-4 flex-1 border-2 ${isPopular ? 'border-amber-400' : 'border-gray-200 dark:border-gray-700'
                }`}
            style={{
                shadowColor: isPopular ? '#f59e0b' : '#7c3aed',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isPopular ? 0.2 : 0.1,
                shadowRadius: 12,
                elevation: isPopular ? 8 : 4,
            }}
        >
            <View className="bg-white dark:bg-gray-900 p-5 flex-1 relative">
                {/* Badges - Absolute Positioned to not affect layout */}
                {isPopular && (
                    <LinearGradient
                        colors={['#f59e0b', '#d97706']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl z-10"
                    >
                        <View className="flex-row items-center">
                            <Sparkles size={12} color="#fff" />
                            <Text className="text-white font-bold text-[10px] ml-1 uppercase">Phổ biến nhất</Text>
                        </View>
                    </LinearGradient>
                )}

                {isCurrentPlan && (
                    <LinearGradient
                        colors={['#10b981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl z-10"
                    >
                        <View className="flex-row items-center">
                            <Check size={12} color="#fff" />
                            <Text className="text-white font-bold text-[10px] ml-1 uppercase">Đang sử dụng</Text>
                        </View>
                    </LinearGradient>
                )}

                {/* Header */}
                <View className="flex-row items-center justify-between mb-5 mt-2">
                    <View className="flex-row items-center">
                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isPopular ? 'bg-amber-500/10' : 'bg-primary/10'
                            }`}>
                            <Crown size={24} color={isPopular ? '#f59e0b' : '#7c3aed'} />
                        </View>
                        <View className="ml-3">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">
                                {membership.name}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {membership.code}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Price */}
                <View className="mb-6">
                    <View className="flex-row items-baseline">
                        <Text className={`text-3xl font-bold ${isPopular ? 'text-amber-500' : 'text-primary'
                            }`}>
                            {formatVNDShort(membership.price)}
                        </Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                        <View className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDuration(membership.durationInMonths)}
                            </Text>
                        </View>
                        {membership.durationInMonths > 1 && (
                            <Text className="text-xs text-gray-400 ml-2">
                                ~{formatVNDShort(Math.round(membership.price / membership.durationInMonths))}/tháng
                            </Text>
                        )}
                    </View>
                </View>

                {/* Features */}
                <View className="mb-6 flex-1">
                    {features.slice(0, 5).map((feature, index) => (
                        <View key={index} className="flex-row items-start mb-3">
                            <View className={`mt-0.5 w-5 h-5 rounded-full items-center justify-center ${isPopular ? 'bg-amber-500/10' : 'bg-green-500/10'
                                }`}>
                                <Check size={12} color={isPopular ? '#f59e0b' : '#10b981'} />
                            </View>
                            <Text className="text-sm text-gray-600 dark:text-gray-300 ml-3 flex-1 leading-5">
                                {feature.trim()}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Action Button */}
                <Pressable
                    onPress={handlePress}
                    disabled={disabled || loading || isCurrentPlan}
                    className={`py-3.5 px-6 rounded-xl items-center justify-center ${isCurrentPlan
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : isPopular
                            ? 'bg-amber-500'
                            : 'bg-primary'
                        }`}
                    style={({ pressed }) => [
                        {
                            opacity: (disabled || loading) ? 0.6 : pressed ? 0.8 : 1,
                        },
                        Platform.OS === 'web' ? {
                            cursor: isCurrentPlan ? 'default' : 'pointer',
                            transition: 'opacity 0.2s, transform 0.1s',
                            transform: pressed ? 'scale(0.98)' : 'scale(1)',
                            boxShadow: isPopular && !isCurrentPlan ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                        } as any : {},
                    ]}
                >
                    <Text className={`font-bold text-base ${isCurrentPlan
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-white'
                        }`}>
                        {loading
                            ? 'Đang xử lý...'
                            : isCurrentPlan
                                ? 'Gói hiện tại'
                                : 'Đăng ký ngay'
                        }
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
