import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Platform,
    Alert,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { Region } from 'react-native-maps'; // Types only
import NativeMap from './NativeMap';
import * as Location from 'expo-location';
import { Text, TextInput, ActivityIndicator, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';

interface AddressFormProps {
    navigation: {
        goBack: () => void;
        navigate: (screen: string, params?: any) => void;
    };
    route?: {
        params?: any;
    };
}

export default function AddressFormScreen({ navigation, route }: AddressFormProps) {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [region, setRegion] = useState<Region | null>(null);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });
    const [loadingAddress, setLoadingAddress] = useState(false);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                Alert.alert('Permission Denied', 'Allow location access to use the map feature.');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);

            const newRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };
            setRegion(newRegion);

            // Initial reverse geocode
            reverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude);
        })();
    }, []);

    const reverseGeocode = async (latitude: number, longitude: number) => {
        setLoadingAddress(true);
        try {
            const result = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (result.length > 0) {
                const addr = result[0];
                setAddress({
                    street: `${addr.streetNumber || ''} ${addr.street || ''}`.trim() || addr.name || '',
                    city: addr.city || addr.subregion || '',
                    state: addr.region || '',
                    postalCode: addr.postalCode || '',
                    country: addr.country || '',
                });
            }
        } catch (error) {
            console.log('Reverse geocoding failed', error);
        } finally {
            setLoadingAddress(false);
        }
    };

    const onRegionChangeComplete = (newRegion: Region) => {
        setRegion(newRegion);
        // Debounce or just call it
        reverseGeocode(newRegion.latitude, newRegion.longitude);
    };

    const handleConfirm = () => {
        // Navigate to next step or save address
        console.log('Confirmed Address:', address);
        navigation.navigate('ServiceSelection');
    };

    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <Text>Map not supported on web in this demo. Please use mobile.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map Background */}
            <View style={styles.mapContainer}>
                {region ? (
                    <NativeMap
                        ref={mapRef}
                        style={styles.map}
                        region={region}
                        onRegionChangeComplete={onRegionChangeComplete}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                    />
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={SP_RED} />
                        <Text style={{ marginTop: 10 }}>Getting Location...</Text>
                    </View>
                )}

                {/* Center Marker (Fixed) */}
                <View style={styles.markerFixed}>
                    <MaterialCommunityIcons name="map-marker" size={48} color={SP_RED} />
                </View>

                {/* Top Search Bar (Visual Only for now) */}
                <View style={styles.searchBarContainer}>
                    <Surface style={styles.searchBar} elevation={4}>
                        <MaterialCommunityIcons name="magnify" size={24} color="#666" />
                        <Text style={styles.searchText}>Search location...</Text>
                        <MaterialCommunityIcons name="microphone" size={24} color="#666" />
                    </Surface>
                </View>
            </View>

            {/* Bottom Sheet Form */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <Surface style={styles.formSheet} elevation={5}>
                    <View style={styles.dragHandle} />

                    <Text style={styles.formTitle}>Confirm Address</Text>

                    <ScrollView style={styles.inputsContainer}>
                        <TextInput
                            mode="outlined"
                            label="Street / Area"
                            value={address.street}
                            onChangeText={(text) => setAddress({ ...address, street: text })}
                            style={styles.input}
                            activeOutlineColor={SP_RED}
                            right={loadingAddress ? <TextInput.Icon icon={() => <ActivityIndicator size={16} />} /> : null}
                        />

                        <View style={styles.row}>
                            <TextInput
                                mode="outlined"
                                label="City"
                                value={address.city}
                                onChangeText={(text) => setAddress({ ...address, city: text })}
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                                activeOutlineColor={SP_RED}
                            />
                            <TextInput
                                mode="outlined"
                                label="State"
                                value={address.state}
                                onChangeText={(text) => setAddress({ ...address, state: text })}
                                style={[styles.input, { flex: 1 }]}
                                activeOutlineColor={SP_RED}
                            />
                        </View>

                        <View style={styles.row}>
                            <TextInput
                                mode="outlined"
                                label="Zip Code"
                                value={address.postalCode}
                                onChangeText={(text) => setAddress({ ...address, postalCode: text })}
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                                activeOutlineColor={SP_RED}
                                keyboardType="numeric"
                            />
                            <TextInput
                                mode="outlined"
                                label="Country"
                                value={address.country}
                                onChangeText={(text) => setAddress({ ...address, country: text })}
                                style={[styles.input, { flex: 1 }]}
                                activeOutlineColor={SP_RED}
                            />
                        </View>
                    </ScrollView>

                    <TouchableOpacity onPress={handleConfirm} style={styles.button}>
                        <LinearGradient
                            colors={[SP_RED, '#b91c1c']}
                            style={styles.gradient}
                        >
                            <Text style={styles.buttonText}>Confirm Location</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Surface>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },
    markerFixed: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -24,
        marginTop: -48,
        zIndex: 10,
    },
    searchBarContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 16,
        height: 50,
        gap: 12,
    },
    searchText: {
        flex: 1,
        color: '#666',
        fontSize: 16,
    },
    formContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
    },
    formSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        minHeight: 300,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1a1a1a',
    },
    inputsContainer: {
        maxHeight: 250,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
    },
    button: {
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
