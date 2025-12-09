import React from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface Hero3Props {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    backgroundColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    viewport?: 'mobile' | 'desktop';
}

export default function Hero3({
    title = "Manage Your Team's Productivity",
    subtitle = "Plan projects, stay on track, and deliver on time without overworking your team.",
    buttonText = "Try Now - Free!",
    backgroundColor = "#ffffff",
    primaryColor = "#7c3aed",
    secondaryColor = "#ff4d4f",
    textColor = "#1a1a1a",
    viewport
}: Hero3Props) {
    const isMobile = viewport ? viewport === 'mobile' : screenWidth < 768;
    const fadeAnim = new Animated.Value(0);
    const floatAnim1 = new Animated.Value(0);
    const floatAnim2 = new Animated.Value(0);

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        // Floating animation for cards
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim1, {
                    toValue: -10,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim1, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim2, {
                    toValue: 10,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim2, {
                    toValue: 0,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={{
            backgroundColor,
            minHeight: isMobile ? 450 : 550,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Wave */}
            <View style={{
                position: 'absolute',
                bottom: -50,
                left: 0,
                right: 0,
                height: isMobile ? 120 : 200,
                backgroundColor: '#fff5f5',
                borderTopLeftRadius: isMobile ? 60 : 100,
                borderTopRightRadius: isMobile ? 60 : 100,
                transform: [{ scaleX: 2 }]
            }} />

            <View style={{
                alignItems: 'center',
                paddingVertical: isMobile ? 40 : 60,
                paddingHorizontal: isMobile ? 20 : 40,
                position: 'relative',
                zIndex: 10,
            }}>
                {/* Floating Cards - Hide on mobile for cleaner look */}
                {!isMobile && (
                    <>
                        <Animated.View style={{
                            position: 'absolute',
                            left: 40,
                            top: 120,
                            transform: [{ translateY: floatAnim1 }],
                            backgroundColor: 'white',
                            padding: 16,
                            borderRadius: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 4,
                        }}>
                            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>UX Copywrite</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>This is your C.B. Suzie</Text>
                        </Animated.View>

                        <Animated.View style={{
                            position: 'absolute',
                            right: 40,
                            top: 140,
                            transform: [{ translateY: floatAnim2 }],
                            backgroundColor: 'white',
                            padding: 16,
                            borderRadius: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 4,
                        }}>
                            <Text style={{ fontSize: 12, color: '#666' }}>UI Animations</Text>
                        </Animated.View>
                    </>
                )}

                {/* Main Content */}
                <Animated.View style={{
                    alignItems: 'center',
                    opacity: fadeAnim,
                    maxWidth: isMobile ? '100%' : 700,
                }}>
                    <Text style={{
                        fontSize: isMobile ? 36 : 64,
                        fontWeight: 'bold',
                        color: textColor,
                        marginBottom: isMobile ? 16 : 24,
                        textAlign: 'center',
                        lineHeight: isMobile ? 42 : 72,
                    }}>
                        {title.split("'").map((part, i) => (
                            i === 1 ? (
                                <Text key={i} style={{ color: secondaryColor }}>'{part}'</Text>
                            ) : part
                        ))}
                    </Text>

                    <Text style={{
                        fontSize: isMobile ? 15 : 18,
                        color: '#666',
                        marginBottom: isMobile ? 28 : 40,
                        textAlign: 'center',
                        lineHeight: isMobile ? 22 : 28,
                        maxWidth: isMobile ? '100%' : 600,
                        paddingHorizontal: isMobile ? 0 : 20,
                    }}>
                        {subtitle}
                    </Text>

                    <TouchableOpacity
                        style={{
                            backgroundColor: primaryColor,
                            paddingHorizontal: isMobile ? 28 : 40,
                            paddingVertical: isMobile ? 14 : 18,
                            borderRadius: 50,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <View style={{
                            width: isMobile ? 20 : 24,
                            height: isMobile ? 20 : 24,
                            borderRadius: isMobile ? 10 : 12,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Text style={{ color: primaryColor, fontSize: isMobile ? 14 : 16 }}>○</Text>
                        </View>
                        <Text style={{
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: isMobile ? 14 : 16,
                        }}>
                            {buttonText}
                        </Text>
                    </TouchableOpacity>

                    {/* Rating */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: isMobile ? 24 : 32,
                        gap: 8,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}>
                        <Text style={{ fontSize: isMobile ? 18 : 20 }}>⭐</Text>
                        <Text style={{ fontSize: isMobile ? 14 : 16, fontWeight: '600' }}>
                            Excellent 4.9 out of 5
                        </Text>
                        <Text style={{ color: '#666', fontSize: isMobile ? 13 : 14 }}>— Globeber</Text>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}
