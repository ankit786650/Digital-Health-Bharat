"use client";

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as L from 'leaflet'; // Keep this import at top
import 'leaflet/dist/leaflet.css'; // Keep this import at top

interface Marker { 
  lat: number; 
  lng: number; 
  name?: string; 
}

interface MapComponentProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Marker[];
}

// Dynamically import Leaflet with no SSR
const MapComponent = ({ latitude, longitude, zoom = 13, markers = [] }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null); // Revert to L.Map | null
  const markersRef = useRef<L.Marker[]>([]); // Revert to L.Marker[]

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const initMap = () => {
      // Fix for default Leaflet icon issue with Webpack/CRA
      // It's better to explicitly set the default icon options directly.
      if (L.Icon) {
        L.Marker.prototype.options.icon = L.icon({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
      }

      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current!);
      } else if (mapInstanceRef.current) {
        // If map already exists, update view
        mapInstanceRef.current.setView([latitude, longitude], zoom);
      }

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      if (markers.length > 0 && mapInstanceRef.current) {
        markers.forEach(marker => {
          const newMarker = L.marker([marker.lat, marker.lng])
            .addTo(mapInstanceRef.current!)
            .bindPopup(marker.name || 'Location');
          markersRef.current.push(newMarker);
        });
      } else if (latitude && longitude && mapInstanceRef.current) {
        // Add single marker for current location if no specific markers provided
        const marker = L.marker([latitude, longitude])
          .addTo(mapInstanceRef.current!)
          .bindPopup('Selected Location');
        markersRef.current.push(marker);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markers]);

  return (
    <div 
      ref={mapRef} 
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
      className="border border-border"
    />
  );
};

// Export as dynamic component with no SSR
export default dynamic(() => Promise.resolve(MapComponent), {
  ssr: false
}); 