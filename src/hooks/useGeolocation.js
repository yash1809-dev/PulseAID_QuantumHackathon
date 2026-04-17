import { useState, useEffect } from 'react';

const PUNE_FALLBACK = { lat: 18.5204, lng: 73.8567 };

/**
 * useGeolocation
 * Returns user's real GPS location.
 * Falls back to Pune center if denied or unavailable.
 */
const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported. Using Pune fallback.');
      setLocation(PUNE_FALLBACK);
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true, // Force GPS
      timeout: 15000,          // Wait up to 15s
      maximumAge: 0            // Don't use cached location
    };

    const success = (pos) => {
      console.log('[Geo] Real location detected:', pos.coords.latitude, pos.coords.longitude);
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setLoading(false);
    };

    const error = (err) => {
      console.warn(`[Geo] Error (${err.code}): ${err.message}. Using Pune fallback.`);
      setLocationError(err.message);
      setLocation(PUNE_FALLBACK);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  }, []);

  return { location, locationError, loading };
};

export default useGeolocation;
