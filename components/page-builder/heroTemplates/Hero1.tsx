import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface Hero1Props {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonUrl?: string;
    imageUrl?: string;
    backgroundColor?: string;
    accentColor?: string;
    textColor?: string;
    viewport?: 'mobile' | 'desktop';
}

export default function Hero1({
    title = "IT Services & Solutions",
    subtitle = "Unlock and unleash the next level business model of innovation.",
    buttonText = "Get Started",
    buttonUrl = "#",
    imageUrl = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    backgroundColor = "#1a1f3a",
    accentColor = "#ff6b35",
    textColor = "#ffffff",
    viewport
}: Hero1Props) {
    // Use viewport prop if provided, otherwise fall back to screen dimensions
    const isMobile = viewport ? viewport === 'mobile' : screenWidth < 768;

    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(-50);

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={{
            backgroundColor,
            minHeight: isMobile ? 400 : 500,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Elements */}
            <View style={{
                position: 'absolute',
                top: 50,


                right: -50,
                width: isMobile ? 120 : 200,
                height: isMobile ? 120 : 200,
                borderRadius: isMobile ? 60 : 100,
                backgroundColor: accentColor,
                opacity: 0.1,
            }} />
            <View style={{
                position: 'absolute',
                bottom: 30,
                left: -30,
                width: isMobile ? 100 : 150,
                height: isMobile ? 100 : 150,
                borderRadius: isMobile ? 50 : 75,
                backgroundColor: accentColor,
                opacity: 0.1,
            }} />

            <View style={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                padding: isMobile ? 24 : 40,
                gap: isMobile ? 24 : 40,
            }}>
                {/* Left Content */}
                <Animated.View style={{
                    flex: 1,
                    width: '100%',
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }]
                }}>
                    <Text style={{
                        fontSize: isMobile ? 10 : 12,
                        color: accentColor,
                        fontWeight: '600',
                        marginBottom: isMobile ? 12 : 16,
                        letterSpacing: 2,
                        textTransform: 'uppercase'
                    }}>
                        WE PROVIDE OUTSTANDING
                    </Text>

                    <Text style={{
                        fontSize: isMobile ? 28 : 48,
                        fontWeight: 'bold',
                        color: textColor,
                        marginBottom: isMobile ? 12 : 20,
                        lineHeight: isMobile ? 34 : 56,
                    }}>
                        {title}
                    </Text>

                    <Text style={{
                        fontSize: isMobile ? 14 : 16,
                        color: textColor,
                        opacity: 0.8,
                        marginBottom: isMobile ? 20 : 32,
                        lineHeight: isMobile ? 20 : 24,
                    }}>
                        {subtitle}
                    </Text>

                    {/* Only show buttons if buttonText exists */}
                    {buttonText && buttonText.trim().length > 0 && (
                        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: accentColor,
                                    paddingHorizontal: isMobile ? 24 : 32,
                                    paddingVertical: isMobile ? 12 : 16,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? 14 : 16,
                                }}>
                                    {buttonText}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    borderWidth: 2,
                                    borderColor: textColor,
                                    paddingHorizontal: isMobile ? 24 : 32,
                                    paddingVertical: isMobile ? 12 : 16,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{
                                    color: textColor,
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? 14 : 16,
                                }}>
                                    Contact Us
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>

                {/* Right Image */}
                <Animated.View style={{
                    flex: 1,
                    width: '100%',
                    opacity: fadeAnim,
                }}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={{
                            width: '100%',
                            height: isMobile ? 250 : 400,
                            borderRadius: isMobile ? 12 : 20,
                        }}
                        resizeMode="cover"
                    />
                </Animated.View>
            </View>
        </View>
    );
}
