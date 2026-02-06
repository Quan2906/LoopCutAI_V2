import { useState, useRef, useEffect } from 'react';
import { Text, View, ScrollView, TextInput, Pressable, Platform, Image, useWindowDimensions, Alert, ActivityIndicator, LayoutAnimation, UIManager, KeyboardAvoidingView, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Send, Sparkles, TrendingUp, TrendingDown, CreditCard, ChevronRight, Bot, User, Brain, ArrowUpRight, Check, Clock, X, Search, Zap, Loader2 } from 'lucide-react-native';
import { useSubscriptions } from '../../context/SubscriptionContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatService } from '../../services/chatService';

// Conditional imports for native only
const isWeb = Platform.OS === 'web';
let useBottomTabBarHeight: () => number;
let useKeyboardHandler: any;
let KeyboardProvider: any;

if (!isWeb) {
    const bottomTabs = require('@react-navigation/bottom-tabs');
    const keyboardController = require('react-native-keyboard-controller');
    useBottomTabBarHeight = bottomTabs.useBottomTabBarHeight;
    useKeyboardHandler = keyboardController.useKeyboardHandler;
    KeyboardProvider = keyboardController.KeyboardProvider;
} else {
    // Web fallbacks
    useBottomTabBarHeight = () => 0;
    useKeyboardHandler = () => { };
    KeyboardProvider = ({ children }: { children: React.ReactNode }) => children;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Insights() {
    const { subscriptions, totalMonthlySpending, deleteSubscription, updateSubscription } = useSubscriptions();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const isDesktop = width >= 768;
    const [inputText, setInputText] = useState('');
    const [isAIThinking, setIsAIThinking] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    // Filter initial suggestions to be just the first 3 for display
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Track keyboard visibility (only on native)
    if (!isWeb) {
        useKeyboardHandler({
            onStart: (e: any) => {
                'worklet';
            },
            onMove: (e: any) => {
                'worklet';
            },
            onEnd: (e: any) => {
                'worklet';
            },
        }, []);
    }

    // Use Keyboard events from react-native for visibility tracking
    useEffect(() => {
        const { Keyboard } = require('react-native');
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardVisible(false);
        });
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // Initialize Chat
    useEffect(() => {
        setMessages([
            {
                id: 'welcome',
                role: 'ai',
                type: 'text',
                content: `Xin chào ${user?.fullName?.split(' ')[0] || 'bạn'}! 👋 Tôi là AI Financial Advisor.\nTôi đã phân tích ${subscriptions.length} gói đăng ký của bạn. Có vài khoản chi tiêu cần tối ưu hóa hôm nay.`
            }
        ]);
    }, []);

    const handleAction = (id: string, action: 'keep' | 'later' | 'cancel', subName: string) => {
        // Remove the suggestion card from view (or mark as handled)
        setMessages(prev => prev.filter(msg => msg.id !== id));

        let responseText = '';
        if (action === 'keep') {
            responseText = `Đã ghi nhận: Bạn muốn giữ lại ${subName}. ✅`;
        } else if (action === 'later') {
            responseText = `Đã hiểu. Tôi sẽ nhắc lại về ${subName} sau 7 ngày. ⏰`;
        } else if (action === 'cancel') {
            responseText = `Đang tiến hành hủy ${subName}... 🗑️`;
            setTimeout(() => {
                const msg = `Đã gửi yêu cầu hủy ${subName}`;
                Platform.OS === 'web' ? alert(msg) : Alert.alert('Thông báo', msg);
            }, 500);
        }

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'ai',
            type: 'text',
            content: responseText
        }]);
    };

    const handleSend = async () => {
        if (!inputText.trim() || isAIThinking) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            type: 'text',
            content: inputText
        };

        const thinkingMsg = {
            id: 'thinking-' + Date.now(),
            role: 'ai',
            type: 'thinking',
            content: ''
        };

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(prev => [...prev, userMsg, thinkingMsg]);
        setInputText('');
        setShowSuggestions(false);
        setIsAIThinking(true);

        // Immediate scroll
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

        // Create hidden context with user's subscription data
        const subscriptionContext = `\n\n--- [SYSTEM CONTEXT: USER DATA] ---\n` +
            `User: ${user?.fullName || 'User'}\n` +
            `Total Monthly Spending: ${totalMonthlySpending?.toLocaleString()} VND\n` +
            `Active Subscriptions (${subscriptions.length}):\n` +
            subscriptions.map(s => `- Tên gói đăng ký là ${s.name}, Đăng ký sẽ đến hạn thanh toán vào ngày ${new Date(s.nextRenewal).toLocaleDateString('vi-VN')}, Đăng ký thuộc danh mục ${s.category}, Giá của gói đăng ký là ${s.price?.toLocaleString()} VND.`).join('\n') +
            `\n-----------------------------------`;

        try {
            // Send user input + hidden context to AI
            const result = await chatService.sendMessage(userMsg.content + subscriptionContext);
            const responseText = (result as any).response || "Xin lỗi, tôi không thể trả lời ngay lúc này.";

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(prev => prev.map(msg =>
                msg.id === thinkingMsg.id
                    ? { ...msg, type: 'text', content: responseText, id: (Date.now() + 1).toString() }
                    : msg
            ));
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg = "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.";

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(prev => prev.map(msg =>
                msg.id === thinkingMsg.id
                    ? { ...msg, type: 'text', content: errorMsg, id: (Date.now() + 1).toString() }
                    : msg
            ));
        } finally {
            setIsAIThinking(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    // --- Components ---

    const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
        <View
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 mb-4"
            style={{
                shadowColor: '#8b5cf6', // Violet shadow
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4
            }}
        >
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{label}</Text>
                    <Text className="text-3xl font-bold text-gray-900 dark:text-white">{value}</Text>
                </View>
                <View className={`w-10 h-10 rounded-full items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
                    <Icon size={20} color={color} />
                </View>
            </View>
            <Text className="text-gray-400 text-xs">{subValue}</Text>
        </View>
    );

    const AskAICard = () => (
        <View className="bg-[#f0fdf4] dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/20 mb-6">
            <View className="flex-row justify-between items-center mb-2">
                <View>
                    <Text className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Tiết kiệm tiềm năng</Text>
                    <Text className="text-xl font-bold text-green-700 dark:text-green-300">Hỏi AI</Text>
                </View>
                <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800/30 items-center justify-center">
                    <TrendingDown size={20} color="#15803d" />
                </View>
            </View>
            <Text className="text-green-600/80 dark:text-green-400/80 text-xs">AI sẽ phân tích cho bạn</Text>
        </View>
    );

    const SubscriptionItem = ({ sub }: any) => {
        const getStatusBadge = () => {
            if (sub.status === 'active') {
                return <View className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30"><Text className="text-xs font-medium text-green-600 dark:text-green-400">✓</Text></View>;
            } else if (sub.status === 'expiring') {
                return <View className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30"><Text className="text-xs font-medium text-yellow-600 dark:text-yellow-400">⏰</Text></View>;
            } else if (sub.status === 'trial') {
                return <View className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30"><Text className="text-xs font-medium text-blue-600 dark:text-blue-400">Trial</Text></View>;
            }
            return null;
        };

        return (
            <View className="flex-row items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 mb-3 shadow-sm">
                <View className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 items-center justify-center mr-3">
                    {sub.logo ? (
                        <Image source={{ uri: sub.logo }} className="w-6 h-6" resizeMode="contain" />
                    ) : (
                        <Text>📦</Text>
                    )}
                </View>
                <View className="flex-1 min-w-0">
                    <Text className="font-semibold text-gray-900 dark:text-white" numberOfLines={1}>{sub.name}</Text>
                    <Text className="text-xs text-gray-500">{sub.category}</Text>
                </View>
                <View className="items-end ml-2">
                    <Text className="font-bold text-primary dark:text-violet-400">{sub.price.toLocaleString()}đ</Text>
                    <Text className="text-[10px] text-gray-400">/{sub.billingCycle === 'monthly' ? 'tháng' : 'năm'}</Text>
                </View>
                <View className="ml-2">
                    {getStatusBadge()}
                </View>
            </View>
        );
    };

    const ChatMessage = ({ msg }: any) => {
        const isAI = msg.role === 'ai';

        if (msg.type === 'thinking') {
            return (
                <View className="flex-row gap-3 mb-4">
                    <View className="w-8 h-8 rounded-full items-center justify-center bg-primary/10">
                        <Bot size={16} color="#7c3aed" />
                    </View>
                    <View className="p-4 rounded-2xl bg-white dark:bg-gray-900 rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm">
                        <ActivityIndicator size="small" color="#7c3aed" />
                    </View>
                </View>
            );
        }

        if (msg.type === 'suggestion') {
            return (
                <View className="flex-row gap-3 mb-6">
                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mt-1">
                        <Sparkles size={16} color="#7c3aed" />
                    </View>
                    <View className="flex-1">
                        <View
                            className="bg-white dark:bg-gray-900 p-5 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2
                            }}
                        >
                            <Text className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">{msg.content}</Text>
                            <View className="flex-row gap-2 flex-wrap">
                                <Pressable
                                    onPress={() => handleAction(msg.id, 'keep', 'Gói này')}
                                    className="flex-row items-center bg-[#22c55e] px-4 py-2 rounded-lg hover:bg-green-600 active:bg-green-700"
                                >
                                    <Check size={14} color="white" />
                                    <Text className="text-white text-xs font-semibold ml-2">Giữ lại</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleAction(msg.id, 'later', 'Gói này')}
                                    className="flex-row items-center bg-[#fef9c3] px-4 py-2 rounded-lg border border-yellow-200"
                                >
                                    <Clock size={14} color="#ca8a04" />
                                    <Text className="text-[#a16207] text-xs font-semibold ml-2">Nhắc sau</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleAction(msg.id, 'cancel', 'Gói này')}
                                    className="flex-row items-center bg-[#fef2f2] px-4 py-2 rounded-lg border border-red-100"
                                >
                                    <X size={14} color="#dc2626" />
                                    <Text className="text-[#b91c1c] text-xs font-semibold ml-2">Hủy bỏ</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View className={`flex-row gap-3 mb-4 ${!isAI ? 'flex-row-reverse' : ''}`}>
                <View className={`w-8 h-8 rounded-full items-center justify-center ${isAI ? 'bg-primary/10' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {isAI ? <Bot size={16} color="#7c3aed" /> : <User size={16} color="#6b7280" />}
                </View>
                <View className={`max-w-[80%] p-4 rounded-2xl ${isAI ? 'bg-white dark:bg-gray-900 rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm' : 'bg-primary rounded-tr-none shadow-sm'}`}>
                    <Text className={`${isAI ? 'text-gray-800 dark:text-gray-200' : 'text-white'} leading-relaxed`}>
                        {msg.content}
                    </Text>
                </View>
            </View>
        );
    };

    const ChatSuggestions = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2 mb-2 flex-shrink-0">
            {[
                "So sánh giá các gói của tôi",
                "Tôi có đang trả quá nhiều tiền không?",
                "Tìm lựa chọn thay thế rẻ hơn",
                "Phân tích tiết kiệm tiềm năng",
                "Đề xuất tối ưu hóa chi tiêu"
            ].map((text, i) => (
                <Pressable
                    key={i}
                    onPress={() => {
                        setInputText(text);
                    }}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full mr-2 shadow-sm"
                >
                    <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">{text}</Text>
                </Pressable>
            ))}
        </ScrollView>
    );

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            className="flex-1 h-full"
            style={{
                backgroundColor: isDark ? '#030712' : '#f9fafb',
                height: Platform.OS === 'web' ? '100vh' : '100%',
                paddingTop: isDesktop ? 0 : insets.top
            } as any}
        >
            {/* Split Layout Container - No Global Scroll */}
            <View className={`flex-1 h-full w-full ${isDesktop ? 'flex-row overflow-hidden' : 'flex-col'}`}>

                {/* LEFT PANEL: Financial Overview */}
                {isDesktop && (
                    <View
                        className="w-[320px] max-w-[320px] border-r border-gray-200 dark:border-gray-800 h-full flex-col"
                        style={{ backgroundColor: isDark ? '#030712' : '#f9fafb' }}
                    >

                        {/* Fixed Header Content for Sidebar */}
                        <View className="p-6 pb-0 flex-none">
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tổng quan Chi tiêu</Text>
                            <Text className="text-gray-500 text-sm mb-6">Phân tích và tối ưu hóa</Text>

                            <StatCard
                                label="Tổng chi phí/tháng"
                                value={`${totalMonthlySpending.toLocaleString()}đ`}
                                subValue={`${subscriptions.length} gói đăng ký`}
                                icon={DollarSignValue}
                                color="#7c3aed"
                            />

                            <AskAICard />

                            <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-4">Các gói đăng ký</Text>
                        </View>

                        {/* Independent Scrollable List */}
                        <ScrollView
                            className="flex-1 px-6"
                            contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {subscriptions.map(sub => (
                                <SubscriptionItem key={sub.id} sub={sub} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* RIGHT PANEL: AI Chat Application */}
                <View className="flex-1 h-full flex flex-col overflow-hidden" style={{ backgroundColor: isDark ? '#030712' : '#ffffff' }}>
                    {/* Fixed Header */}
                    <View className="p-4 border-b border-gray-100 dark:border-gray-800 flex-row items-center gap-3 z-10 flex-none" style={{ backgroundColor: isDark ? '#030712' : '#ffffff' }}>
                        <View className="relative">
                            <View className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 items-center justify-center">
                                <Sparkles size={20} color="#7c3aed" />
                            </View>
                            {/* Online indicator */}
                            <View className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-950" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-900 dark:text-white text-base">AI Financial Advisor</Text>
                            <Text className="text-xs text-gray-500">Tìm kiếm web • So sánh giá • Phân tích tiết kiệm</Text>
                        </View>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 45 : 27}
                        style={{ flex: 1, flexDirection: 'column' }}
                    >
                        {/* Chat Messages Area - Takes remaining space */}
                        <ScrollView
                            ref={scrollViewRef}
                            className="flex-1 w-full"
                            style={{ backgroundColor: isDark ? '#030712' : '#ffffff' }}
                            contentContainerStyle={{ padding: 16, paddingBottom: 20, flexGrow: 1 }}
                            showsVerticalScrollIndicator={true}
                            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                        >
                            {messages.map((msg, index) => (
                                <ChatMessage key={msg.id || index} msg={msg} />
                            ))}
                        </ScrollView>

                        {/* Input Area - Fixed at bottom of KeyboardAvoidingView */}
                        <View
                            className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-20 flex-none"
                            style={{
                                paddingBottom: isDesktop
                                    ? 16
                                    : Platform.OS === 'web'
                                        ? 60
                                        : Platform.OS === 'ios' ? 10 : 16 // Added 16px padding for Android
                            }}
                        >
                            {showSuggestions && !isKeyboardVisible && (
                                <View className={Platform.OS === 'web' ? "mb-3" : "mb-4"}>
                                    <View className="flex-row items-center gap-2 mb-3 pl-1">
                                        <Sparkles size={14} color="#7c3aed" />
                                        <Text className="text-xs font-medium text-primary">Câu hỏi gợi ý</Text>
                                    </View>
                                    <ChatSuggestions />
                                </View>
                            )}

                            <View className="flex-row gap-3 items-end">
                                <View className="flex-1 bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 focus:border-primary/50 flex-row items-center px-4 py-1 shadow-sm">
                                    <TextInput
                                        className="flex-1 text-base text-gray-900 dark:text-white min-h-[48px] max-h-32 pt-3 pb-3"
                                        placeholder="Nhập câu hỏi của bạn..."
                                        placeholderTextColor="#9ca3af"
                                        multiline
                                        value={inputText}
                                        onChangeText={setInputText}
                                        style={{ textAlignVertical: 'center' }}
                                    />
                                </View>
                                <Pressable
                                    onPress={handleSend}
                                    disabled={!inputText.trim() || isAIThinking}
                                    className={`w-12 h-12 rounded-full items-center justify-center shadow-md ${inputText.trim() && !isAIThinking ? 'bg-primary shadow-primary/30' : 'bg-gray-100 dark:bg-gray-800'}`}
                                >
                                    {isAIThinking ? (
                                        <ActivityIndicator size="small" color="#9ca3af" />
                                    ) : (
                                        <Send size={20} color={inputText.trim() ? "white" : "#9ca3af"} />
                                    )}
                                </Pressable>
                            </View>
                            {isAIThinking && (
                                <View className="flex-row items-center justify-center gap-2 mt-2">
                                    <ActivityIndicator size="small" color="#7c3aed" />
                                    <Text className="text-xs text-primary">Đang phân tích...</Text>
                                </View>
                            )}
                            <Text className="text-[10px] text-center text-gray-400 mt-2 hidden">
                                AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
                            </Text>
                        </View>
                    </KeyboardAvoidingView>
                </View>

            </View >
        </Animated.View >
    );
}

// Helper icon component
const DollarSignValue = ({ size, color }: any) => (
    <Text style={{ fontSize: size, color: color, fontWeight: 'bold' }}>$</Text>
);
