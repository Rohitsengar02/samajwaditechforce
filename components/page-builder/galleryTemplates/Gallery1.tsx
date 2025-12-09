import React from 'react';
import { View, Image, Text, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ImageItem {
    url: string;
    title?: string;
    description?: string;
}

interface Gallery1Props {
    images?: ImageItem[];
    layout?: 'grid' | 'carousel';
    autoScroll?: boolean;
    scrollSpeed?: number;
    columns?: number;
    spacing?: number;
    viewport?: 'mobile' | 'desktop';
}

export default function Gallery1({
    images = [
        { url: 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?w=400', title: 'Project One', description: 'Modern workspace' },
        { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', title: 'Project Two', description: 'Tech innovation' },
        { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', title: 'Project Three', description: 'Digital solutions' },
        { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', title: 'Project Four', description: 'Team collaboration' },
    ],
    layout = 'grid',
    autoScroll = false,
    scrollSpeed = 3000,
    columns = 2,
    spacing = 12,
    viewport
}: Gallery1Props) {
    const { width: screenWidth } = useWindowDimensions();
    const isMobile = viewport ? viewport === 'mobile' : screenWidth < 768;
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Auto-scroll for carousel
    React.useEffect(() => {
        if (layout === 'carousel' && autoScroll && images.length > 0) {
            const slideWidth = screenWidth - (isMobile ? 32 : 48);
            const interval = setInterval(() => {
                const totalSlides = Math.ceil(images.length / (isMobile ? Math.min(columns || 1, 2) : (columns || 1)));
                const nextIndex = (currentIndex + 1) % totalSlides;
                scrollToIndex(nextIndex);
            }, scrollSpeed);
            return () => clearInterval(interval);
        }
    }, [layout, autoScroll, scrollSpeed, currentIndex, images.length, columns, spacing, isMobile, screenWidth]);

    const scrollToIndex = (index: number) => {
        const slideWidth = screenWidth - (isMobile ? 32 : 48);
        scrollViewRef.current?.scrollTo({
            x: index * (slideWidth + spacing),
            animated: true,
        });
        setCurrentIndex(index);
    };

    if (layout === 'carousel') {
        const cardsPerSlide = isMobile ? Math.min(columns || 1, 2) : (columns || 1);
        const totalSlides = Math.ceil(images.length / cardsPerSlide);
        const slideWidth = screenWidth - (isMobile ? 32 : 48); // Fixed width for slides
        const sidePadding = (screenWidth - slideWidth) / 2; // Center alignment

        return (
            <View style={{ paddingVertical: isMobile ? 16 : 24, position: 'relative' }}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    decelerationRate="fast"
                    snapToInterval={slideWidth + spacing}
                    disableIntervalMomentum
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: sidePadding,
                        paddingBottom: 20 // Shadow space
                    }}
                    scrollEventThrottle={16}
                    onScroll={(e) => {
                        const offsetX = e.nativeEvent.contentOffset.x;
                        const index = Math.round(offsetX / (slideWidth + spacing));
                        if (index !== currentIndex) {
                            setCurrentIndex(index);
                        }
                    }}
                >
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                        const startIdx = slideIndex * cardsPerSlide;
                        const slideImages = images.slice(startIdx, startIdx + cardsPerSlide);

                        return (
                            <View
                                key={slideIndex}
                                style={{
                                    width: slideWidth,
                                    marginRight: spacing,
                                    flexDirection: 'row',
                                    gap: spacing,
                                }}
                            >
                                {slideImages.map((item, cardIndex) => (
                                    <View
                                        key={startIdx + cardIndex}
                                        style={{
                                            flex: 1,
                                            height: isMobile ? 100 : 250,
                                        }}
                                    >
                                        <Image
                                            source={{ uri: item.url }}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: 16,
                                            }}
                                            resizeMode="cover"
                                        />

                                        {/* Overlay Title */}
                                        {(item.title || item.description) && (
                                            <View style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                padding: 16,
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                borderBottomLeftRadius: 16,
                                                borderBottomRightRadius: 16,
                                            }}>
                                                {item.title && item.title.trim() && (
                                                    <Text style={{
                                                        fontSize: isMobile ? 16 : 18,
                                                        fontWeight: '600',
                                                        color: '#fff',
                                                        marginBottom: 4,
                                                    }}>
                                                        {item.title}
                                                    </Text>
                                                )}
                                                {item.description && item.description.trim() && (
                                                    <Text style={{
                                                        fontSize: isMobile ? 13 : 14,
                                                        color: '#e5e7eb',
                                                    }}>
                                                        {item.description}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Desktop Arrows */}
                {!isMobile && totalSlides > 1 && (
                    <>
                        <Pressable
                            onPress={() => scrollToIndex(Math.max(0, currentIndex - 1))}
                            style={{
                                position: 'absolute',
                                left: 24,
                                top: '50%',
                                transform: [{ translateY: -20 }],
                                width: 40,
                                height: 40,
                                backgroundColor: 'white',
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 5,
                                zIndex: 100, // Explicit Z-Index
                                opacity: currentIndex === 0 ? 0.5 : 1,
                            }}
                            disabled={currentIndex === 0}
                        >
                            <MaterialCommunityIcons name="chevron-left" size={24} color="#1e293b" />
                        </Pressable>

                        <Pressable
                            onPress={() => scrollToIndex(Math.min(totalSlides - 1, currentIndex + 1))}
                            style={{
                                position: 'absolute',
                                right: 24,
                                top: '50%',
                                transform: [{ translateY: -20 }],
                                width: 40,
                                height: 40,
                                backgroundColor: 'white',
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 5,
                                zIndex: 100, // Explicit Z-Index
                                opacity: currentIndex === totalSlides - 1 ? 0.5 : 1,
                            }}
                            disabled={currentIndex === totalSlides - 1}
                        >
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#1e293b" />
                        </Pressable>
                    </>
                )}

                {/* Carousel Indicators */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 8 }}>
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <View
                            key={index}
                            style={{
                                width: currentIndex === index ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: currentIndex === index ? '#6366f1' : '#d1d5db',
                            }}
                        />
                    ))}
                </View>
            </View>
        );
    }

    // Grid Layout
    const effectiveColumns = isMobile ? Math.min(columns, 2) : columns;

    return (
        <View style={{ padding: isMobile ? 16 : 24 }}>
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: spacing,
                    justifyContent: 'center',
                }}
            >
                {images.map((item, index) => (
                    <View
                        key={index}
                        style={{
                            width: `${(100 / effectiveColumns) - (spacing * (effectiveColumns - 1)) / effectiveColumns}%`,
                        }}
                    >
                        <Image
                            source={{ uri: item.url }}
                            style={{
                                width: '100%',
                                height: isMobile ? 150 : 250,
                                borderRadius: 12,
                            }}
                            resizeMode="cover"
                        />
                        {(item.title || item.description) && (
                            <View style={{ paddingTop: 8 }}>
                                {item.title && item.title.trim() && (
                                    <Text style={{
                                        fontSize: isMobile ? 14 : 16,
                                        fontWeight: '600',
                                        color: '#111827',
                                        marginBottom: 4,
                                    }}>
                                        {item.title}
                                    </Text>
                                )}
                                {item.description && item.description.trim() && (
                                    <Text style={{
                                        fontSize: isMobile ? 12 : 13,
                                        color: '#6b7280',
                                        lineHeight: isMobile ? 16 : 18,
                                    }}>
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}
