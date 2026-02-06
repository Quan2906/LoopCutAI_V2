import { TextInput, View, Text, TextInputProps, Platform } from 'react-native';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
    const isAndroid = Platform.OS === 'android';

    return (
        <View className={isAndroid ? "mb-2" : "mb-4"}>
            <Text className={`font-semibold text-gray-900 dark:text-white ${isAndroid ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
                {label}
            </Text>
            {/* Removed fixed height on Android to prevent text cutoff, added paddingVertical instead */}
            <TextInput
                placeholderTextColor="#9ca3af"
                className={`px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white ${isAndroid ? 'py-3 text-base' : 'h-14 text-base'} ${className}`}
                {...props}
            />
            {error && (
                <Text className="mt-1 text-xs text-destructive">{error}</Text>
            )}
        </View>
    );
}
