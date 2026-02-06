import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    useWindowDimensions,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

// Import onboarding images
const onboardingConnect = require('../assets/images/onboarding-connect.jpg');
const onboardingAI = require('../assets/images/onboarding-ai.jpg');
const onboardingSave = require('../assets/images/onboarding-save.jpg');

interface OnboardingScreenProps {
    isAppLoading: boolean;
    onComplete: () => void;
}

interface OnboardingStep {
    image: any;
    title: string;
    description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        image: onboardingConnect,
        title: 'Quản lý gói đăng ký dễ dàng',
        description: 'Thêm tất cả các gói đăng ký của bạn vào một nơi. Netflix, Spotify, gym, bảo hiểm... tất cả đều ở đây.',
    },
    {
        image: onboardingAI,
        title: 'AI phân tích chi tiêu thông minh',
        description: 'LoopCutAI phân tích thói quen chi tiêu, cảnh báo các khoản phí ẩn và gợi ý tối ưu hóa ngân sách.',
    },
    {
        image: onboardingSave,
        title: 'Đưa ra quyết định sáng suốt',
        description: 'Nhận nhắc nhở kịp thời và câu hỏi thông minh để quyết định giữ hay hủy đăng ký. Tiết kiệm hiệu quả.',
    },
];

const LOADING_STEP = {
    title: 'Ứng dụng đang khởi động',
    description: 'Vui lòng chờ thêm trong giây lát...',
};

