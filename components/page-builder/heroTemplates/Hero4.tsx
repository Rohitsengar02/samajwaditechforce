import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface Hero4Props {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    imageUrl?: string;
    gradientStart?: string;
    gradientEnd?: string;
    textColor?: string;
    viewport?: 'mobile' | 'desktop';
}

export default function Hero4({
    title = "Digital Innovation",
    subtitle = "We transform businesses through cutting-edge digital solutions and strategic technology partnerships.",
    buttonText = "Explore Solutions",
    imageUrl = "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
    gradientStart = "#667eea",
    gradientEnd = "#764ba2",
    textColor = "#ffffff",
    viewport
}: Hero4Props) {
    const isMobile = viewport ? viewport === 'mobile' : screenWidth < 768;
    const fadeAnim = new Animated.Value(0);
    const slideUp = new Animated.Value(50);
    const rotate = new Animated.Value(0);

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideUp, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration: 20000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <LinearGradient
            colors={[gradientStart, gradientEnd]}
            style={{
                minHeight: isMobile ? 500 : 600,
                position: 'relative',
                overflow: 'hidden'
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Animated Background Shapes */}
            <Animated.View style={{
                position: 'absolute',
                top: -100,
                right: isMobile ? -80 : -100,
                width: isMobile ? 250 : 400,
                height: isMobile ? 250 : 400,
                borderRadius: isMobile ? 125 : 200,
                backgroundColor: 'rgba(255,255,255,0.1)',
                transform: [{ rotate: spin }],
            }} />
            <View style={{
                position: 'absolute',
                bottom: -80,
                left: isMobile ? -60 : -80,
                width: isMobile ? 200 : 300,
                height: isMobile ? 200 : 300,
                borderRadius: isMobile ? 100 : 150,
                backgroundColor: 'rgba(255,255,255,0.08)',
            }} />

            <View style={{
                paddingVertical: isMobile ? 50 : 80,
                paddingHorizontal: isMobile ? 20 : 40,
                alignItems: 'center',
                position: 'relative',
                zIndex: 10,
            }}>
                <Animated.View style={{
                    alignItems: 'center',
                    maxWidth: isMobile ? '100%' : 900,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUp }],
                }}>
                    <Text style={{
                        fontSize: isMobile ? 40 : 72,
                        fontWeight: 'bold',
                        color: textColor,
                        marginBottom: isMobile ? 16 : 24,
                        textAlign: 'center',
                        lineHeight: isMobile ? 46 : 80,
                        textShadowColor: 'rgba(0,0,0,0.2)',
                        textShadowOffset: { width: 0, height: 4 },
                        textShadowRadius: 10,
                    }}>
                        {title}
                    </Text>

                    <Text style={{
                        fontSize: isMobile ? 15 : 20,
                        color: textColor,
                        opacity: 0.95,
                        marginBottom: isMobile ? 32 : 48,
                        textAlign: 'center',
                        lineHeight: isMobile ? 22 : 32,
                        maxWidth: isMobile ? '100%' : 700,
                    }}>
                        {subtitle}
                    </Text>

                    <View style={{
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 12,
                        marginBottom: isMobile ? 40 : 60,
                        width: isMobile ? '100%' : 'auto',
                    }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: 'white',
                                paddingHorizontal: isMobile ? 28 : 36,
                                paddingVertical: isMobile ? 14 : 18,
                                borderRadius: 50,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 16,
                                elevation: 8,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{
                                color: gradientStart,
                                fontWeight: 'bold',
                                fontSize: isMobile ? 14 : 16,
                            }}>
                                {buttonText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                borderWidth: 2,
                                borderColor: 'white',
                                paddingHorizontal: isMobile ? 28 : 36,
                                paddingVertical: isMobile ? 14 : 18,
                                borderRadius: 50,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: isMobile ? 14 : 16,
                            }}>
                                Watch Demo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Feature Image/Mockup */}
                    <View style={{
                        width: '100%',
                        maxWidth: isMobile ? 350 : 800,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: isMobile ? 16 : 24,
                        padding: isMobile ? 6 : 8,
                        backdropFilter: 'blur(10px)',
                    }}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={{
                                width: '100%',
                                height: isMobile ? 220 : 400,
                                borderRadius: isMobile ? 12 : 16,
                            }}
                            resizeMode="cover"
                        />
                    </View>
                </Animated.View>
            </View>
        </LinearGradient>
    );
}
