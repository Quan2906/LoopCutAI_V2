import React, { useState } from 'react';
import {
    View, Text, Modal, Pressable, ScrollView, TextInput,
    Platform, Alert, KeyboardAvoidingView, Image
} from 'react-native';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Subscription, ServiceDefinition } from '../types/subscription';
import { useSubscriptions } from '../context/SubscriptionContext';
import { useTheme } from '../context/ThemeContext';
import { subscriptionService } from '../services/subscriptionService';
import Button from './Button';

interface AddSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    initialData?: Subscription | null;
}

interface FormData {
    name: string;
    logo: string;
    price: string;
    billingCycle: 'monthly' | 'yearly';
    nextRenewal: string;
    category: string;
    type: 'online' | 'offline';
    isTrial: boolean;
}

const initialFormData: FormData = {
    name: '',
    logo: '',
    price: '',
    billingCycle: 'monthly',
    nextRenewal: '',
    category: '',
    type: 'online',
    isTrial: false,
};

// Input component with consistent styling - MOVED OUTSIDE to prevent focus loss
const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    required = false
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    required?: boolean;
}) => (
    <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            keyboardType={keyboardType}
            className="h-14 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base"
        />
    </View>
);

// Option button for billing cycle / type selection - MOVED OUTSIDE
const OptionButton = ({
    selected,
    onPress,
    icon,
    label,
    sublabel
}: {
    selected: boolean;
    onPress: () => void;
    icon: string;
    label: string;
    sublabel?: string;
}) => (
    <Pressable
        onPress={onPress}
        className={`flex-1 p-4 rounded-xl border-2 ${selected
            ? 'border-primary bg-primary/10'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            }`}
        style={Platform.OS === 'web' ? { cursor: 'pointer' } : {}}
    >
        <Text className="text-2xl mb-1">{icon}</Text>
        <Text className={`font-medium ${selected ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
            {label}
        </Text>
        {sublabel && (
            <Text className="text-xs text-gray-500 dark:text-gray-400">{sublabel}</Text>
        )}
    </Pressable>
);

// Progress indicator - MOVED OUTSIDE
const ProgressIndicator = ({ step }: { step: number }) => (
    <View className="flex-row items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
            <View key={s} className="flex-row items-center">
                <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${s < step
                        ? 'bg-primary'
                        : s === step
                            ? 'bg-primary'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                    style={s === step ? {
                        shadowColor: '#7c3aed',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 4,
                    } : {}}
                >
                    {s < step ? (
                        <Check size={20} color="#ffffff" />
                    ) : (
                        <Text className={`font-semibold ${s <= step ? 'text-white' : 'text-gray-500'}`}>
                            {s}
                        </Text>
                    )}
                </View>
                {s < 3 && (
                    <View
                        className={`w-12 h-1 ${s < step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                    />
                )}
            </View>
        ))}
    </View>
);

