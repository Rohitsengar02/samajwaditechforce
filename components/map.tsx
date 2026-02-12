import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Location {
    lat: number;
    lng: number;
}

interface MapProps {
    location: Location | null;
    onRegionChangeComplete?: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => void;
}

export default function Map({ location, onRegionChangeComplete }: MapProps) {
    const webViewRef = useRef<WebView>(null);

    const htmlContent = `
    <!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body {margin: 0; padding: 0; }
                    #map {width: 100%; height: 100vh; }
                    .custom-person-marker {background: transparent; border: none; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    var map = L.map('map', {
                        zoomControl: false,
                    attributionControl: false
            }).setView([20.5937, 78.9629], 5);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
            }).addTo(map);

                    var marker;
                    var personIcon = L.divIcon({
                        className: 'custom-person-marker',
                    html: '<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
            });

                    function updateLocation(lat, lng) {
                if (marker) {
                        marker.setLatLng([lat, lng]);
                } else {
                        marker = L.marker([lat, lng], { icon: personIcon }).addTo(map);
                }
                    map.setView([lat, lng], 16, {animate: true, duration: 1 });
            }

                    // Send map center changes to React Native
                    map.on('moveend', function() {
                var center = map.getCenter();
                    var bounds = map.getBounds();
                    var latDelta = bounds.getNorth() - bounds.getSouth();
                    var lngDelta = bounds.getEast() - bounds.getWest();

                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'regionChange',
                    latitude: center.lat,
                    longitude: center.lng,
                    latitudeDelta: latDelta,
                    longitudeDelta: lngDelta
                }));
            });
                </script>
            </body>
        </html>
    `;

    useEffect(() => {
        if (location && webViewRef.current) {
            webViewRef.current.injectJavaScript(`updateLocation(${location.lat}, ${location.lng}); true; `);
        }
    }, [location]);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'regionChange' && onRegionChangeComplete) {
                onRegionChangeComplete({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    latitudeDelta: data.latitudeDelta,
                    longitudeDelta: data.longitudeDelta
                });
            }
        } catch (error) {
            console.log('Map message error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={styles.map}
                scrollEnabled={false}
                onMessage={handleMessage}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
});
