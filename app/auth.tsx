import { View, Text, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

export default function AuthPage() {
    useEffect(() => {
        // This function handles the redirect from the OAuth provider
        // It checks the URL hash/query params and signals completion to the main window
        WebBrowser.maybeCompleteAuthSession();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginTop: 20, fontSize: 16 }}>Completing Authentication...</Text>
            <ActivityIndicator size="large" color="#E30512" style={{ marginTop: 20 }} />
        </View>
    );
}
