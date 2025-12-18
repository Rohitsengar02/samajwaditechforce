import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform } from 'react-native';
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

// Helper to get cross-origin props for web images (fixes CORS canvas taint)
const getWebImageProps = () => Platform.OS === 'web' ? { crossOrigin: 'anonymous' as any } : {};


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
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 3 }}>
                {/* LEFT CONTENT (40%): Details */}
                <View style={{ width: '40%', gap: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="phone" size={customization?.mobileFontSize ? customization.mobileFontSize + 2 : 10} color={customization?.mobileColor || '#ffffff'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.mobileFontSize || 8,
                            color: customization?.mobileColor || '#ffffff',
                            backgroundColor: customization?.mobileBackgroundColor || 'transparent',
                        }]}>{details?.mobile || '+91 98765 43210'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4, flexWrap: 'wrap' }}>
                        <MaterialCommunityIcons name="map-marker" size={customization?.addressFontSize ? customization.addressFontSize + 2 : 12} color={customization?.addressColor || '#ffffff'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.addressFontSize || 9,
                            color: customization?.addressColor || '#ffffff',
                            backgroundColor: customization?.addressBackgroundColor || 'transparent',
                            flex: 1,
                            flexWrap: 'wrap',
                        }]}>{details?.address || 'Lucknow, Uttar Pradesh'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={customization?.socialFontSize ? customization.socialFontSize + 2 : 12} color={customization?.socialColor || '#ffffff'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.socialFontSize || 9,
                            color: customization?.socialColor || '#ffffff',
                            backgroundColor: customization?.socialBackgroundColor || 'transparent',
                        }]}>{details?.socialHandle || '@samajwadiparty'}</Text>
                    </View>
                </View>

                {/* GAP (4%) */}
                <View style={{ width: '4%' }} />

                {/* RIGHT CONTENT (Remaining): Photo & Name */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={[styles.textBold, {
                            fontSize: customization?.nameFontSize || 10,
                            color: customization?.nameColor || '#ffffff',
                            backgroundColor: customization?.nameBackgroundColor || 'transparent',
                            textAlign: 'right',
                            flexWrap: 'wrap',
                        }]}>{details?.name || 'Your Name'}</Text>
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 8,
                            color: customization?.designationColor || '#ffffff',
                            backgroundColor: customization?.designationBackgroundColor || 'transparent',
                            textAlign: 'right',
                            flexWrap: 'wrap',
                        }]}>{details?.designation || 'Designation'}</Text>
                    </View>
                    <View style={[styles.photoContainer, {
                        width: customization?.imageSize || 40,
                        height: customization?.imageSize || 40,
                        borderRadius: (customization?.imageSize || 40) / 2,
                        borderColor: customization?.imageBorderColor || SP_GREEN,
                        borderWidth: customization?.imageBorderWidth || 2,
                    }]}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={styles.photo} {...getWebImageProps()} />
                        ) : (
                            <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                        )}
                    </View>
                </View>
            </View>
            {/* Bottom Strip */}
            <LinearGradient colors={[SP_GREEN, '#15803d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 4, width: '100%', position: 'absolute', bottom: 0, left: 0 }} />
        </LinearGradient >
    );
};

