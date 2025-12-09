import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Footer() {
    const router = useRouter();

    return (
        <View style={styles.footer}>
            <View style={styles.footerContent}>
                <View style={styles.footerColumn}>
                    <View style={styles.footerLogo}>
                        <MaterialCommunityIcons name="bicycle" size={40} color="#fff" />
                        <Text style={styles.footerBrand}>Samajwadi Tech Force</Text>
                    </View>
                    <Text style={styles.footerDesc}>
                        The official digital wing of Samajwadi Party, dedicated to spreading the message of development and social justice.
                    </Text>
                    <View style={styles.socialLinks}>
                        <MaterialCommunityIcons name="facebook" size={28} color="#fff" />
                        <MaterialCommunityIcons name="twitter" size={28} color="#fff" />
                        <MaterialCommunityIcons name="instagram" size={28} color="#fff" />
                        <MaterialCommunityIcons name="youtube" size={28} color="#fff" />
                    </View>
                </View>
                <View style={styles.footerColumn}>
                    <Text style={styles.footerHeading}>Quick Links</Text>
                    <Text style={styles.footerLink} onPress={() => router.push('/about' as any)}>About Us</Text>
                    <Text style={styles.footerLink} onPress={() => router.push('/news' as any)}>Latest News</Text>
                    <Text style={styles.footerLink} onPress={() => router.push('/joinus' as any)}>Join Us</Text>
                    <Text style={styles.footerLink} onPress={() => router.push('/contact' as any)}>Contact</Text>
                </View>
                <View style={styles.footerColumn}>
                    <Text style={styles.footerHeading}>Resources</Text>
                    <Text style={styles.footerLink} onPress={() => router.push('/posters' as any)}>Posters</Text>
                    <Text style={styles.footerLink} onPress={() => router.push('/idcard' as any)}>ID Card</Text>
                    <Text style={styles.footerLink} onPress={() => router.push('/daily-work' as any)}>Daily Tasks</Text>
                    <Text style={styles.footerLink} onPress={() => router.push('/events' as any)}>Events</Text>
                </View>
                <View style={styles.footerColumn}>
                    <Text style={styles.footerHeading}>Contact Info</Text>
                    <Text style={styles.footerText}>Samajwadi Party HQ</Text>
                    <Text style={styles.footerText}>19, Vikramaditya Marg</Text>
                    <Text style={styles.footerText}>Lucknow, Uttar Pradesh</Text>
                    <Text style={styles.footerText}>Phone: 0522-2234455</Text>
                </View>
            </View>
            <View style={styles.footerBottom}>
                <Text style={styles.copyright}>© 2024 Samajwadi Tech Force. All rights reserved.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        backgroundColor: '#0f172a',
        paddingTop: 80,
        paddingBottom: 40,
        width: '100%',
    },
    footerContent: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 60,
        marginBottom: 60,
        gap: 40,
        flexWrap: 'wrap', // Added wrap for smaller screens support
    },
    footerColumn: {
        flex: 1,
        minWidth: 200, // Added minWidth
    },
    footerLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    footerBrand: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    footerDesc: {
        color: '#94a3b8',
        lineHeight: 24,
        marginBottom: 24,
    },
    footerHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 20,
    },
    footerLink: {
        color: '#94a3b8',
        marginBottom: 12,
        fontSize: 15,
    },
    footerText: {
        color: '#94a3b8',
        marginBottom: 8,
        fontSize: 14,
    },
    socialLinks: {
        flexDirection: 'row',
        gap: 16,
    },
    footerBottom: {
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        paddingTop: 30,
        alignItems: 'center',
    },
    copyright: {
        color: '#64748b',
        fontSize: 14,
    },
});