export default function OnboardingScreen({ isAppLoading, onComplete }: OnboardingScreenProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [showLoadingStage, setShowLoadingStage] = useState(false);
    const [imageLoading, setImageLoading] = useState(true); // Track image loading state
    const { isDark } = useTheme();
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Determine if we're on a desktop/larger screen
    const isDesktop = Platform.OS === 'web' && width >= 768;
    const isMobile = !isDesktop;

    // Calculate if screen is small (small Android devices)
    const isSmallScreen = height < 700;

    // Check if user has completed all onboarding steps
    const hasCompletedOnboarding = currentStep >= ONBOARDING_STEPS.length;

    // Effect to handle completion
    useEffect(() => {
        if (hasCompletedOnboarding || showLoadingStage) {
            if (!isAppLoading) {
                onComplete();
            }
        }
    }, [hasCompletedOnboarding, showLoadingStage, isAppLoading, onComplete]);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setImageLoading(true); // Reset loading state for new image
            setCurrentStep(currentStep + 1);
        } else {
            // User finished all stages
            if (isAppLoading) {
                setShowLoadingStage(true);
            } else {
                onComplete();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setImageLoading(true); // Reset loading state for new image
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        if (isAppLoading) {
            setShowLoadingStage(true);
        } else {
            onComplete();
        }
    };

    // Colors based on theme
    const colors = {
        background: isDark ? '#030712' : '#f9fafb',
        text: isDark ? '#f9fafb' : '#030712',
        textMuted: isDark ? '#9ca3af' : '#6b7280',
        primary: '#7c3aed',
        primaryDark: '#6d28d9',
        border: isDark ? '#374151' : '#e5e7eb',
        cardBg: isDark ? '#111827' : '#ffffff',
    };

    // Safe area paddings
    const topPadding = Math.max(insets.top, 16) + 8;
    const bottomPadding = Math.max(insets.bottom, 16) + 16;

    // Render loading stage (4th stage)
    if (showLoadingStage || hasCompletedOnboarding) {
        return (
            <View style={{
                flex: 1,
                backgroundColor: colors.background,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                paddingTop: topPadding,
                paddingBottom: bottomPadding,
            }}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 24 }} />
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.text,
                    textAlign: 'center',
                    marginBottom: 12,
                }}>
                    {LOADING_STEP.title}
                </Text>
                <Text style={{
                    fontSize: 16,
                    color: colors.textMuted,
                    textAlign: 'center',
                }}>
                    {LOADING_STEP.description}
                </Text>
            </View>
        );
    }

    const step = ONBOARDING_STEPS[currentStep];
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    return (
        <View style={{
            flex: 1,
            backgroundColor: colors.background,
        }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header: Progress Indicator + Skip Button on same row (mobile only) */}
            <View style={{
                flexDirection: 'row',
                justifyContent: isMobile ? 'space-between' : 'center',
                alignItems: 'center',
                paddingTop: topPadding,
                paddingHorizontal: 20,
                paddingBottom: 8,
            }}>
                {/* Progress Indicator */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    flex: isMobile ? 1 : undefined,
                }}>
                    {ONBOARDING_STEPS.map((_, index) => (
                        <View
                            key={index}
                            style={{
                                height: 6,
                                width: index === currentStep ? 32 : 24,
                                borderRadius: 3,
                                backgroundColor: index === currentStep
                                    ? colors.primary
                                    : index < currentStep
                                        ? `${colors.primary}80`
                                        : colors.border,
                            }}
                        />
                    ))}
                </View>

                {/* Skip Button - Mobile: Same row as progress */}
                {isMobile && (
                    <TouchableOpacity
                        onPress={handleSkip}
                        style={{
                            paddingVertical: 8,
                            paddingLeft: 16,
                        }}
                    >
                        <Text style={{
                            color: colors.primary,
                            fontSize: 16,
                            fontWeight: '600',
                        }}>
                            Bỏ qua
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Scrollable Content */}
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                    paddingVertical: isSmallScreen ? 16 : 24,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    maxWidth: isDesktop ? 500 : '100%',
                    width: '100%',
                    alignItems: 'center',
                }}>
                    {/* Image - Responsive size for small screens */}
                    <View style={{
                        width: '100%',
                        maxWidth: isSmallScreen ? 280 : 400,
                        aspectRatio: 16 / 10,
                        borderRadius: 24,
                        overflow: 'hidden',
                        marginBottom: isSmallScreen ? 20 : 32,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 8,
                        backgroundColor: colors.cardBg,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        {/* Loading indicator - shows while image is loading */}
                        {imageLoading && (
                            <View style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: colors.cardBg,
                                zIndex: 1,
                            }}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                        )}
                        <Image
                            key={currentStep} // Force re-mount on step change to reset loading state
                            source={step.image}
                            style={{
                                width: '100%',
                                height: '100%',
                                opacity: imageLoading ? 0 : 1, // Hide image while loading
                            }}
                            resizeMode="cover"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                        />
                    </View>

                    {/* Text Content */}
                    <View style={{
                        alignItems: 'center',
                        paddingHorizontal: 8,
                    }}>
                        <Text style={{
                            fontSize: isDesktop ? 32 : isSmallScreen ? 24 : 28,
                            fontWeight: 'bold',
                            color: colors.text,
                            textAlign: 'center',
                            marginBottom: isSmallScreen ? 12 : 16,
                        }}>
                            {step.title}
                        </Text>
                        <Text style={{
                            fontSize: isDesktop ? 18 : isSmallScreen ? 14 : 16,
                            color: colors.textMuted,
                            textAlign: 'center',
                            lineHeight: isDesktop ? 28 : isSmallScreen ? 20 : 24,
                        }}>
                            {step.description}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Navigation Buttons - Fixed at bottom with safe area */}
            <View style={{
                paddingHorizontal: 24,
                paddingBottom: bottomPadding,
                paddingTop: 16,
                maxWidth: isDesktop ? 500 : '100%',
                alignSelf: 'center',
                width: '100%',
            }}>
                {/* Skip Button - Desktop: Above Continue */}
                {isDesktop && (
                    <TouchableOpacity
                        onPress={handleSkip}
                        style={{
                            alignSelf: 'center',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{
                            color: colors.primary,
                            fontSize: 16,
                            fontWeight: '600',
                        }}>
                            Bỏ qua
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={{
                    flexDirection: 'row',
                    gap: 16,
                }}>
                    {/* Back Button */}
                    {currentStep > 0 && (
                        <TouchableOpacity
                            onPress={handleBack}
                            style={{
                                paddingVertical: 16,
                                paddingHorizontal: 20,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.border,
                                backgroundColor: colors.cardBg,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{
                                color: colors.text,
                                fontSize: 20,
                                fontWeight: '600',
                            }}>
                                ←
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Next/Complete Button */}
                    <TouchableOpacity
                        onPress={handleNext}
                        style={{
                            flex: 1,
                            paddingVertical: 16,
                            paddingHorizontal: 24,
                            borderRadius: 12,
                            backgroundColor: colors.primary,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                        }}
                    >
                        <Text style={{
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: '600',
                        }}>
                            {isLastStep ? 'Bắt đầu ngay' : 'Tiếp theo'}
                        </Text>
                        {!isLastStep && (
                            <Text style={{
                                color: '#ffffff',
                                fontSize: 18,
                                fontWeight: '600',
                            }}>
                                →
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
