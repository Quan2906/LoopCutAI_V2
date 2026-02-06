import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Pressable, Platform, Switch, useWindowDimensions, Modal, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useMembership } from '../../context/MembershipContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import PaymentMethodModal from '../../components/PaymentMethodModal';
import { MembershipScreen } from '../../components/membership';
import { authService } from '../../services/authService';
import { AccountRequest } from '../../types/api';
import { getDaysRemaining, formatDaysRemaining } from '../../utils/formatters';
import {
    User, Bell, Shield, FileText, HelpCircle, LogOut, ChevronRight, X, Settings as SettingsIcon, Moon, Crown
} from 'lucide-react-native';

export default function Profile() {
    const { user, logout, refreshUser } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { userMembership } = useMembership();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isDesktop = width >= 768;

    const [isEditing, setIsEditing] = useState(false);
    const [showMembership, setShowMembership] = useState(false);
    const [showPaymentMethod, setShowPaymentMethod] = useState(false);
    const [loading, setLoading] = useState(false);

    // Toggles for UI simulation
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);

    // Calculate membership days remaining
    const membershipDaysRemaining = userMembership ? getDaysRemaining(userMembership.endDate) : 0;

    const [form, setForm] = useState<AccountRequest>({
        email: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        password: ''
    });

    useEffect(() => {
        if (user) {
            setForm({
                email: user.email || '',
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                password: ''
            });
        }
    }, [user]);

    const handleUpdate = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            await authService.updateProfile(user.id, form);
            await refreshUser();
            const msg = 'Cập nhật hồ sơ thành công';
            Platform.OS === 'web' ? alert(msg) : Alert.alert('Thành công', msg);
            setIsEditing(false);
        } catch (e: any) {
            const msg = e.message || 'Cập nhật thất bại';
            Platform.OS === 'web' ? alert(msg) : Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            if (confirm('Bạn có chắc muốn đăng xuất?')) logout();
        } else {
            Alert.alert('Đăng xuất', 'Bạn có chắc không?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', style: 'destructive', onPress: logout }
            ]);
        }
    };

    const handleExport = () => {
        const msg = 'Tính năng xuất báo cáo sắp ra mắt!';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Sắp ra mắt', msg);
    };

    // Card with elevated styling matching Lovable design
    const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 border border-gray-100 dark:border-gray-800"
            style={{
                shadowColor: '#7c3aed',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
            }}
        >
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</Text>
            {children}
        </View>
    );

    // Menu item matching Lovable's button-style rows
    const MenuItem = ({
        icon: Icon,
        label,
        subLabel,
        onPress,
        toggleValue,
        onToggle,
        showChevron = true,
        iconBgColor = 'bg-primary/10',
        iconColor = '#7c3aed'
    }: {
        icon: any;
        label: string;
        subLabel?: string;
        onPress?: () => void;
        toggleValue?: boolean;
        onToggle?: (value: boolean) => void;
        showChevron?: boolean;
        iconBgColor?: string;
        iconColor?: string;
    }) => (
        <Pressable
            onPress={onPress}
            className="flex-row items-center justify-between p-3 rounded-xl active:bg-gray-100 dark:active:bg-gray-800"
            style={({ pressed }) => Platform.OS === 'web' ? {
                cursor: onPress ? 'pointer' : 'default',
                backgroundColor: pressed ? (isDark ? '#1f2937' : '#f3f4f6') : 'transparent',
                transition: 'background-color 0.2s'
            } : {}}
        >
            <View className="flex-row items-center flex-1 min-w-0">
                <View className={`w-10 h-10 rounded-lg ${iconBgColor} items-center justify-center mr-3`}>
                    <Icon size={20} color={iconColor} />
                </View>
                <View className="flex-1 min-w-0">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">{label}</Text>
                    {subLabel && (
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subLabel}</Text>
                    )}
                </View>
            </View>

            {onToggle !== undefined ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: '#e5e7eb', true: '#7c3aed' }}
                    thumbColor="#ffffff"
                />
            ) : (
                showChevron && <ChevronRight size={20} color="#9ca3af" />
            )}
        </Pressable>
    );

    // Wrapper: Use View mostly, handle insets manually for full bleed header
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        return (
            <View className="flex-1 bg-gray-50 dark:bg-gray-950">
                <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
                    {children}
                </Animated.View>
            </View>
        );
    };

    return (
        <Wrapper>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                contentContainerStyle={{
                    backgroundColor: isDark ? '#030712' : '#f9fafb',
                    minHeight: '100%',
                    paddingBottom: isDesktop ? 0 : Platform.OS === 'ios' ? 0 : (insets.bottom + 20)
                }}
            >

                {/* Mobile Header - Gradient Style */}
                {!isDesktop && (
                    <LinearGradient
                        colors={isDark ? ['#8B5CF6', '#10B981'] : ['#A78BFA', '#6EE7B7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-6 rounded-b-3xl"
                        style={{ paddingTop: insets.top + 20, paddingBottom: 40, paddingHorizontal: Platform.OS === 'ios' ? 32 : 24 }}
                    >
                        <View className="flex-row items-center gap-4">
                            <View
                                className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 items-center justify-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 16,
                                    elevation: 8,
                                }}
                            >
                                <User size={40} color="#7c3aed" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-white mb-1">
                                    {user?.fullName || 'User'}
                                </Text>
                                <Text className="text-white/80 text-sm">
                                    {user?.email}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                )}

                {/* Desktop Header - Bordered Style */}
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
                                    <User size={24} color="#ffffff" />
                                </LinearGradient>
                                <View>
                                    <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                        {user?.fullName || 'User'}
                                    </Text>
                                    <Text className="text-gray-500 dark:text-gray-400">
                                        {user?.email}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Content */}
                <View className={`px-6 py-6 ${isDesktop ? 'max-w-5xl mx-auto w-full' : 'max-w-lg mx-auto'} ${!isDesktop ? '-mt-4' : ''}`}>

                    {/* Grid Layout for Desktop, Stack for Mobile */}
                    <View className={`${isDesktop ? 'flex-row flex-wrap -mx-3' : ''}`}>

                        {/* Account Section */}
                        <View className={`${isDesktop ? 'w-1/2 px-3' : 'w-full'}`}>
                            <SectionCard title="Tài khoản">
                                <MenuItem
                                    icon={User}
                                    label="Thông tin cá nhân"
                                    subLabel="Quản lý thông tin hồ sơ của bạn"
                                    onPress={() => setIsEditing(true)}
                                />
                                <MenuItem
                                    icon={SettingsIcon}
                                    label="Phương thức thanh toán"
                                    subLabel="Quản lý thẻ và thanh toán"
                                    onPress={() => setShowPaymentMethod(true)}
                                />
                                <MenuItem
                                    icon={Crown}
                                    label="Gói thành viên"
                                    subLabel={userMembership ? userMembership.membership.name : 'Nâng cấp tài khoản'}
                                    onPress={() => setShowMembership(true)}
                                    iconBgColor="bg-amber-500/10"
                                    iconColor="#f59e0b"
                                />
                                {userMembership && (
                                    <View className="ml-13 -mt-1 mb-2 pl-13">
                                        <Badge variant={membershipDaysRemaining <= 7 ? 'warning' : 'success'}>
                                            {formatDaysRemaining(userMembership.endDate)}
                                        </Badge>
                                    </View>
                                )}
                            </SectionCard>
                        </View>

                        {/* Notifications Section - WITH DARK MODE TOGGLE */}
                        <View className={`${isDesktop ? 'w-1/2 px-3' : 'w-full'}`}>
                            <SectionCard title="Thông báo & Ứng dụng">
                                <MenuItem
                                    icon={Bell}
                                    label="Nhắc gia hạn"
                                    subLabel="Nhận thông báo trước khi gia hạn"
                                    toggleValue={notificationsEnabled}
                                    onToggle={setNotificationsEnabled}
                                />
                                <MenuItem
                                    icon={Bell}
                                    label="AI Insights"
                                    subLabel="Nhận câu hỏi từ AI"
                                    toggleValue={aiInsightsEnabled}
                                    onToggle={setAiInsightsEnabled}
                                />
                                <MenuItem
                                    icon={Moon}
                                    label="Chế độ tối"
                                    subLabel="Bật/tắt giao diện tối"
                                    toggleValue={isDark}
                                    onToggle={toggleTheme}
                                />
                            </SectionCard>
                        </View>

                        {/* Privacy Section */}
                        <View className={`${isDesktop ? 'w-1/2 px-3' : 'w-full'}`}>
                            <SectionCard title="Quyền riêng tư">
                                <MenuItem
                                    icon={Shield}
                                    label="Cài đặt quyền riêng tư"
                                    subLabel="Dữ liệu được mã hóa & bảo mật"
                                    iconBgColor="bg-accent/20"
                                    iconColor="#6ee7b7"
                                    onPress={() => { }}
                                />
                                <View className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 mt-2">
                                    <Text className="text-sm text-green-800 dark:text-green-400 leading-relaxed">
                                        🔒 Dữ liệu của bạn được lưu trữ cục bộ và mã hóa. LoopCutAI không bao giờ bán hoặc chia sẻ thông tin của bạn.
                                    </Text>
                                </View>
                            </SectionCard>
                        </View>

                        {/* Other Options */}
                        <View className={`${isDesktop ? 'w-1/2 px-3' : 'w-full'}`}>
                            <SectionCard title="Khác">
                                <MenuItem
                                    icon={FileText}
                                    label="Xuất báo cáo"
                                    onPress={handleExport}
                                />
                                <MenuItem
                                    icon={HelpCircle}
                                    label="Trợ giúp & Hỗ trợ"
                                    onPress={() => { }}
                                />
                            </SectionCard>
                        </View>
                    </View>

                    {/* Logout Button */}
                    <View className="max-w-md mx-auto w-full mt-2">
                        <Pressable
                            onPress={handleLogout}
                            className="flex-row items-center justify-center py-3 px-6 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 active:bg-red-100 dark:active:bg-red-900/20"
                            style={({ pressed }) => Platform.OS === 'web' ? {
                                cursor: 'pointer',
                                backgroundColor: pressed ? (isDark ? 'rgba(127, 29, 29, 0.2)' : '#fee2e2') : (isDark ? 'rgba(127, 29, 29, 0.1)' : '#fef2f2'),
                                transition: 'background-color 0.2s'
                            } : {}}
                        >
                            <LogOut size={18} color="#dc2626" />
                            <Text className="ml-2 font-semibold text-red-600 dark:text-red-500">Đăng xuất</Text>
                        </Pressable>

                        {/* Version */}
                        <Text
                            className="text-center text-sm text-gray-400 dark:text-gray-500 pt-4"
                            style={{ paddingBottom: isDesktop ? 32 : 4 }}
                        >
                            LoopCutAI v1.0.0
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            {/* Edit Profile Modal */}
            {/* Edit Profile Modal - Gesture Enabled */}
            <Modal
                visible={isEditing}
                transparent
                statusBarTranslucent
                animationType="fade"
                onRequestClose={() => setIsEditing(false)}
            >
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <ModalContent
                        onClose={() => setIsEditing(false)}
                        initialForm={form}
                        onUpdate={async (data) => {
                            setForm(data);
                            await handleUpdate();
                        }}
                        loading={loading}
                    />
                </GestureHandlerRootView>
            </Modal>

            {/* Membership Screen Modal */}
            <MembershipScreen
                visible={showMembership}
                onClose={() => setShowMembership(false)}
            />

            {/* Payment Method Modal */}
            <PaymentMethodModal
                visible={showPaymentMethod}
                onClose={() => setShowPaymentMethod(false)}
            />
        </Wrapper>
    );
}