// Template 2: Professional Card - Blue gradient with large circular photo
const BoldStripBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || ['#1e3a8a', '#1e40af', '#3b82f6'];

    return (
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 4, gap: 6 }}>
                {/* Large circular photo with golden border */}
                <View style={[styles.photoContainer, {
                    width: customization?.imageSize || 48,
                    height: customization?.imageSize || 48,
                    borderRadius: (customization?.imageSize || 48) / 2,
                    borderColor: customization?.imageBorderColor || '#fbbf24',
                    borderWidth: customization?.imageBorderWidth || 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                }]}>
                    {details?.photo ? (
                        <Image source={{ uri: details.photo }} style={styles.photo} {...getWebImageProps()} />
                    ) : (
                        <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                    )}
                </View>

                {/* Text content */}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.textBold, {
                        fontSize: customization?.nameFontSize || 11,
                        color: customization?.nameColor || '#fbbf24',
                        fontWeight: '900',
                        textShadowColor: 'rgba(0,0,0,0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                    }]} >{details?.name || 'Your Name'}</Text>

                    <Text style={[styles.textRegular, {
                        fontSize: customization?.designationFontSize || 8,
                        color: customization?.designationColor || '#fff',
                        marginTop: 1,
                    }]} >{details?.designation || 'Designation'}</Text>

                    <View style={{ marginTop: 4, gap: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons
                                name="phone"
                                size={(customization?.mobileFontSize || 9) + 1}
                                color='#e0f2fe'
                            />
                            <Text style={{ fontSize: customization?.mobileFontSize || 9, color: customization?.mobileColor || '#e0f2fe' }}>
                                {details?.mobile || '+91 XXXXX'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={(customization?.addressFontSize || 9) + 1}
                                color='#e0f2fe'
                            />
                            <Text style={{ fontSize: customization?.addressFontSize || 9, color: customization?.addressColor || '#e0f2fe', flex: 1, flexWrap: 'wrap' }}>
                                {details?.address || 'Your Address'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons
                                name={getSocialIcon(details?.socialPlatform) as any}
                                size={(customization?.socialFontSize || 9) + 1}
                                color='#e0f2fe'
                            />
                            <Text style={{ fontSize: customization?.socialFontSize || 9, color: customization?.socialColor || '#e0f2fe', flex: 1, flexWrap: 'wrap' }}>
                                {details?.socialHandle || '@user'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient >
    );
};

// Template 3: Modern Minimal - Clean white card with accent line (customizable background)
const MinimalWhiteBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || [SP_RED, '#16a34a'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            {/* Top accent line */}
            <View style={{ height: 2, width: '100%', backgroundColor: 'rgba(255,255,255,0.3)' }} />

            <View style={{ padding: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {/* Compact square-ish photo */}
                <View style={[styles.photoContainer, {
                    width: customization?.imageSize || 45,
                    height: customization?.imageSize || 45,
                    borderRadius: 6,
                    borderColor: customization?.imageBorderColor || '#ffffff',
                    borderWidth: customization?.imageBorderWidth || 2,
                }]}>
                    {details?.photo ? (
                        <Image source={{ uri: details.photo }} style={[styles.photo, { borderRadius: 6 }]} {...getWebImageProps()} />
                    ) : (
                        <Image source={require('../../assets/images/icon.png')} style={[styles.photo, { borderRadius: 6 }]} />
                    )}
                </View>

                {/* Vertical layout for text */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={[styles.textBold, {
                        fontSize: customization?.nameFontSize || 10,
                        color: customization?.nameColor || '#ffffff',
                        marginBottom: 1,
                    }]}>{details?.name || 'Your Name'}</Text>

                    <Text style={[styles.textRegular, {
                        fontSize: customization?.designationFontSize || 8,
                        color: customization?.designationColor || '#ffffff',
                        marginBottom: 1,
                    }]}>{details?.designation || 'Designation'}</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 1, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 8) + 2} color={customization?.mobileColor || '#ffffff'} />
                            <Text style={{ fontSize: customization?.mobileFontSize || 8, color: customization?.mobileColor || '#ffffff' }}>
                                {details?.mobile || '+91...'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 9) + 2} color={customization?.socialColor || '#ffffff'} />
                            <Text style={{ fontSize: customization?.socialFontSize || 9, color: customization?.socialColor || '#ffffff' }}>
                                {details?.socialHandle || '@user'}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1 }}>
                        <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 9) + 2} color={customization?.addressColor || '#ffffff'} />
                        <Text style={{ fontSize: customization?.addressFontSize || 9, color: customization?.addressColor || '#ffffff', flex: 1, flexWrap: 'wrap' }}>
                            {details?.address || 'Your Address'}
                        </Text>
                    </View>
                </View>

                {/* Icon decoration */}
                <MaterialCommunityIcons name="bicycle" size={24} color="rgba(255, 255, 255, 0.2)" />
            </View>
        </LinearGradient>
    );
};

