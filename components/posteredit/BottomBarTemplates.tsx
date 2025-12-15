import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Helper function to get social media icon
const getSocialIcon = (platform?: string): string => {
    switch (platform) {
        case 'twitter': return 'twitter';
        case 'facebook': return 'facebook';
        case 'instagram': return 'instagram';
        case 'youtube': return 'youtube';
        case 'linkedin': return 'linkedin';
        case 'whatsapp': return 'whatsapp';
        default: return 'twitter';
    }
};

export const TEMPLATES = [
    { id: 'default', name: '🎯 Classic Frame' },
    { id: 'bold_strip', name: '💎 Professional Card' },
    { id: 'minimal_white', name: '✨ Modern Minimal' },
    { id: 'red_accent', name: '🔴 Red Power' },
    { id: 'gradient_wave', name: '🌊 Vibrant Wave' },
];

interface TemplateCustomization {
    backgroundType?: 'solid' | 'gradient';
    backgroundColor?: string;
    backgroundGradient?: string[];
    backgroundOpacity?: number;
    imageSize?: number;
    imageBorderColor?: string;
    imageBorderWidth?: number;
    nameFontSize?: number;
    nameColor?: string;
    nameBackgroundColor?: string;
    nameFontFamily?: string;
    designationFontSize?: number;
    designationColor?: string;
    designationBackgroundColor?: string;
    designationFontFamily?: string;
    mobileFontSize?: number;
    mobileColor?: string;
    mobileBackgroundColor?: string;
    addressFontSize?: number;
    addressColor?: string;
    addressBackgroundColor?: string;
    socialFontSize?: number;
    socialColor?: string;
    socialBackgroundColor?: string;
}

interface TemplateProps {
    details: any;
    width: number;
    customization?: TemplateCustomization;
}

// Template 1: Classic Frame - Traditional horizontal layout with party strip
const DefaultBar = ({ details, width, customization }: TemplateProps) => {
    const isSolid = customization?.backgroundType === 'solid';
    const bgColors = isSolid
        ? [customization?.backgroundColor || SP_RED, customization?.backgroundColor || SP_RED]
        : (customization?.backgroundGradient || [SP_RED, '#16a34a']);

    return (
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, height: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                <View style={[styles.photoContainer, {
                    width: customization?.imageSize || 100,
                    height: customization?.imageSize || 100,
                    borderRadius: (customization?.imageSize || 100) / 2,
                    borderColor: customization?.imageBorderColor || SP_RED,
                    borderWidth: customization?.imageBorderWidth || 2,
                }]}>
                    {details?.photo ? (
                        <Image source={{ uri: details.photo }} style={styles.photo} />
                    ) : (
                        <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                    )}
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.textBold, {
                        fontSize: customization?.nameFontSize || 15,
                        color: customization?.nameColor || '#ffffff',
                        backgroundColor: customization?.nameBackgroundColor || 'transparent',
                    }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>
                    <Text style={[styles.textRegular, {
                        fontSize: customization?.designationFontSize || 15,
                        color: customization?.designationColor || '#ffffff',
                        backgroundColor: customization?.designationBackgroundColor || 'transparent',
                    }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>
                </View>
                <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="phone" size={customization?.mobileFontSize ? customization.mobileFontSize + 4 : 20} color={customization?.mobileColor || '#ffffff'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.mobileFontSize || 15,
                            color: customization?.mobileColor || '#ffffff',
                            backgroundColor: customization?.mobileBackgroundColor || 'transparent',
                        }]}>{details?.mobile || '+91 98765 43210'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="map-marker" size={customization?.addressFontSize ? customization.addressFontSize + 6 : 20} color={customization?.addressColor || '#ffffff'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.addressFontSize || 15,
                            color: customization?.addressColor || '#ffffff',
                            backgroundColor: customization?.addressBackgroundColor || 'transparent',
                            flex: 1,
                        }]} numberOfLines={2}>{details?.address || 'Lucknow, Uttar Pradesh'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={customization?.socialFontSize ? customization.socialFontSize + 4 : 20} color={customization?.socialColor || '#ffffff'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.socialFontSize || 15,
                            color: customization?.socialColor || '#ffffff',
                            backgroundColor: customization?.socialBackgroundColor || 'transparent',
                        }]}>{details?.socialHandle || '@samajwadiparty'}</Text>
                    </View>
                </View>
            </View>
            {/* Bottom Strip */}
            <LinearGradient colors={[SP_GREEN, '#15803d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, width: '100%', position: 'absolute', bottom: 0, left: 0 }} />
        </LinearGradient >
    );
};

