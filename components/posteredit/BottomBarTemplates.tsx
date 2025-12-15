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
    { id: 'yellow_theme', name: '🌟 Golden Elite' },
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
        ? [customization?.backgroundColor || '#fff', customization?.backgroundColor || '#fff']
        : (customization?.backgroundGradient || ['#fff', '#f8fafc']);

    return (
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                <View style={[styles.photoContainer, {
                    width: customization?.imageSize || 85,
                    height: customization?.imageSize || 85,
                    borderRadius: (customization?.imageSize || 85) / 2,
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
                        fontSize: customization?.nameFontSize || 16,
                        color: customization?.nameColor || '#0f172a',
                        backgroundColor: customization?.nameBackgroundColor || 'transparent',
                    }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>
                    <Text style={[styles.textRegular, {
                        fontSize: customization?.designationFontSize || 15,
                        color: customization?.designationColor || '#64748b',
                        backgroundColor: customization?.designationBackgroundColor || 'transparent',
                    }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>
                </View>
                <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="phone" size={customization?.mobileFontSize ? customization.mobileFontSize + 4 : 20} color={customization?.mobileColor || '#64748b'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.mobileFontSize || 15,
                            color: customization?.mobileColor || '#64748b',
                            backgroundColor: customization?.mobileBackgroundColor || 'transparent',
                        }]}>{details?.mobile || '+91 98765 43210'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="map-marker" size={customization?.addressFontSize ? customization.addressFontSize + 6 : 20} color={customization?.addressColor || '#94a3b8'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.addressFontSize || 15,
                            color: customization?.addressColor || '#94a3b8',
                            backgroundColor: customization?.addressBackgroundColor || 'transparent',
                            flex: 1,
                        }]} numberOfLines={2}>{details?.address || 'Lucknow, Uttar Pradesh'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name={getSocialIcon(details?.socialPlatform) as any} size={customization?.socialFontSize ? customization.socialFontSize + 4 : 20} color={customization?.socialColor || '#64748b'} />
                        <Text style={[styles.textRegular, {
                            fontSize: customization?.socialFontSize || 15,
                            color: customization?.socialColor || '#64748b',
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
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
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
                        fontSize: customization?.nameFontSize || 20,
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
    const bgColor = customization?.backgroundColor || '#ffffff';

    return (
        <View style={[styles.bottomBar, { width, backgroundColor: bgColor, opacity: customization?.backgroundOpacity || 1, borderWidth: 1, borderColor: '#e5e7eb' }]}>
            {/* Top accent line */}
            <View style={{ height: 4, width: '100%', backgroundColor: SP_RED }} />

            <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {/* Compact square-ish photo */}
                <View style={[styles.photoContainer, {
                    width: customization?.imageSize || 70,
                    height: customization?.imageSize || 70,
                    borderRadius: 12,
                    borderColor: customization?.imageBorderColor || SP_RED,
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
                        fontSize: customization?.nameFontSize || 16,
                        color: customization?.nameColor || '#1e293b',
                        marginBottom: 2,
                    }]}>{details?.name || 'Your Name'}</Text>

                    <Text style={[styles.textRegular, {
                        fontSize: customization?.designationFontSize || 15,
                        color: customization?.designationColor || '#64748b',
                        marginBottom: 4,
                    }]}>{details?.designation || 'Designation'}</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
                        <Text style={{ fontSize: customization?.mobileFontSize || 15, color: customization?.mobileColor || '#334155' }}>
                            {details?.mobile || '+91...'}
                        </Text>
                        <Text style={{ fontSize: customization?.socialFontSize || 15, color: customization?.socialColor || '#334155' }}>
                            {details?.social || '@user'}
                        </Text>
                    </View>
                    <Text style={{ fontSize: customization?.addressFontSize || 15, color: customization?.addressColor || '#334155', marginTop: 2 }}>
                        📍 {details?.address || 'Your Address'}
                    </Text>
                </View>

                {/* Icon decoration */}
                <MaterialCommunityIcons name="bicycle" size={40} color="rgba(227, 5, 18, 0.1)" />
            </View>
        </View>
    );
};

// Template 4: Red Power - Full red gradient with white text
const RedAccentBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || [SP_RED, '#b91c1c', '#7f1d1d'];

    return (
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ padding: 14 }}>
                {/* Top row with photo and name */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <View style={[styles.photoContainer, {
                        width: customization?.imageSize || 80,
                        height: customization?.imageSize || 80,
                        borderRadius: (customization?.imageSize || 80) / 2,
                        borderColor: customization?.imageBorderColor || '#fff',
                        borderWidth: customization?.imageBorderWidth || 3,
                    }]}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={styles.photo} />
                        ) : (
                            <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                        )}
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.textBold, {
                            fontSize: customization?.nameFontSize || 18,
                            color: customization?.nameColor || '#fff',
                            fontWeight: '900',
                        }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>

                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 15,
                            color: customization?.designationColor || '#fef2f2',
                            marginTop: 2,
                        }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>
                    </View>
                </View>

                {/* Bottom info bar */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 8, flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 4 }}>
                    <Text style={{ fontSize: customization?.mobileFontSize || 15, color: customization?.mobileColor || '#fff', fontWeight: '600' }}>
                        📱 {details?.mobile || '+91...'}
                    </Text>
                    <Text style={{ fontSize: customization?.socialFontSize || 15, color: customization?.socialColor || '#fff', fontWeight: '600' }}>
                        🐦 {details?.social || '@user'}
                    </Text>
                    <Text style={{ fontSize: customization?.addressFontSize || 15, color: customization?.addressColor || '#fff', fontWeight: '600' }} numberOfLines={1}>
                        📍 {details?.address || 'Address'}
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
};

