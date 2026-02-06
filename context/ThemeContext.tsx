import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { Storage } from '../utils/storage';
import { Appearance, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { colorScheme, setColorScheme } = useNativeWindColorScheme();
    const [isDark, setIsDark] = useState(colorScheme === 'dark');

    // Set Android navigation bar color
    const setNavigationBarColor = (dark: boolean) => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync(dark ? '#030712' : '#f9fafb');
            NavigationBar.setButtonStyleAsync(dark ? 'light' : 'dark');
        }
    };

    // Load saved theme on mount
    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await Storage.getItem('theme');
            if (savedTheme) {
                const isDarkMode = savedTheme === 'dark';
                setIsDark(isDarkMode);
                setColorScheme(isDarkMode ? 'dark' : 'light');
                setNavigationBarColor(isDarkMode);
            } else {
                // Use device preference if no saved theme
                const deviceTheme = Appearance.getColorScheme();
                const isDarkMode = deviceTheme === 'dark';
                setIsDark(isDarkMode);
                setColorScheme(isDarkMode ? 'dark' : 'light');
                setNavigationBarColor(isDarkMode);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        setColorScheme(newIsDark ? 'dark' : 'light');
        setNavigationBarColor(newIsDark);
        await Storage.setItem('theme', newIsDark ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
