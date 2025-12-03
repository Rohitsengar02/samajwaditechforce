import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import DesktopNewsDetail from '../desktop-screen-pages/news-detail';
import { Stack } from 'expo-router';

export default function NewsDetailScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    if (isDesktop) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <DesktopNewsDetail />
            </>
        );
    }

    // Mobile view (reusing desktop component for now, but wrapped safely)
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <DesktopNewsDetail />
        </>
    );
}
