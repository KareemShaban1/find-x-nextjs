'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default map center: Egypt (Cairo)
const DEFAULT_CENTER_EGYPT: [number, number] = [30.0444, 31.2357];

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}

function SetViewOnLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 0.5 });
  }, [lat, lng, map]);
  return null;
}

export default function LocationMap({ latitude, longitude, onLocationChange }: LocationMapProps) {
  const [mounted, setMounted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultLat = latitude ?? DEFAULT_CENTER_EGYPT[0];
  const defaultLng = longitude ?? DEFAULT_CENTER_EGYPT[1];

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        onLocationChange(lat, lng);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocationError('Location permission denied');
        else if (err.code === 2) setLocationError('Location unavailable');
        else setLocationError('Could not get location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  if (!mounted) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {locating ? (
            <>Getting location...</>
          ) : (
            <>
              <span aria-hidden>📍</span>
              Use my current location
            </>
          )}
        </button>
        {locationError && (
          <span className="text-sm text-red-600">{locationError}</span>
        )}
      </div>
      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={latitude && longitude ? 15 : 6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {latitude != null && longitude != null && (
            <>
              <Marker position={[latitude, longitude]} />
              <SetViewOnLocation lat={latitude} lng={longitude} />
            </>
          )}
          <MapClickHandler onLocationChange={onLocationChange} />
        </MapContainer>
      </div>
    </div>
  );
}
