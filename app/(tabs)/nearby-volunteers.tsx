import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';
import { DEFAULT_VOLUNTEERS } from '../../constants/volunteersData';

interface Volunteer {
    Name: string;
    "Mobile Number": string;
    District: string;
    "Vidhan Sabha": string;
    Latitude: number;
    Longitude: number;
    distance?: number;
}

// Import the JSON data directly
// Note: In a real app, this might be fetched from an API or a more stable file path.
// We use a try-catch require or just assume it exists as per user instruction.
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
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        fetchUserDataAndCalculateDistance();
    }, []);

    const fetchUserDataAndCalculateDistance = async () => {
        // Map the raw data to the expected format
        const mapped = volunteersData
            .filter((v: any) => v)
            .slice(2)
            .map((v: any) => ({
                Name: v['Column2'] || v['आपका पूरा नाम क्या है? '] || 'Unknown',
                District: v['Column4'] || v['जिला '] || 'Unknown',
                'Vidhan Sabha': v['Column5'] || v['आपकी विधानसभा (Vidhan Sabha) कौन सी है? '] || 'Unknown',
                distance: null
            }));
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
                <Image
                    source={require('../../assets/images/volunteer_avatar.png')}
                    style={styles.avatar}
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{item.Name}</Text>
                    <Text style={styles.district}>{item.District} • {item['Vidhan Sabha']}</Text>
                    {item.distance !== null && (
                        <View style={styles.distanceBadge}>
                            <MaterialCommunityIcons name="map-marker-distance" size={12} color="#fff" />
                            <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
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
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={SP_RED} />
                </View>
            ) : (
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
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    cardHeader: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    district: {
        fontSize: 14,
        color: '#64748b',
    },
    distanceBadge: {
        backgroundColor: SP_RED,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
    emptyText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
});
