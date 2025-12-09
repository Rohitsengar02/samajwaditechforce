import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Hero2Props {
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

export default function Hero2({
    title = "Empowering your business future",
    subtitle = "Transform your business with cutting-edge technology solutions",
    buttonText = "Learn More",
    buttonUrl = "#",
    imageUrl = "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
    backgroundColor = "#000000",
    accentColor = "#00ff88",
    textColor = "#ffffff",
    viewport
}: Hero2Props) {
    const isMobile = viewport ? viewport === 'mobile' : screenWidth < 768;
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.9);

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
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
            {/* Diagonal Accent */}
            <View style={{
                position: 'absolute',
                top: 0,
                right: -100,
                width: '50%',
                height: '100%',
                backgroundColor: accentColor,
                transform: [{ skewX: '-15deg' }],
                opacity: isMobile ? 0.8 : 1,
            }} />

            <View style={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                padding: isMobile ? 24 : 40,
                gap: isMobile ? 24 : 40,
                position: 'relative',
                zIndex: 10,
            }}>
                {/* Left Content */}
                <Animated.View style={{
                    flex: 1,
                    width: '100%',
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }}>
                    <Text style={{
                        fontSize: isMobile ? 32 : 56,
                        fontWeight: 'bold',
                        color: textColor,
                        marginBottom: isMobile ? 16 : 24,
                        lineHeight: isMobile ? 38 : 64,
                    }}>
                        {title}
                    </Text>

                    <Text style={{
                        fontSize: isMobile ? 14 : 18,
                        color: textColor,
                        opacity: 0.9,
                        marginBottom: isMobile ? 24 : 40,
                        lineHeight: isMobile ? 22 : 28,
                    }}>
                        {subtitle}
                    </Text>

                    {/* Only show button if buttonText exists */}
                    {buttonText && buttonText.trim().length > 0 && (
                        <TouchableOpacity
                            style={{
                                backgroundColor: accentColor,
                                paddingHorizontal: isMobile ? 28 : 40,
                                paddingVertical: isMobile ? 14 : 18,
                                borderRadius: 12,
                                alignSelf: 'flex-start',
                            }}
                        >
                            <Text style={{
                                color: '#000000',
                                fontWeight: 'bold',
                                fontSize: isMobile ? 15 : 18,
                            }}>
                                {buttonText}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Trust Indicators */}
                    <View style={{ flexDirection: 'row', marginTop: isMobile ? 28 : 40, gap: isMobile ? 16 : 24 }}>
                        <View>
                            <Text style={{ color: accentColor, fontSize: isMobile ? 24 : 32, fontWeight: 'bold' }}>500+</Text>
                            <Text style={{ color: textColor, opacity: 0.7, fontSize: isMobile ? 12 : 14 }}>Clients</Text>
                        </View>
                        <View>
                            <Text style={{ color: accentColor, fontSize: isMobile ? 24 : 32, fontWeight: 'bold' }}>99%</Text>
                            <Text style={{ color: textColor, opacity: 0.7, fontSize: isMobile ? 12 : 14 }}>Satisfaction</Text>
                        </View>
                    </View>
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
                            height: isMobile ? 250 : 450,
                            borderRadius: 16,
                        }}
                        resizeMode="cover"
                    />
                </Animated.View>
            </View>
        </View>
    );
}