// Template 5: Golden Elite - Yellow/gold theme with decorative elements
const YellowThemeBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || ['#fbbf24', '#f59e0b', '#d97706'];

    return (
        <LinearGradient colors={bgColors as any} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            {/* Decorative top border */}
            <View style={{ height: 3, width: '100%', backgroundColor: '#78350f' }} />

            <View style={{ padding: 12, position: 'relative' }}>
                {/* Background decoration */}
                <View style={{ position: 'absolute', right: 10, top: 10, opacity: 0.1 }}>
                    <MaterialCommunityIcons name="star-four-points" size={80} color="#78350f" />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    {/* hexagonal-style photo */}
                    <View style={[styles.photoContainer, {
                        width: customization?.imageSize || 75,
                        height: customization?.imageSize || 75,
                        borderRadius: 12,
                        borderColor: customization?.imageBorderColor || '#78350f',
                        borderWidth: customization?.imageBorderWidth || 3,
                        transform: [{ rotate: '45deg' }],
                        overflow: 'hidden',
                    }]}>
                        <View style={{ transform: [{ rotate: '-45deg' }], width: '141%', height: '141%', marginLeft: '-21%', marginTop: '-21%' }}>
                            {details?.photo ? (
                                <Image source={{ uri: details.photo }} style={[styles.photo, { borderRadius: 0 }]} />
                            ) : (
                                <Image source={require('../../assets/images/icon.png')} style={[styles.photo, { borderRadius: 0 }]} />
                            )}
                        </View>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.textBold, {
                            fontSize: customization?.nameFontSize || 17,
                            color: customization?.nameColor || '#78350f',
                            fontWeight: '900',
                        }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>

                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 15,
                            color: customization?.designationColor || '#92400e',
                            marginTop: 2,
                        }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>

                        <View style={{ marginTop: 6 }}>
                            <Text style={{ fontSize: customization?.mobileFontSize || 15, color: customization?.mobileColor || '#78350f', fontWeight: '600' }}>
                                {details?.mobile || '+91 XXXXX'}
                            </Text>
                            <Text style={{ fontSize: customization?.addressFontSize || 15, color: customization?.addressColor || '#92400e' }} numberOfLines={1}>
                                {details?.address || 'Your Address'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Decorative bottom border */}
            <View style={{ height: 3, width: '100%', backgroundColor: '#78350f' }} />
        </LinearGradient>
    );
};

// Template 6: Vibrant Wave - Purple/pink gradient with modern wave design
const GradientWaveBar = ({ details, width, customization }: TemplateProps) => {
    const bgColors = customization?.backgroundGradient || ['#6366f1', '#8b5cf6', '#d946ef'];

    return (
        <LinearGradient colors={bgColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bottomBar, { width, opacity: customization?.backgroundOpacity || 1 }]}>
            <View style={{ padding: 14, position: 'relative', overflow: 'hidden' }}>
                {/* Wave decoration */}
                <View style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.2 }}>
                    <MaterialCommunityIcons name="wave" size={120} color="#fff" />
                </View>

                {/* Main content */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    {/* Circular photo with glow */}
                    <View style={[styles.photoContainer, {
                        width: customization?.imageSize || 85,
                        height: customization?.imageSize || 85,
                        borderRadius: (customization?.imageSize || 85) / 2,
                        borderColor: customization?.imageBorderColor || '#fff',
                        borderWidth: customization?.imageBorderWidth || 3,
                        shadowColor: '#fff',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                        elevation: 10,
                    }]}>
                        {details?.photo ? (
                            <Image source={{ uri: details.photo }} style={styles.photo} />
                        ) : (
                            <Image source={require('../../assets/images/icon.png')} style={styles.photo} />
                        )}
                    </View>

                    {/* Text content with modern styling */}
                    <View style={{ flex: 1 }}>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8, marginBottom: 6 }}>
                            <Text style={[styles.textBold, {
                                fontSize: customization?.nameFontSize || 19,
                                color: customization?.nameColor || '#fff',
                                fontWeight: '900',
                            }]} numberOfLines={1}>{details?.name || 'Your Name'}</Text>
                        </View>

                        <Text style={[styles.textRegular, {
                            fontSize: customization?.designationFontSize || 15,
                            color: customization?.designationColor || 'rgba(255,255,255,0.95)',
                            marginBottom: 6,
                        }]} numberOfLines={1}>{details?.designation || 'Designation'}</Text>

                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                                <Text style={{ fontSize: customization?.mobileFontSize || 15, color: customization?.mobileColor || '#fff' }}>
                                    📱 {details?.mobile || '+91...'}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                                <Text style={{ fontSize: customization?.socialFontSize || 15, color: customization?.socialColor || '#fff' }}>
                                    🌐 {details?.social || '@user'}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '100%' }}>
                                <Text style={{ fontSize: customization?.addressFontSize || 15, color: customization?.addressColor || '#fff' }} numberOfLines={1}>
                                    📍 {details?.address || 'Your Address'}
                                </Text>
                            </View>
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
        case 'yellow_theme':
            return <YellowThemeBar details={finalDetails} width={finalWidth} customization={finalCustomization} />;
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
