import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert, ActivityIndicator, Image, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { getApiUrl } from '../../utils/api';
import { DEFAULT_VOLUNTEERS } from '../../constants/volunteersData';

// Map feature disabled - react-native-maps doesn't support web
const MAP_ENABLED = false;

const { width, height } = Dimensions.get('window');

interface Volunteer {
    Name: string;
    "Mobile Number": string;
    District: string;
    "Vidhan Sabha": string;
    Latitude: number;
    Longitude: number;
    distance?: number;
}

// Known district and Vidhan Sabha coordinates for realistic placement
// Matches Column4 (district) and Column5 (Vidhan Sabha) fields
const DISTRICT_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
    // NCR Region
    'ghaziabad': { lat: 28.6692, lng: 77.4538 },
    'noida': { lat: 28.5355, lng: 77.3910 },
    'greater noida': { lat: 28.4744, lng: 77.5040 },
    'gautam buddha nagar': { lat: 28.4744, lng: 77.5040 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'new delhi': { lat: 28.6139, lng: 77.2090 },
    'meerut': { lat: 28.9845, lng: 77.7064 },
    'hapur': { lat: 28.7437, lng: 77.7628 },
    'bulandshahr': { lat: 28.4070, lng: 77.8498 },

    // Kanpur Region
    'kanpur': { lat: 26.4499, lng: 80.3319 },
    'kanpur nagar': { lat: 26.4499, lng: 80.3319 },
    'kanpur dehat': { lat: 26.3000, lng: 79.9500 },
    'kanpur gramin': { lat: 26.3000, lng: 79.9500 },
    'कानपुर': { lat: 26.4499, lng: 80.3319 },
    'कानपुर नगर': { lat: 26.4499, lng: 80.3319 },
    'कानपुर देहात': { lat: 26.3000, lng: 79.9500 },
    'kalyanpur': { lat: 26.4999, lng: 80.2919 },
    'कल्याणपुर': { lat: 26.4999, lng: 80.2919 },
    'kidwai nagar': { lat: 26.4580, lng: 80.3500 },
    'govind nagar': { lat: 26.4650, lng: 80.3150 },
    'गोविंद नगर': { lat: 26.4650, lng: 80.3150 },
    'sisamau': { lat: 26.4350, lng: 80.3400 },
    'maharajpur': { lat: 26.4100, lng: 80.4000 },
    'bilhaur': { lat: 26.8300, lng: 80.0600 },
    'bithoor': { lat: 26.6100, lng: 80.2700 },
    'bhognipur': { lat: 26.2000, lng: 79.9000 },
    'bhoganipur': { lat: 26.2000, lng: 79.9000 },
    'akbarpur raniya': { lat: 26.4300, lng: 79.7200 },
    'sikandra': { lat: 27.1000, lng: 78.0500 },

    // Lucknow Region
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'लखनऊ': { lat: 26.8467, lng: 80.9462 },
    'unnao': { lat: 26.5393, lng: 80.4878 },
    'sitapur': { lat: 27.5706, lng: 80.6817 },
    'hardoi': { lat: 27.3969, lng: 80.1252 },
    'barabanki': { lat: 26.9260, lng: 81.1916 },
    'nawabganj': { lat: 26.9400, lng: 81.2300 },

    // Eastern UP - Major Places
    'varanasi': { lat: 25.3176, lng: 82.9739 },
    'बनारस': { lat: 25.3176, lng: 82.9739 },
    'prayagraj': { lat: 25.4358, lng: 81.8463 },
    'allahabad': { lat: 25.4358, lng: 81.8463 },
    'इलाहाबाद': { lat: 25.4358, lng: 81.8463 },
    'kaushambi': { lat: 25.5315, lng: 81.3870 },
    'sirathu': { lat: 25.5320, lng: 81.3280 },
    'gorakhpur': { lat: 26.7606, lng: 83.3732 },
    'gorkhapur': { lat: 26.7606, lng: 83.3732 },  // Common typo
    'azamgarh': { lat: 26.0735, lng: 83.1854 },
    'ghazipur': { lat: 25.5870, lng: 83.5770 },
    'jaunpur': { lat: 25.7464, lng: 82.6836 },
    'mirzapur': { lat: 25.1337, lng: 82.5644 },
    'sultanpur': { lat: 26.2648, lng: 82.0727 },
    'faizabad': { lat: 26.7745, lng: 82.1352 },
    'ayodhya': { lat: 26.7922, lng: 82.1998 },
    'basti': { lat: 26.8106, lng: 82.7469 },
    'ballia': { lat: 25.7603, lng: 84.1488 },
    'deoria': { lat: 26.5024, lng: 83.7910 },
    'mau': { lat: 25.9417, lng: 83.5610 },
    'sonbhadra': { lat: 24.6885, lng: 83.0631 },
    'renukoot': { lat: 24.2166, lng: 83.0318 },
    'robertsganj': { lat: 24.6926, lng: 83.0687 },

    // Pratapgarh Region
    'pratapgarh': { lat: 25.8961, lng: 81.9450 },
    'प्रतापगढ़': { lat: 25.8961, lng: 81.9450 },
    'rasulabad': { lat: 25.9000, lng: 81.9500 },
    'रसूलाबाद': { lat: 25.9000, lng: 81.9500 },

    // Western UP
    'agra': { lat: 27.1767, lng: 78.0081 },
    'आगरा': { lat: 27.1767, lng: 78.0081 },
    'mathura': { lat: 27.4924, lng: 77.6737 },
    'aligarh': { lat: 27.8974, lng: 78.0880 },
    'moradabad': { lat: 28.8386, lng: 78.7763 },
    'bareilly': { lat: 28.3670, lng: 79.4304 },
    'saharanpur': { lat: 29.9680, lng: 77.5510 },
    'muzaffarnagar': { lat: 29.4727, lng: 77.6867 },
    'shamli': { lat: 29.4527, lng: 77.3148 },
    'bijnor': { lat: 29.3723, lng: 78.1365 },
    'firozabad': { lat: 27.1505, lng: 78.3956 },
    'mainpuri': { lat: 27.2348, lng: 79.0277 },
    'मैनपुरी': { lat: 27.2348, lng: 79.0277 },
    'etah': { lat: 27.5577, lng: 78.6610 },
    'hathras': { lat: 27.6069, lng: 78.0548 },
    'kannauj': { lat: 27.0545, lng: 79.9219 },
    'kannoj': { lat: 27.0545, lng: 79.9219 },  // Alternate spelling
    'कन्नौज': { lat: 27.0545, lng: 79.9219 },
    'chibramau': { lat: 27.1600, lng: 79.5000 },
    'lahrpur': { lat: 27.5500, lng: 80.7800 },  // Sitapur district

    // Bundelkhand
    'jhansi': { lat: 25.4484, lng: 78.5685 },
    'banda': { lat: 25.4751, lng: 80.3367 },
    'hamirpur': { lat: 25.9568, lng: 80.1533 },
    'chitrakoot': { lat: 25.2015, lng: 80.8986 },
    'mahoba': { lat: 25.2923, lng: 79.8717 },
    'lalitpur': { lat: 24.6879, lng: 78.4166 },

    // Bihar (mentioned in data)
    'sitamarhi': { lat: 26.5916, lng: 85.4906 },
    'सीतामढ़ी': { lat: 26.5916, lng: 85.4906 },

    // Mohammdabad region
    'mohammdabad': { lat: 26.7600, lng: 83.4100 },
    'mohammadabad': { lat: 26.7600, lng: 83.4100 },

    // Additional places from data
    'chilupar': { lat: 26.7606, lng: 83.3732 },  // Near Gorakhpur
    'kairana': { lat: 29.3949, lng: 77.2042 },
    'meerut sauth': { lat: 28.9600, lng: 77.7100 },
};

