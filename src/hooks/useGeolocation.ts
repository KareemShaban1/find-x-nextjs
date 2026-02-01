import { useState, useCallback } from "react";

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface GetLocationResult {
  coords: Coords | null;
  error: string | null;
}

export interface UseGeolocationResult {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
  getLocation: () => Promise<GetLocationResult>;
  clearLocation: () => void;
}

/** Geolocation only works in secure contexts (HTTPS or localhost). */
export function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext;
}

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback((): Promise<GetLocationResult> => {
    if (!navigator.geolocation) {
      const msg = "Geolocation is not supported by your browser";
      setError(msg);
      return Promise.resolve({ coords: null, error: msg });
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const c = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoords(c);
          setLoading(false);
          resolve({ coords: c, error: null });
        },
        (err) => {
          let message = "Unable to get your location";
          // Non-secure context (HTTP): browser blocks geolocation; suggest HTTPS or typing a city
          if (typeof window !== "undefined" && !window.isSecureContext) {
            message =
              "Location requires a secure connection (HTTPS). Use this site via https:// for \"Near Me\", or enter a city or address in the location field.";
          } else {
            switch (err.code) {
              case err.PERMISSION_DENIED:
                message =
                  "Location was denied. Enable it in your browser (lock icon → Site settings) or use https:// for this site.";
                break;
              case err.POSITION_UNAVAILABLE:
                message = "Location unavailable. Check your device location settings.";
                break;
              case err.TIMEOUT:
                message = "Location request timed out. Please try again.";
                break;
            }
          }
          setError(message);
          setLoading(false);
          setCoords(null);
          resolve({ coords: null, error: message });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setError(null);
  }, []);

  return { coords, loading, error, getLocation, clearLocation };
}
