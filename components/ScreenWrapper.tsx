import { View, Platform, SafeAreaView } from 'react-native';

type ScreenWrapperProps = {
    children: React.ReactNode;
    className?: string;
};

export default function ScreenWrapper({ children, className }: ScreenWrapperProps) {
    if (Platform.OS === 'web') {
        return (
            <View className={`flex-1 p-4 ${className}`}>
                {children}
            </View>
        );
    }

    return (
        <SafeAreaView className={`flex-1 ${className}`}>
            <View className="flex-1 p-4">
                {children}
            </View>
        </SafeAreaView>
    );
}
