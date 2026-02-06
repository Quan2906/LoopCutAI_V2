import { useEffect } from 'react';
import { Text, View, Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

// Initialize WebBrowser for web auth
WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginButton() {
    const { loginWithGoogle, isLoading } = useAuth();

    const [request, response, promptAsync] = Google.useAuthRequest({
        // Use your own client IDs here
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '857541693263-g705l8oi6i55k9skln4cte9umg3rhbbv.apps.googleusercontent.com',
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'dummy-android-client-id',
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'dummy-ios-client-id',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleLogin(id_token);
        }
    }, [response]);

    const handleGoogleLogin = async (idToken: string) => {
        try {
            await loginWithGoogle(idToken);
        } catch (e: any) {
            const msg = e.response?.data?.message || e.message || 'Google Login Failed';
            if (msg.includes('Account not found')) {
                const alertMsg = 'Account not found. Please register first, or contact support.';
                Platform.OS === 'web' ? alert(alertMsg) : Alert.alert('Account Not Found', alertMsg);
            } else {
                Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
            }
        }
    };

    return (
        <Button
            title="Tiếp tục với Google"
            variant="outline"
            disabled={!request}
            loading={isLoading}
            onPress={() => promptAsync()}
            className="mt-4 border-gray-600"
        />
    );
}