// Template 2: Professional Card - Blue gradient with large circular photo
const BoldStripBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || ['#1e3a8a', '#1e40af', '#3b82f6'];

    return (
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, height: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 }}>
                {/* Large circular photo with golden border */}
                <View style={[styles.photoContainer, {
                    width: customization?.imageSize || 100,
                    height: customization?.imageSize || 100,
                    borderRadius: (customization?.imageSize || 100) / 2,
                    borderColor: customization?.imageBorderColor || '#fbbf24',
                    borderWidth: customization?.imageBorderWidth || 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }]}>
                    {details?.photo ? (
                        <Image source={{ uri: details.photo }} style={styles.photo} />
                    ) : (
                        <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                    )}
                </View>

                {/* Text content */}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.textBold, {
                        fontSize: customization?.nameFontSize || 15,
                        color: customization?.nameColor || '#fbbf24',
                        fontWeight: '900',
                        textShadowColor: 'rgba(0,0,0,0.3)',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                    }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>

                    <Text style={[styles.textRegular, {
                        fontSize: customization?.designationFontSize || 15,
                        color: customization?.designationColor || '#fff',
                        marginTop: 4,
                    }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>

                    <View style={{ marginTop: 8, gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons
                                name="phone"
                                size={(customization?.mobileFontSize || 15) + 1}
                                color='#e0f2fe'
                            />
                            <Text style={{ fontSize: customization?.mobileFontSize || 15, color: customization?.mobileColor || '#e0f2fe' }}>
                                {details?.mobile || '+91 XXXXX'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={(customization?.addressFontSize || 15) + 1}
                                color='#e0f2fe'
                            />
                            <Text style={{ fontSize: customization?.addressFontSize || 15, color: customization?.addressColor || '#e0f2fe' }} numberOfLines={1}>
                                {details?.address || 'Your Address'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons
                                name={getSocialIcon(details?.socialPlatform) as any}
                                size={(customization?.socialFontSize || 15) + 1}
                                color='#e0f2fe'
                            />
                            <Text style={{ fontSize: customization?.socialFontSize || 15, color: customization?.socialColor || '#e0f2fe' }} numberOfLines={1}>
                                {details?.social || '@user'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

// Template 3: Modern Minimal - Clean white card with accent line (customizable background)
const MinimalWhiteBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || [SP_RED, '#16a34a'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, height: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
            {/* Top accent line */}
            <View style={{ height: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.3)' }} />

            <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {/* Compact square-ish photo */}
                <View style={[styles.photoContainer, {
                    width: customization?.imageSize || 100,
                    height: customization?.imageSize || 100,
                    borderRadius: 12,
                    borderColor: customization?.imageBorderColor || '#ffffff',
                    borderWidth: customization?.imageBorderWidth || 2,
                }]}>
                    {details?.photo ? (
                        <Image source={{ uri: details.photo }} style={[styles.photo, { borderRadius: 10 }]} />
                    ) : (
                        <Image source={require('../../assets/images/icon.png')} style={[styles.photo, { borderRadius: 10 }]} />
                    )}
                </View>

                {/* Vertical layout for text */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={[styles.textBold, {
                        fontSize: customization?.nameFontSize || 15,
                        color: customization?.nameColor || '#ffffff',
                        marginBottom: 2,
                    }]}>{details?.name || 'Your Name'}</Text>

                    <Text style={[styles.textRegular, {
                        fontSize: customization?.designationFontSize || 15,
                        color: customization?.designationColor || '#ffffff',
                        marginBottom: 4,
                    }]}>{details?.designation || 'Designation'}</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 15) + 2} color={customization?.mobileColor || '#ffffff'} />
                            <Text style={{ fontSize: customization?.mobileFontSize || 15, color: customization?.mobileColor || '#ffffff' }}>
                                {details?.mobile || '+91...'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 15) + 2} color={customization?.socialColor || '#ffffff'} />
                            <Text style={{ fontSize: customization?.socialFontSize || 15, color: customization?.socialColor || '#ffffff' }}>
                                {details?.socialHandle || '@user'}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 15) + 2} color={customization?.addressColor || '#ffffff'} />
                        <Text style={{ fontSize: customization?.addressFontSize || 15, color: customization?.addressColor || '#ffffff' }}>
                            {details?.address || 'Your Address'}
                        </Text>
                    </View>
                </View>

                {/* Icon decoration */}
                <MaterialCommunityIcons name="bicycle" size={40} color="rgba(255, 255, 255, 0.2)" />
            </View>
        </LinearGradient>
    );
};

// Template 4: Red Power - Creative split design with geometric accents
const RedAccentBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || [SP_RED, '#b91c1c', '#7f1d1d'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, height: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
            {/* Decorative elements */}
            <View style={{ position: 'absolute', top: -15, right: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ position: 'absolute', bottom: -10, left: '40%', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* Main content */}
            <View style={{ flex: 1, position: 'relative' }}>
                {/* Top section: Photo + Name */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 6 }}>

                    {/* Photo with glow effect */}
                    <View style={{ position: 'relative', marginRight: 10 }}>
                        <View style={{ position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        <View style={[styles.photoContainer, {
                            width: customization?.imageSize || 50,
                            height: customization?.imageSize || 50,
                            borderRadius: 25,
                            borderColor: '#fff',
                            borderWidth: 2,
                        }]}>
                            {details?.photo ? (
                                <Image source={{ uri: details.photo }} style={styles.photo} />
                            ) : (
                                <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                            )}
                        </View>
                    </View>

                    {/* Name & Designation */}
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.textBold, {
                            fontSize: customization?.nameFontSize || 14,
                            color: '#fff',
                            fontWeight: '900',
                            textShadowColor: 'rgba(0,0,0,0.3)',
                            textShadowOffset: { width: 1, height: 1 },
                            textShadowRadius: 2,
                        }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>
                        <View style={{ width: 40, height: 2, backgroundColor: '#fff', marginVertical: 3, borderRadius: 1 }} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 11,
                            color: 'rgba(255,255,255,0.9)',
                        }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>
                    </View>

                    {/* Social & Mobile (stacked on right) */}
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 10) + 2} color={customization?.mobileColor || '#fff'} />
                            <Text style={{ fontSize: customization?.mobileFontSize || 10, color: customization?.mobileColor || '#fff', fontWeight: '600' }} numberOfLines={1}>{details?.mobile || '+91...'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 10) + 2} color={customization?.socialColor || '#fff'} />
                            <Text style={{ fontSize: customization?.socialFontSize || 10, color: customization?.socialColor || '#fff', fontWeight: '600' }} numberOfLines={1}>{details?.socialHandle || '@user'}</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom address bar */}
                <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 4, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 10) + 2} color={customization?.addressColor || '#fff'} />
                    <Text style={{ fontSize: customization?.addressFontSize || 10, color: customization?.addressColor || '#fff', fontWeight: '500' }} numberOfLines={1}>{details?.address || 'Your Address'}</Text>
                </View>
            </View>

            {/* Right white accent strip */}
            <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#fff' }} />
        </LinearGradient>
    );
};

