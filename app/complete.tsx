import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import InteractiveCompleteScreen from '../components/InteractiveCompleteScreen';

export default function CompleteScreenRoute() {
    const router = useRouter();

    const navigationAdapter = {
        navigate: (screen: string) => {
            if (screen === 'Dashboard' || screen === 'LoginForm') {
                router.replace('/(tabs)');
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <InteractiveCompleteScreen navigation={navigationAdapter} />
        </View>
    );
}
