import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Alert, Modal, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { X, CreditCard, Trash2, Plus, Info } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

interface PaymentMethod {
    id: string;
    last4: string;
    cardType: string; // Visa, Mastercard, etc
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
    isDefault: boolean;
}

interface PaymentMethodModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function PaymentMethodModal({ visible, onClose }: Readonly<PaymentMethodModalProps>) {
    const { isDark } = useTheme();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    // Mock payment methods - in real app, fetch from API
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        {
            id: '1',
            last4: '4242',
            cardType: 'Visa',
            expiryMonth: 12,
            expiryYear: 2025,
            holderName: 'John Doe',
            isDefault: true,
        },
        {
            id: '2',
            last4: '5555',
            cardType: 'Mastercard',
            expiryMonth: 6,
            expiryYear: 2026,
            holderName: 'John Doe',
            isDefault: false,
        },
    ]);

    const handleDeleteCard = (id: string) => {
        if (Platform.OS === 'web') {
            if (confirm('Bạn có chắc muốn xóa phương thức thanh toán này?')) {
                setPaymentMethods(paymentMethods.filter(m => m.id !== id));
                const msg = 'Xóa phương thức thanh toán thành công';
                alert(msg);
            }
        } else {
            Alert.alert('Xóa phương thức thanh toán', 'Bạn có chắc không?', [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => {
                        setPaymentMethods(paymentMethods.filter(m => m.id !== id));
                        Alert.alert('Thành công', 'Phương thức thanh toán đã được xóa');
                    }
                }
            ]);
        }
    };

    const handleAddCard = () => {
        const msg = 'Tính năng thêm phương thức thanh toán sắp ra mắt!';
        if (Platform.OS === 'web') {
            alert(msg);
        } else {
            Alert.alert('Sắp ra mắt', msg);
        }
    };

    const handleSetDefault = (id: string) => {
        setPaymentMethods(paymentMethods.map(m => ({
            ...m,
            isDefault: m.id === id
        })));
        const msg = 'Đã đặt làm phương thức thanh toán mặc định';
        if (Platform.OS === 'web') {
            alert(msg);
        } else {
            Alert.alert('Thành công', msg);
        }
    };

    const PaymentCard = ({ method }: { method: PaymentMethod }) => (
        <Animated.View entering={FadeIn.duration(300)} className="mb-4">
            <Pressable
                onPress={() => handleSetDefault(method.id)}
                className={`rounded-xl p-4 border-2 overflow-hidden ${
                    method.isDefault
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : `border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`
                }`}
                style={({ pressed }) => Platform.OS === 'web' ? {
                    cursor: 'pointer',
                    backgroundColor: pressed ? (isDark ? '#374151' : '#f3f4f6') : (method.isDefault ? (isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)') : (isDark ? '#1f2937' : '#f9fafb')),
                    transition: 'background-color 0.2s'
                } : {}}
            >
                <View className="flex-row items-start justify-between">
                    <View className="flex-row items-start flex-1">
                        <View className={`${method.isDefault ? 'bg-primary/20' : 'bg-gray-200 dark:bg-gray-700'} rounded-lg p-3 mr-3`}>
                            <CreditCard
                                size={24}
                                color={method.isDefault ? '#7c3aed' : (isDark ? '#9ca3af' : '#6b7280')}
                            />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                                <Text className="font-semibold text-gray-900 dark:text-white">
                                    {method.cardType} ••••{method.last4}
                                </Text>
                                {method.isDefault && (
                                    <View className="bg-primary px-2 py-1 rounded">
                                        <Text className="text-white text-xs font-semibold">Mặc định</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {method.holderName}
                            </Text>
                            <Text className="text-xs text-gray-400 dark:text-gray-500">
                                Hết hạn: {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={(e) => {
                            e.stopPropagation?.();
                            handleDeleteCard(method.id);
                        }}
                        className="p-2 rounded-lg active:bg-red-100 dark:active:bg-red-900/20"
                    >
                        <Trash2 size={20} color="#ef4444" />
                    </Pressable>
                </View>
            </Pressable>
        </Animated.View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            statusBarTranslucent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1" style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}>
                <View className="flex-1 justify-center items-center px-4">
                    <View
                        className={`${isDesktop ? 'w-full max-w-md' : 'w-full max-h-[85%]'} rounded-2xl overflow-hidden shadow-2xl ${
                            isDark ? 'bg-gray-900' : 'bg-white'
                        }`}
                    >
                        {/* Header */}
                        <LinearGradient
                            colors={isDark ? ['#7c3aed', '#6d28d9'] : ['#a78bfa', '#8b5cf6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="px-6 py-6 flex-row items-center justify-between"
                        >
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-white">Phương thức thanh toán</Text>
                            </View>
                            <Pressable
                                onPress={onClose}
                                className="p-2 rounded-full active:bg-white/20"
                            >
                                <X size={24} color="#ffffff" />
                            </Pressable>
                        </LinearGradient>

                        {/* Content */}
                        <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
                            {/* Info Box */}
                            <View className="flex-row gap-3 mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30">
                                <Info size={20} color="#3b82f6" className="flex-shrink-0 mt-0.5" />
                                <Text className="text-blue-900 dark:text-blue-300 text-sm flex-1 leading-relaxed">
                                    Chỉ các phương thức mặc định sẽ được sử dụng để thanh toán gói thành viên.
                                </Text>
                            </View>

                            {/* Payment Methods List */}
                            {paymentMethods.length > 0 ? (
                                <>
                                    <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                                        Các phương thức của bạn:
                                    </Text>
                                    {paymentMethods.map(method => (
                                        <PaymentCard key={method.id} method={method} />
                                    ))}
                                </>
                            ) : (
                                <View className="items-center justify-center py-12">
                                    <CreditCard size={48} color={isDark ? '#6b7280' : '#d1d5db'} className="mb-3" />
                                    <Text className="text-gray-500 dark:text-gray-400 text-center">
                                        Chưa có phương thức thanh toán nào
                                    </Text>
                                </View>
                            )}

                            {/* Add Card Button */}
                            <View className="mt-6">
                                <Pressable
                                    onPress={handleAddCard}
                                    className="flex-row items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-primary active:bg-primary/10"
                                    style={({ pressed }) => Platform.OS === 'web' ? {
                                        cursor: 'pointer',
                                        backgroundColor: pressed ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                                        transition: 'background-color 0.2s'
                                    } : {}}
                                >
                                    <Plus size={20} color="#7c3aed" />
                                    <Text className="font-semibold text-primary">Thêm phương thức mới</Text>
                                </Pressable>
                            </View>

                            {/* Close Button */}
                            <View className="mt-6">
                                <Button
                                    title="Đóng"
                                    onPress={onClose}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
