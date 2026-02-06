import { Text, View, ScrollView, Pressable, Platform, useWindowDimensions, Image, Alert } from 'react-native';
import { Bell, Calendar, Clock, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSubscriptions } from '../../context/SubscriptionContext';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Badge, { getUrgencyBadgeConfig } from '../../components/Badge';
import Button from '../../components/Button';

export default function Reminders() {
    const { upcomingRenewals, deleteSubscription } = useSubscriptions();
    const { isDark } = useTheme();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isDesktop = width >= 768;

    // Calculate urgency counts
    const urgentCount = upcomingRenewals.filter(s => s.daysUntil <= 2).length;
    const thisWeekCount = upcomingRenewals.filter(s => s.daysUntil > 2 && s.daysUntil <= 7).length;
    const laterCount = upcomingRenewals.filter(s => s.daysUntil > 7).length;

    const showMessage = (msg: string) => {
        if (Platform.OS === 'web') {
            alert(msg);
        } else {
            Alert.alert('Thành công', msg);
        }
    };

    const handleRemindLater = (name: string) => {
        showMessage(`Sẽ nhắc bạn về ${name} sau`);
    };

    const handleCancel = (id: string, name: string) => {
        if (Platform.OS === 'web') {
            if (confirm(`Bạn có chắc muốn hủy đăng ký ${name}?`)) {
                deleteSubscription(id);
                showMessage(`Đã hủy đăng ký ${name}`);
            }
        } else {
            Alert.alert(
                'Xác nhận hủy',
                `Bạn có chắc muốn hủy đăng ký ${name}?`,
                [
                    { text: 'Không', style: 'cancel' },
                    {
                        text: 'Hủy đăng ký',
                        style: 'destructive',
                        onPress: () => {
                            deleteSubscription(id);
                            showMessage(`Đã hủy đăng ký ${name}`);
                        }
                    }
                ]
            );
        }
    };

    // Get urgency icon based on days
    const getUrgencyIcon = (daysUntil: number) => {
        if (daysUntil <= 2) return <AlertCircle size={20} color="#dc2626" />;
        if (daysUntil <= 7) return <Clock size={20} color="#eab308" />;
        return <Calendar size={20} color="#9ca3af" />;
    };

    // Summary stat component
    const SummaryStat = ({
        count,
        label,
        bgColor
    }: {
        count: number;
        label: string;
        bgColor: string;
    }) => (
        <View className={`flex-1 p-3 rounded-xl ${bgColor}`}>
            <Text className={`text-2xl font-bold text-center ${label === 'Khẩn cấp' ? 'text-red-600 dark:text-red-400' :
                label === 'Tuần này' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-gray-900 dark:text-white'
                }`}>
                {count}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">{label}</Text>
        </View>
    );

    // Renewal item component
    const RenewalItem = ({
        subscription,
        index
    }: {
        subscription: typeof upcomingRenewals[0];
        index: number;
    }) => {
        const urgencyConfig = getUrgencyBadgeConfig(subscription.daysUntil);

        return (
            <View
                className="rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
                style={{
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    shadowColor: isDark ? '#000' : '#7c3aed',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                }}
            >
                <View className="flex-row gap-3">
                    {/* Logo */}
                    <View className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center">
                        {subscription.logo ? (
                            <Image
                                source={{ uri: subscription.logo }}
                                className="w-7 h-7"
                                resizeMode="contain"
                            />
                        ) : (
                            <Text className="text-xl">📦</Text>
                        )}
                    </View>

                    {/* Content */}
                    <View className="flex-1 min-w-0">
                        {/* Header */}
                        <View className="flex-row items-start justify-between gap-2 mb-1.5">
                            <View className="flex-1">
                                <Text className="font-semibold text-sm text-gray-900 dark:text-white" numberOfLines={1}>
                                    {subscription.name}
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(subscription.nextRenewal).toLocaleDateString('vi-VN')}
                                </Text>
                            </View>
                            <Badge variant={urgencyConfig.variant}>
                                {urgencyConfig.label}
                            </Badge>
                        </View>

                        {/* Price */}
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-base font-bold text-gray-900 dark:text-white">
                                {subscription.currency}{subscription.price.toLocaleString()}
                            </Text>
                        </View>

                        {/* Trial warning */}
                        {subscription.status === 'trial' && (
                            <View className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 mb-2">
                                <Text className="text-xs text-yellow-700 dark:text-yellow-400">
                                    ⚠️ Dùng thử kết thúc trong {subscription.daysUntil} ngày
                                </Text>
                            </View>
                        )}

                        {/* Action buttons */}
                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={() => handleRemindLater(subscription.name)}
                                className="flex-1 h-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700"
                                style={({ pressed }) => Platform.OS === 'web' ? {
                                    cursor: 'pointer',
                                    opacity: pressed ? 0.8 : 1,
                                } : {}}
                            >
                                <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Nhắc sau
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleCancel(subscription.id, subscription.name)}
                                className="flex-1 h-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20"
                                style={({ pressed }) => Platform.OS === 'web' ? {
                                    cursor: 'pointer',
                                    opacity: pressed ? 0.8 : 1,
                                } : {}}
                            >
                                <Text className="text-xs font-medium text-red-600 dark:text-red-400">
                                    Hủy
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

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
                        <View className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 items-center justify-center">
                            <Bell size={20} color="#7c3aed" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-900 dark:text-white text-base">Nhắc nhở</Text>
                            <Text className="text-xs text-gray-500">Gia hạn sắp tới</Text>
                        </View>
                    </View>
                )}

                {/* Desktop Header */}
                {isDesktop && (
                    <View className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                        <View className="px-8 py-6">
                            <View className="flex-row items-center gap-4">
                                <LinearGradient
                                    colors={['#7c3aed', '#6d28d9']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="w-12 h-12 rounded-xl items-center justify-center"
                                    style={{
                                        shadowColor: '#7c3aed',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 4,
                                    }}
                                >
                                    <Bell size={24} color="#ffffff" />
                                </LinearGradient>
                                <View>
                                    <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Nhắc nhở</Text>
                                    <Text className="text-gray-500 dark:text-gray-400">Gia hạn sắp tới</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Content */}
                <View className={`px-6 py-6 ${isDesktop ? 'max-w-5xl mx-auto w-full' : 'max-w-lg mx-auto w-full'} ${!isDesktop ? '-mt-3' : ''}`}>

                    {/* Summary Card */}
                    <View
                        className="rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-4"
                        style={{
                            backgroundColor: isDark ? '#111827' : '#ffffff',
                            shadowColor: isDark ? '#000' : '#7c3aed',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isDark ? 0.3 : 0.08,
                            shadowRadius: 12,
                            elevation: 4,
                        }}
                    >
                        <View className="flex-row gap-3">
                            <SummaryStat
                                count={urgentCount}
                                label="Khẩn cấp"
                                bgColor="bg-red-50 dark:bg-red-900/10"
                            />
                            <SummaryStat
                                count={thisWeekCount}
                                label="Tuần này"
                                bgColor="bg-yellow-50 dark:bg-yellow-900/10"
                            />
                            <SummaryStat
                                count={laterCount}
                                label="Sau này"
                                bgColor="bg-gray-50 dark:bg-gray-800"
                            />
                        </View>
                    </View>

                    {/* Reminders List */}
                    {upcomingRenewals.length === 0 ? (
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
                            <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
                                <Bell size={32} color="#7c3aed" />
                            </View>
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                                Chưa có nhắc nhở
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 leading-relaxed">
                                Thêm các đăng ký để nhận thông báo trước khi hết hạn. Bạn sẽ không bỏ lỡ bất kỳ khoản gia hạn nào.
                            </Text>
                        </View>
                    ) : (
                        <View className={`${isDesktop ? 'flex-row flex-wrap -mx-2' : ''}`}>
                            {upcomingRenewals.map((subscription, index) => (
                                <View
                                    key={subscription.id}
                                    className={`${isDesktop ? 'w-1/2 px-2 mb-4' : 'mb-3'}`}
                                >
                                    <RenewalItem subscription={subscription} index={index} />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </Animated.View>
    );
}
