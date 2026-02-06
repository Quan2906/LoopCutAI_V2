import { View, Platform, useWindowDimensions, Pressable, Text, ActivityIndicator } from 'react-native';
import { Tabs, Slot, useRouter, usePathname, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LucideHome, LucideLightbulb, LucideBell, LucideUser, LucideIcon, Home } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import "../../global.css";

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { label: 'Trang chủ', path: '/', icon: LucideHome },
        { label: 'AI Insights', path: '/insights', icon: LucideLightbulb },
        { label: 'Nhắc nhở', path: '/reminders', icon: LucideBell },
        { label: 'Hồ sơ', path: '/profile', icon: LucideUser },
    ];

    return (
        <View className="w-64 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
            {/* Logo Header */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-800">
                <View className="flex-row items-center gap-3">
                    <LinearGradient
                        colors={['#7c3aed', '#6d28d9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-10 h-10 rounded-xl items-center justify-center"
                    >
                        <Home size={24} color="#ffffff" />
                    </LinearGradient>
                    <View>
                        <Text className="font-bold text-lg text-gray-900 dark:text-white">LoopCutAI</Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">Quản lý đăng ký</Text>
                    </View>
                </View>
            </View>

            {/* Nav Items */}
            <View className="p-2 gap-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                        <Pressable
                            key={item.path}
                            onPress={() => router.push(item.path as any)}
                            className={`flex-row items-center p-3 rounded-lg ${isActive
                                ? 'bg-primary'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            style={({ pressed }) => Platform.OS === 'web' ? {
                                cursor: 'pointer',
                                backgroundColor: isActive
                                    ? '#7c3aed'
                                    : pressed
                                        ? '#f3f4f6'
                                        : 'transparent',
                                transition: 'background-color 0.2s'
                            } : {}}
                        >
                            <Icon size={20} color={isActive ? '#ffffff' : '#6b7280'} />
                            <Text className={`ml-3 font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

export default function MainLayout() {
    const { user, isLoading } = useAuth();
    const { isDark } = useTheme();
    const { width } = useWindowDimensions();
    const pathname = usePathname();
    const isDesktop = Platform.OS === 'web' && width >= 768;

    // Auth guard - redirect to login if not authenticated
    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    if (isDesktop) {
        return (
            <SafeAreaProvider>
                <View className="flex-1 flex-row bg-gray-50 dark:bg-gray-950">
                    <Sidebar />
                    <View className="flex-1 overflow-hidden">
                        <Animated.View
                            key={pathname}
                            entering={FadeIn.duration(300)}
                            style={{ flex: 1 }}
                        >
                            <Slot />
                        </Animated.View>
                    </View>
                </View>
                <StatusBar style="auto" />
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <View style={{ flex: 1, backgroundColor: isDark ? '#030712' : '#f9fafb' }}>
                <Tabs
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: isDark ? '#030712' : '#ffffff',
                            borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
                        },
                        tabBarActiveTintColor: '#7c3aed',
                        tabBarInactiveTintColor: isDark ? '#888' : '#6b7280',
                    }}
                >
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Trang chủ',
                            tabBarIcon: ({ color }) => <LucideHome size={24} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="insights"
                        options={{
                            title: 'Insights',
                            tabBarIcon: ({ color }) => <LucideLightbulb size={24} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="reminders"
                        options={{
                            title: 'Nhắc nhở',
                            tabBarIcon: ({ color }) => <LucideBell size={24} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: 'Hồ sơ',
                            tabBarIcon: ({ color }) => <LucideUser size={24} color={color} />,
                        }}
                    />
                </Tabs>
                <StatusBar style={isDark ? "light" : "dark"} />
            </View>
        </SafeAreaProvider>
    );
}
