
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
    lat: number;
    lng: number;
}

interface MapProps {
    location: Location | null;
}

const createPersonIcon = () => {
    return L.divIcon({
        className: 'custom-person-marker',
        html: `<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
      </svg>
    </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
};

export default function Map({ location }: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize map only once
        if (!mapRef.current && containerRef.current) {
            mapRef.current = L.map(containerRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView([20.5937, 78.9629], 5); // Default to center of India

            // Use a light theme map style
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(mapRef.current);

            // Force a resize after initialization
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                }
            }, 250);
        }

        // Cleanup function
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update map when location changes
    useEffect(() => {
        if (!mapRef.current || !location) return;

        // Force a resize to ensure proper display
        mapRef.current.invalidateSize();

        // Update map view with smooth animation
        mapRef.current.setView([location.lat, location.lng], 16, {
            animate: true,
            duration: 1
        });

        // Update or create marker with person icon
        if (markerRef.current) {
            markerRef.current.setLatLng([location.lat, location.lng]);
        } else {
            markerRef.current = L.marker([location.lat, location.lng], {
                icon: createPersonIcon(),
            }).addTo(mapRef.current);
        }
    }, [location]);

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
            }}
        />
    );
}