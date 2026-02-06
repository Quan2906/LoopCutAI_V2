import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { MembershipProvider } from '../context/MembershipContext';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import "../global.css";

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#030712', // Matches global dark background
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f9fafb', // Matches global light background
  },
};

function RootLayoutNav() {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
      <Slot />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <MembershipProvider>
            <RootLayoutNav />
          </MembershipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

