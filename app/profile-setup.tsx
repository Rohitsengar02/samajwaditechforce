import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProfileSetupScreen from '../components/ProfileSetupScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function ProfileSetupRoute() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Create a navigation adapter for the component
    const navigationAdapter = {
        navigate: (screen: string, navParams: any) => {
            if (screen === 'AddressForm') {
                // Navigate to the next screen (which we might need to expose as a route too, or handle here)
                // For now, let's assume AddressFormScreen is usually Step 3. 
                // We really should just route to a dedicated Address page if we are decoupling.
                // But to keep it simple, we can pass the data to /address-setup (we need to create this too, or use register's step?).
                // Let's create /address-setup as well to be safe.
                router.push({
                    pathname: '/address-setup',
                    params: {
                        profileData: JSON.stringify(navParams.profileData)
                    }
                });
            }
        }
    };

    // Ensure googleData is passed correctly
    const googleDataRaw = params.googleData;
    let googleData = null;

    try {
        if (typeof googleDataRaw === 'string') {
            googleData = JSON.parse(googleDataRaw);
        }
    } catch (e) {
        console.error("Failed to parse", e);
    }

    return (
        <ErrorBoundary>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <ProfileSetupScreen
                    navigation={navigationAdapter}
                    route={{ params: { googleData } }}
                />
            </View>
        </ErrorBoundary>
    );
}
