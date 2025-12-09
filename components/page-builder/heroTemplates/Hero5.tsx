import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Hero5Props {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    imageUrl?: string;
    backgroundColor?: string;
    accentColor?: string;
    textColor?: string;
    viewport?: 'mobile' | 'desktop';
}

export default function Hero5({
    title = "Next Generation Solutions",
    subtitle = "Innovative technology that drives your business forward in the digital age",
    buttonText = "Get Started Today",
    imageUrl = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
    backgroundColor = "#0a0e27",
    accentColor = "#00d4ff",
    textColor = "#ffffff",
    viewport
}: Hero5Props) {
    const isMobile = viewport ? viewport === 'mobile' : screenWidth < 768;
    const fadeAnim = new Animated.Value(0);
    const slideLeft = new Animated.Value(100);
    const pulse = new Animated.Value(1);

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideLeft, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 1500,
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
            {/* Grid Pattern Background */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.05,
            }}>
                {[...Array(isMobile ? 6 : 10)].map((_, i) => (
                    <View key={i} style={{
                        position: 'absolute',
                        top: i * (isMobile ? 75 : 60),
                        left: 0,
                        right: 0,
                        height: 1,
                        backgroundColor: accentColor,
                    }} />
                ))}
            </View>

            {/* Glowing Circles */}
            <Animated.View style={{
                position: 'absolute',
                top: isMobile ? 60 : 100,
                left: isMobile ? 30 : 60,
                width: isMobile ? 100 : 150,
                height: isMobile ? 100 : 150,
                borderRadius: isMobile ? 50 : 75,
                backgroundColor: accentColor,
                opacity: 0.15,
                transform: [{ scale: pulse }],
            }} />
            <View style={{
                position: 'absolute',
                bottom: isMobile ? 50 : 80,
                right: isMobile ? 40 : 80,
                width: isMobile ? 120 : 200,
                height: isMobile ? 120 : 200,
                borderRadius: isMobile ? 60 : 100,
                borderWidth: 2,
                borderColor: accentColor,
                opacity: 0.2,
            }} />

            <View style={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                padding: isMobile ? 24 : 40,
                gap: isMobile ? 32 : 60,
                position: 'relative',
                zIndex: 10,
            }}>
                {/* Left Content */}
                <Animated.View style={{
                    flex: 1,
                    width: '100%',
                    opacity: fadeAnim,
                }}>
                    <View style={{
                        paddingVertical: isMobile ? 6 : 8,
                        paddingHorizontal: isMobile ? 12 : 16,
                        backgroundColor: `${accentColor}20`,
                        borderLeftWidth: 3,
                        borderLeftColor: accentColor,
                        marginBottom: isMobile ? 16 : 24,
                        alignSelf: 'flex-start',
                    }}>
                        <Text style={{
                            color: accentColor,
                            fontSize: isMobile ? 11 : 14,
                            fontWeight: '600',
                        }}>
                            WELCOME TO THE FUTURE
                        </Text>
                    </View>

                    <Text style={{
                        fontSize: isMobile ? 34 : 58,
                        fontWeight: 'bold',
                        color: textColor,
                        marginBottom: isMobile ? 14 : 20,
                        lineHeight: isMobile ? 40 : 66,
                    }}>
                        {title}
                    </Text>

                    <Text style={{
                        fontSize: isMobile ? 14 : 18,
                        color: textColor,
                        opacity: 0.8,
                        marginBottom: isMobile ? 28 : 40,
                        lineHeight: isMobile ? 22 : 30,
                    }}>
                        {subtitle}
                    </Text>

                    <View style={{
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 12,
                        width: isMobile ? '100%' : 'auto',
                    }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: accentColor,
                                paddingHorizontal: isMobile ? 28 : 36,
                                paddingVertical: isMobile ? 13 : 16,
                                borderRadius: 8,
                                shadowColor: accentColor,
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.4,
                                shadowRadius: 16,
                                elevation: 8,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{
                                color: backgroundColor,
                                fontWeight: 'bold',
                                fontSize: isMobile ? 14 : 16,
                            }}>
                                {buttonText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                paddingHorizontal: isMobile ? 28 : 36,
                                paddingVertical: isMobile ? 13 : 16,
                                borderRadius: 8,
                                borderWidth: 2,
                                borderColor: accentColor,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{
                                color: accentColor,
                                fontWeight: 'bold',
                                fontSize: isMobile ? 14 : 16,
                            }}>
                                View Case Studies
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={{
                        flexDirection: 'row',
                        marginTop: isMobile ? 32 : 50,
                        gap: isMobile ? 24 : 40,
                        flexWrap: 'wrap',
                    }}>
                        <View>
                            <Text style={{
                                fontSize: isMobile ? 28 : 36,
                                fontWeight: 'bold',
                                color: accentColor,
                                marginBottom: 4,
                            }}>
                                1000+
                            </Text>
                            <Text style={{ color: textColor, opacity: 0.7, fontSize: isMobile ? 12 : 14 }}>
                                Projects Delivered
                            </Text>
                        </View>
                        <View>
                            <Text style={{
                                fontSize: isMobile ? 28 : 36,
                                fontWeight: 'bold',
                                color: accentColor,
                                marginBottom: 4,
                            }}>
                                98%
                            </Text>
                            <Text style={{ color: textColor, opacity: 0.7, fontSize: isMobile ? 12 : 14 }}>
                                Client Satisfaction
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Right Image */}
                <Animated.View style={{
                    flex: 1,
                    width: '100%',
                    opacity: fadeAnim,
                    transform: isMobile ? [] : [{ translateX: slideLeft }],
                }}>
                    <View style={{
                        position: 'relative',
                        shadowColor: accentColor,
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.3,
                        shadowRadius: 30,
                    }}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={{
                                width: '100%',
                                height: isMobile ? 280 : 450,
                                borderRadius: isMobile ? 16 : 20,
                            }}
                            resizeMode="cover"
                        />
                        {/* Decorative Corner */}
                        <View style={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            width: isMobile ? 60 : 100,
                            height: isMobile ? 60 : 100,
                            borderTopWidth: 3,
                            borderRightWidth: 3,
                            borderColor: accentColor,
                            borderTopRightRadius: isMobile ? 16 : 20,
                        }} />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}
