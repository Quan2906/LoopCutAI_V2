import { useState } from 'react';
import { View, Text, Alert, Platform, ScrollView, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { RegisterRequest } from '../../types/api';

// Conditional imports for native only
const isWeb = Platform.OS === 'web';
const isAndroid = Platform.OS === 'android';
let KeyboardProvider: any;
let KeyboardAwareScrollView: any;

if (isAndroid) {
    const keyboardController = require('react-native-keyboard-controller');
    KeyboardProvider = keyboardController.KeyboardProvider;
    KeyboardAwareScrollView = keyboardController.KeyboardAwareScrollView;
} else {
    // Web/iOS fallbacks
    KeyboardProvider = ({ children }: { children: React.ReactNode }) => children;
    KeyboardAwareScrollView = ScrollView;
}

export default function Register() {
    const [form, setForm] = useState<RegisterRequest>({
        email: '',
        password: '',
        fullName: '',
        address: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();

    const handleRegister = async () => {
        try {
            setError('');
            setLoading(true);
            if (!form.email || !form.password || !form.fullName || !form.address || !form.phoneNumber) {
                setError('Vui lòng điền đầy đủ thông tin');
                setLoading(false);
                return;
            }

            await authService.register(form);
            const msg = 'Tạo tài khoản thành công! Vui lòng đăng nhập.';
            if (typeof window !== 'undefined') {
                alert(msg);
            } else {
                Alert.alert('Thành công', msg);
            }
            router.replace('/(auth)/login');
        } catch (e: any) {
            const msg = e.response?.data?.message || e.message || 'Đăng ký thất bại';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const isAndroid = Platform.OS === 'android';
    const isIOS = Platform.OS === 'ios';
    const isWeb = Platform.OS === 'web';

    const content = (
        <View className="w-full max-w-sm self-center">
            {/* Header - Always show subtitle comfortably now that space is managed better */}
            <View className={isAndroid ? "mb-2" : "mb-8"}>
                <Text className={`font-bold text-primary mb-1 ${isAndroid ? 'text-2xl' : 'text-4xl'}`}>Tạo tài khoản</Text>
                <Text className={`text-gray-600 dark:text-gray-400 ${isAndroid ? 'text-xs' : 'text-base'}`}>Tham gia LoopCutAI ngay hôm nay</Text>
            </View>

            {/* Form */}
            <View>
                <Input
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChangeText={(text) => setForm({ ...form, fullName: text })}
                />
                <Input
                    label="Email"
                    placeholder="you@example.com"
                    value={form.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(text) => setForm({ ...form, email: text })}
                />
                <Input
                    label="Số điện thoại"
                    placeholder="+84123456789"
                    value={form.phoneNumber}
                    keyboardType="phone-pad"
                    onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
                />
                <Input
                    label="Địa chỉ"
                    placeholder="123 Đường ABC"
                    value={form.address}
                    onChangeText={(text) => setForm({ ...form, address: text })}
                />
                <Input
                    label="Mật khẩu"
                    placeholder="••••••••"
                    secureTextEntry
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                />

                {error ? <Text className="text-destructive mb-1 text-center text-xs">{error}</Text> : null}

                <Button
                    title="Đăng ký"
                    onPress={handleRegister}
                    loading={loading}
                    className={isAndroid ? "" : "mt-2"}
                />
            </View>

            {/* Footer */}
            <View className={`flex-row justify-center ${isAndroid ? 'mt-3' : 'mt-8'}`}>
                <Text className={`text-gray-600 dark:text-gray-400 ${isAndroid ? 'text-sm' : ''}`}>Đã có tài khoản? </Text>
                <Link href="/(auth)/login" asChild>
                    <Text className={`text-primary font-bold ${isAndroid ? 'text-sm' : ''}`}>Đăng nhập</Text>
                </Link>
            </View>
        </View>
    );

    // Android: Use KeyboardAwareScrollView for automatic scroll to focused input
    if (isAndroid) {
        return (
            <KeyboardProvider>
                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingHorizontal: 20,
                        paddingTop: Math.max(insets.top, 16),
                        paddingBottom: Math.max(insets.bottom, 20),
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bottomOffset={50}
                >
                    <View className="flex-1 justify-center bg-gray-50 dark:bg-gray-950">
                        {content}
                    </View>
                </KeyboardAwareScrollView>
            </KeyboardProvider>
        );
    }

    // iOS: use KeyboardAvoidingView and ScrollView with safe area
    if (isIOS) {
        return (
            <KeyboardAvoidingView
                className="flex-1 bg-gray-50 dark:bg-gray-950"
                behavior="padding"
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingHorizontal: 24,
                        paddingTop: Math.max(insets.top, 16) + 16,
                        paddingBottom: Math.max(insets.bottom, 16) + 16,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {content}
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    // Web: keep original layout
    return (
        <View className="flex-1 justify-center bg-gray-50 dark:bg-gray-950 p-6">
            {content}
        </View>
    );
}
