import AsyncStorage from '@react-native-async-storage/async-storage';
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
import type { Region } from 'react-native-maps'; // Types only
import Map from './map';
import * as Location from 'expo-location';
import { Text, TextInput, ActivityIndicator, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';

import { getApiUrl } from '../utils/api';

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
    const [registering, setRegistering] = useState(false);
    const mapRef = useRef<any>(null);

    const profileData = route?.params?.profileData || {};

    useEffect(() => {
        fetchLocation();
    }, []);

    const fetchLocation = async () => {
        try {
            console.log('🗺️ Requesting location permissions...');
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                Alert.alert(
                    'Location Permission Required',
                    'Please allow location access to use the map feature. You can also manually enter your address.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Try Again', onPress: () => fetchLocation() }
                    ]
                );
                // Set a default location (India center) so map still loads
                const defaultRegion = {
                    latitude: 28.6139, // Delhi
                    longitude: 77.2090,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setRegion(defaultRegion);
                return;
            }

            console.log('✅ Location permission granted, getting current position...');
            try {
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                console.log('✅ Got current location:', currentLocation.coords);
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
            } catch (locError: any) {
                console.error('❌ Error getting location:', locError);
                setErrorMsg('Could not fetch your location');

                Alert.alert(
                    'Location Error',
                    'Unable to get your current location. You can manually enter your address or try again.',
                    [
                        { text: 'Enter Manually', style: 'cancel' },
                        { text: 'Retry', onPress: () => fetchLocation() }
                    ]
                );

                // Set default location so map still works
                const defaultRegion = {
                    latitude: 28.6139,
                    longitude: 77.2090,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setRegion(defaultRegion);
            }
        } catch (error: any) {
            console.error('❌ Location fetch error:', error);
            setErrorMsg('Location service error');

            // Set default location
            const defaultRegion = {
                latitude: 28.6139,
                longitude: 77.2090,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setRegion(defaultRegion);
        }
    };

    const reverseGeocode = async (latitude: number, longitude: number) => {
        setLoadingAddress(true);
        try {
            console.log(`📍 Reverse geocoding: ${latitude}, ${longitude}`);
            const result = await Location.reverseGeocodeAsync({ latitude, longitude });
            console.log('📍 Raw geocode result:', JSON.stringify(result, null, 2));

            if (result && result.length > 0) {
                const addr = result[0];
                console.log('📍 First address:', addr);

                // Construct address from available data
                const streetParts = [];
                if (addr.streetNumber) streetParts.push(addr.streetNumber);
                if (addr.street) streetParts.push(addr.street);
                if (addr.name && !addr.street) streetParts.push(addr.name);
                const street = streetParts.join(' ').trim();

                const city = addr.city || addr.subregion || addr.district || '';
                const state = addr.region || '';
                const postalCode = addr.postalCode || '';
                const country = addr.country || addr.isoCountryCode || '';

                const newAddress = {
                    street: street || addr.name || 'Current Location',
                    city: city,
                    state: state,
                    postalCode: postalCode,
                    country: country,
                };

                console.log('✅ Auto-filling address form:', newAddress);
                setAddress(newAddress);

                // Show success feedback
                Alert.alert('Location Found', 'Address has been auto-filled. Please verify and edit if needed.');
            } else {
                console.warn('⚠️ No address found for coordinates');
                Alert.alert('Location Found', 'Could not determine address. Please enter manually.');
            }
        } catch (error: any) {
            console.error('❌ Reverse geocoding failed:', error);
            Alert.alert(
                'Geocoding Error',
                'Could not determine address from location. Please enter manually.'
            );
        } finally {
            setLoadingAddress(false);
        }
    };

    const onRegionChangeComplete = (newRegion: Region) => {
        setRegion(newRegion);
        // Debounce or just call it
        reverseGeocode(newRegion.latitude, newRegion.longitude);
    };

    const handleConfirm = async () => {
        setRegistering(true);
        try {
            const userData = {
                ...profileData,
                address,
                location: {
                    lat: region?.latitude || location?.coords.latitude,
                    lng: region?.longitude || location?.coords.longitude,
                }
            };

            // Get API URL from centralized utility
            const url = getApiUrl();

            console.log('Registering user:', userData);
            console.log('Using API URL:', `${url}/auth/register`);

            const response = await fetch(`${url}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Save user data and token
            await AsyncStorage.setItem('userInfo', JSON.stringify(data));
            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
            }

            Alert.alert('Success', 'Account created successfully!');
            navigation.navigate('ServiceSelection');
        } catch (error: any) {
            console.error('Registration Error:', error);
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setRegistering(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Map Background */}
            <View style={styles.mapContainer}>
                {region ? (
                    <Map
                        location={{ lat: region.latitude, lng: region.longitude }}
                        onRegionChangeComplete={onRegionChangeComplete}
                    />
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={SP_RED} />
                        <Text style={{ marginTop: 10 }}>Getting Location...</Text>
                    </View>
                )}

                {/* Center Marker (Fixed) - Visual indicator for the center */}
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

                    <TouchableOpacity onPress={handleConfirm} style={styles.button} disabled={registering}>
                        <LinearGradient
                            colors={registering ? ['#e5e7eb', '#d1d5db'] : [SP_RED, '#b91c1c']}
                            style={styles.gradient}
                        >
                            <Text style={styles.buttonText}>
                                {registering ? 'Creating Account...' : 'Confirm & Register'}
                            </Text>
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
