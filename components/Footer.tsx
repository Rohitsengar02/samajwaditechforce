import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

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
                                <View style={styles.logoIconContainer}>
                                    <MaterialCommunityIcons name="bicycle" size={36} color={SP_RED} />
                                </View>
                                <View>
                                    <Text style={styles.footerBrand}>Samajwadi</Text>
                                    <Text style={styles.footerBrandSub}>Tech Force</Text>
                                </View>
                            </View>
                        )}
                        <Text style={styles.footerDesc}>
                            {col.content}
                        </Text>
                    </View>
                );
            case 'links':
                return (col.links || []).map((link: any, idx: number) => (
                    <TouchableOpacity
                        key={idx}
                        onPress={() => {
                            if (link.path.startsWith('http')) openLink(link.path);
                            else router.push(link.path);
                        }}
                        style={styles.linkHover}
                    >
                        <View style={styles.linkRow}>
                            <MaterialCommunityIcons name="chevron-right" size={16} color={SP_GREEN} />
                            <Text style={styles.footerLink}>{link.label}</Text>
                        </View>
                    </TouchableOpacity>
                ));
            case 'contact':
                const { address, phone, email } = col.contact || {};

                return (
                    <View style={styles.contactSection}>
                        {address && (
                            <View style={styles.contactItem}>
                                <MaterialCommunityIcons name="map-marker" size={20} color={SP_RED} />
                                <Text style={styles.footerText}>{address}</Text>
                            </View>
                        )}
                        {phone && (
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)} style={styles.contactItem}>
                                <MaterialCommunityIcons name="phone" size={20} color={SP_RED} />
                                <Text style={styles.footerText}>{phone}</Text>
                            </TouchableOpacity>
                        )}
                        {email && (
                            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)} style={styles.contactItem}>
                                <MaterialCommunityIcons name="email" size={20} color={SP_RED} />
                                <Text style={styles.footerText}>{email}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                );
            case 'social':
                const social = col.social || {};
                const socialPlatforms = [
                    { name: 'facebook', icon: 'facebook', color: '#1877F2', label: 'Facebook' },
                    { name: 'twitter', icon: 'twitter', color: '#1DA1F2', label: 'Twitter' },
                    { name: 'instagram', icon: 'instagram', color: '#E4405F', label: 'Instagram' },
                    { name: 'youtube', icon: 'youtube', color: '#FF0000', label: 'YouTube' },
                    { name: 'telegram', icon: 'telegram', color: '#0088cc', label: 'Telegram' },
                    { name: 'linkedin', icon: 'linkedin', color: '#0A66C2', label: 'LinkedIn' },
                    { name: 'whatsapp', icon: 'whatsapp', color: '#25D366', label: 'WhatsApp' },
                    { name: 'website', icon: 'web', color: '#E30512', label: 'Website' },
                ];

                return (
                    <View style={styles.socialLinksColumn}>
                        {socialPlatforms.map((platform) => {
                            const hasLink = social[platform.name];
                            return (
                                <TouchableOpacity
                                    key={platform.name}
                                    onPress={() => hasLink ? openLink(social[platform.name]) : null}
                                    style={[
                                        styles.socialButton,
                                        {
                                            backgroundColor: platform.color + '20',
                                            opacity: hasLink ? 1 : 0.5
                                        }
                                    ]}
                                    disabled={!hasLink}
                                >
                                    <MaterialCommunityIcons
                                        name={platform.icon as any}
                                        size={24}
                                        color={platform.color}
                                    />
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
        <View style={styles.footerWrapper}>
            <LinearGradient
                colors={['#1e293b', '#0f172a', '#020617']}
                style={styles.footer}
            >
                {/* Decorative top wave */}
                <View style={styles.decorativeTop}>
                    <View style={styles.wave} />
                </View>

                <View style={styles.footerContent}>
                    {columns.length > 0 ? columns.map((col: any, index: number) => {
                        // Ensure contact column appears on the right
                        const isContactColumn = col.type === 'contact';
                        const columnStyle = isContactColumn
                            ? [styles.footerColumn, styles.contactColumn]
                            : styles.footerColumn;

                        return (
                            <View key={col.id || index} style={columnStyle}>
                                {col.title && (
                                    <View style={styles.headingContainer}>
                                        <View style={styles.headingAccent} />
                                        <Text style={styles.footerHeading}>{col.title}</Text>
                                    </View>
                                )}
                                {renderColumnContent(col)}
                            </View>
                        );
                    }) : (
                        <View style={styles.footerColumn}>
                            <Text style={{ color: '#94a3b8' }}>Loading footer...</Text>
                        </View>
                    )}
                </View>




                {/* Bottom Bar */}
                <View style={styles.footerBottom}>
                    <View style={styles.bottomContent}>
                        <Text style={styles.copyright}>{copyright}</Text>
                        <View style={styles.bottomLinks}>
                            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
                                <Text style={styles.bottomLink}>Privacy Policy</Text>
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity onPress={() => router.push('/return-refund' as any)}>
                                <Text style={styles.bottomLink}>Terms of Service</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    footerWrapper: {
        width: '100%',
    },
    footer: {
        width: '100%',
        paddingTop: 60,
        paddingBottom: 0,
    },
    decorativeTop: {
        height: 4,
        backgroundColor: SP_RED,
        width: '100%',
        marginBottom: 60,
    },
    wave: {
        height: '100%',
        width: '100%',
    },
    footerContent: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 60,
        paddingBottom: 60,
        gap: 40,
        flexWrap: 'nowrap',
        overflow: 'hidden',
    },
    footerColumn: {
        flex: 1,
        minWidth: 220,
        maxWidth: 280,
    },
    contactColumn: {
        flex: 1,
        minWidth: 280,
        maxWidth: 320,
        order: 999,
        ...Platform.select({
            web: {
                marginLeft: 20,
            } as any
        })
    },
    footerLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    logoIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: 'rgba(227, 5, 18, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(227, 5, 18, 0.3)',
    },
    footerBrand: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    footerBrandSub: {
        fontSize: 13,
        fontWeight: '600',
        color: SP_RED,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    headingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    headingAccent: {
        width: 4,
        height: 24,
        backgroundColor: SP_RED,
        borderRadius: 2,
    },
    footerHeading: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },
    footerDesc: {
        color: '#94a3b8',
        lineHeight: 26,
        fontSize: 15,
        marginBottom: 24,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    footerLink: {
        color: '#cbd5e1',
        fontSize: 15,
        fontWeight: '500',
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            } as any
        })
    },
    contactSection: {
        gap: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 15,
        lineHeight: 22,
        flex: 1,
    },
    socialContainer: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    socialTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
    },
    socialLinks: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    socialLinksColumn: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            } as any
        })
    },
    linkHover: {
        ...Platform.select({
            web: { cursor: 'pointer' } as any
        })
    },
    newsletterSection: {
        backgroundColor: 'rgba(227, 5, 18, 0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 40,
        paddingHorizontal: 60,
    },
    newsletterContent: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    newsletterTextContainer: {
        flex: 1,
    },
    newsletterTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    newsletterSubtitle: {
        fontSize: 15,
        color: '#94a3b8',
        lineHeight: 22,
    },
    footerBottom: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 32,
        paddingHorizontal: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    bottomContent: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
    },
    copyright: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    bottomLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    bottomLink: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '500',
        ...Platform.select({
            web: { cursor: 'pointer' } as any
        })
    },
    divider: {
        width: 1,
        height: 16,
        backgroundColor: '#475569',
    },
});
