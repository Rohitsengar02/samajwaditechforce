import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import { Title, Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import IDCardPreview from '../../components/idcards/IDCardPreview';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function IDCardTab() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isDesktop = width > 900;

    const dummyData = {
        fullName: 'अखिलेश यादव',
        mobile: '9876543210',
        district: 'इटावा',
        vidhanSabha: 'करहल',
        age: '50',
        qualification: 'B.E., M.E.',
        photoUri: "https://upload.wikimedia.org/wikipedia/commons/2/26/Akhilesh_Yadav_Lok_Sabha.jpg", // Public image of Akhilesh Yadav
        email: 'info@samajwadiparty.in',
        partyRole: 'राष्ट्रीय अध्यक्ष',
        socialMedia: ['Twitter', 'Facebook']
    };

    const ContentSection = () => (
        <View style={[styles.contentSection, isDesktop && styles.contentSectionDesktop]}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="card-account-details" size={48} color={SP_RED} />
                <Title style={styles.headerTitle}>सदस्य ID कार्ड</Title>
                <Text style={styles.headerSubtitle}>अपना डिजिटल पहचान पत्र बनाएं</Text>
            </View>

            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.iconWrapper}>
                        <MaterialCommunityIcons name="bicycle" size={40} color={SP_RED} />
                    </View>
                    <Text style={styles.cardTitle}>समाजवादी टेक फ़ोर्स</Text>
                    <Text style={styles.cardDescription}>
                        अपना सदस्य ID कार्ड बनाने के लिए नीचे दिए गए बटन पर क्लिक करें
                    </Text>
                </Card.Content>
            </Card>

            <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                    <MaterialCommunityIcons name="check-circle" size={24} color={SP_GREEN} />
                    <Text style={styles.featureText}>डिजिटल ID कार्ड (Front & Back)</Text>
                </View>
                <View style={styles.featureRow}>
                    <MaterialCommunityIcons name="check-circle" size={24} color={SP_GREEN} />
                    <Text style={styles.featureText}>QR कोड के साथ</Text>
                </View>
                <View style={styles.featureRow}>
                    <MaterialCommunityIcons name="check-circle" size={24} color={SP_GREEN} />
                    <Text style={styles.featureText}>डाउनलोड और शेयर करें</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/member-form')}
            >
                <LinearGradient
                    colors={[SP_RED, '#b91c1c']}
                    style={styles.buttonGradient}
                >
                    <MaterialCommunityIcons name="card-plus" size={24} color="#fff" />
                    <Text style={styles.buttonText}>नया ID कार्ड बनाएं</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#ffffff', '#f0fdf4']} style={styles.background} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {isDesktop ? (
                    <View style={styles.desktopContainer}>
                        {/* Left Side: Big Card Preview */}
                        <View style={styles.leftColumn}>
                            <View style={styles.previewWrapper}>
                                <IDCardPreview memberData={dummyData} showBack={false} />
                            </View>
                        </View>

                        {/* Right Side: Content */}
                        <View style={styles.rightColumn}>
                            <ContentSection />
                        </View>
                    </View>
                ) : (
                    <View style={styles.mobileContainer}>
                        <ContentSection />
                        <View style={styles.previewSection}>
                            <Text style={styles.previewTitle}>ID कार्ड का नमूना:</Text>
                            <View style={{ transform: [{ scale: 0.9 }] }}>
                                <IDCardPreview memberData={dummyData} showBack={false} />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    scrollContent: { flexGrow: 1 },

    desktopContainer: {
        flexDirection: 'row',
        minHeight: '100%',
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 60,
    },
    mobileContainer: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    leftColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 500,
    },
    rightColumn: {
        flex: 1,
        maxWidth: 500,
    },

    contentSection: { width: '100%' },
    contentSectionDesktop: { alignItems: 'flex-start' },

    header: { alignItems: 'center', marginBottom: 32, width: '100%' },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', marginTop: 16 },
    headerSubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center' },

    card: { borderRadius: 20, backgroundColor: '#fff', elevation: 4, marginBottom: 24, width: '100%' },
    cardContent: { padding: 24, alignItems: 'center' },
    iconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 12, textAlign: 'center' },
    cardDescription: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },

    featuresContainer: { backgroundColor: '#f0fdf4', borderRadius: 16, padding: 20, marginBottom: 24, gap: 12, width: '100%' },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureText: { fontSize: 15, color: '#166534', fontWeight: '600' },

    createButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 32, elevation: 8, shadowColor: SP_RED, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, width: '100%' },
    buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 },
    buttonText: { fontSize: 18, fontWeight: '800', color: '#fff' },

    previewSection: { alignItems: 'center', marginTop: 20 },
    previewTitle: { fontSize: 16, fontWeight: '700', color: '#64748b', marginBottom: 16 },
    previewWrapper: { transform: [{ scale: 1.1 }] },
});
