import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Footer({ data }: { data?: any }) {
    const router = useRouter();
    const columns = data?.columns || [];
    const copyright = data?.copyright || '© 2024 Samajwadi Tech Force. All rights reserved.';

    const openLink = (url?: string) => {
        if (url) Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const renderColumnContent = (col: any) => {
        switch (col.type) {
            case 'text':
                return (
                    <View>
                        {col.id === 'about_col' && (
                            <View style={styles.footerLogo}>
                                <MaterialCommunityIcons name="bicycle" size={40} color="#fff" />
                                <Text style={styles.footerBrand}>Samajwadi Tech Force</Text>
                            </View>
                        )}
                        <Text style={styles.footerDesc}>
                            {col.content}
                        </Text>
                    </View>
                );
            case 'links':
                return (col.links || []).map((link: any, idx: number) => (
                    <TouchableOpacity key={idx} onPress={() => {
                        if (link.path.startsWith('http')) openLink(link.path);
                        else router.push(link.path);
                    }} style={styles.linkHover}>
                        <Text style={styles.footerLink}>{link.label}</Text>
                    </TouchableOpacity>
                ));
            case 'contact':
                const { address, phone, email } = col.contact || {};
                return (
                    <View>
                        {address ? <Text style={styles.footerText}>{address}</Text> : null}
                        {phone ? <Text style={styles.footerText}>Phone: {phone}</Text> : null}
                        {email ? <Text style={styles.footerText}>Email: {email}</Text> : null}
                    </View>
                );
            case 'social':
                const social = col.social || {};
                return (
                    <View style={styles.socialLinks}>
                        {['facebook', 'twitter', 'instagram', 'youtube'].map((platform) => {
                            if (!social[platform]) return null;
                            return (
                                <TouchableOpacity key={platform} onPress={() => openLink(social[platform])} style={styles.linkHover}>
                                    <MaterialCommunityIcons name={platform as any} size={28} color="#fff" />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.footer}>
            <View style={styles.footerContent}>
                {columns.length > 0 ? columns.map((col: any, index: number) => (
                    <View key={col.id || index} style={styles.footerColumn}>
                        {col.title ? <Text style={styles.footerHeading}>{col.title}</Text> : null}
                        {renderColumnContent(col)}
                    </View>
                )) : (
                    <View style={styles.footerColumn}><Text style={{ color: '#94a3b8' }}>Loading...</Text></View>
                )}
            </View>
            <View style={styles.footerBottom}>
                <Text style={styles.copyright}>{copyright}</Text>
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
        flexWrap: 'wrap',
    },
    footerColumn: {
        flex: 1,
        minWidth: 200,
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
    footerHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 20,
    },
    footerDesc: {
        color: '#94a3b8',
        lineHeight: 24,
        marginBottom: 24,
    },
    footerLink: {
        color: '#94a3b8',
        marginBottom: 12,
        fontSize: 15,
        ...Platform.select({
            web: { cursor: 'pointer' } as any
        })
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
    linkHover: {
        ...Platform.select({
            web: { cursor: 'pointer' } as any
        })
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
