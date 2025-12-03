import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopAbout() {
    const router = useRouter();
    const [showMegaMenu, setShowMegaMenu] = useState(false);

    const teamMembers = [
        { role: 'संयोजक', name: 'डॉ. नितेन्द्र यादव' },
        { role: 'सह संयोजक', name: 'अपर्णा बंसल जैन' },
        { role: 'तकनीकी प्रमुख', name: 'अनुज तिवारी' },
    ];

    const appFeatures = [
        {
            icon: 'bullhorn',
            title: '📢 कैंपेन और कार्य प्रबंधन',
            points: ['प्रत्येक सदस्य को दैनिक डिजिटल कार्य सौंपे जाएंगे', 'कार्य पूरा होने पर पॉइंट्स और लीडरबोर्ड सिस्टम']
        },
        {
            icon: 'vote',
            title: '🗳️ विधानसभा कनेक्ट',
            points: ['स्थानीय स्तर पर जुड़े सदस्यों की सूची', 'कार्यक्रमों, बैठकों और अभियानों की सूचना', 'जीपीएस लोकेशन से नज़दीकी सदस्य दिखें']
        },
        {
            icon: 'newspaper',
            title: '💬 न्यूज़ और अपडेट सेक्शन',
            points: ['समाजवादी पार्टी से जुड़ी नवीनतम खबरें और घोषणाएँ', 'पुश नोटिफिकेशन से महत्वपूर्ण संदेश']
        },
        {
            icon: 'chart-line',
            title: '🧾 रिपोर्टिंग और विश्लेषण',
            points: ['प्रत्येक सदस्य की सोशल मीडिया एक्टिविटी रिपोर्ट', 'जिलेवार प्रगति चार्ट और मासिक रिपोर्ट']
        },
        {
            icon: 'forum',
            title: '🤝 संवाद केंद्र',
            points: ['ऐप के अंदर चैट और डिस्कशन फोरम', 'सुझाव देने और "नेता से सवाल" सेक्शन']
        },
        {
            icon: 'shield-check',
            title: '🔐 सुरक्षा और सत्यापन',
            points: ['सुरक्षित लॉगिन और डाटा सुरक्षा', 'सत्यापित सदस्यों को "वेरिफाइड बैज"']
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerLogo}>समाजवादी पार्टी</Text>
                <View style={styles.navMenu}>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/home' as any)}><Text style={styles.navItem}>Home</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/news' as any)}><Text style={styles.navItem}>News</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/events' as any)}><Text style={styles.navItem}>Events</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/gallery' as any)}><Text style={styles.navItem}>Gallery</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/about' as any)}><Text style={styles.navItem}>About</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/volunteers' as any)}><Text style={styles.navItem}>Volunteers</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/daily-work' as any)}><Text style={styles.navItem}>Daily Work</Text></Pressable>
                </View>
                <View style={styles.headerActions}>
                    <Text style={styles.langSwitch}>EN</Text>
                    <Pressable onPress={() => router.push('/register' as any)}><Text style={styles.loginBtn}>Login</Text></Pressable>
                    <Pressable style={styles.signupBtn} onPress={() => router.push('/joinus' as any)}><Text style={styles.signupBtnText}>Join Us</Text></Pressable>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <LinearGradient colors={['#fef2f2', '#fff']} style={styles.heroSection}>
                    <View style={styles.heroContent}>
                        <MaterialCommunityIcons name="bicycle" size={80} color={SP_RED} />
                        <Text style={styles.heroTitle}>समाजवादी टेक फ़ोर्स</Text>
                        <Text style={styles.heroSubtitle}>डिजिटल क्रांति का सशक्त माध्यम</Text>
                    </View>
                </LinearGradient>

                {/* Welcome Section */}
                <View style={styles.section}>
                    <View style={styles.sectionCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: `${SP_RED}15` }]}>
                                <MaterialCommunityIcons name="hand-wave" size={32} color={SP_RED} />
                            </View>
                            <Text style={styles.cardTitle}>स्वागत एवं अभिनंदन</Text>
                        </View>
                        <Text style={styles.welcomeText}>समाजवादी टेक फ़ोर्स परिवार में आपका हार्दिक स्वागत! 🙏</Text>
                        <Text style={styles.description}>
                            समाजवादी साथियों को टेक एवं डिजिटल ट्रेनिंग के माध्यम से सशक्त बनाना है। हमारा मिशन है कि हर कार्यकर्ता डिजिटल रूप से सक्षम बने और पार्टी की विचारधारा को नई ऊर्जा के साथ आगे बढ़ाए।
                        </Text>
                    </View>
                </View>

                {/* Team Structure */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>टीम संरचना</Text>
                    <View style={styles.teamGrid}>
                        {teamMembers.map((member, index) => (
                            <View key={index} style={styles.teamCard}>
                                <View style={styles.teamAvatar}>
                                    <MaterialCommunityIcons name="account-tie" size={40} color={SP_RED} />
                                </View>
                                <Text style={styles.teamRole}>{member.role}</Text>
                                <Text style={styles.teamName}>{member.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Samvaad & Samman Programme */}
                <View style={styles.section}>
                    <View style={styles.sectionCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#3B82F615' }]}>
                                <MaterialCommunityIcons name="forum" size={32} color="#3B82F6" />
                            </View>
                            <Text style={styles.cardTitle}>संवाद व सम्मान कार्यक्रम</Text>
                        </View>

                        <Text style={styles.subheading}>🎯 उद्देश्य:</Text>
                        <Text style={styles.description}>
                            प्रथम फेस कनेक्ट के समापन पर जुड़े हुए युवाओं को एक मंच पर लाकर, संवाद और सम्मान के माध्यम से संगठनात्मक एकता को मज़बूत करना।
                        </Text>

                        <Text style={styles.subheading}>📅 कार्यक्रम विवरण:</Text>
                        <View style={styles.bulletList}>
                            <View style={styles.bulletItem}><View style={styles.bullet} /><Text style={styles.bulletText}>इस फेस का समापन एक विशेष "संवाद व सम्मान कार्यक्रम" से किया जाएगा</Text></View>
                            <View style={styles.bulletItem}><View style={styles.bullet} /><Text style={styles.bulletText}>यह कार्यक्रम समाजवादी पार्टी के लखनऊ कार्यालय में आयोजित किया जाएगा</Text></View>
                            <View style={styles.bulletItem}><View style={styles.bullet} /><Text style={styles.bulletText}>कार्यक्रम की तिथि और समय श्री अखिलेश यादव जी के उपलब्ध समय के अनुसार तय किया जाएगा</Text></View>
                        </View>

                        <Text style={styles.subheading}>🧭 लक्ष्य:</Text>
                        <View style={styles.bulletList}>
                            <View style={styles.bulletItem}><View style={styles.bullet} /><Text style={styles.bulletText}>समाजवादी टेक फोर्स के पहले बैच के सदस्यों का सम्मान</Text></View>
                            <View style={styles.bulletItem}><View style={styles.bullet} /><Text style={styles.bulletText}>आगामी ट्रेनिंग और एक्शन फेस के लिए दिशा-निर्देश</Text></View>
                            <View style={styles.bulletItem}><View style={styles.bullet} /><Text style={styles.bulletText}>पार्टी और टेक फोर्स के बीच मजबूत संवाद की शुरुआत</Text></View>
                        </View>
                    </View>
                </View>

                {/* App Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ऐप की मुख्य विशेषताएं</Text>
                    <View style={styles.featuresGrid}>
                        {appFeatures.map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <View style={styles.featureBullets}>
                                    {feature.points.map((point, i) => (
                                        <View key={i} style={styles.bulletItem}>
                                            <View style={styles.bullet} />
                                            <Text style={styles.bulletText}>{point}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <View style={styles.contactCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#F59E0B15' }]}>
                                <MaterialCommunityIcons name="office-building" size={32} color="#F59E0B" />
                            </View>
                            <Text style={styles.cardTitle}>संपर्क सूत्र</Text>
                        </View>
                        <View style={styles.contactList}>
                            <View style={styles.contactItem}>
                                <MaterialCommunityIcons name="phone" size={24} color={SP_GREEN} />
                                <Text style={styles.contactText}>9621762121</Text>
                            </View>
                            <View style={styles.contactItem}>
                                <MaterialCommunityIcons name="email" size={24} color={SP_GREEN} />
                                <Text style={styles.contactText}>info@samajwaditechforce.com</Text>
                            </View>
                            <View style={styles.contactItem}>
                                <MaterialCommunityIcons name="map-marker" size={24} color={SP_GREEN} />
                                <Text style={styles.contactText}>
                                    117/क्यू/710, गीता नगर क्रॉसिंग रोड, गीता नगर, काकादेव,{'\n'}शारदा नगर, कानपुर, उत्तर प्रदेश – 208025
                                </Text>
                            </View>
                            <Text style={styles.companyName}>वर्कफोर्स इंफोटेक प्रा. लि.</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <MaterialCommunityIcons name="bicycle" size={64} color={SP_RED} />
                    <Text style={styles.footerTitle}>साइकिल चलाओ देश बचाओ</Text>
                    <Text style={styles.footerSubtitle}>आइए, मिलकर समाजवादी डिजिटल क्रांति को मजबूत करें!</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 60, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', zIndex: 100, position: 'relative' },
    headerLogo: { fontSize: 24, fontWeight: '900', color: SP_RED },
    navMenu: { flexDirection: 'row', alignItems: 'center', gap: 32 },
    navItem: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    langSwitch: { fontSize: 14, fontWeight: '600', color: '#64748b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
    loginBtn: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    signupBtn: { backgroundColor: SP_RED, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    heroSection: { paddingHorizontal: 60, paddingVertical: 100, alignItems: 'center' },
    heroContent: { alignItems: 'center', maxWidth: 800 },
    heroTitle: { fontSize: 56, fontWeight: '900', color: '#1e293b', marginTop: 24, marginBottom: 16, textAlign: 'center' },
    heroSubtitle: { fontSize: 20, color: '#64748b', textAlign: 'center' },
    section: { paddingHorizontal: 60, paddingVertical: 40 },
    sectionTitle: { fontSize: 36, fontWeight: '800', color: '#1e293b', marginBottom: 32 },
    sectionCard: { backgroundColor: '#fff', padding: 40, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    iconBox: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    cardTitle: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
    welcomeText: { fontSize: 18, fontWeight: '700', color: SP_RED, marginBottom: 16 },
    description: { fontSize: 16, color: '#64748b', lineHeight: 26, marginBottom: 16 },
    subheading: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 24, marginBottom: 12 },
    bulletList: { gap: 12, marginTop: 12 },
    bulletItem: { flexDirection: 'row', alignItems: 'flex-start' },
    bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: SP_GREEN, marginTop: 8, marginRight: 12 },
    bulletText: { flex: 1, fontSize: 15, color: '#64748b', lineHeight: 24 },
    teamGrid: { flexDirection: 'row', gap: 24 },
    teamCard: { flex: 1, backgroundColor: '#fff', padding: 32, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    teamAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    teamRole: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
    teamName: { fontSize: 18, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
    featureCard: { width: '48%', backgroundColor: '#fff', padding: 32, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    featureTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
    featureBullets: { gap: 12 },
    contactCard: { backgroundColor: '#fff', padding: 40, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    contactList: { gap: 20 },
    contactItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
    contactText: { flex: 1, fontSize: 16, color: '#64748b', lineHeight: 24 },
    companyName: { fontSize: 20, fontWeight: '700', color: SP_RED, marginTop: 16, textAlign: 'center' },
    footer: { alignItems: 'center', paddingVertical: 80, backgroundColor: '#fef2f2' },
    footerTitle: { fontSize: 32, fontWeight: '900', color: SP_RED, marginTop: 24, marginBottom: 12 },
    footerSubtitle: { fontSize: 18, color: '#64748b', textAlign: 'center', fontWeight: '600' },
});
