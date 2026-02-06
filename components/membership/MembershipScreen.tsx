import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Platform,
    Alert,
    Modal,
    ActivityIndicator,
    useWindowDimensions,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import { X, Crown, Clock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { useMembership } from '../../context/MembershipContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { membershipService } from '../../services/membershipService';
import { Membership, PaymentStatus } from '../../types/api';
import { formatDate, getDaysRemaining, formatDaysRemaining, isExpiringSoon } from '../../utils/formatters';
import MembershipCard from './MembershipCard';
import Badge from '../Badge';

interface MembershipScreenProps {
    visible: boolean;
    onClose: () => void;
}

export default function MembershipScreen({ visible, onClose }: Readonly<MembershipScreenProps>) {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isDesktop = width >= 768;

    const {
        memberships,
        userMembership,
        isLoadingMemberships,
        isLoadingUserMembership,
        membershipError,
        refreshAll,
        fetchUserMembership,
    } = useMembership();

    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [paymentResult, setPaymentResult] = useState<{
        status: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshAll();
        setRefreshing(false);
    }, [refreshAll]);

    // Auto-close modal after successful payment
    useEffect(() => {
        if (paymentResult?.status === 'success') {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [paymentResult?.status, onClose]);

    const handlePurchase = async (membership: Membership) => {
        if (!user?.id) {
            const msg = 'Vui lòng đăng nhập để tiếp tục';
            Platform.OS === 'web' ? alert(msg) : Alert.alert('Lỗi', msg);
            return;
        }

        setPurchasingId(membership.id);
        setPaymentResult(null);

        try {
            // Create payment link
            const response = await membershipService.createPaymentLink({
                userId: user.id,
                membershipId: membership.id,
            });

            if (response.checkoutUrl) {
                // Show info message that payment window is opening
                setPaymentResult({
                    status: 'info',
                    message: 'Đang mở trang thanh toán PayOS... Vui lòng hoàn tất thanh toán trong cửa sổ mới.',
                });

                // Open PayOS checkout in browser
                if (Platform.OS === 'web') {
                    // Web: Open in new window
                    const paymentWindow = window.open(response.checkoutUrl, '_blank');

                    // Start polling for payment status (silently)
                    if (paymentWindow) {
                        pollPaymentStatus(response.orderCode.toString());
                    }
                } else {
                    // Mobile: Use WebBrowser
                    const result = await WebBrowser.openBrowserAsync(response.checkoutUrl, {
                        dismissButtonStyle: 'close',
                        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                    });

                    // After browser closes, check payment status
                    if (result.type === 'cancel' || result.type === 'dismiss') {
                        await checkPaymentStatus(response.orderCode.toString());
                    }
                }
            } else {
                // No checkout URL returned
                setPaymentResult({
                    status: 'error',
                    message: 'Không thể tạo liên kết thanh toán. Vui lòng thử lại.',
                });
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            setPaymentResult({
                status: 'error',
                message: error.message || 'Không thể tạo liên kết thanh toán',
            });
        } finally {
            setPurchasingId(null);
        }
    };

    const pollPaymentStatus = async (orderCode: string) => {
        // Poll every 3 seconds for up to 5 minutes
        const maxAttempts = 100;
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await membershipService.getPaymentInfo(orderCode);
                const status = response.data?.status;

                if (status === PaymentStatus.Completed) {
                    setPaymentResult({
                        status: 'success',
                        message: 'Thanh toán thành công! Gói thành viên đã được kích hoạt.',
                    });
                    await fetchUserMembership();
                    return;
                } else if (status === PaymentStatus.Failed) {
                    setPaymentResult({
                        status: 'error',
                        message: 'Thanh toán thất bại. Vui lòng thử lại.',
                    });
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 3000);
                }
            } catch (error) {
                console.error('Poll error:', error);
            }
        };

        // Start polling after a short delay
        setTimeout(poll, 2000);
    };

    const checkPaymentStatus = async (orderCode: string) => {
        try {
            const response = await membershipService.getPaymentInfo(orderCode);
            const status = response.data?.status;

            if (status === PaymentStatus.Completed) {
                setPaymentResult({
                    status: 'success',
                    message: 'Thanh toán thành công! Gói thành viên đã được kích hoạt.',
                });
                await fetchUserMembership();
            } else if (status === PaymentStatus.Failed) {
                setPaymentResult({
                    status: 'error',
                    message: 'Thanh toán thất bại. Vui lòng thử lại.',
                });
            } else if (status === PaymentStatus.Pending) {
                setPaymentResult({
                    status: 'info',
                    message: 'Thanh toán đang được xử lý. Vui lòng đợi trong giây lát.',
                });
                // Continue polling
                pollPaymentStatus(orderCode);
            }
        } catch (error: any) {
            console.error('Check payment error:', error);
        }
    };

    const isLoading = isLoadingMemberships || isLoadingUserMembership;
    const daysRemaining = userMembership ? getDaysRemaining(userMembership.endDate) : 0;
    const expiringSoon = userMembership ? isExpiringSoon(userMembership.endDate) : false;

    return (
        <Modal
            visible={visible}
            transparent
            statusBarTranslucent
            animationType={isDesktop ? 'fade' : 'slide'}
            onRequestClose={onClose}
        >
            <View className={`flex-1 ${isDesktop ? 'bg-black/50 justify-center items-center' : 'bg-gray-50 dark:bg-gray-950'}`}>
                {isDesktop && (
                    <Pressable
                        className="absolute inset-0"
                        onPress={onClose}
                    />
                )}

                <View className={`${isDesktop ? 'w-[850px] max-w-[95%] max-h-[90%] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl' : 'flex-1'}`}>
                    {/* Header */}
                    <LinearGradient
                        colors={isDark ? ['#8B5CF6', '#10B981'] : ['#A78BFA', '#6EE7B7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            paddingTop: isDesktop ? 20 : insets.top + 12,
                            paddingBottom: 20,
                            paddingHorizontal: 20,
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
                                    <Crown size={22} color="#fff" />
                                </View>
                                <View>
                                    <Text className="text-xl font-bold text-white">Gói thành viên</Text>
                                    <Text className="text-white/80 text-sm">Nâng cấp tài khoản của bạn</Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={onClose}
                                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                                style={({ pressed }) => Platform.OS === 'web' ? {
                                    cursor: 'pointer',
                                    opacity: pressed ? 0.7 : 1,
                                } : {}}
                            >
                                <X size={22} color="#fff" />
                            </Pressable>
                        </View>
                    </LinearGradient>

                    <ScrollView
                        className="flex-1 bg-gray-50 dark:bg-gray-950"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: isDesktop ? 32 : 20,
                            paddingTop: 20,
                            paddingBottom: isDesktop ? 40 : insets.bottom + 40,
                            width: '100%',
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#7c3aed"
                            />
                        }
                    >
                        {/* Current Membership Status */}
                        {userMembership && (
                            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                                <View
                                    className={`bg-white dark:bg-gray-900 rounded-2xl p-5 mb-6 border ${expiringSoon
                                        ? 'border-amber-300 dark:border-amber-700'
                                        : 'border-green-200 dark:border-green-800'
                                        }`}
                                    style={{
                                        shadowColor: expiringSoon ? '#f59e0b' : '#10b981',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 12,
                                        elevation: 4,
                                    }}
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className="flex-row items-center">
                                            <View className={`w-10 h-10 rounded-xl items-center justify-center ${expiringSoon ? 'bg-amber-500/10' : 'bg-green-500/10'
                                                }`}>
                                                <Crown size={20} color={expiringSoon ? '#f59e0b' : '#10b981'} />
                                            </View>
                                            <View className="ml-3">
                                                <Text className="text-base font-bold text-gray-900 dark:text-white">
                                                    {userMembership.membership.name}
                                                </Text>
                                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                    Gói hiện tại
                                                </Text>
                                            </View>
                                        </View>
                                        <Badge variant={expiringSoon ? 'warning' : 'success'}>
                                            {expiringSoon ? 'Sắp hết hạn' : 'Đang hoạt động'}
                                        </Badge>
                                    </View>

                                    <View className="flex-row items-center mt-2">
                                        <Clock size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                                        <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                            {formatDaysRemaining(userMembership.endDate)} • Hết hạn {formatDate(userMembership.endDate)}
                                        </Text>
                                    </View>

                                    {/* Progress bar for remaining time */}
                                    <View className="mt-4">
                                        <View className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <View
                                                className={`h-full ${expiringSoon ? 'bg-amber-500' : 'bg-green-500'}`}
                                                style={{
                                                    width: `${Math.min(100, (daysRemaining / (userMembership.membership.durationInMonths * 30)) * 100)}%`,
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        )}

                        {/* Payment Result Message */}
                        {paymentResult && (
                            <Animated.View entering={FadeIn.duration(300)}>
                                <View
                                    className={`flex-row items-center p-4 rounded-xl mb-6 ${paymentResult.status === 'success'
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                        : paymentResult.status === 'info'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                        }`}
                                >
                                    {paymentResult.status === 'success' ? (
                                        <CheckCircle2 size={20} color="#10b981" />
                                    ) : paymentResult.status === 'info' ? (
                                        <Clock size={20} color="#3b82f6" />
                                    ) : (
                                        <AlertCircle size={20} color="#ef4444" />
                                    )}
                                    <Text
                                        className={`flex-1 ml-3 text-sm ${paymentResult.status === 'success'
                                            ? 'text-green-700 dark:text-green-400'
                                            : paymentResult.status === 'info'
                                                ? 'text-blue-700 dark:text-blue-400'
                                                : 'text-red-700 dark:text-red-400'
                                            }`}
                                    >
                                        {paymentResult.message}
                                    </Text>
                                    <Pressable
                                        onPress={() => setPaymentResult(null)}
                                        className="p-1"
                                    >
                                        <X size={16} color={
                                            paymentResult.status === 'success' ? '#10b981'
                                                : paymentResult.status === 'info' ? '#3b82f6'
                                                    : '#ef4444'
                                        } />
                                    </Pressable>
                                </View>
                            </Animated.View>
                        )}

                        {/* Section Title */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                {userMembership ? 'Nâng cấp gói' : 'Chọn gói thành viên'}
                            </Text>
                            {isLoading && (
                                <ActivityIndicator size="small" color="#7c3aed" />
                            )}
                        </View>

                        {/* Error State */}
                        {membershipError && (
                            <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-4 flex-row items-center">
                                <AlertCircle size={20} color="#ef4444" />
                                <Text className="text-red-600 dark:text-red-400 ml-2 flex-1">
                                    {membershipError}
                                </Text>
                                <Pressable onPress={onRefresh} className="p-2">
                                    <RefreshCw size={18} color="#ef4444" />
                                </Pressable>
                            </View>
                        )}

                        {/* Loading State */}
                        {isLoading && memberships.length === 0 && (
                            <View className="py-20 items-center">
                                <ActivityIndicator size="large" color="#7c3aed" />
                                <Text className="text-gray-500 dark:text-gray-400 mt-4">
                                    Đang tải gói thành viên...
                                </Text>
                            </View>
                        )}

                        {/* Empty State */}
                        {!isLoading && memberships.length === 0 && !membershipError && (
                            <View className="py-20 items-center">
                                <Crown size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
                                <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                                    Chưa có gói thành viên nào.{'\n'}Vui lòng thử lại sau.
                                </Text>
                                <Pressable
                                    onPress={onRefresh}
                                    className="mt-4 px-6 py-2 bg-primary rounded-lg"
                                >
                                    <Text className="text-white font-medium">Tải lại</Text>
                                </Pressable>
                            </View>
                        )}

                        {/* Membership Cards */}
                        <View className={isDesktop ? 'flex-row flex-wrap justify-center gap-6' : ''}>
                            {[...memberships]
                                .sort((a, b) => a.price - b.price)
                                .map((membership, index) => {
                                    const isCurrentPlan = userMembership?.membership.membershipId === membership.id;
                                    // Mark the second membership as popular (or the one with 12 months)
                                    const isPopular = membership.durationInMonths === 12 ||
                                        (index === 1 && memberships.length > 1);

                                    return (
                                        <Animated.View
                                            key={membership.id}
                                            entering={FadeInDown.delay(150 * index).duration(400)}
                                            className={isDesktop ? 'w-[45%] min-w-[340px]' : 'w-full'}
                                        >
                                            <MembershipCard
                                                membership={membership}
                                                isCurrentPlan={isCurrentPlan}
                                                isPopular={isPopular && !isCurrentPlan}
                                                onPurchase={handlePurchase}
                                                loading={purchasingId === membership.id}
                                                disabled={!!purchasingId}
                                            />
                                        </Animated.View>
                                    );
                                })}
                        </View>

                        {/* Info Text */}
                        <View className="mt-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center leading-5">
                                💳 Thanh toán an toàn qua PayOS{'\n'}
                                🔒 Gói thành viên sẽ được kích hoạt ngay sau khi thanh toán thành công
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
