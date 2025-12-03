import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../components/TranslatedText';

const { width } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

const SectionCard = ({ icon, title, children, color, delay }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionCard}>
                <LinearGradient
                    colors={[color + '15', color + '08']}
                    style={styles.sectionHeader}
                >
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <MaterialCommunityIcons name={icon} size={28} color={color} />
                    </View>
                    <Text style={styles.sectionTitle}>
                        <TranslatedText>{title}</TranslatedText>
                    </Text>
                </LinearGradient>
                <View style={styles.sectionContent}>
                    {children}
                </View>
            </View>
        </Animated.View>
    );
};

const BulletPoint = ({ text }: any) => (
    <View style={styles.bulletContainer}>
        <View style={styles.bullet} />
        <Text style={styles.bulletText}>
            <TranslatedText>{text}</TranslatedText>
        </Text>
    </View>
);

export default function AboutPage() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={[SP_RED, '#b91c1c', SP_DARK]}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <MaterialCommunityIcons name="bicycle" size={64} color="#fff" style={{ opacity: 0.9 }} />
                        <Text style={styles.headerTitle}>
                            <TranslatedText>समाजवादी टेक फ़ोर्स</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>डिजिटल क्रांति का सशक्त माध्यम</TranslatedText>
                        </Text>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Welcome Section */}
                    <SectionCard icon="hand-wave" title="स्वागत एवं अभिनंदन" color={SP_RED} delay={0}>
                        <Text style={styles.welcomeText}>
                            <TranslatedText>समाजवादी टेक फ़ोर्स परिवार में आपका हार्दिक स्वागत! 🙏</TranslatedText>
                        </Text>
                        <Text style={styles.paragraph}>
                            <TranslatedText>समाजवादी साथियों को टेक एवं डिजिटल ट्रेनिंग के माध्यम से सशक्त बनाना है। हमारा मिशन है कि हर कार्यकर्ता डिजिटल रूप से सक्षम बने और पार्टी की विचारधारा को नई ऊर्जा के साथ आगे बढ़ाए।</TranslatedText>
                        </Text>
                    </SectionCard>

                    {/* Team Structure */}
                    <SectionCard icon="account-group" title="टीम संरचना" color={SP_GREEN} delay={100}>
                        <View style={styles.teamMember}>
                            <Text style={styles.teamRole}>
                                <TranslatedText>संयोजक:</TranslatedText>
                            </Text>
                            <Text style={styles.teamName}>
                                <TranslatedText>डॉ. नितेन्द्र यादव</TranslatedText>
                            </Text>
                        </View>
                        <View style={styles.teamMember}>
                            <Text style={styles.teamRole}>
                                <TranslatedText>सह संयोजक:</TranslatedText>
                            </Text>
                            <Text style={styles.teamName}>
                                <TranslatedText>अपर्णा बंसल जैन</TranslatedText>
                            </Text>
                        </View>
                        <View style={styles.teamMember}>
                            <Text style={styles.teamRole}>
                                <TranslatedText>तकनीकी प्रमुख:</TranslatedText>
                            </Text>
                            <Text style={styles.teamName}>
                                <TranslatedText>अनुज तिवारी</TranslatedText>
                            </Text>
                        </View>
                    </SectionCard>

                    {/* Samvaad & Samman Programme */}
                    <SectionCard icon="forum" title="संवाद व सम्मान कार्यक्रम" color="#3B82F6" delay={200}>
                        <Text style={styles.subheading}>
                            <TranslatedText>🎯 उद्देश्य:</TranslatedText>
                        </Text>
                        <Text style={styles.paragraph}>
                            <TranslatedText>प्रथम फेस कनेक्ट के समापन पर जुड़े हुए युवाओं को एक मंच पर लाकर, संवाद और सम्मान के माध्यम से संगठनात्मक एकता को मज़बूत करना।</TranslatedText>
                        </Text>

                        <Text style={styles.subheading}>
                            <TranslatedText>📅 कार्यक्रम विवरण:</TranslatedText>
                        </Text>
                        <BulletPoint text='इस फेस का समापन एक विशेष "संवाद व सम्मान कार्यक्रम" से किया जाएगा' />
                        <BulletPoint text="यह कार्यक्रम समाजवादी पार्टी के लखनऊ कार्यालय में आयोजित किया जाएगा" />
                        <BulletPoint text="कार्यक्रम की तिथि और समय श्री अखिलेश यादव जी के उपलब्ध समय के अनुसार तय किया जाएगा" />

                        <Text style={styles.subheading}>
                            <TranslatedText>🧭 लक्ष्य:</TranslatedText>
                        </Text>
                        <BulletPoint text="समाजवादी टेक फोर्स के पहले बैच के सदस्यों का सम्मान" />
                        <BulletPoint text="आगामी ट्रेनिंग और एक्शन फेस के लिए दिशा-निर्देश" />
                        <BulletPoint text="पार्टी और टेक फोर्स के बीच मजबूत संवाद की शुरुआत" />
                    </SectionCard>

                    {/* App Features */}
                    <SectionCard icon="cellphone-cog" title="ऐप की मुख्य विशेषताएं" color="#9333EA" delay={300}>

                        <Text style={styles.featureTitle}>
                            <TranslatedText>📢 कैंपेन और कार्य प्रबंधन</TranslatedText>
                        </Text>
                        <BulletPoint text='प्रत्येक सदस्य को दैनिक डिजिटल कार्य सौंपे जाएंगे' />
                        <BulletPoint text="कार्य पूरा होने पर पॉइंट्स और लीडरबोर्ड सिस्टम" />

                        <Text style={styles.featureTitle}>
                            <TranslatedText>🗳️ विधानसभा कनेक्ट</TranslatedText>
                        </Text>
                        <BulletPoint text="स्थानीय स्तर पर जुड़े सदस्यों की सूची" />
                        <BulletPoint text="कार्यक्रमों, बैठकों और अभियानों की सूचना" />
                        <BulletPoint text="जीपीएस लोकेशन से नज़दीकी सदस्य दिखें" />

                        <Text style={styles.featureTitle}>
                            <TranslatedText>💬 न्यूज़ और अपडेट सेक्शन</TranslatedText>
                        </Text>
                        <BulletPoint text="समाजवादी पार्टी से जुड़ी नवीनतम खबरें और घोषणाएँ" />
                        <BulletPoint text="पुश नोटिफिकेशन से महत्वपूर्ण संदेश" />

                        <Text style={styles.featureTitle}>
                            <TranslatedText>🧾 रिपोर्टिंग और विश्लेषण</TranslatedText>
                        </Text>
                        <BulletPoint text="प्रत्येक सदस्य की सोशल मीडिया एक्टिविटी रिपोर्ट" />
                        <BulletPoint text="जिलेवार प्रगति चार्ट और मासिक रिपोर्ट" />

                        <Text style={styles.featureTitle}>
                            <TranslatedText>🤝 संवाद केंद्र</TranslatedText>
                        </Text>
                        <BulletPoint text="ऐप के अंदर ही चैट और डिस्कशन फोरम" />
                        <BulletPoint text='सुझाव देने और "नेता से सवाल" सेक्शन' />

                        <Text style={styles.featureTitle}>
                            <TranslatedText>🔐 सुरक्षा और सत्यापन</TranslatedText>
                        </Text>
                        <BulletPoint text="सुरक्षित लॉगिन और डाटा सुरक्षा" />
                        <BulletPoint text='सत्यापित सदस्यों को "वेरिफाइड बैज"' />

                        <Text style={styles.featureTitle}>
                            <TranslatedText>🌟 पहचान और सम्मान</TranslatedText>
                        </Text>
                        <BulletPoint text="सक्रिय सदस्य को पॉइंट्स और डिजिटल बैज" />
                        <BulletPoint text="श्रेष्ठ डिजिटल कार्यकर्ता को होमपेज पर स्थान" />

                        <Text style={styles.featureTitle}>
                            <TranslatedText>🏁 चुनाव मोड</TranslatedText>
                        </Text>
                        <BulletPoint text="बूथ स्तर की रिपोर्टिंग प्रणाली" />
                        <BulletPoint text="चुनाव के दौरान लाइव अपडेट और डिजिटल समन्वय" />
                    </SectionCard>

                    {/* Contact Information */}
                    <SectionCard icon="office-building" title="संपर्क सूत्र" color="#F59E0B" delay={400}>
                        <View style={styles.contactItem}>
                            <MaterialCommunityIcons name="phone" size={20} color={SP_GREEN} />
                            <Text style={styles.contactText}>9621762121</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <MaterialCommunityIcons name="email" size={20} color={SP_GREEN} />
                            <Text style={styles.contactText}>info@samajwaditechforce.com</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <MaterialCommunityIcons name="email" size={20} color={SP_GREEN} />
                            <Text style={styles.contactText}>contact@samajwaditechforce.com</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <MaterialCommunityIcons name="map-marker" size={20} color={SP_GREEN} />
                            <Text style={styles.contactText}>
                                117/क्यू/710, गीता नगर क्रॉसिंग रोड, गीता नगर, काकादेव,{'\n'}शारदा नगर, कानपुर, उत्तर प्रदेश – 208025
                            </Text>
                        </View>
                        <Text style={styles.companyName}>
                            <TranslatedText>वर्कफोर्स इंफोटेक प्रा. लि.</TranslatedText>
                        </Text>
                    </SectionCard>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <MaterialCommunityIcons name="bicycle" size={40} color={SP_RED} />
                        <Text style={styles.footerText}>
                            <TranslatedText>साइकिल चलाओ देश बचाओ</TranslatedText>
                        </Text>
                        <Text style={styles.footerSubtext}>
                            <TranslatedText>आइए, मिलकर समाजवादी डिजिटल क्रांति को मजबूत करें!</TranslatedText>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginTop: 16,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        textAlign: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        flex: 1,
    },
    sectionContent: {
        padding: 20,
        paddingTop: 0,
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: '700',
        color: SP_RED,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: '#475569',
        marginBottom: 12,
    },
    subheading: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    bulletContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingLeft: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: SP_GREEN,
        marginTop: 9,
        marginRight: 12,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
        color: '#64748b',
    },
    teamMember: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    teamRole: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        width: 120,
    },
    teamName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    contactText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        marginLeft: 12,
        lineHeight: 20,
    },
    companyName: {
        fontSize: 16,
        fontWeight: '700',
        color: SP_RED,
        marginTop: 12,
        textAlign: 'center',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
        marginTop: 20,
    },
    footerText: {
        fontSize: 20,
        fontWeight: '800',
        color: SP_RED,
        marginTop: 12,
        marginBottom: 8,
    },
    footerSubtext: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '600',
    },
});
