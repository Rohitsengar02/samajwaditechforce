import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

const SP_RED = '#E30512';
const SP_DARK_RED = '#B00410';

interface IDCardPreviewProps {
    memberData: any;
    showBack: boolean;
}

export default function IDCardPreview({ memberData, showBack }: IDCardPreviewProps) {
    // Generate unique ID from user's _id or create one
    const fullID = memberData.uniqueId || memberData._id || `SP-TF-${Date.now().toString().slice(-6)}`;
    const IDNumber = fullID.slice(0, 6).toUpperCase();
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(flipAnimation, {
            toValue: showBack ? 180 : 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
        }).start();
        setIsFlipped(showBack);
    }, [showBack]);

    const flipCard = () => {
        const toValue = isFlipped ? 0 : 180;
        Animated.spring(flipAnimation, {
            toValue,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
        }).start();
        setIsFlipped(!isFlipped);
    };

    const frontRotate = flipAnimation.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backRotate = flipAnimation.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const frontOpacity = flipAnimation.interpolate({
        inputRange: [0, 90, 180],
        outputRange: [1, 1, 0],
    });

    const backOpacity = flipAnimation.interpolate({
        inputRange: [0, 90, 180],
        outputRange: [0, 0, 1],
    });

    return (
        <View style={styles.mockupContainer}>
            {/* Modern Lanyard */}
            <View style={styles.lanyard}>
                <View style={styles.lanyardTop} />
                <LinearGradient
                    colors={[SP_RED, SP_DARK_RED]}
                    style={styles.lanyardStrap}
                />
                <View style={styles.lanyardClip}>
                    <View style={styles.clipRing} />
                    <View style={styles.clipHook} />
                </View>
            </View>

            <View style={styles.cardHolder}>
                <View style={styles.holderFrame}>
                    <View style={styles.idCard}>
                        {/* Front Card */}
                        <Animated.View style={[styles.cardFace, { opacity: frontOpacity, transform: [{ rotateY: frontRotate }] }]}>
                            <View style={styles.cardContainer}>
                                <LinearGradient
                                    colors={[SP_RED, SP_DARK_RED]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.cardHeader}
                                >
                                    <View style={styles.headerPattern}>
                                        <View style={[styles.patternCircle, { top: -20, right: -20 }]} />
                                        <View style={[styles.patternCircle, { bottom: -30, left: -30 }]} />
                                    </View>

                                    <Image
                                        source={{ uri: "https://res.cloudinary.com/dssmutzly/image/upload/v1763543757/928c21d2-4d75-46a6-9265-0531d5433c29_txhwun.png" }}
                                        style={styles.headerLogo}
                                    />
                                    <View style={styles.headerTextContainer}>
                                        <Text style={styles.partyName}>समाजवादी टेक फोर्स</Text>
                                        <View style={styles.techForceBadge}>
                                            <Text style={styles.techForce}>MEMBER DETAILS</Text>
                                        </View>
                                    </View>
                                </LinearGradient>

                                <View style={styles.marqueeContainer}>
                                    <Text style={styles.marqueeText}>पहचान एवं सम्मान कार्यक्रम</Text>
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.profileCard}>
                                        <View style={styles.photoContainer}>
                                            <Image
                                                source={{
                                                    uri: memberData.photo || "https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png"
                                                }}
                                                style={styles.memberPhoto}
                                            />
                                            <View style={styles.photoBorder} />
                                        </View>
                                    </View>

                                    <View style={styles.infoList}>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Name:</Text>
                                            <Text style={styles.infoValue}>{memberData.fullName || 'नाम'}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Mobile:</Text>
                                            <Text style={styles.infoValue}>+91 {memberData.mobile || '----------'}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>District:</Text>
                                            <Text style={styles.infoValue}>{memberData.district || 'जिला'}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Vidhan Sabha:</Text>
                                            <Text style={styles.infoValue}>{memberData.vidhanSabha || 'विधानसभा'}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Age:</Text>
                                            <Text style={styles.infoValue}>{memberData.age ? `${memberData.age} वर्ष` : '-- वर्ष'}</Text>
                                        </View>
                                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                                            <Text style={styles.infoLabel}>Qualification:</Text>
                                            <Text style={styles.infoValue}>{memberData.qualification || 'योग्यता'}</Text>
                                        </View>
                                    </View>
                                </View>

                                <LinearGradient
                                    colors={[SP_RED, SP_DARK_RED]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.cardFooter}
                                >
                                    <View style={styles.footerContent}>
                                        <MaterialCommunityIcons name="web" size={14} color="#fff" />
                                        <Text style={styles.footerTextWhite}>www.samajwaditechforce.com</Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        </Animated.View>

                        {/* Back Card */}
                        <Animated.View style={[styles.cardFace, { opacity: backOpacity, transform: [{ rotateY: backRotate }] }]}>
                            <View style={styles.cardContainer}>
                                <LinearGradient
                                    colors={[SP_RED, SP_DARK_RED]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.cardHeader}
                                >
                                    <View style={styles.headerPattern}>
                                        <View style={[styles.patternCircle, { top: -20, right: -20 }]} />
                                        <View style={[styles.patternCircle, { bottom: -30, left: -30 }]} />
                                    </View>

                                    <Image
                                        source={{ uri: "https://res.cloudinary.com/dssmutzly/image/upload/v1763543757/928c21d2-4d75-46a6-9265-0531d5433c29_txhwun.png" }}
                                        style={styles.headerLogo}
                                    />
                                    <View style={styles.headerTextContainer}>
                                        <Text style={styles.partyName}>समाजवादी टेक फोर्स</Text>
                                        <View style={styles.techForceBadge}>
                                            <Text style={styles.techForce}>MEMBER DETAILS</Text>
                                        </View>
                                    </View>
                                </LinearGradient>

                                <View style={styles.marqueeContainer}>
                                    <Text style={styles.marqueeText}>पहचान एवं सम्मान कार्यक्रम</Text>
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.infoList}>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Email:</Text>
                                            <Text style={[styles.infoValue, { fontSize: 11 }]}>{memberData.email || 'Not Provided'}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Party Role:</Text>
                                            <Text style={styles.infoValue}>{memberData.partyRole || 'Member'}</Text>
                                        </View>
                                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                                            <Text style={styles.infoLabel}>Member Since:</Text>
                                            <Text style={styles.infoValue}>{memberData.memberSince || '2024'}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.qrContainer, { marginTop: 10, padding: 10, flex: 1, justifyContent: 'center' }]}>
                                        <View style={styles.qrCodeWrapper}>
                                            <QRCode
                                                value={`https://samajwaditechforce.com/member/${fullID}`}
                                                size={80}
                                                backgroundColor="white"
                                                color="black"
                                            />
                                        </View>
                                        <Text style={[styles.qrText, { marginTop: 8 }]}>Scan for verification</Text>
                                        <Text style={[styles.qrIdText, { marginTop: 4 }]}>UID:- {IDNumber}</Text>
                                    </View>

                                    <View style={styles.backLogoContainer}>
                                        <MaterialCommunityIcons name="bicycle" size={100} color={SP_RED} style={{ opacity: 0.08 }} />
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={styles.socialIcons}>
                                        <View style={styles.socialIcon}>
                                            <MaterialCommunityIcons name="facebook" size={14} color="#3B82F6" />
                                        </View>
                                        <View style={styles.socialIcon}>
                                            <MaterialCommunityIcons name="twitter" size={14} color="#1DA1F2" />
                                        </View>
                                        <View style={styles.socialIcon}>
                                            <MaterialCommunityIcons name="instagram" size={14} color="#E4405F" />
                                        </View>
                                        <View style={styles.socialIcon}>
                                            <MaterialCommunityIcons name="youtube" size={14} color="#FF0000" />
                                        </View>
                                    </View>
                                    <Text style={styles.footerText}>samajwaditechforce.com</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </View>
                </View>
            </View>

            {/* Flip Button */}
            <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
                <MaterialCommunityIcons name="rotate-3d-variant" size={20} color="#fff" />
                <Text style={styles.flipButtonText}>{isFlipped ? 'See Front' : 'See Back'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    mockupContainer: { alignItems: 'center', marginBottom: 24 },
    lanyard: { alignItems: 'center', zIndex: 1 },
    lanyardTop: { width: 60, height: 20, backgroundColor: '#475569', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
    lanyardStrap: { width: 22, height: 100, borderRadius: 11, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
    lanyardClip: { alignItems: 'center', marginTop: -5 },
    clipRing: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: '#94a3b8', backgroundColor: 'transparent' },
    clipHook: { width: 14, height: 22, backgroundColor: '#64748b', marginTop: -15, borderRadius: 7 },

    cardHolder: { width: 350, maxWidth: 360, marginTop: -10 },
    holderFrame: {
        borderRadius: 24,
        padding: 8,
        backgroundColor: '#0f172a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20
    },
    idCard: { aspectRatio: 0.55, borderRadius: 18, overflow: 'hidden', backgroundColor: '#fff' },
    cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' },

    cardContainer: { flex: 1, backgroundColor: '#F8FAFC' },

    cardHeader: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'flex-end',
        position: 'relative',
        overflow: 'hidden'
    },
    headerPattern: { position: 'absolute', width: '100%', height: '100%' },
    patternCircle: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerLogo: {
        position: 'absolute',
        left: 16,
        top: 16,
        width: 80,
        height: 80,
        resizeMode: 'contain',
        zIndex: 3
    },
    headerTextContainer: { alignItems: 'flex-end', gap: 4 },
    partyName: { color: '#fff', fontWeight: '900', fontSize: 22, textAlign: 'right', letterSpacing: 0.5 },
    techForceBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    techForce: { color: '#fff', fontSize: 14, letterSpacing: 2, fontWeight: '700' },

    cardBody: { flex: 1, padding: 16, paddingTop: 20 },

    profileCard: {
        flexDirection: 'column',

        borderRadius: 12,
        padding: 12,
        marginBottom: 12,

        alignItems: 'center',
        gap: 8
    },
    photoContainer: {
        position: 'relative',
    },
    memberPhoto: { width: 100, height: 100, borderRadius: 50 },
    photoPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
    photoBorder: {
        position: 'absolute',
        top: -3,
        left: -3,
        width: 106,
        height: 106,
        borderRadius: 53,
        borderWidth: 2.5,
        borderColor: SP_RED,
        borderStyle: 'solid'
    },
    profileInfo: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4
    },
    nameText: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
    idBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    idText: { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 0.3 },

    infoList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    infoValue: { fontSize: 13, color: '#0F172A', fontWeight: '700', textAlign: 'right' },

    qrContainer: {

        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,

    },
    qrCodeWrapper: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#F1F5F9',
    },
    qrText: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 8 },
    qrIdText: {
        fontSize: 9,
        color: '#94A3B8',
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    backLogoContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        opacity: 0.05
    },

    cardFooter: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: SP_RED,
        alignItems: 'center',
        justifyContent: 'center'
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    footerTextWhite: { color: '#fff', fontSize: 12, fontWeight: '700' },
    footerText: { fontSize: 11, color: '#ffffffff', fontWeight: '600' },
    socialIcons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8
    },
    socialIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },

    flipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: SP_RED,
        borderRadius: 20,
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    flipButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700'
    },
    marqueeContainer: {
        backgroundColor: 'green',
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    marqueeText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});