// Separated Modal Content for Cleaner Hook/Gesture Logic

function ModalContent({ onClose, initialForm, onUpdate, loading }: { onClose: () => void, initialForm: AccountRequest, onUpdate: (form: AccountRequest) => Promise<void>, loading: boolean }) {
    // Local form state
    const [localForm, setLocalForm] = useState(initialForm);

    return (
        <View className="flex-1 bg-black/50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-end sm:justify-center items-center"
            >
                <Pressable
                    className="absolute inset-0"
                    onPress={onClose}
                />

                <View className="bg-white dark:bg-gray-900 w-full sm:w-[500px] rounded-t-3xl sm:rounded-2xl max-h-[90%] overflow-hidden shadow-xl relative">
                    {/* Header */}
                    <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 z-10">
                        <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Chỉnh sửa hồ sơ</Text>
                            <Pressable
                                onPress={onClose}
                                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                            >
                                <X size={20} color="#9ca3af" />
                            </Pressable>
                        </View>
                    </View>

                    <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                        <View className="pb-6">
                            <Input
                                label="Họ và tên"
                                value={localForm.fullName}
                                onChangeText={(t) => setLocalForm({ ...localForm, fullName: t })}
                            />
                            <Input
                                label="Số điện thoại"
                                value={localForm.phoneNumber}
                                onChangeText={(t) => setLocalForm({ ...localForm, phoneNumber: t })}
                                keyboardType="phone-pad"
                            />
                            <Input
                                label="Địa chỉ"
                                value={localForm.address}
                                onChangeText={(t) => setLocalForm({ ...localForm, address: t })}
                            />

                            <Button
                                title="Lưu thay đổi"
                                onPress={() => onUpdate(localForm)}
                                loading={loading}
                                className="mt-4"
                            />
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