// Template 5: Golden Elite - Centered photo with symmetrical layout
const YellowThemeBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || ['#fbbf24', '#f59e0b', '#d97706'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, height: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
            {/* Top brown border */}
            <View style={{ height: 3, width: '100%', backgroundColor: '#78350f' }} />

            {/* Main content area */}
            <View style={{ flex: 1, position: 'relative' }}>
                {/* Crown decoration */}
                <View style={{ position: 'absolute', left: 10, top: 5, opacity: 0.12 }}>
                    <MaterialCommunityIcons name="crown" size={40} color="#78350f" />
                </View>

                {/* Top row: Name (left) | Photo (center) | Contact (right) */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 6 }}>

                    {/* LEFT: Name & Designation */}
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <MaterialCommunityIcons name="star" size={12} color="#78350f" />
                            <Text style={[styles.textBold, {
                                fontSize: customization?.nameFontSize || 13,
                                color: customization?.nameColor || '#78350f',
                                fontWeight: '900',
                            }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>
                        </View>
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 10,
                            color: customization?.designationColor || '#92400e',
                            fontStyle: 'italic',
                        }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>
                    </View>

                    {/* CENTER: Photo */}
                    <View style={[styles.photoContainer, {
                        width: customization?.imageSize || 55,
                        height: customization?.imageSize || 55,
                        borderRadius: (customization?.imageSize || 55) / 2,
                        borderColor: customization?.imageBorderColor || '#78350f',
                        borderWidth: 3,
                    }]}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={styles.photo} />
                        ) : (
                            <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                        )}
                    </View>

                    {/* RIGHT: Mobile & Social */}
                    <View style={{ flex: 1, alignItems: 'flex-end', gap: 3 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(120,53,15,0.15)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 10) + 2} color={customization?.mobileColor || '#78350f'} />
                            <Text style={{ fontSize: customization?.mobileFontSize || 10, color: customization?.mobileColor || '#78350f', fontWeight: '600' }} numberOfLines={1}>{details?.mobile || '+91...'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(120,53,15,0.15)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 10) + 2} color={customization?.socialColor || '#78350f'} />
                            <Text style={{ fontSize: customization?.socialFontSize || 10, color: customization?.socialColor || '#78350f', fontWeight: '600' }} numberOfLines={1}>{details?.socialHandle || '@user'}</Text>
                        </View>
                    </View>
                </View>

                {/* BOTTOM: Address bar */}
                <View style={{ backgroundColor: 'rgba(120,53,15,0.15)', paddingVertical: 3, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 10) + 2} color={customization?.addressColor || '#78350f'} />
                    <Text style={{ fontSize: customization?.addressFontSize || 10, color: customization?.addressColor || '#78350f', fontWeight: '600' }} numberOfLines={1}>{details?.address || 'Your Address'}</Text>
                </View>
            </View>

            {/* Bottom brown border */}
            <View style={{ height: 3, width: '100%', backgroundColor: '#78350f' }} />
        </LinearGradient>
    );
};