// Template 4: Red Power - Creative split design with geometric accents
const RedAccentBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || [SP_RED, '#b91c1c', '#7f1d1d'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            {/* Decorative elements */}
            <View style={{ position: 'absolute', top: -10, right: 20, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ position: 'absolute', bottom: -5, left: '40%', width: 15, height: 15, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* Main content - Split Layout */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 2, flex: 1 }}>

                {/* LEFT (40%): Details */}
                <View style={{ width: '40%', gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2, flexWrap: 'wrap' }}>
                        <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 9) + 1} color={customization?.mobileColor || '#fff'} />
                        <Text style={{ fontSize: customization?.mobileFontSize || 9, color: customization?.mobileColor || '#fff', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap' }}>{details?.mobile || '+91...'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2, flexWrap: 'wrap' }}>
                        <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 9) + 1} color={customization?.socialColor || '#fff'} />
                        <Text style={{ fontSize: customization?.socialFontSize || 9, color: customization?.socialColor || '#fff', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap' }}>{details?.socialHandle || '@user'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 2, marginTop: 1, flexWrap: 'wrap' }}>
                        <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 8) + 1} color={customization?.addressColor || '#fff'} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: customization?.addressFontSize || 8, color: customization?.addressColor || '#fff', fontWeight: '500', flex: 1, flexWrap: 'wrap' }}>{details?.address || 'Your Address'}</Text>
                    </View>
                </View>

                {/* GAP (4%) */}
                <View style={{ width: '4%' }} />

                {/* RIGHT (Remaining): Photo & Name */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={[styles.textBold, {
                            fontSize: customization?.nameFontSize || 10,
                            color: '#fff',
                            fontWeight: '900',
                            textShadowColor: 'rgba(0,0,0,0.3)',
                            textShadowOffset: { width: 1, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'right'
                        }]} >{details?.name || 'Your Name'}</Text>
                        <View style={{ width: 25, height: 2, backgroundColor: '#fff', marginVertical: 1, borderRadius: 1 }} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 8,
                            color: 'rgba(255,255,255,0.9)',
                            textAlign: 'right'
                        }]} >{details?.designation || 'Designation'}</Text>
                    </View>

                    {/* Photo with glow effect */}
                    <View style={{ position: 'relative' }}>
                        <View style={{ position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        <View style={[styles.photoContainer, {
                            width: customization?.imageSize || 35,
                            height: customization?.imageSize || 35,
                            borderRadius: (customization?.imageSize || 35) / 2,
                            borderColor: '#fff',
                            borderWidth: 1.5,
                        }]}>
                            {details?.photo ? (
                                <Image source={{ uri: details.photo }} style={styles.photo} {...getWebImageProps()} />
                            ) : (
                                <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Right white accent strip */}
            <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, backgroundColor: '#fff' }} />
        </LinearGradient>
    );
};

