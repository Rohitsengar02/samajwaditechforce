import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export const TEMPLATES = [
    { id: 'default', name: 'Default' },
    { id: 'bold_strip', name: 'Bold Blue' },
    { id: 'minimal_white', name: 'Clean White' },
    { id: 'red_accent', name: 'Red Accent' },
    { id: 'yellow_theme', name: 'Yellow Theme' },
];

const DefaultBar = ({ details, width }: { details: any, width: number }) => (
    <LinearGradient
        colors={['#fff', '#f8fafc']}
        style={[styles.bottomBar, { width }]}
    >
        <View style={styles.bottomBarContent}>
            <View style={styles.barPhotoContainer}>
                {details.photo ? (
                    <Image source={{ uri: details.photo }} style={styles.barPhoto} />
                ) : (
                    <Image
                        source={require('../../assets/images/icon.png')}
                        style={styles.barPhoto}
                    />
                )}
            </View>
            <View style={styles.barTextContainer}>
                <Text style={styles.barName} numberOfLines={1}>
                    {details.name || 'Your Name'}
                </Text>
                <Text style={styles.barDesignation} numberOfLines={1}>
                    {details.designation || 'Designation'}
                </Text>
            </View>
            <View style={styles.barContactContainer}>
                <View style={styles.contactItem}>
                    <MaterialCommunityIcons name="phone" size={10} color={SP_RED} />
                    <Text style={styles.contactText} numberOfLines={1}>{details.mobile || '+91 XXXXX'}</Text>
                </View>
                <View style={styles.contactItem}>
                    <MaterialCommunityIcons name="twitter" size={10} color={SP_RED} />
                    <Text style={styles.contactText} numberOfLines={1}>{details.social || '@user'}</Text>
                </View>
            </View>
        </View>
        {/* Address on separate line */}
        <View style={{ paddingHorizontal: 12, paddingBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="map-marker" size={10} color={SP_RED} />
                <Text style={{ fontSize: 8, color: '#334155', marginLeft: 4 }} numberOfLines={1}>
                    {details.address || 'Your Address'}
                </Text>
            </View>
        </View>
        <LinearGradient
            colors={[SP_GREEN, '#15803d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.partyStrip}
        />
    </LinearGradient>
);

const ModernCurveBar = ({ details, width }: { details: any, width: number }) => (
    <View style={[styles.bottomBar, { width, backgroundColor: 'transparent' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', borderTopRightRadius: 30, padding: 8, paddingRight: 20 }}>
                <Image
                    source={require('../../assets/images/icon.png')}
                    style={{ width: 40, height: 40, resizeMode: 'contain' }}
                />
            </View>
            <View style={{ flex: 1, backgroundColor: '#0ea5e9', borderTopLeftRadius: 30, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.barPhotoContainer, { borderColor: '#fff' }]}>
                        {details.photo ? (
                            <Image source={{ uri: details.photo }} style={styles.barPhoto} />
                        ) : (
                            <View style={{ backgroundColor: '#ccc', flex: 1 }} />
                        )}
                    </View>
                    <View style={{ marginLeft: 8 }}>
                        <Text style={[styles.barName, { color: '#fff' }]}>{details.name || 'Your Name'}</Text>
                        <Text style={[styles.barDesignation, { color: '#e0f2fe' }]}>{details.designation || 'Designation'}</Text>
                    </View>
                </View>
                <View>
                    <Text style={{ color: '#fff', fontSize: 10 }}>{details.mobile || '+91...'}</Text>
                    <Text style={{ color: '#fff', fontSize: 10 }}>{details.social || '@...'}</Text>
                    <Text style={{ color: '#fff', fontSize: 10 }} numberOfLines={1}>{details.address || 'Address'}</Text>
                </View>
            </View>
        </View>
    </View>
);

const BoldStripBar = ({ details, width }: { details: any, width: number }) => (
    <View style={[styles.bottomBar, { width }]}>
        <View style={{ backgroundColor: '#1e3a8a', padding: 10, flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.barPhotoContainer, { borderColor: '#fbbf24', width: 60, height: 60, borderRadius: 30 }]}>
                {details.photo ? (
                    <Image source={{ uri: details.photo }} style={styles.barPhoto} />
                ) : (
                    <View style={{ backgroundColor: '#ccc', flex: 1 }} />
                )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.barName, { color: '#fbbf24', fontSize: 18 }]}>{details.name || 'Your Name'}</Text>
                <Text style={[styles.barDesignation, { color: '#fff' }]}>{details.designation || 'Designation'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.contactItem}>
                    <MaterialCommunityIcons name="phone" size={14} color="#fbbf24" />
                    <Text style={[styles.contactText, { color: '#fff' }]}>{details.mobile || 'Mobile'}</Text>
                </View>
                <View style={styles.contactItem}>
                    <MaterialCommunityIcons name="web" size={14} color="#fbbf24" />
                    <Text style={[styles.contactText, { color: '#fff' }]}>www.website.com</Text>
                </View>
            </View>
        </View>
        <View style={{ backgroundColor: '#fff', padding: 4, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#1e3a8a', fontWeight: 'bold' }}>{details.address || '321, Area Name, City - 456789'}</Text>
        </View>
    </View>
);

const MinimalWhiteBar = ({ details, width }: { details: any, width: number }) => (
    <View style={[styles.bottomBar, { width, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', padding: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.barPhotoContainer, { width: 40, height: 40, borderRadius: 20, marginRight: 8 }]}>
                    {details.photo ? (
                        <Image source={{ uri: details.photo }} style={styles.barPhoto} />
                    ) : (
                        <View style={{ backgroundColor: '#ccc', flex: 1 }} />
                    )}
                </View>
                <View>
                    <Text style={[styles.barName, { color: '#333' }]}>{details.name || 'Your Name'}</Text>
                    <Text style={[styles.barDesignation, { color: '#666', fontSize: 10 }]}>{details.designation || 'Designation'}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
                <MaterialCommunityIcons name="instagram" size={20} color="#E4405F" />
                <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
            </View>
        </View>
        <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 6 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 10, color: '#666' }}>{details.mobile || '+91 98765 43210'}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{details.social || 'email@example.com'}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{details.address || 'Address'}</Text>
        </View>
    </View>
);

const RedAccentBar = ({ details, width }: { details: any, width: number }) => (
    <View style={[styles.bottomBar, { width }]}>
        <View style={{ height: 4, backgroundColor: SP_RED }} />
        <View style={{ backgroundColor: '#fff', padding: 10, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: SP_RED, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 4 }}>
                    <Text style={{ color: SP_RED, fontWeight: 'bold', fontSize: 14 }}>{details.name || 'Your Name'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#333', marginRight: 8 }}>Follow us:</Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                        <MaterialCommunityIcons name="facebook" size={16} color="#333" />
                        <MaterialCommunityIcons name="instagram" size={16} color="#333" />
                    </View>
                </View>
            </View>
            <View style={[styles.barPhotoContainer, { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#fff', marginTop: -30, elevation: 4 }]}>
                {details.photo ? (
                    <Image source={{ uri: details.photo }} style={styles.barPhoto} />
                ) : (
                    <View style={{ backgroundColor: '#ccc', flex: 1 }} />
                )}
            </View>
        </View>
        <View style={{ backgroundColor: SP_RED, padding: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{details.mobile || '+91 XXXXX'}</Text>
            <Text style={{ color: '#fff', fontSize: 10 }}>{details.address || 'Area Name, City'}</Text>
        </View>
    </View>
);

const YellowThemeBar = ({ details, width }: { details: any, width: number }) => (
    <View style={[styles.bottomBar, { width }]}>
        <View style={{ backgroundColor: '#FFD700', padding: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.barPhotoContainer, { borderColor: '#000', borderWidth: 1 }]}>
                    {details.photo ? (
                        <Image source={{ uri: details.photo }} style={styles.barPhoto} />
                    ) : (
                        <View style={{ backgroundColor: '#ccc', flex: 1 }} />
                    )}
                </View>
                <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#000' }}>{details.name || 'YOUR NAME'}</Text>
                </View>
            </View>
            <View>
                <MaterialCommunityIcons name="flag" size={24} color="#000" />
            </View>
        </View>
        <View style={{ backgroundColor: '#000', padding: 8, flexDirection: 'row', justifyContent: 'space-around' }}>
            <Text style={{ color: '#FFD700', fontSize: 10 }}>{details.mobile || 'Mobile Number'}</Text>
            <Text style={{ color: '#FFD700', fontSize: 10 }}>|</Text>
            <Text style={{ color: '#FFD700', fontSize: 10 }}>{details.address || 'Address'}</Text>
        </View>
    </View>
);

export const RenderBottomBar = ({ template, details, width }: { template: string, details: any, width: number }) => {
    switch (template) {
        case 'modern_curve':
            return <ModernCurveBar details={details} width={width} />;
        case 'bold_strip':
            return <BoldStripBar details={details} width={width} />;
        case 'minimal_white':
            return <MinimalWhiteBar details={details} width={width} />;
        case 'red_accent':
            return <RedAccentBar details={details} width={width} />;
        case 'yellow_theme':
            return <YellowThemeBar details={details} width={width} />;
        default:
            return <DefaultBar details={details} width={width} />;
    }
};

const styles = StyleSheet.create({
    bottomBar: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    bottomBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 12,
    },
    barPhotoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: SP_RED,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#fff',
    },
    barPhoto: {
        width: '100%',
        height: '100%',
    },
    barTextContainer: {
        flex: 1,
    },
    barName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    barDesignation: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    barContactContainer: {
        alignItems: 'flex-end',
        maxWidth: 120, // Limit width to prevent overflow
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    contactText: {
        fontSize: 9, // Smaller font
        color: '#334155',
        marginLeft: 3,
        fontWeight: '600',
        maxWidth: 100, // Limit text width
    },
    partyStrip: {
        height: 6,
        width: '100%',
    },
});
