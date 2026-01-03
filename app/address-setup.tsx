import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AddressFormScreen from '../components/AddressFormScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function AddressSetupRoute() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const navigationAdapter = {
        goBack: () => router.back(),
        navigate: (screen: string, navParams: any) => {
            // AddressForm usually navigates to ServiceSelection or just completes.
            // We'll direct to 'completed' or Tabs.
            if (screen === 'ServiceSelection' || screen === 'Dashboard') {
                router.replace('/complete');
            }
        }
    };

    let profileData = null;
    try {
        if (typeof params.profileData === 'string') {
            profileData = JSON.parse(params.profileData);
        } else {
            profileData = params.profileData;
        }
    } catch (e) {
        console.error(e);
    }

    return (
        <ErrorBoundary>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <AddressFormScreen
                    navigation={navigationAdapter}
                    route={{ params: { profileData } }}
                />
            </View>
        </ErrorBoundary>
    );
}