// Import the JSON data directly
let volunteersData: Volunteer[] = [];
try {
    const rawData = require('./समाजवादी टेक फोर्स से जुड़ें — बने समाजवाद की डिजिटल आवाज़! (Responses) (5).json');
    volunteersData = (rawData as any).default || rawData;
    if (!Array.isArray(volunteersData) || volunteersData.length === 0) {
        volunteersData = DEFAULT_VOLUNTEERS;
    }
} catch (e) {
    console.log("Failed to load volunteers data from JSON, using default.", e);
    volunteersData = DEFAULT_VOLUNTEERS;
}

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function NearbyVolunteersScreen() {
    const router = useRouter();
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        fetchCurrentLocation();
    }, []);

    const fetchCurrentLocation = async () => {
        setFetchingLocation(true);
        setLocationError(null);
        try {
            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Location permission denied');
                // Still load volunteers without distance
                fetchUserDataAndCalculateDistance(null);
                return;
            }

            // Get current location with high accuracy
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const userLoc = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setUserLocation(userLoc);
            fetchUserDataAndCalculateDistance(userLoc);
        } catch (error) {
            console.error('Error getting location:', error);
            setLocationError('Could not fetch location');
            fetchUserDataAndCalculateDistance(null);
        } finally {
            setFetchingLocation(false);
        }
    };

    const getCoordinatesForDistrict = (district: string, userLoc: { latitude: number; longitude: number } | null) => {
        // Normalize the district name: lowercase, trim, remove extra spaces
        const normalizedDistrict = district?.toLowerCase().trim().replace(/\s+/g, ' ') || '';

        // First try exact match (after normalization)
        if (DISTRICT_COORDINATES[normalizedDistrict]) {
            const coords = DISTRICT_COORDINATES[normalizedDistrict];
            // Add small random offset for variation (within ~2-3 km)
            return {
                lat: coords.lat + (Math.random() - 0.5) * 0.03,
                lng: coords.lng + (Math.random() - 0.5) * 0.03,
            };
        }

        // Try partial matching - check if normalized district contains any known key
        for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
            // Check both directions: district contains key OR key contains district
            if (normalizedDistrict.includes(key) || key.includes(normalizedDistrict)) {
                // Add small random offset for variation (within ~2-3 km)
                return {
                    lat: coords.lat + (Math.random() - 0.5) * 0.03,
                    lng: coords.lng + (Math.random() - 0.5) * 0.03,
                };
            }
        }

        // For words like "Kanpur " with trailing space, check first word
        const firstWord = normalizedDistrict.split(' ')[0];
        if (firstWord && DISTRICT_COORDINATES[firstWord]) {
            const coords = DISTRICT_COORDINATES[firstWord];
            return {
                lat: coords.lat + (Math.random() - 0.5) * 0.03,
                lng: coords.lng + (Math.random() - 0.5) * 0.03,
            };
        }

        // If user location available, place random volunteers nearby (fallback)
        if (userLoc) {
            return {
                lat: userLoc.latitude + (Math.random() - 0.5) * 0.3,
                lng: userLoc.longitude + (Math.random() - 0.5) * 0.3,
            };
        }

        // Default to Lucknow area (state capital)
        return {
            lat: 26.8467 + (Math.random() - 0.5) * 0.5,
            lng: 80.9462 + (Math.random() - 0.5) * 0.5,
        };
    };

    const fetchUserDataAndCalculateDistance = async (userLoc: { latitude: number; longitude: number } | null) => {
        // Map the raw data to the expected format
        const mapped = volunteersData
            .filter((v: any) => v)
            .map((v: any) => {
                // District can be in Column4 (older entries) or Column12 (newer entries)
                const district = v['Column4'] || v['Column12'] || v['जिला '] || '';
                // Vidhan Sabha is in Column5
                const vidhanSabha = v['Column5'] || v['आपकी विधानसभा (Vidhan Sabha) कौन सी है? '] || '';

                // Try to get coordinates from district first, then from Vidhan Sabha
                let coords = getCoordinatesForDistrict(district, null);

                // If district didn't match (fallback coordinates), try Vidhan Sabha
                if (coords.lat === 26.8467 && !district) {
                    coords = getCoordinatesForDistrict(vidhanSabha, null);
                }

                // If still no match, try combining both for better matching
                if (coords.lat === 26.8467 && coords.lng === 80.9462) {
                    // Try Vidhan Sabha directly
                    coords = getCoordinatesForDistrict(vidhanSabha, userLoc);
                }

                const volunteer = {
                    Name: v['Column2'] || v['आपका पूरा नाम क्या है? '] || 'Unknown',
                    District: district || vidhanSabha || 'Unknown',
                    'Vidhan Sabha': vidhanSabha || 'Unknown',
                    Latitude: coords.lat,
                    Longitude: coords.lng,
                    distance: null as number | null
                };

                // Calculate distance if user location is available
                if (userLoc && volunteer.Latitude && volunteer.Longitude) {
                    volunteer.distance = getDistanceFromLatLonInKm(
                        userLoc.latitude,
                        userLoc.longitude,
                        volunteer.Latitude,
                        volunteer.Longitude
                    );
                }

                return volunteer;
            });

        // Sort by distance if available
        if (userLoc) {
            mapped.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }

        setVolunteers(mapped);
        setLoading(false);
    };

    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180)
    }

    const handleCall = (mobile: string) => {
        Linking.openURL(`tel:${mobile}`);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={require('../../assets/images/icon.png')}
                        style={styles.partyLogo}
                    />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {item.Name}
                    </Text>
                    <Text style={styles.district} numberOfLines={2} ellipsizeMode="tail">
                        {item.District} • {item['Vidhan Sabha']}
                    </Text>
                    {item.distance !== null && (
                        <View style={styles.distanceBadge}>
                            <MaterialCommunityIcons name="map-marker-distance" size={12} color="#fff" />
                            <Text style={styles.distanceText}>{item.distance.toFixed(1)} km away</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={[SP_RED, '#b91c1c']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nearby Volunteers</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={fetchCurrentLocation}
                        style={styles.locationButton}
                        disabled={fetchingLocation}
                    >
                        {fetchingLocation ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Location Status Banner */}
            {userLocation && (
                <View style={styles.locationBanner}>
                    <MaterialCommunityIcons name="map-marker-check" size={18} color={SP_GREEN} />
                    <Text style={styles.locationBannerText}>
                        Showing volunteers near your location
                    </Text>
                </View>
            )}

            {locationError && (
                <View style={styles.errorBanner}>
                    <MaterialCommunityIcons name="map-marker-off" size={18} color="#f59e0b" />
                    <Text style={styles.errorBannerText}>{locationError}</Text>
                    <TouchableOpacity onPress={fetchCurrentLocation}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={SP_RED} />
                    <Text style={styles.loadingText}>
                        {fetchingLocation ? 'Getting your location...' : 'Loading volunteers...'}
                    </Text>
                </View>
            ) : (
                /* List View */
                <FlatList
                    data={volunteers}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No volunteers found nearby.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    locationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    locationBannerText: {
        fontSize: 13,
        color: '#065f46',
        fontWeight: '600',
        flex: 1,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    errorBannerText: {
        fontSize: 13,
        color: '#92400e',
        fontWeight: '500',
        flex: 1,
    },
    retryText: {
        fontSize: 13,
        color: SP_RED,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        overflow: 'hidden',
    },
    cardHeader: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: SP_RED + '15',
        marginRight: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: SP_RED + '30',
        flexShrink: 0,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
    },
    partyLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        resizeMode: 'contain',
    },
    infoContainer: {
        flex: 1,
        paddingRight: 8,
        minWidth: 0,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
        flexShrink: 1,
    },
    district: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
        flexShrink: 1,
    },
    distanceBadge: {
        backgroundColor: SP_GREEN,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    distanceText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    cardActions: {
        flexDirection: 'row',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mapToggleButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    customMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        borderColor: SP_RED,
    },
    markerImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
        resizeMode: 'contain',
    },
    recenterButton: {
        position: 'absolute',
        bottom: 100,
        right: 16,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    volunteerCountBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: SP_RED,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    volunteerCountText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    mapWebFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#f8fafc',
    },
    mapWebFallbackTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        textAlign: 'center',
    },
    mapWebFallbackText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    mapWebFallbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: SP_RED,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 24,
    },
    mapWebFallbackButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
