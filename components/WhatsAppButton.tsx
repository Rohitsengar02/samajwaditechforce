import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, Linking, Platform, View, Dimensions, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiUrl } from '../utils/api';

export const WhatsAppButton = () => {
    // Default to the requested number if API fails or is not set
    const [whatsappUrl, setWhatsappUrl] = useState<string | null>('https://wa.me/919621762121');

    useEffect(() => {
        fetchWhatsAppLink();
    }, []);

    const fetchWhatsAppLink = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/footer`);
            const data = await res.json();

            if (data.success && data.data) {
                const footerData = data.data;
                const socialCol = (footerData.columns || []).find((c: any) => c.type === 'social');

                if (socialCol && socialCol.social && socialCol.social.whatsapp) {
                    setWhatsappUrl(socialCol.social.whatsapp);
                }
            }
        } catch (error) {
            console.error('Error fetching WhatsApp link:', error);
        }
    };

    const handlePress = () => {
        if (whatsappUrl) {
            Linking.openURL(whatsappUrl).catch(err => console.error("Couldn't open WhatsApp", err));
        } else {
            console.log('WhatsApp URL not set');
            alert('WhatsApp number is not configured in Admin Panel.');
        }
    };

    // For Web Responsive: Check window width to adjust bottom margin
    const { width } = useWindowDimensions();
    const isMobileWeb = Platform.OS === 'web' && width < 768; // Standard tablet/mobile breakpoint

    // Dynamic style for web positioning
    const webStyle = Platform.OS === 'web' ? {
        position: 'fixed' as const,
        bottom: isMobileWeb ? 100 : 40, // Higher margin on mobile web to clear bottom bars
        right: 30,
        cursor: 'pointer',
    } : {};

    return (
        <TouchableOpacity
            style={[styles.button, webStyle as any]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <MaterialCommunityIcons name="whatsapp" size={32} color="#fff" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        // Base styles
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#25D366',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 9999,

        // Native Mobile positioning (default)
        ...Platform.select({
            default: {
                position: 'absolute',
                bottom: 160,
                right: 30,
            },
            web: {
                // Base web styles, overridden by dynamic style above
            }
        })
    }
});
