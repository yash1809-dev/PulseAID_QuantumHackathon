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

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported. Using Pune fallback.');
      setLocation(PUNE_FALLBACK);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('Geolocation denied/failed. Using Pune fallback.', err.message);
        setLocationError(err.message);
        setLocation(PUNE_FALLBACK);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return { location, locationError };
};

export default useGeolocation;