// Template 5: Golden Elite - Centered photo with symmetrical layout
const YellowThemeBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || ['#fbbf24', '#f59e0b', '#d97706'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            {/* Top brown border */}
            <View style={{ height: 2, width: '100%', backgroundColor: '#78350f' }} />

            {/* Main content area */}
            <View style={{ flex: 1, position: 'relative' }}>
                {/* Crown decoration */}
                <View style={{ position: 'absolute', left: 8, top: 3, opacity: 0.12 }}>
                    <MaterialCommunityIcons name="crown" size={24} color="#78350f" />
                </View>

                {/* Top row: Name (left) | Photo (center) | Contact (right) */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 2 }}>

                    {/* LEFT: Name & Designation */}
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                            <MaterialCommunityIcons name="star" size={8} color="#78350f" />
                            <Text style={[styles.textBold, {
                                fontSize: customization?.nameFontSize || 10,
                                color: customization?.nameColor || '#78350f',
                                fontWeight: '900',
                            }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>
                        </View>
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 8,
                            color: customization?.designationColor || '#92400e',
                            fontStyle: 'italic',
                        }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>
                    </View>

                    {/* CENTER: Photo */}
                    <View style={[styles.photoContainer, {
                        width: customization?.imageSize || 40,
                        height: customization?.imageSize || 40,
                        borderRadius: (customization?.imageSize || 40) / 2,
                        borderColor: customization?.imageBorderColor || '#78350f',
                        borderWidth: 2,
                    }]}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={styles.photo} {...getWebImageProps()} />
                        ) : (
                            <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                        )}
                    </View>

                    {/* RIGHT: Mobile & Social - 60% max width with wrapping */}
                    <View style={{ width: '60%', alignItems: 'flex-end', gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(120,53,15,0.15)', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 9) + 1} color={customization?.mobileColor || '#78350f'} />
                            <Text style={{ fontSize: customization?.mobileFontSize || 9, color: customization?.mobileColor || '#78350f', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap', textAlign: 'right' }}>{details?.mobile || '+91...'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(120,53,15,0.15)', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 9) + 1} color={customization?.socialColor || '#78350f'} />
                            <Text style={{ fontSize: customization?.socialFontSize || 9, color: customization?.socialColor || '#78350f', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap', textAlign: 'right' }}>{details?.socialHandle || '@user'}</Text>
                        </View>
                    </View>
                </View>

                {/* BOTTOM: Address bar - allows multi-line wrapping */}
                <View style={{ backgroundColor: 'rgba(120,53,15,0.15)', paddingVertical: 1, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                    <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 8) + 1} color={customization?.addressColor || '#78350f'} style={{ marginTop: 1 }} />
                    <Text style={{ fontSize: customization?.addressFontSize || 8, color: customization?.addressColor || '#78350f', fontWeight: '500', flex: 1, flexWrap: 'wrap' }}>{details?.address || 'Your Address'}</Text>
                </View>
            </View>
        </LinearGradient>
    );
};

// Template 6: Vibrant Wave - Modern glassmorphism with neon glow
const GradientWaveBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || ['#6366f1', '#8b5cf6', '#d946ef'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 3, position: 'relative', overflow: 'hidden' }}>
                {/* Multiple wave decorations */}
                <View style={{ position: 'absolute', bottom: -15, right: -15, opacity: 0.15 }}>
                    <MaterialCommunityIcons name="wave" size={60} color="#fff" />
                </View>
                <View style={{ position: 'absolute', top: -20, left: 40, opacity: 0.1 }}>
                    <MaterialCommunityIcons name="wave" size={40} color="#fff" />
                </View>

                {/* LEFT (40%): Mobile, Social, Address */}
                <View style={{ width: '40%', gap: 2, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 2, flexWrap: 'wrap' }}>
                        <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 9) + 1} color={customization?.mobileColor || '#fff'} />
                        <Text style={{ fontSize: customization?.mobileFontSize || 9, color: customization?.mobileColor || '#fff', fontWeight: '500', flexShrink: 1, flexWrap: 'wrap' }} numberOfLines={2}>{details?.mobile || '+91...'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 2, flexWrap: 'wrap' }}>
                        <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 9) + 1} color={customization?.socialColor || '#fff'} />
                        <Text style={{ fontSize: customization?.socialFontSize || 9, color: customization?.socialColor || '#fff', fontWeight: '500', flexShrink: 1, flexWrap: 'wrap' }} numberOfLines={2}>{details?.socialHandle || '@user'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 2, flexWrap: 'wrap' }}>
                        <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 9) + 1} color={customization?.addressColor || '#fff'} />
                        <Text style={{ fontSize: customization?.addressFontSize || 9, color: customization?.addressColor || '#fff', fontWeight: '500', flexShrink: 1, flexWrap: 'wrap' }} numberOfLines={2}>{details?.address || 'Address'}</Text>
                    </View>
                </View>

                {/* GAP (4%) */}
                <View style={{ width: '4%' }} />

                {/* RIGHT (Remaining): Photo & Name */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2, marginBottom: 1, alignSelf: 'flex-end', maxWidth: '100%' }}>
                            <Text style={[styles.textBold, {
                                fontSize: customization?.nameFontSize || 10,
                                color: customization?.nameColor || '#fff',
                                fontWeight: '900',
                                flexWrap: 'wrap',
                                textAlign: 'right'
                            }]} numberOfLines={2}>{details?.name || 'Your Name'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <Text style={[styles.textRegular, {
                                fontSize: customization?.designationFontSize || 8,
                                color: customization?.designationColor || 'rgba(255,255,255,0.9)',
                                textAlign: 'right',
                                flex: 1,
                                flexWrap: 'wrap',
                            }]} numberOfLines={2}>{details?.designation || 'Designation'}</Text>
                            <MaterialCommunityIcons name="star-circle" size={8} color="rgba(255,255,255,0.8)" />
                        </View>
                    </View>

                    {/* Photo with glow ring */}
                    <View style={{ position: 'relative' }}>
                        <View style={{
                            position: 'absolute',
                            top: -3, left: -3, right: -3, bottom: -3,
                            borderRadius: 24,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                        }} />
                        <View style={[styles.photoContainer, {
                            width: customization?.imageSize || 42,
                            height: customization?.imageSize || 42,
                            borderRadius: (customization?.imageSize || 42) / 2,
                            borderColor: customization?.imageBorderColor || '#fff',
                            borderWidth: 2,
                        }]}>
                            {details?.photo ? (
                                <Image source={{ uri: details.photo }} style={styles.photo} {...getWebImageProps()} />
                            ) : (
                                <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                            )}
                        </View>
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