// Template 6: Vibrant Wave - Modern glassmorphism with neon glow
const GradientWaveBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || ['#6366f1', '#8b5cf6', '#d946ef'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bottomBar, { width, height: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10, position: 'relative', overflow: 'hidden' }}>
                {/* Multiple wave decorations */}
                <View style={{ position: 'absolute', bottom: -15, right: -15, opacity: 0.15 }}>
                    <MaterialCommunityIcons name="wave" size={100} color="#fff" />
                </View>
                <View style={{ position: 'absolute', top: -20, left: 50, opacity: 0.1 }}>
                    <MaterialCommunityIcons name="wave" size={60} color="#fff" />
                </View>

                {/* Photo with glow ring */}
                <View style={{ position: 'relative' }}>
                    <View style={{
                        position: 'absolute',
                        top: -4, left: -4, right: -4, bottom: -4,
                        borderRadius: 40,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                    }} />
                    <View style={[styles.photoContainer, {
                        width: customization?.imageSize || 65,
                        height: customization?.imageSize || 65,
                        borderRadius: (customization?.imageSize || 65) / 2,
                        borderColor: customization?.imageBorderColor || '#fff',
                        borderWidth: 2,
                    }]}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={styles.photo} />
                        ) : (
                            <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                        )}
                    </View>
                </View>

                {/* Name & Designation with glass card */}
                <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4, alignSelf: 'flex-start' }}>
                        <Text style={[styles.textBold, {
                            fontSize: customization?.nameFontSize || 14,
                            color: customization?.nameColor || '#fff',
                            fontWeight: '900',
                        }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="star-circle" size={12} color="rgba(255,255,255,0.8)" />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 11,
                            color: customization?.designationColor || 'rgba(255,255,255,0.9)',
                        }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>
                    </View>
                </View>

                {/* Contact Info in glass pills */}
                <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 10) + 2} color={customization?.mobileColor || '#fff'} />
                        <Text style={{ fontSize: customization?.mobileFontSize || 10, color: customization?.mobileColor || '#fff', fontWeight: '500' }} numberOfLines={1}>{details?.mobile || '+91...'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 10) + 2} color={customization?.socialColor || '#fff'} />
                        <Text style={{ fontSize: customization?.socialFontSize || 10, color: customization?.socialColor || '#fff', fontWeight: '500' }} numberOfLines={1}>{details?.socialHandle || '@user'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 10) + 2} color={customization?.addressColor || '#fff'} />
                        <Text style={{ fontSize: customization?.addressFontSize || 10, color: customization?.addressColor || '#fff', fontWeight: '500' }} numberOfLines={1}>{details?.address || 'Address'}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

export const renderTemplate = (templateIdOrProps: string | { template?: string; templateId?: string; details: any; width: number; customization?: TemplateCustomization }, details?: any, width?: number, customization?: TemplateCustomization) => {
    // Handle both old and new API
    let templateId: string;
    let finalDetails: any;
    let finalWidth: number;
    let finalCustomization: TemplateCustomization | undefined;

    if (typeof templateIdOrProps === 'string') {
        // Old API: renderTemplate(templateId, details, width, customization)
        templateId = templateIdOrProps;
        finalDetails = details;
        finalWidth = width || 300;
        finalCustomization = customization;
    } else {
        // New API: renderTemplate({ template, details, width, customization })
        templateId = templateIdOrProps.template || templateIdOrProps.templateId || 'default';
        finalDetails = templateIdOrProps.details;
        finalWidth = templateIdOrProps.width;
        finalCustomization = templateIdOrProps.customization;
    }

    switch (templateId) {
        case 'bold_strip':
            return <BoldStripBar details={finalDetails} width={finalWidth} customization={finalCustomization} />;
        case 'minimal_white':
            return <MinimalWhiteBar details={finalDetails} width={finalWidth} customization={finalCustomization} />;
        case 'red_accent':
            return <RedAccentBar details={finalDetails} width={finalWidth} customization={finalCustomization} />;
        case 'gradient_wave':
            return <GradientWaveBar details={finalDetails} width={finalWidth} customization={finalCustomization} />;
        default:
            return <DefaultBar details={finalDetails} width={finalWidth} customization={finalCustomization} />;
    }
};

// Backwards compatibility alias
export const RenderBottomBar = renderTemplate;

const styles = StyleSheet.create({
    bottomBar: {
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    photoContainer: {
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    textBold: {
        fontWeight: '700',
    },
    textRegular: {
        fontWeight: '500',
    },
});
