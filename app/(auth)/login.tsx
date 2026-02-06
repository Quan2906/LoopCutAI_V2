import { useState } from 'react';
import { View, Text, Alert, Platform, ScrollView, KeyboardAvoidingView as RNKeyboardAvoidingView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import { LoginRequest } from '../../types/api';

// Conditional imports for native only
const isAndroid = Platform.OS === 'android';
let KeyboardProvider: any;
let KeyboardAvoidingView: any;

if (isAndroid) {
    const keyboardController = require('react-native-keyboard-controller');
    KeyboardProvider = keyboardController.KeyboardProvider;
    KeyboardAvoidingView = keyboardController.KeyboardAvoidingView;
} else {
    // Web/iOS fallbacks
    KeyboardProvider = ({ children }: { children: React.ReactNode }) => children;
    KeyboardAvoidingView = RNKeyboardAvoidingView;
}

export default function Login() {
    const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleLogin = async () => {
        try {
            setError('');
            if (!form.email || !form.password) {
                setError('Vui lòng điền đầy đủ thông tin');
                return;
            }
            await login(form);
            // Redirect handled by AuthContext/RootLayout
        } catch (e: any) {
            const msg = e.response?.data?.Message || e.message || 'Đăng nhập thất bại';
            setError(msg);
        }
    };

    const isAndroid = Platform.OS === 'android';
    const isIOS = Platform.OS === 'ios';
    const isWeb = Platform.OS === 'web';

    const content = (
        <View className="w-full max-w-sm self-center">
            {/* Header */}
            <View className={isAndroid ? "mb-4" : "mb-8"}>
                <Text className={`font-bold text-primary mb-2 ${isAndroid ? 'text-3xl' : 'text-4xl'}`}>Chào mừng trở lại</Text>
                <Text className={`text-gray-600 dark:text-gray-400 ${isAndroid ? 'text-sm' : 'text-base'}`}>Đăng nhập để tiếp tục với LoopCutAI</Text>
            </View>

            {/* Form */}
            <View>
                <Input
                    label="Email"
                    placeholder="you@example.com"
                    value={form.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(text) => setForm({ ...form, email: text })}
                />
                <Input
                    label="Mật khẩu"
                    placeholder="••••••••"
                    secureTextEntry
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                />

                {error ? <Text className="text-destructive mb-4 text-center">{error}</Text> : null}

                <Button
                    title="Đăng nhập"
                    onPress={handleLogin}
                    loading={isLoading}
                    className="mt-2"
                />

                <View className={`flex-row items-center ${isAndroid ? 'my-2' : 'my-4'}`}>
                    <View className="flex-1 h-[1px] bg-gray-300 dark:bg-gray-700" />
                    <Text className="mx-4 text-gray-500 text-xs">HOẶC</Text>
                    <View className="flex-1 h-[1px] bg-gray-300 dark:bg-gray-700" />
                </View>

                <GoogleLoginButton />
            </View>

            {/* Footer - Added more spacing */}
            <View className={`flex-row justify-center ${isAndroid ? 'mt-4' : 'mt-8'}`}>
                <Text className="text-gray-600 dark:text-gray-400">Chưa có tài khoản? </Text>
                <Link href="/(auth)/register" asChild>
                    <Text className="text-primary font-bold">Đăng ký</Text>
                </Link>
            </View>
        </View>
    );

    // Android: Use KeyboardAvoidingView and ScrollView
    if (isAndroid) {
        return (
            <KeyboardProvider>
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
                            paddingTop: Math.max(insets.top, 16),
                            paddingBottom: Math.max(insets.bottom, 20),
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {content}
                    </ScrollView>
                </KeyboardAvoidingView>
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
