import { View, Text, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <View className="flex-row items-center justify-between py-4 px-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <View className="flex-row items-center">
                <Text className="text-xl mr-3">{isDark ? '🌙' : '☀️'}</Text>
                <View>
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        Dark mode
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {isDark ? 'On' : 'Off'}
                    </Text>
                </View>
            </View>
            <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e5e7eb', true: '#1d9bf0' }}
                thumbColor="#ffffff"
            />
        </View>
    );
}
