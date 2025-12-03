import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Easing,
    Image,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import verifiedUsersData from './(tabs)/समाजवादी टेक फोर्स से जुड़ें — बने समाजवाद की डिजिटल आवाज़! (Responses) (5).json';
import { getApiUrl } from '../utils/api';

const { width, height } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Filter verified users from JSON
const getVerifiedVolunteers = () => {
    try {
        const data = (verifiedUsersData as any).default || verifiedUsersData;
        const safeData = Array.isArray(data) ? data : [];

        const verified = safeData
            .filter((user: any) => user && user['वेरिफिकेशन स्टेटस ']?.trim() === 'Verified')
            .slice(0, 20) // Get first 20 verified users
            .map((user: any, index: number) => ({
                id: index + 1,
                name: user['Column2'] || user['आपका पूरा नाम क्या है? '] || 'Unknown',
                role: user['Column4'] || user['जिला '] || 'Volunteer',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user['Column2'] || user['आपका पूरा नाम क्या है? '] || 'User')}&background=random&color=fff&size=128`
            }));

        // Return fallback data if no verified users found
        if (verified.length === 0) {
            return [
                { id: 1, name: 'राहुल शर्मा', role: 'Kanpur', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
                { id: 2, name: 'प्रिया सिंह', role: 'Lucknow', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
                { id: 3, name: 'अमित यादव', role: 'Varanasi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
                { id: 4, name: 'सुनीता वर्मा', role: 'Agra', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
                { id: 5, name: 'विक्रम सिंह', role: 'Meerut', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
                { id: 6, name: 'नेहा गुप्ता', role: 'Ghaziabad', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
                { id: 7, name: 'राजेश कुमार', role: 'Noida', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
                { id: 8, name: 'पूजा पटेल', role: 'Prayagraj', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
            ];
        }

        return verified;
    } catch (error) {
        console.error('Error loading verified users:', error);
        // Return fallback data on error
        return [
            { id: 1, name: 'राहुल शर्मा', role: 'Kanpur', avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=E30512&color=fff&size=128' },
            { id: 2, name: 'प्रिया सिंह', role: 'Lucknow', avatar: 'https://ui-avatars.com/api/?name=Priya+Singh&background=009933&color=fff&size=128' },
            { id: 3, name: 'अमित यादव', role: 'Varanasi', avatar: 'https://ui-avatars.com/api/?name=Amit+Yadav&background=E30512&color=fff&size=128' },
            { id: 4, name: 'सुनीता वर्मा', role: 'Agra', avatar: 'https://ui-avatars.com/api/?name=Sunita+Verma&background=009933&color=fff&size=128' },
            { id: 5, name: 'विक्रम सिंह', role: 'Meerut', avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=E30512&color=fff&size=128' },
            { id: 6, name: 'नेहा गुप्ता', role: 'Ghaziabad', avatar: 'https://ui-avatars.com/api/?name=Neha+Gupta&background=009933&color=fff&size=128' },
        ];
    }
};

const VOLUNTEERS = getVerifiedVolunteers();

// Infinite Grid Slider Component - 3 cards per row, 4 rows - FULLSCREEN
const InfiniteGridSlider = () => {
    const scrollX = useRef(new Animated.Value(0)).current;
    // Calculate card size to fit exactly 4 rows in screen height
    const CARD_HEIGHT = height / 4; // Each row takes exactly 1/4 of screen
    const CARD_WIDTH = width / 3;  // Each column takes 1/3 of screen width
    const CARD_MARGIN = 0; // NO gaps
    const NUM_ROWS = 4; // Exactly 4 rows to fill screen

    // Distribute volunteers into rows FIRST
    const rowsRaw: any[][] = Array.from({ length: NUM_ROWS }, () => []);
    VOLUNTEERS.forEach((item: any, index: number) => {
        const rowIndex = index % NUM_ROWS;
        rowsRaw[rowIndex].push({ ...item, originalIndex: index });
    });

    // Create infinite data for each row by duplicating
    // Duplicate 10 times to ensure plenty of content for seamless scrolling
    const rows = rowsRaw.map(row => [
        ...row, ...row, ...row, ...row, ...row,
        ...row, ...row, ...row, ...row, ...row
    ]);

    // We scroll by the width of ONE set of items to create seamless loop
    const singleSetWidth = rowsRaw[0].length * CARD_WIDTH;

    useEffect(() => {
        // Auto-scroll from right to left
        const scrollAnimation = Animated.loop(
            Animated.timing(scrollX, {
                toValue: -singleSetWidth,
                duration: rowsRaw[0].length * 4000, // Slower, smoother scroll
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        scrollAnimation.start();

        return () => scrollAnimation.stop();
    }, []);

    const gradients = [
        ['#ff9a9e', '#fad0c4'],
        ['#a18cd1', '#fbc2eb'],
        ['#84fab0', '#8fd3f4'],
        ['#ffecd2', '#fcb69f'],
        [SP_RED, '#b91c1c'],
        [SP_GREEN, '#15803d']
    ];

    return (
        <View style={styles.gridSliderContainer} pointerEvents="none">
            {rows.map((rowData, rowIndex) => (
                <Animated.View
                    key={`row-${rowIndex}`}
                    style={[
                        styles.gridRow,
                        {
                            transform: [{
                                translateX: scrollX
                            }],
                            width: rowData.length * CARD_WIDTH,
                        }
                    ]}
                >
                    {rowData.map((volunteer, colIndex) => {
                        const gradient = gradients[volunteer.originalIndex % gradients.length];

                        return (
                            <View
                                key={`${rowIndex}-${colIndex}-${volunteer.id}`}
                                style={[styles.gridCard, {
                                    width: CARD_WIDTH,
                                    height: CARD_HEIGHT + 1, // +1 to prevent sub-pixel gaps
                                    marginRight: CARD_MARGIN
                                }]}
                            >
                                <LinearGradient
                                    colors={gradient as any}
                                    style={styles.gridCardGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.gridCardContent}>
                                        <View style={styles.gridAvatarContainer}>
                                            <Image
                                                source={{ uri: volunteer.avatar }}
                                                style={{ width: '100%', height: '100%', borderRadius: 35 }}
                                                resizeMode="cover"
                                            />
                                        </View>
                                        <Text style={styles.gridName} numberOfLines={2}>
                                            {volunteer.name}
                                        </Text>
                                        <Text style={styles.gridRole} numberOfLines={1}>
                                            {volunteer.role}
                                        </Text>
                                        <View style={styles.gridBadge}>
                                            <MaterialCommunityIcons
                                                name="check-decagram"
                                                size={16}
                                                color="#fff"
                                            />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>
                        );
                    })}
                </Animated.View>
            ))}
        </View>
    );
};

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isSplashVisible, setIsSplashVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const defaultSlides = [
        {
            title: 'Mission 2027',
            description: 'Empowering youth, expanding reach, strengthening booths, winning hearts, ensuring Samajwadi victory in 2027 elections.',
            type: 'image',
            image: 'https://samajwadiparty.in/_assets/img/president.jpg',
            gradient: [SP_RED, '#b91c1c', '#7f1d1d'],
            order: 0
        },
        {
            title: 'लाखों डिजिटल वालंटियर्स',
            description: 'हर विधानसभा में प्रशिक्षित युवाओं का नेटवर्क तैयार कर एक सक्रिय डिजिटल टीम बनाई जा रही है।',
            type: 'carousel',
            gradient: [SP_GREEN, '#15803d', '#14532d'],
            order: 1
        },
        {
            title: 'Samajwadi Tech Force',
            description: 'समाजवादी टेक फोर्स सत्ता परिवर्तन की दिशा में एक सशक्त कदम',
            type: 'image',
            image: 'https://timetv.news/wp-content/uploads/2025/07/Akhilesh-Yadav.png',
            gradient: ['#dc2626', SP_RED, '#991b1b'],
            order: 2
        },
        {
            title: 'स्किल ट्रेनिंग और विकास',
            description: 'सोशल मीडिया हैंडलिंग, पोस्टर डिज़ाइन और वीडियो एडिटिंग में युवाओं को प्रशिक्षित करना।',
            type: 'image',
            image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202412/akhilesh-yadav-290226162-1x1.jpg',
            gradient: ['#16a34a', SP_GREEN, '#166534'],
            order: 3
        },
    ];

    const [slides, setSlides] = useState<any[]>(defaultSlides);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const fetchSlides = async () => {
        try {
            const API_URL = getApiUrl();
            console.log('Fetching slides from:', `${API_URL}/onboarding`);
            const response = await fetch(`${API_URL}/onboarding`);
            const text = await response.text();

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON response:', text.substring(0, 200));
                throw new Error('Invalid JSON response');
            }

            if (data.success && data.slides && data.slides.length > 0) {
                const apiSlides = data.slides.map((s: any) => ({
                    title: s.title,
                    description: s.description,
                    type: 'image',
                    image: s.imageUrl,
                    gradient: s.gradient || [SP_RED, '#b91c1c', '#7f1d1d'],
                    order: s.order
                }));

                const fixedSlide = {
                    title: 'लाखों डिजिटल वालंटियर्स',
                    description: 'हर विधानसभा में प्रशिक्षित युवाओं का नेटवर्क तैयार कर एक सक्रिय डिजिटल टीम बनाई जा रही है।',
                    type: 'carousel',
                    gradient: [SP_GREEN, '#15803d', '#14532d'],
                    order: 1 // Fixed position
                };

                // Combine and sort
                const combinedSlides = [...apiSlides, fixedSlide].sort((a, b) => a.order - b.order);
                setSlides(combinedSlides);
            } else {
                setSlides(defaultSlides);
            }
        } catch (error) {
            console.error('Error fetching onboarding slides:', error);
            setSlides(defaultSlides);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    useEffect(() => {
        // Splash Timer
        const timer = setTimeout(() => {
            setIsSplashVisible(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Reset animations on slide change
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);
        slideAnim.setValue(50);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentIndex]);

    const currentSlide = slides[currentIndex] || slides[0];

    const handleNext = () => {
        if (currentIndex === slides.length - 1) {
            router.replace('/register');
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        router.replace('/register');
    };

    if (isSplashVisible) {
        return (
            <View style={styles.splashContainer}>
                <LinearGradient colors={[SP_RED, '#b91c1c']} style={StyleSheet.absoluteFill} />
                <View style={styles.splashContent}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/images/icon.png')}
                            style={styles.splashLogo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.splashTitle}>Samajwadi Tech Force</Text>
                    <Text style={styles.splashSubtitle}>Digital Revolution</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={currentSlide.gradient as any} style={StyleSheet.absoluteFill} />

            {/* Grid Slider as Background for Carousel Slide */}
            {currentSlide.type === 'carousel' && (
                <>
                    <InfiniteGridSlider />
                    {/* Dark Gradient Overlay for better text visibility */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                    />
                </>
            )}

            {/* Background Decoration */}
            <View style={styles.decorationCircle1} />
            <View style={styles.decorationCircle2} />

            {/* Skip Button */}
            <TouchableOpacity
                style={[styles.skipButton, { top: insets.top + 20 }]}
                onPress={handleSkip}
            >
                <Text style={styles.skipText}>Skip</Text>
                <MaterialCommunityIcons name="chevron-double-right" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                {/* Illustration */}
                <Animated.View
                    style={[
                        styles.illustrationContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
                        }
                    ]}
                >
                    {currentSlide.type === 'carousel' ? null : (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: currentSlide.image }}
                                style={styles.slideImage}
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.5)']}
                                style={StyleSheet.absoluteFill}
                            />
                        </View>
                    )}
                </Animated.View>

                {/* Text Content */}
                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.title}>{currentSlide.title}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.description}>{currentSlide.description}</Text>
                </Animated.View>

                {/* Footer Navigation */}
                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    {/* Dots */}
                    <View style={styles.pagination}>
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentIndex && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        {currentIndex > 0 ? (
                            <TouchableOpacity onPress={handlePrev} style={styles.prevButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <View style={{ width: 50 }} />
                        )}

                        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                            <Text style={styles.nextButtonText}>
                                {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                            </Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color={currentIndex === slides.length - 1 ? SP_RED : SP_GREEN} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SP_DARK,
    },
    splashContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    splashContent: {
        alignItems: 'center',
    },
    logoContainer: {
        width: width * 0.3,
        height: width * 0.3,
        backgroundColor: '#fff',
        borderRadius: (width * 0.3) / 2,
        padding: 10,
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    splashLogo: {
        width: '100%',
        height: '100%',
    },
    splashTitle: {
        fontSize: width * 0.08,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    splashSubtitle: {
        fontSize: width * 0.04,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 2,
    },
    decorationCircle1: {
        position: 'absolute',
        top: -width * 0.2,
        left: -width * 0.1,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    decorationCircle2: {
        position: 'absolute',
        bottom: width * 0.2,
        right: -width * 0.2,
        width: width,
        height: width,
        borderRadius: width / 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    skipButton: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        zIndex: 10,
    },
    skipText: {
        color: '#fff',
        marginRight: 4,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: height * 0.12,
        position: 'relative',
    },
    illustrationContainer: {
        height: height * 0.35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        width: width * 0.75,
        height: width * 0.75,
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    slideImage: {
        width: '100%',
        height: '100%',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    fallingContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0, // Behind text but visible
    },
    circleCard: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    circleGradient: {
        flex: 1,
        borderRadius: 55,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    circleInitial: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    circleLocation: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 2,
        fontWeight: '600',
    },
    circlePosition: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    circleName: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    // Grid Slider Styles
    gridSliderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
    },
    gridRow: {
        flexDirection: 'row',
        marginBottom: 0, // NO gap between rows
    },
    gridCard: {
        borderRadius: 0, // Sharp edges for seamless look
        overflow: 'hidden',
        elevation: 0,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)', // Subtle border
    },
    gridCardGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridCardContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridAvatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    gridInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    gridName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 6,
        paddingHorizontal: 8,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    gridRole: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    gridBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 14,
        padding: 6,
    },
    textContainer: {
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: width * 0.07,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 15,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    divider: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 2,
        marginBottom: 15,
    },
    description: {
        fontSize: width * 0.04,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 30,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    prevButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        elevation: 5,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
});