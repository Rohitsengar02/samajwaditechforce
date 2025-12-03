import React, { forwardRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { StyleSheet } from 'react-native';

interface NativeMapProps {
    region: Region;
    onRegionChangeComplete: (region: Region) => void;
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    style?: any;
}

const NativeMap = forwardRef<MapView, NativeMapProps>((props, ref) => {
    return (
        <MapView
            ref={ref}
            style={props.style}
            initialRegion={props.region}
            onRegionChangeComplete={props.onRegionChangeComplete}
            showsUserLocation={props.showsUserLocation}
            showsMyLocationButton={props.showsMyLocationButton}
        />
    );
});

export default NativeMap;
