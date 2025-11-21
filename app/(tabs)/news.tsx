import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    Easing,
    Share,
    Modal,
    Image,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// News Card Component
const NewsCard = ({ id, title, description, category, time, image, likes: initialLikes, comments, featured = false }: any) => {
    const router = useRouter();
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(initialLikes || 0);
    const [showComments, setShowComments] = useState(false);
    const likeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const slideAnim = useRef(new Animated.Value(600)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (showComments) {
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 600,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [showComments]);

    const handleLike = () => {
        setLiked(!liked);
        setLikes(liked ? likes - 1 : likes + 1);

        Animated.sequence([
            Animated.timing(likeAnim, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.spring(likeAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${title}\n\n${description}`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleCardPress = () => {
        router.push(`/news-detail?id=${id}` as any);
    };

    const handleCommentsPress = (e: any) => {
        e.stopPropagation();
        setShowComments(true);
    };

    const getGradientColors = (): [string, string] => {
        if (featured) return [SP_RED, '#b91c1c'];
        switch (category) {
            case 'Tech Force': return ['#3B82F6', '#2563eb'];
            case 'Campaign': return [SP_GREEN, '#15803d'];
            case 'Policy': return ['#F59E0B', '#d97706'];
            default: return ['#8B5CF6', '#7c3aed'];
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[styles.newsCard, featured && styles.featuredCard]}
                activeOpacity={0.95}
                onPress={handleCardPress}
            >
                {/* Featured Badge */}
                {featured && (
                    <View style={styles.featuredBadge}>
                        <MaterialCommunityIcons name="star" size={14} color="#fff" />
                        <Text style={styles.featuredText}>FEATURED</Text>
                    </View>
                )}

                {/* Enhanced Image Banner with Gradient Overlay */}
                <View style={styles.imageContainer}>
                    {image ? (
                        <Image
                            source={{ uri: image }}
                            style={styles.newsBanner}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={getGradientColors() as any}
                            style={styles.newsBanner}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons
                                name="newspaper"
                                size={100}
                                color="#fff"
                                style={{ opacity: 0.4 }}
                            />
                        </LinearGradient>
                    )}

                    {/* Gradient Overlay for better text readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageOverlay}
                    >
                        <View style={styles.categoryBadgeOnImage}>
                            <View style={[styles.categoryDot, { backgroundColor: '#fff' }]} />
                            <Text style={styles.categoryTextOnImage}>{category}</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                    <Text style={styles.newsTitle} numberOfLines={2}>{title}</Text>
                    <Text style={styles.newsDescription} numberOfLines={3}>{description}</Text>

                    {/* Interaction Bar */}
                    <View style={styles.interactionBar}>
                        <TouchableOpacity
                            style={styles.interactionButton}
                            onPress={handleLike}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                                <MaterialCommunityIcons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={20}
                                    color={liked ? SP_RED : '#64748b'}
                                />
                            </Animated.View>
                            <Text style={[styles.interactionText, liked && { color: SP_RED, fontWeight: '700' }]}>
                                {likes}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.interactionButton}
                            activeOpacity={0.7}
                            onPress={handleCommentsPress}
                        >
                            <MaterialCommunityIcons
                                name="comment-outline"
                                size={20}
                                color="#64748b"
                            />
                            <Text style={styles.interactionText}>{comments || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.interactionButton}
                            onPress={handleShare}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="share-variant"
                                size={20}
                                color="#64748b"
                            />
                        </TouchableOpacity>

                        <View style={styles.timeContainer}>
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={14}
                                color="#94a3b8"
                            />
                            <Text style={styles.timeText}>{time}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Comments Modal */}
            <Modal
                visible={showComments}
                transparent
                animationType="none"
                onRequestClose={() => setShowComments(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowComments(false)}
                >
                    <Animated.View
                        style={[
                            styles.commentsModal,
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.modalHandle} />

                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Comments ({comments || 0})</Text>
                                <TouchableOpacity onPress={() => setShowComments(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.commentsScroll}>
                                {[...Array(comments || 3)].map((_, idx) => (
                                    <View key={idx} style={styles.commentItem}>
                                        <View style={styles.commentAvatar}>
                                            <MaterialCommunityIcons name="account-circle" size={40} color={SP_RED} />
                                        </View>
                                        <View style={styles.commentContent}>
                                            <Text style={styles.commentAuthor}>User {idx + 1}</Text>
                                            <Text style={styles.commentText}>
                                                {idx === 0 ? 'बहुत अच्छी खबर है!' : idx === 1 ? 'Great initiative!' : 'Very informative article.'}
                                            </Text>
                                            <Text style={styles.commentTime}>{idx + 1} hours ago</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </Animated.View>
    );
};

// Trending Carousel Component
const TrendingCarousel = ({ trendingNews }: any) => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentIndex < trendingNews.length - 1) {
                setCurrentIndex(currentIndex + 1);
                flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            } else {
                setCurrentIndex(0);
                flatListRef.current?.scrollToIndex({ index: 0, animated: true });
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [currentIndex, trendingNews.length]);

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / (width - 48));
        setCurrentIndex(index);
    };

    const renderTrendingItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.trendingCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/news-detail?id=${item.id}` as any)}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.trendingImage}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.trendingOverlay}
            >
                <View style={styles.trendingBadge}>
                    <Text style={styles.trendingBadgeText}>{item.category}</Text>
                </View>
                <View style={styles.trendingContent}>
                    <Text style={styles.trendingSource}>{item.source}</Text>
                    <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.trendingSection}>
            <View style={styles.trendingSectionHeader}>
                <Text style={styles.trendingSectionTitle}>Breaking News</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                ref={flatListRef}
                data={trendingNews}
                renderItem={renderTrendingItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id.toString()}
                snapToInterval={width - 48}
                decelerationRate="fast"
            />
            <View style={styles.paginationDots}>
                {trendingNews.map((_: any, index: number) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentIndex && styles.activeDot
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

// Desktop Header Component
const DesktopHeader = () => {
    const scrollAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scrollAnim, {
                    toValue: 1,
                    duration: 20000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(scrollAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateX = scrollAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [width, -width * 2],
    });

    return (
        <LinearGradient
            colors={[SP_RED, '#b91c1c', SP_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.desktopHeader}
        >
            <View style={styles.headerContent}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <MaterialCommunityIcons name="bicycle" size={32} color="#fff" />
                    </View>
                    <View style={styles.logoText}>
                        <Text style={styles.partyNameHindi}>समाजवादी पार्टी</Text>
                        <Text style={styles.partyNameEnglish}>Samajwadi Party</Text>
                    </View>
                </View>

                {/* Scrolling News Ticker */}
                <View style={styles.tickerContainer}>
                    <View style={styles.tickerLabel}>
                        <MaterialCommunityIcons name="bullhorn" size={16} color={SP_RED} />
                        <Text style={styles.tickerLabelText}>LATEST</Text>
                    </View>
                    <View style={styles.tickerScroll}>
                        <Animated.View style={[styles.tickerContent, { transform: [{ translateX }] }]}>
                            <Text style={styles.tickerText}>
                                देश में बदलाव की लहर • Tech Force में शामिल हों • नई योजनाओं की घोषणा •
                                Join the Digital Revolution • समाजवाद का संदेश • साइकिल चलाओ देश बचाओ •
                            </Text>
                        </Animated.View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <MaterialCommunityIcons name="bell" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <MaterialCommunityIcons name="account" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

export default function NewsScreen() {
    const isDesktop = width >= 768;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const newsData = [
        {
            id: 1,
            title: 'समाजवादी टेक फोर्स का विस्तार पूरे देश में',
            description: 'डिजिटल युग में नई पहल के साथ युवाओं को जोड़ने की तैयारी। पार्टी ने देशभर में टेक्नोलॉजी के माध्यम से जनता से जुड़ने का फैसला किया है।',
            category: 'Tech Force',
            time: '2 hours ago',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
            likes: 1245,
            comments: 89,
            featured: true,
        },
        {
            id: 2,
            title: 'नई सदस्यता अभियान की शुरुआत',
            description: 'पार्टी ने देशभर में नई सदस्यता अभियान की घोषणा की है। युवाओं को प्राथमिकता दी जा रही है।',
            category: 'Campaign',
            time: '5 hours ago',
            image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800',
            likes: 892,
            comments: 45,
        },
        {
            id: 3,
            title: 'किसानों के लिए नई योजना की घोषणा',
            description: 'पार्टी ने किसानों के हित में कई महत्वपूर्ण योजनाओं का ऐलान किया। कृषि क्षेत्र में सुधार पर जोर।',
            category: 'Policy',
            time: '1 day ago',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
            likes: 2156,
            comments: 234,
        },
        {
            id: 4,
            title: 'युवा रोजगार कार्यक्रम लॉन्च',
            description: 'Tech Force के तहत युवाओं के लिए रोजगार और प्रशिक्षण कार्यक्रम शुरू किया गया।',
            category: 'Youth',
            time: '2 days ago',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
            likes: 1567,
            comments: 123,
        },
    ];

    const trendingNews = [
        {
            id: 101,
            title: 'समाजवादी टेक फोर्स का विस्तार पूरे देश में',
            category: 'Sports',
            source: 'CNN Indonesia',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        },
        {
            id: 102,
            title: 'किसानों के लिए नई योजना की घोषणा',
            category: 'Education',
            source: 'Okhuariao',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
        },
        {
            id: 103,
            title: 'युवा रोजगार कार्यक्रम लॉन्च',
            category: 'Campaign',
            source: 'SP News',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Desktop Header - Only shown on desktop */}
            {isDesktop && <DesktopHeader />}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Mobile Header */}
                    {!isDesktop && (
                        <LinearGradient
                            colors={[SP_RED, '#b91c1c']}
                            style={styles.mobileHeader}
                        >
                            <View style={styles.mobileHeaderContent}>
                                <View>
                                    <Text style={styles.mobileTitle}>समाचार</Text>
                                    <Text style={styles.mobileSubtitle}>Latest Updates</Text>
                                </View>
                                <TouchableOpacity style={styles.notificationButton}>
                                    <MaterialCommunityIcons name="bell" size={24} color="#fff" />
                                    <View style={styles.notificationDot} />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    )}

                    {/* Content Section */}
                    <View style={[styles.contentContainer, isDesktop && styles.desktopContent]}>
                        {/* Trending Carousel */}
                        <TrendingCarousel trendingNews={trendingNews} />

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>आज की खबरें</Text>
                        </View>

                        {newsData.map((news, index) => (
                            <NewsCard key={index} {...news} />
                        ))}

                        {/* Categories Section */}
                        <View style={styles.categoriesSection}>
                            <Text style={styles.sectionTitle}>श्रेणियाँ</Text>
                            <View style={styles.categoriesGrid}>
                                {['Tech Force', 'Campaign', 'Policy', 'Youth', 'Events', 'Media'].map((cat, idx) => (
                                    <TouchableOpacity key={idx} style={styles.categoryChip}>
                                        <Text style={styles.categoryChipText}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    // Desktop Header Styles
    desktopHeader: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        gap: 2,
    },
    partyNameHindi: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    partyNameEnglish: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tickerContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        height: 40,
    },
    tickerLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        backgroundColor: '#fef2f2',
    },
    tickerLabelText: {
        fontSize: 11,
        fontWeight: '800',
        color: SP_RED,
        letterSpacing: 1,
    },
    tickerScroll: {
        flex: 1,
        overflow: 'hidden',
    },
    tickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tickerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Mobile Header Styles
    mobileHeader: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    mobileHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mobileTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    mobileSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    notificationButton: {
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: SP_RED,
    },
    // Content Styles
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    contentContainer: {
        padding: 24,
    },
    desktopContent: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: SP_RED,
    },
    // News Card Styles
    newsCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    featuredCard: {
        shadowColor: SP_RED,
        shadowOpacity: 0.3,
        elevation: 8,
    },
    featuredBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: SP_RED,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    featuredText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    newsBanner: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        position: 'relative',
        overflow: 'hidden',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        justifyContent: 'flex-end',
        padding: 16,
    },
    categoryBadgeOnImage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    categoryTextOnImage: {
        fontSize: 11,
        fontWeight: '800',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardContent: {
        padding: 20,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    categoryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    newsTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 28,
    },
    newsDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 22,
        marginBottom: 16,
    },
    interactionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    interactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    interactionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 'auto',
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    // Categories Styles
    categoriesSection: {
        marginTop: 32,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    categoryChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    commentsModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 40,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#cbd5e1',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    commentsScroll: {
        maxHeight: 500,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    commentAvatar: {
        width: 40,
        height: 40,
    },
    commentContent: {
        flex: 1,
    },
    commentAuthor: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 6,
    },
    commentTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    // Trending Carousel Styles
    trendingSection: {
        marginBottom: 24,
    },
    trendingSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    trendingSectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    trendingCard: {
        width: width - 48,
        height: 220,
        marginRight: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    trendingImage: {
        width: '100%',
        height: '100%',
    },
    trendingOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        padding: 16,
        justifyContent: 'space-between',
    },
    trendingBadge: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    trendingBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    trendingContent: {
        gap: 4,
    },
    trendingSource: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
    trendingTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        lineHeight: 24,
    },
    paginationDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#cbd5e1',
    },
    activeDot: {
        width: 24,
        backgroundColor: SP_RED,
    },
});
