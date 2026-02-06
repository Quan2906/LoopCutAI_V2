import { useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import OnboardingScreen from '../components/OnboardingScreen';

export default function Index() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (user && inAuthGroup) {
            // User is logged in but on auth screen, redirect to main
            router.replace('/(main)');
        } else if (user && !inAuthGroup) {
            // Should default to /matches main layout if we are just at root /
            // The directory move made /(main)/index.tsx accessible at /(main)
            router.replace('/(main)');
        }
        // Note: We no longer auto-redirect to login here.
        // The OnboardingScreen handles that via onComplete callback.
    }, [user, isLoading, segments]);

    // Callback when onboarding is complete (user skipped or finished all stages)
    const handleOnboardingComplete = useCallback(() => {
        router.replace('/(auth)/login');
    }, [router]);

    // If user is already logged in, show loading while redirecting
    if (user) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#7c3aed" />
                <StatusBar style="light" />
            </View>
        );
    }

    // Show onboarding for unauthenticated users
    return (
        <OnboardingScreen
            isAppLoading={isLoading}
            onComplete={handleOnboardingComplete}
        />
    );
}
