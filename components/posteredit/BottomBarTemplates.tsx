import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import frame assets
const frame1 = require('../../assets/images/frame1.png');
const frame2 = require('../../assets/images/frame2.png');
const frame3 = require('../../assets/images/frame3.png');
const logo = require('../../assets/images/icon.png');

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
    { id: 'stf_bold', name: '� STF Bold' },
    { id: 'stf_rounded', name: '� STF Rounded' },
    { id: 'stf_tabbed', name: '📑 STF Tabbed' },
    { id: 'image_frame1', name: '�️ STF Frame 1' },
    { id: 'image_frame2', name: '�️ STF Frame 2' },
    { id: 'image_frame3', name: '�️ STF Frame 3' },
    { id: 'bold_strip', name: '� Professional Card' },
    { id: 'red_accent', name: '� Red Power' },
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
    customColor1?: string;
    customColor2?: string;
}

interface TemplateProps {
    details: any;
    width: number;
    customization?: TemplateCustomization;
    photoPosition?: { x: number; y: number };
    isPhotoFlipped?: boolean;
}


// Template 2: Professional Card - Blue gradient with large circular photo
const BoldStripBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient && customization.backgroundGradient.length > 0 && customization.backgroundGradient[0] !== customization.backgroundGradient[1]
        ? customization.backgroundGradient
        : [SP_RED, SP_GREEN]; // Red to green gradient default

    return (
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, minHeight: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
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
                    }]} >{details?.name || 'Your Name'}</Text>

                    <Text style={[styles.textRegular, {
                        fontSize: customization?.designationFontSize || 15,
                        color: customization?.designationColor || '#fff',
                        marginTop: 4,
                    }]} >{details?.designation || 'Designation'}</Text>

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
                            <Text style={{ fontSize: customization?.addressFontSize || 15, color: customization?.addressColor || '#e0f2fe', flex: 1, flexWrap: 'wrap' }}>
                                {details?.address || 'Your Address'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons
                                name={getSocialIcon(details?.socialPlatform) as any}
                                size={(customization?.socialFontSize || 15) + 1}
                                color='#e0f2fe'
                            />
                            <Text style={{ fontSize: customization?.socialFontSize || 15, color: customization?.socialColor || '#e0f2fe', flex: 1, flexWrap: 'wrap' }}>
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
    const bgColors = customization?.backgroundGradient && customization.backgroundGradient.length > 0 && customization.backgroundGradient[0] !== customization.backgroundGradient[1]
        ? customization.backgroundGradient
        : [SP_RED, SP_GREEN]; // Red to green gradient default

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, minHeight: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
            {/* Top accent line */}
            <View style={{ height: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.3)' }} />

            <View style={{ padding: 12, paddingVertical: 0, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
    const bgColors = customization?.backgroundGradient && customization.backgroundGradient.length > 0 && customization.backgroundGradient[0] !== customization.backgroundGradient[1]
        ? customization.backgroundGradient
        : [SP_RED, SP_GREEN]; // Red to green gradient default

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, minHeight: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
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
                        }]} >{details?.name || 'Your Name'}</Text>
                        <View style={{ width: 40, height: 2, backgroundColor: '#fff', marginVertical: 3, borderRadius: 1 }} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 11,
                            color: 'rgba(255,255,255,0.9)',
                        }]} >{details?.designation || 'Designation'}</Text>
                    </View>

                    {/* Social & Mobile (stacked on right) - 50% max width with wrapping */}
                    <View style={{ width: '50%', alignItems: 'flex-end', gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 10) + 2} color={customization?.mobileColor || '#fff'} />
                            <Text style={{ fontSize: customization?.mobileFontSize || 10, color: customization?.mobileColor || '#fff', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap', textAlign: 'right' }}>{details?.mobile || '+91...'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 10) + 2} color={customization?.socialColor || '#fff'} />
                            <Text style={{ fontSize: customization?.socialFontSize || 10, color: customization?.socialColor || '#fff', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap', textAlign: 'right' }}>{details?.socialHandle || '@user'}</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom address bar - allows multi-line wrapping */}
                <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 4, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 10) + 2} color={customization?.addressColor || '#fff'} style={{ marginTop: 2 }} />
                    <Text style={{ fontSize: customization?.addressFontSize || 10, color: customization?.addressColor || '#fff', fontWeight: '500', flexShrink: 1, flexWrap: 'wrap', textAlign: 'center' }}>{details?.address || 'Your Address'}</Text>
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
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bottomBar, { width, minHeight: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
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

                    {/* RIGHT: Mobile & Social - 60% max width with wrapping */}
                    <View style={{ width: '60%', alignItems: 'flex-end', gap: 3 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(120,53,15,0.15)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, maxWidth: '100%', flexWrap: 'wrap' }}>
                            <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 10) + 2} color={customization?.mobileColor || '#78350f'} />
                            <Text style={{ fontSize: customization?.mobileFontSize || 10, color: customization?.mobileColor || '#78350f', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap' }}>{details?.mobile || '+91...'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(120,53,15,0.15)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, maxWidth: '100%', flexWrap: 'wrap' }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 10) + 2} color={customization?.socialColor || '#78350f'} />
                            <Text style={{ fontSize: customization?.socialFontSize || 10, color: customization?.socialColor || '#78350f', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap' }}>{details?.socialHandle || '@user'}</Text>
                        </View>
                    </View>
                </View>

                {/* BOTTOM: Address bar - allows multi-line wrapping */}
                <View style={{ backgroundColor: 'rgba(120,53,15,0.15)', paddingVertical: 4, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                    <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 10) + 2} color={customization?.addressColor || '#78350f'} style={{ marginTop: 2 }} />
                    <Text style={{ fontSize: customization?.addressFontSize || 10, color: customization?.addressColor || '#78350f', fontWeight: '600', flex: 1, flexWrap: 'wrap' }}>{details?.address || 'Your Address'}</Text>
                </View>
            </View>

            {/* Bottom brown border */}
            <View style={{ height: 3, width: '100%', backgroundColor: '#78350f' }} />
        </LinearGradient>
    );
};

// Template 6: Vibrant Wave - Modern glassmorphism with neon glow
const GradientWaveBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient && customization.backgroundGradient.length > 0 && customization.backgroundGradient[0] !== customization.backgroundGradient[1]
        ? customization.backgroundGradient
        : [SP_RED, SP_GREEN]; // Red to green gradient default

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bottomBar, { width, minHeight: '100%', opacity: customization?.backgroundOpacity || 1 }]}>
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

                {/* Contact Info in glass pills - 60% width to prevent collision */}
                <View style={{ width: '60%', alignItems: 'flex-end', gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <MaterialCommunityIcons name="phone" size={(customization?.mobileFontSize || 10) + 2} color={customization?.mobileColor || '#fff'} />
                        <Text style={{ fontSize: customization?.mobileFontSize || 10, color: customization?.mobileColor || '#fff', fontWeight: '500', flexShrink: 1, flexWrap: 'wrap', textAlign: 'right' }}>{details?.mobile || '+91...'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={(customization?.socialFontSize || 10) + 2} color={customization?.socialColor || '#fff'} />
                        <Text style={{ fontSize: customization?.socialFontSize || 10, color: customization?.socialColor || '#fff', fontWeight: '500', flexShrink: 1, flexWrap: 'wrap', textAlign: 'right' }}>{details?.socialHandle || '@user'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <MaterialCommunityIcons name="map-marker" size={(customization?.addressFontSize || 10) + 2} color={customization?.addressColor || '#fff'} />
                        <Text style={{ fontSize: customization?.addressFontSize || 10, color: customization?.addressColor || '#fff', fontWeight: '500', flexShrink: 1, flexWrap: 'wrap', textAlign: 'right' }}>{details?.address || 'Address'}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

// Template 7: Curved Tech Frame - STF Special

// Template 8: Bold STF - Image Frame (frame1)
const StfBoldFrame = ({ details, width, customization, photoPosition, isPhotoFlipped }: TemplateProps) => {
    const photoX = photoPosition?.x ?? 1;
    const photoY = photoPosition?.y ?? -180;

    return (
        <View style={[styles.bottomBar, { width, height: 120, padding: 0, justifyContent: 'flex-start', overflow: 'visible' }]}>
            {/* User Photo - Behind Frame - Right Side - Large Square */}
            <View style={{ position: 'absolute', right: photoX, top: photoY, height: 240, zIndex: 16 }}>
                <View style={{
                    width: 270,
                    height: 300,
                    overflow: 'hidden',
                    transform: [{ scaleX: isPhotoFlipped ? -1 : 1 }]
                }}>
                    {details?.photoNoBg ? (
                        <Image source={{ uri: details.photoNoBg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : details?.photo ? (
                        <Image source={{ uri: details.photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="account" size={80} color="#cbd5e1" />
                        </View>
                    )}
                </View>
            </View>

            {/* Frame Image Overlay (Middle Layer) */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 12 }}>
                <Image source={frame1} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
            </View>

            {/* Content Layer (Top - Above Frame) */}
            <View style={{ position: 'absolute', left: '20%', top: -20, bottom: 0, width: '50%', alignItems: 'flex-start', justifyContent: 'center', zIndex: 20 }}>
                {/* Details (Left Aligned) */}
                <View style={{ alignItems: 'flex-start' }}>
                    <Text style={[styles.textBold, { fontSize: customization?.nameFontSize || 18, color: customization?.nameColor || '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.name || 'Your Name'}</Text>
                    <Text style={[styles.textRegular, { fontSize: customization?.designationFontSize || 12, color: customization?.designationColor || '#fff', opacity: 0.9, textAlign: 'left', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.designation || 'Designation'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10, justifyContent: 'flex-start' }}>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.mobile}</Text>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9 }}>|</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={12} color="#fff" />
                            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.socialHandle}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Address at Bottom of Frame */}
            <View style={{ position: 'absolute', bottom: 8, left: 119, right: 5, zIndex: 20 }}>
                <Text style={[styles.textBold, { fontSize: 11, color: '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>
                    {details?.address || 'Address'}
                </Text>
            </View>
        </View>
    );
};
// Template 9: Rounded STF - Image Frame (frame2)
const StfRoundedFrame = ({ details, width, customization, photoPosition, isPhotoFlipped }: TemplateProps) => {
    const photoX = photoPosition?.x ?? 1;
    const photoY = photoPosition?.y ?? -240;

    return (
        <View style={[styles.bottomBar, { width, height: 120, padding: 0, justifyContent: 'flex-start', overflow: 'visible' }]}>
            {/* User Photo - ABOVE Frame - Right Side - Large Square */}
            <View style={{ position: 'absolute', right: photoX, top: photoY, height: 240, zIndex: 16 }}>
                <View style={{
                    width: 270,
                    height: 300,
                    overflow: 'hidden',
                    transform: [{ scaleX: isPhotoFlipped ? -1 : 1 }]
                }}>
                    {details?.photoNoBg ? (
                        <Image source={{ uri: details.photoNoBg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : details?.photo ? (
                        <Image source={{ uri: details.photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="account" size={80} color="#cbd5e1" />
                        </View>
                    )}
                </View>
            </View>

            {/* Frame Image Overlay (Middle Layer) */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 12 }}>
                <Image source={frame2} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
            </View>

            {/* Content Layer (Top - Above Frame) - LEFT ALIGNED */}
            <View style={{ position: 'absolute', left: '25%', top: -1, bottom: 0, width: '50%', alignItems: 'flex-start', justifyContent: 'center', zIndex: 20 }}>
                {/* Details (Left Aligned) */}
                <View style={{ alignItems: 'flex-start' }}>
                    <Text style={[styles.textBold, { fontSize: customization?.nameFontSize || 18, color: customization?.nameColor || '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.name || 'Your Name'}</Text>
                    <Text style={[styles.textRegular, { fontSize: customization?.designationFontSize || 12, color: customization?.designationColor || '#fff', opacity: 0.9, textAlign: 'left', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.designation || 'Designation'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10, justifyContent: 'flex-start' }}>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.mobile}</Text>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9 }}>|</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={12} color="#fff" />
                            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.socialHandle}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Address at Bottom of Frame */}
            <View style={{ position: 'absolute', bottom: 5, left: 140, right: 5, zIndex: 20 }}>
                <Text style={[styles.textBold, { fontSize: 11, color: '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>
                    {details?.address || 'Address'}
                </Text>
            </View>
        </View>
    );
};

// Template 10: Tabbed STF - Image Frame (frame3)
const StfTabbedFrame = ({ details, width, customization, photoPosition, isPhotoFlipped }: TemplateProps) => {
    const photoX = photoPosition?.x ?? 1;
    const photoY = photoPosition?.y ?? -240;

    return (
        <View style={[styles.bottomBar, { width, height: 120, padding: 0, justifyContent: 'flex-start', overflow: 'visible' }]}>
            {/* User Photo - ABOVE Frame - Right Side - Large Square */}
            <View style={{ position: 'absolute', right: photoX, top: photoY, height: 240, zIndex: 16 }}>
                <View style={{
                    width: 270,
                    height: 300,
                    overflow: 'hidden',
                    transform: [{ scaleX: isPhotoFlipped ? -1 : 1 }]
                }}>
                    {details?.photoNoBg ? (
                        <Image source={{ uri: details.photoNoBg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : details?.photo ? (
                        <Image source={{ uri: details.photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="account" size={80} color="#cbd5e1" />
                        </View>
                    )}
                </View>
            </View>

            {/* Frame Image Overlay (Middle Layer) */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 12 }}>
                <Image source={frame3} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
            </View>

            {/* Content Layer (Top - Above Frame) - LEFT ALIGNED */}
            <View style={{ position: 'absolute', left: '25%', top: -35, bottom: 0, width: '50%', alignItems: 'flex-start', justifyContent: 'center', zIndex: 20 }}>
                {/* Details (Left Aligned) */}
                <View style={{ alignItems: 'flex-start' }}>
                    <Text style={[styles.textBold, { fontSize: customization?.nameFontSize || 18, color: customization?.nameColor || '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.name || 'Your Name'}</Text>
                    <Text style={[styles.textRegular, { fontSize: customization?.designationFontSize || 12, color: customization?.designationColor || '#fff', opacity: 0.9, textAlign: 'left', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.designation || 'Designation'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10, justifyContent: 'flex-start' }}>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.mobile}</Text>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9 }}>|</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={12} color="#fff" />
                            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.socialHandle}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Address at Bottom of Frame */}
            <View style={{ position: 'absolute', bottom: 15, left: 139, right: 5, zIndex: 20 }}>
                <Text style={[styles.textBold, { fontSize: 11, color: '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>
                    {details?.address || 'Address'}
                </Text>
            </View>
        </View>
    );
};

// Template 12: Image Frame 1 - Asset Overlay
const ImageFrame1 = ({ details, width, customization }: TemplateProps) => {
    return (
        <View style={[styles.bottomBar, { width, height: 120, padding: 0, justifyContent: 'flex-start' }]}>
            {/* Content Layer (Layers Under Frame) */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, position: 'relative', zIndex: 10 }}>
                {/* Left: Logo */}
                <View style={{ marginRight: 15 }}>
                    <Image source={logo} style={{ width: 50, height: 50, resizeMode: 'contain', backgroundColor: '#fff', borderRadius: 25 }} />
                </View>

                {/* Center: Details */}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.textBold, { fontSize: customization?.nameFontSize || 18, color: customization?.nameColor || '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.name || 'Your Name'}</Text>
                    <Text style={[styles.textRegular, { fontSize: customization?.designationFontSize || 12, color: customization?.designationColor || '#fff', opacity: 0.9, textAlign: 'left', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.designation || 'Designation'}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }}>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.mobile}</Text>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9 }}>|</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={12} color="#fff" />
                            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.socialHandle}</Text>
                        </View>
                    </View>
                </View>

                {/* Right: User Photo */}
                <View style={{ marginBottom: 15 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialCommunityIcons name="account" size={40} color="#cbd5e1" />
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Frame Image Overlay (Front) */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}>
                <Image source={frame1} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
            </View>
        </View>
    );
};

// Template 13: Image Frame 2 - Asset Overlay
const ImageFrame2 = ({ details, width, customization }: TemplateProps) => {
    return (
        <View style={[styles.bottomBar, { width, height: 120, padding: 0, justifyContent: 'flex-start' }]}>
            {/* Content Layer (Behind Frame) */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, position: 'relative', zIndex: 10 }}>
                {/* Left: Logo */}
                <View style={{ marginRight: 15 }}>
                    <Image source={logo} style={{ width: 50, height: 50, resizeMode: 'contain', backgroundColor: '#fff', borderRadius: 25 }} />
                </View>

                {/* Center: Details */}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.textBold, { fontSize: customization?.nameFontSize || 18, color: customization?.nameColor || '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.name || 'Your Name'}</Text>
                    <Text style={[styles.textRegular, { fontSize: customization?.designationFontSize || 12, color: customization?.designationColor || '#fff', opacity: 0.9, textAlign: 'left', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.designation || 'Designation'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }}>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.mobile}</Text>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9 }}>|</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={12} color="#fff" />
                            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.socialHandle}</Text>
                        </View>
                    </View>
                </View>

                {/* Right: User Photo */}
                <View style={{ marginBottom: 15 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialCommunityIcons name="account" size={40} color="#cbd5e1" />
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Frame Image Overlay (Front) */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}>
                <Image source={frame2} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
            </View>
        </View>
    );
};

// Template 14: Image Frame 3 - Asset Overlay
const ImageFrame3 = ({ details, width, customization }: TemplateProps) => {
    return (
        <View style={[styles.bottomBar, { width, height: 120, padding: 0, justifyContent: 'flex-start' }]}>
            {/* Content Layer (Behind Frame) */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, position: 'relative', zIndex: 10 }}>
                {/* Left: Logo */}
                <View style={{ marginRight: 15 }}>
                    <Image source={logo} style={{ width: 50, height: 50, resizeMode: 'contain', backgroundColor: '#fff', borderRadius: 25 }} />
                </View>

                {/* Center: Details */}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.textBold, { fontSize: customization?.nameFontSize || 18, color: customization?.nameColor || '#fff', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.name || 'Your Name'}</Text>
                    <Text style={[styles.textRegular, { fontSize: customization?.designationFontSize || 12, color: customization?.designationColor || '#fff', opacity: 0.9, textAlign: 'left', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }]}>{details?.designation || 'Designation'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }}>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.mobile}</Text>
                        <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9 }}>|</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={12} color="#fff" />
                            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.9, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 }}>{details?.socialHandle}</Text>
                        </View>
                    </View>
                </View>

                {/* Right: User Photo */}
                <View style={{ marginBottom: 15 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialCommunityIcons name="account" size={40} color="#cbd5e1" />
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Frame Image Overlay (Front) */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}>
                <Image source={frame3} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
            </View>
        </View>
    );
};
export const renderTemplate = (templateIdOrProps: string | { template?: string; templateId?: string; details: any; width: number; customization?: TemplateCustomization; photoPosition?: { x: number; y: number }; isPhotoFlipped?: boolean }, details?: any, width?: number, customization?: TemplateCustomization, photoPosition?: { x: number; y: number }, isPhotoFlipped?: boolean) => {
    // Handle both old and new API
    let templateId: string;
    let finalDetails: any;
    let finalWidth: number;
    let finalCustomization: TemplateCustomization | undefined;
    let finalPhotoPosition: { x: number; y: number } | undefined;
    let finalIsPhotoFlipped: boolean | undefined;

    if (typeof templateIdOrProps === 'string') {
        // Old API: renderTemplate(templateId, details, width, customization, photoPosition, isPhotoFlipped)
        templateId = templateIdOrProps;
        finalDetails = details;
        finalWidth = width || 300;
        finalCustomization = customization;
        finalPhotoPosition = photoPosition;
        finalIsPhotoFlipped = isPhotoFlipped;
    } else {
        // New API: renderTemplate({ template, details, width, customization, photoPosition, isPhotoFlipped })
        templateId = templateIdOrProps.template || templateIdOrProps.templateId || 'default';
        finalDetails = templateIdOrProps.details;
        finalWidth = templateIdOrProps.width;
        finalCustomization = templateIdOrProps.customization;
        finalPhotoPosition = templateIdOrProps.photoPosition;
        finalIsPhotoFlipped = templateIdOrProps.isPhotoFlipped;
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

        case 'stf_bold':
            return <StfBoldFrame details={finalDetails} width={finalWidth} customization={finalCustomization} photoPosition={finalPhotoPosition} isPhotoFlipped={finalIsPhotoFlipped} />;
        case 'stf_rounded':
            return <StfRoundedFrame details={finalDetails} width={finalWidth} customization={finalCustomization} photoPosition={finalPhotoPosition} isPhotoFlipped={finalIsPhotoFlipped} />;
        case 'stf_tabbed':
            return <StfTabbedFrame details={finalDetails} width={finalWidth} customization={finalCustomization} photoPosition={finalPhotoPosition} isPhotoFlipped={finalIsPhotoFlipped} />;

        case 'image_frame1':
            return <ImageFrame1 details={finalDetails} width={finalWidth} customization={finalCustomization} />;
        case 'image_frame2':
            return <ImageFrame2 details={finalDetails} width={finalWidth} customization={finalCustomization} />;
        case 'image_frame3':
            return <ImageFrame3 details={finalDetails} width={finalWidth} customization={finalCustomization} />;
        default:
            return <BoldStripBar details={finalDetails} width={finalWidth} customization={finalCustomization} />;
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
