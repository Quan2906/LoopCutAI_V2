import { useState } from 'react';
import { Text, View, ScrollView, Pressable, Platform, useWindowDimensions, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscriptions } from '../../context/SubscriptionContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingDown, PieChart, Plus } from 'lucide-react-native';
import SubscriptionCard from '../../components/SubscriptionCard';
import AddSubscriptionModal from '../../components/AddSubscriptionModal';
import Button from '../../components/Button';
import { Subscription } from '../../types/subscription';

export default function Dashboard() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const { subscriptions, isLoading, totalMonthlySpending, deleteSubscription } = useSubscriptions();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isDesktop = width >= 768;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    const handleEditSubscription = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingSubscription(null);
    };

    // Stat Card component
    const StatCard = ({
        icon: Icon,
        label,
        value,
        gradient = false,
        iconBg = 'bg-primary/10',
        iconColor = '#7c3aed',
        valueColor = 'text-gray-900 dark:text-white'
    }: {
        icon: any;
        label: string;
        value: string;
        gradient?: boolean;
        iconBg?: string;
        iconColor?: string;
        valueColor?: string;
    }) => (
        <View
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 flex-1 min-w-[140px] border border-gray-100 dark:border-gray-800"
            style={{
                shadowColor: '#7c3aed',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
            }}
        >
            <View className="mb-4">
                {gradient ? (
                    <LinearGradient
                        colors={['#7c3aed', '#6d28d9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-12 h-12 rounded-2xl items-center justify-center"
                    >
                        <Icon size={24} color="#ffffff" />
                    </LinearGradient>
                ) : (
                    <View className={`w-12 h-12 rounded-2xl ${iconBg} items-center justify-center`}>
                        <Icon size={24} color={iconColor} />
                    </View>
                )}
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">{label}</Text>
            <Text className={`text-3xl font-bold ${valueColor}`}>{value}</Text>
        </View>
    );

    if (isLoading) {
        return (
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: isDark ? '#030712' : '#f9fafb' }}
            >
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            className="flex-1"
            style={{
                backgroundColor: isDark ? '#030712' : '#f9fafb',
                paddingTop: isDesktop ? 0 : insets.top
            }}
        >
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ backgroundColor: isDark ? '#030712' : '#f9fafb', flexGrow: 1, paddingBottom: 20 }}
            >

                {/* Mobile Header */}
                {!isDesktop && (
                    <View className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-row items-center gap-3 z-10">
                        <View className="flex-1">
                            <Text className="font-bold text-gray-900 dark:text-white text-base">
                                Chào {user?.fullName?.split(' ').pop() || 'bạn'} 👋
                            </Text>
                            <Text className="text-xs text-gray-500">
                                Hãy kiểm soát chi tiêu của bạn
                            </Text>
                        </View>
                    </View>
                )}

                {/* Desktop Header */}
                {isDesktop && (
                    <View className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                        <View className="px-8 py-6">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                        Bảng điều khiển
                                    </Text>
                                    <Text className="text-gray-500 dark:text-gray-400">
                                        Chào mừng trở lại, {user?.fullName?.split(' ').pop() || 'bạn'} 👋
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() => setShowAddModal(true)}
                                    className="flex-row items-center px-6 py-3 bg-primary rounded-xl"
                                    style={({ pressed }) => Platform.OS === 'web' ? {
                                        cursor: 'pointer',
                                        opacity: pressed ? 0.9 : 1,
                                        transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                                        transition: 'all 0.2s ease',
                                    } : {}}
                                >
                                    <Plus size={20} color="#ffffff" />
                                    <Text className="ml-2 font-semibold text-white">Thêm đăng ký</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                )}

                {/* Content */}
                <View className={`px-6 py-6 ${isDesktop ? 'w-full' : 'max-w-lg mx-auto w-full'} ${!isDesktop ? '-mt-4' : ''}`}>

                    {/* Desktop Stats Grid */}
                    {isDesktop && (
                        <View className="flex-row gap-6 mb-8">
                            <StatCard
                                icon={TrendingDown}
                                label="Tổng chi tiêu hàng tháng"
                                value={`₫${Math.round(totalMonthlySpending).toLocaleString()}`}
                                gradient
                            />
                            <StatCard
                                icon={PieChart}
                                label="Đăng ký đang hoạt động"
                                value={subscriptions.length.toString()}
                                iconBg="bg-primary/10"
                                iconColor="#7c3aed"
                            />
                            <StatCard
                                icon={TrendingDown}
                                label="Tiết kiệm tiềm năng"
                                value="Đang cập nhật..."
                                iconBg="bg-yellow-100 dark:bg-yellow-900/20"
                                iconColor="#eab308"
                                valueColor="text-yellow-600 dark:text-yellow-400 text-xl"
                            />
                        </View>
                    )}

                    {/* Mobile Summary Card */}
                    {!isDesktop && (
                        <View
                            className="rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6"
                            style={{
                                backgroundColor: isDark ? '#111827' : '#ffffff',
                                shadowColor: isDark ? '#000' : '#7c3aed',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: isDark ? 0.3 : 0.08,
                                shadowRadius: 12,
                                elevation: 4,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        Tổng chi tiêu hàng tháng
                                    </Text>
                                    <Text className="text-4xl font-bold text-primary">
                                        ₫{Math.round(totalMonthlySpending).toLocaleString()}
                                    </Text>
                                </View>
                                <View className="w-16 h-16 rounded-2xl bg-accent/20 items-center justify-center">
                                    <TrendingDown size={32} color="#6ee7b7" />
                                </View>
                            </View>

                            <View className="flex-row items-stretch gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <View className="flex-1 flex-col justify-between">
                                    <View className="min-h-[32px] justify-center">
                                        <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {subscriptions.length}
                                        </Text>
                                    </View>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Đăng ký đang hoạt động
                                    </Text>
                                </View>
                                {/* Divider (Optional, but helps separation) */}
                                <View className="w-[1px] bg-gray-200 dark:bg-gray-700" />

                                <View className="flex-1 flex-col justify-between">
                                    <View className="min-h-[32px] justify-center">
                                        <Text className="text-lg font-bold text-yellow-600 dark:text-yellow-400" numberOfLines={1}>
                                            Đang cập nhật...
                                        </Text>
                                    </View>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Tiết kiệm tiềm năng
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Subscriptions Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">
                            Đăng ký của bạn
                        </Text>
                        {!isDesktop && (
                            <Pressable
                                onPress={() => setShowAddModal(true)}
                                className="flex-row items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl"
                                style={({ pressed }) => Platform.OS === 'web' ? {
                                    cursor: 'pointer',
                                    opacity: pressed ? 0.9 : 1,
                                } : {}}
                            >
                                <Plus size={16} color="#7c3aed" />
                                <Text className="ml-2 text-sm font-medium text-primary">Thêm</Text>
                            </Pressable>
                        )}
                    </View>

                    {/* Subscriptions Grid/List */}
                    {subscriptions.length === 0 ? (
                        <View
                            className="rounded-2xl p-8 border border-gray-100 dark:border-gray-800 items-center"
                            style={{
                                backgroundColor: isDark ? '#111827' : '#ffffff',
                                shadowColor: isDark ? '#000' : '#7c3aed',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: isDark ? 0.3 : 0.08,
                                shadowRadius: 12,
                                elevation: 4,
                            }}
                        >
                            <Text className="text-5xl mb-4">📦</Text>
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                                Chưa có đăng ký nào
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 mb-6">
                                Thêm đăng ký đầu tiên của bạn để bắt đầu theo dõi chi tiêu
                            </Text>
                            <Button
                                title="Thêm đăng ký"
                                onPress={() => setShowAddModal(true)}
                            />
                        </View>
                    ) : (
                        <View className={`${isDesktop ? 'flex-row flex-wrap -mx-2' : 'space-y-3'}`}>
                            {subscriptions.map((subscription, index) => (
                                <View
                                    key={subscription.id}
                                    className={`${isDesktop ? 'w-1/3 px-2 mb-4' : 'mb-3'}`}
                                >
                                    <SubscriptionCard
                                        subscription={subscription}
                                        onPress={() => handleEditSubscription(subscription)}
                                        onDelete={() => {
                                            if (Platform.OS === 'web') {
                                                if (confirm(`Bạn có chắc muốn xóa ${subscription.name}?`)) deleteSubscription(subscription.id);
                                            } else {
                                                Alert.alert(
                                                    'Xóa đăng ký',
                                                    `Bạn có chắc chắn muốn xóa ${subscription.name}?`,
                                                    [
                                                        { text: 'Hủy', style: 'cancel' },
                                                        { text: 'Xóa', style: 'destructive', onPress: () => deleteSubscription(subscription.id) }
                                                    ]
                                                );
                                            }
                                        }}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Add/Edit Subscription Modal */}
            <AddSubscriptionModal
                visible={showAddModal}
                onClose={handleCloseModal}
                initialData={editingSubscription}
            />
        </Animated.View>
    );
}