export default function AddSubscriptionModal({ visible, onClose, initialData }: AddSubscriptionModalProps) {
    const { addSubscription, updateSubscription } = useSubscriptions();
    const { isDark } = useTheme();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [availableServices, setAvailableServices] = useState<ServiceDefinition[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');

    // Load initial data for editing
    React.useEffect(() => {
        if (visible && initialData) {
            setFormData({
                name: initialData.name,
                logo: initialData.logo,
                price: initialData.price.toString(),
                billingCycle: initialData.billingCycle,
                nextRenewal: initialData.nextRenewal ? initialData.nextRenewal.split('T')[0] : '',
                category: initialData.category,
                type: initialData.type,
                isTrial: initialData.status === 'trial',
            });
            setSelectedId(initialData.servicePlanId || '');
        } else if (visible && !initialData) {
            setFormData(initialFormData);
            setSelectedId('');
        }
    }, [visible, initialData]);

    const showMessage = (msg: string, isError = true) => {
        if (Platform.OS === 'web') {
            alert(msg);
        } else {
            Alert.alert(isError ? 'Lỗi' : 'Thành công', msg);
        }
    };

    const handleNext = () => {
        if (step === 1 && !formData.name) {
            showMessage('Vui lòng nhập tên dịch vụ');
            return;
        }
        if (step === 2 && (!formData.price || !formData.nextRenewal)) {
            showMessage('Vui lòng điền đầy đủ thông tin giá và ngày gia hạn');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        try {
            if (initialData) {
                // Update mode
                await updateSubscription(initialData.id, {
                    name: formData.name,
                    logo: formData.logo,
                    price: parseFloat(formData.price) || 0,
                    billingCycle: formData.billingCycle,
                    nextRenewal: formData.nextRenewal,
                    status: formData.isTrial ? 'trial' : 'active',
                    category: formData.category,
                    type: formData.type,
                    servicePlanId: selectedId || undefined
                });
                showMessage(`Đã cập nhật ${formData.name}`, false);
            } else {
                // Create mode
                const finalId = selectedId || (formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now());

                const newSubscription: Subscription = {
                    id: finalId,
                    name: formData.name,
                    logo: formData.logo || '',
                    price: parseFloat(formData.price) || 0,
                    currency: '₫',
                    billingCycle: formData.billingCycle,
                    nextRenewal: formData.nextRenewal,
                    status: formData.isTrial ? 'trial' : 'active',
                    category: formData.category || 'Khác',
                    type: formData.type,
                    servicePlanId: selectedId || undefined
                };
                await addSubscription(newSubscription);
                showMessage(`Đã thêm ${formData.name} thành công`, false);
            }
            handleClose();
        } catch (e) {
            showMessage(initialData ? 'Cập nhật thất bại' : 'Thêm thất bại. Vui lòng thử lại.');
        }
    };

    const handleClose = () => {
        setStep(1);
        setFormData(initialFormData);
        setSelectedId('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end sm:justify-center items-center"
                >
                    <Pressable
                        className="absolute inset-0"
                        onPress={handleClose}
                    />

                    <View className="bg-white dark:bg-gray-900 w-full sm:w-[500px] rounded-t-3xl sm:rounded-2xl max-h-[90%] overflow-hidden shadow-xl relative">
                        {/* Header */}
                        <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 z-10">
                            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {initialData ? 'Chỉnh sửa đăng ký' : 'Thêm đăng ký mới'}
                                </Text>
                                <Pressable
                                    onPress={handleClose}
                                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                                >
                                    <X size={20} color="#9ca3af" />
                                </Pressable>
                            </View>
                            <ProgressIndicator step={step} />
                        </View>

                        {/* Content */}
                        <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <View className="pb-6">
                                    <View className="mb-6">
                                        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
                                            Thông tin cơ bản
                                        </Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                            Chọn dịch vụ có sẵn hoặc tự nhập
                                        </Text>
                                    </View>

                                    {/* Service Type Selection */}
                                    <View className="mb-4">
                                        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Loại dịch vụ
                                        </Text>
                                        <View className="flex-row gap-3">
                                            <OptionButton
                                                selected={formData.type === 'online'}
                                                onPress={() => setFormData({ ...formData, type: 'online' })}
                                                icon="🌐"
                                                label="Online"
                                                sublabel="Netflix, Spotify..."
                                            />
                                            <OptionButton
                                                selected={formData.type === 'offline'}
                                                onPress={() => setFormData({ ...formData, type: 'offline' })}
                                                icon="🏢"
                                                label="Offline"
                                                sublabel="Gym, học thêm..."
                                            />
                                        </View>
                                    </View>

                                    {/* Service Name Input with Suggestions */}
                                    <View className="mb-4 relative z-10">
                                        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Tên dịch vụ <Text className="text-red-500">*</Text>
                                        </Text>
                                        <TextInput
                                            value={formData.name}
                                            onChangeText={(text) => {
                                                setFormData({ ...formData, name: text });
                                                setSelectedId(''); // Reset ID on manual type
                                            }}
                                            onFocus={() => {
                                                // Fetch memberships if not loaded
                                                if (availableServices.length === 0) {
                                                    subscriptionService.getMemberships().then(setAvailableServices);
                                                }
                                            }}
                                            placeholder={formData.type === 'online' ? 'Ví dụ: Netflix, Spotify...' : 'Ví dụ: California Fitness...'}
                                            placeholderTextColor="#9ca3af"
                                            className="h-14 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base"
                                        />

                                        {/* Suggestions List */}
                                        {availableServices.length > 0 && formData.name.length > 0 && !selectedId && (
                                            <View className="absolute top-[85px] left-0 right-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-48 overflow-hidden">
                                                <ScrollView keyboardShouldPersistTaps="handled">
                                                    {availableServices
                                                        .filter(s => s.name.toLowerCase().includes(formData.name.toLowerCase()))
                                                        .slice(0, 5)
                                                        .map(service => (
                                                            <Pressable
                                                                key={service.id}
                                                                onPress={() => {
                                                                    setFormData({
                                                                        ...formData,
                                                                        name: service.name,
                                                                        logo: service.logoUrl || '',
                                                                        category: 'Khác'
                                                                    });
                                                                    setSelectedId(service.id);

                                                                    if (service.servicePlans && service.servicePlans.length > 0) {
                                                                        // Logic for pre-fill could go here
                                                                    }
                                                                }}
                                                                className="p-3 border-b border-gray-100 dark:border-gray-700 flex-row items-center gap-3 active:bg-gray-50 dark:active:bg-gray-700"
                                                            >
                                                                {service.logoUrl ? (
                                                                    <Image source={{ uri: service.logoUrl }} className="w-6 h-6 rounded-full" resizeMode="contain" />
                                                                ) : (
                                                                    <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center"><Text>📦</Text></View>
                                                                )}
                                                                <Text className="text-gray-900 dark:text-white">{service.name}</Text>
                                                            </Pressable>
                                                        ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Step 2: Pricing */}
                            {step === 2 && (
                                <View className="pb-6">
                                    <View className="mb-6">
                                        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
                                            Chi phí và chu kỳ
                                        </Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                            Thông tin giá cả
                                        </Text>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Giá <Text className="text-red-500">*</Text>
                                        </Text>
                                        <View className="relative">
                                            <TextInput
                                                value={formData.price}
                                                onChangeText={(text) => setFormData({ ...formData, price: text })}
                                                placeholder="260000"
                                                placeholderTextColor="#9ca3af"
                                                keyboardType="numeric"
                                                className="h-14 px-4 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base"
                                            />
                                            <Text className="absolute right-4 top-4 text-gray-500 font-medium">₫</Text>
                                        </View>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Chu kỳ thanh toán
                                        </Text>
                                        <View className="flex-row gap-3">
                                            <OptionButton
                                                selected={formData.billingCycle === 'monthly'}
                                                onPress={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                                                icon="📅"
                                                label="Hàng tháng"
                                            />
                                            <OptionButton
                                                selected={formData.billingCycle === 'yearly'}
                                                onPress={() => setFormData({ ...formData, billingCycle: 'yearly' })}
                                                icon="📆"
                                                label="Hàng năm"
                                            />
                                        </View>
                                    </View>

                                    <View className="mb-4">
                                        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            Ngày gia hạn tiếp theo <Text className="text-red-500">*</Text>
                                        </Text>
                                        <TextInput
                                            value={formData.nextRenewal}
                                            onChangeText={(text) => setFormData({ ...formData, nextRenewal: text })}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#9ca3af"
                                            className="h-14 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base"
                                        />
                                    </View>

                                    <Pressable
                                        onPress={() => setFormData({ ...formData, isTrial: !formData.isTrial })}
                                        className={`flex-row items-center p-4 rounded-xl border ${formData.isTrial
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${formData.isTrial ? 'bg-primary border-primary' : 'border-gray-400'
                                            }`}>
                                            {formData.isTrial && <Check size={14} color="#ffffff" />}
                                        </View>
                                        <Text className="text-gray-900 dark:text-white font-medium">
                                            Đây là đăng ký dùng thử
                                        </Text>
                                    </Pressable>
                                </View>
                            )}

                            {/* Step 3: Summary */}
                            {step === 3 && (
                                <View className="pb-6">
                                    <View className="mb-6">
                                        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
                                            Xác nhận thông tin
                                        </Text>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                            Kiểm tra lại thông tin đăng ký
                                        </Text>
                                    </View>

                                    <FormInput
                                        label="Danh mục"
                                        value={formData.category}
                                        onChangeText={(text) => setFormData({ ...formData, category: text })}
                                        placeholder={formData.type === 'online' ? 'Ví dụ: Giải trí, Âm nhạc...' : 'Ví dụ: Sức khỏe, Giáo dục...'}
                                    />

                                    {/* Summary Card */}
                                    <LinearGradient
                                        colors={['rgba(124, 58, 237, 0.1)', 'rgba(110, 231, 183, 0.1)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="p-5 rounded-2xl border border-primary/30"
                                    >
                                        <View className="flex-row items-center gap-2 mb-4">
                                            <Text className="text-xl">✨</Text>
                                            <Text className="font-bold text-gray-900 dark:text-white">Tóm tắt đăng ký</Text>
                                        </View>

                                        <View className="space-y-3">
                                            <View className="flex-row justify-between items-center">
                                                <Text className="text-gray-500 dark:text-gray-400">Dịch vụ:</Text>
                                                <Text className="font-semibold text-gray-900 dark:text-white">
                                                    {formData.name || '—'}
                                                </Text>
                                            </View>
                                            <View className="flex-row justify-between items-center mt-2">
                                                <Text className="text-gray-500 dark:text-gray-400">Giá:</Text>
                                                <View className="flex-row items-baseline">
                                                    <Text className="font-semibold text-primary text-lg">
                                                        {formData.price ? `${parseFloat(formData.price).toLocaleString()}₫` : '—'}
                                                    </Text>
                                                    <Text className="text-xs text-gray-500 ml-1">
                                                        /{formData.billingCycle === 'monthly' ? 'tháng' : 'năm'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View className="flex-row justify-between items-center mt-2">
                                                <Text className="text-gray-500 dark:text-gray-400">Gia hạn:</Text>
                                                <Text className="font-semibold text-gray-900 dark:text-white">
                                                    {formData.nextRenewal || '—'}
                                                </Text>
                                            </View>
                                            {formData.isTrial && (
                                                <View className="mt-3 pt-3 border-t border-primary/20">
                                                    <View className="bg-primary/20 px-3 py-1.5 rounded-full self-start">
                                                        <Text className="text-primary font-medium text-sm">🎁 Đăng ký dùng thử</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </LinearGradient>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer buttons */}
                        <View className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <View className="flex-row gap-3">
                                {step > 1 && (
                                    <Button
                                        title="Quay lại"
                                        variant="outline"
                                        onPress={handleBack}
                                        className="flex-1"
                                    />
                                )}
                                {step < 3 ? (
                                    <Button
                                        title="Tiếp tục"
                                        onPress={handleNext}
                                        className="flex-1"
                                    />
                                ) : (
                                    <Button
                                        title={initialData ? 'Cập nhật' : 'Hoàn tất'}
                                        onPress={handleSubmit}
                                        className="flex-1"
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
