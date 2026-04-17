/**
 * Haversine formula to calculate distance (in km) between two lat/lng points.
 */
export const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Find the nearest available ambulance to a given position.
 */
export const findNearestAmbulance = (ambulances, userLat, userLng) => {
  const available = ambulances.filter((a) => a.status === 'available');
  if (available.length === 0) return null;

  return available.reduce((nearest, amb) => {
    const d = getDistanceKm(userLat, userLng, amb.lat, amb.lng);
    const nd = getDistanceKm(userLat, userLng, nearest.lat, nearest.lng);
    return d < nd ? amb : nearest;
  });
};

/**
 * Find the nearest hospital with ICU availability to a given position.
 */
export const findNearestHospital = (hospitals, userLat, userLng) => {
  const available = hospitals.filter((h) => h.icu_available > 0);
  if (available.length === 0) return null;

  return available.reduce((nearest, hosp) => {
    const d = getDistanceKm(userLat, userLng, hosp.lat, hosp.lng);
    const nd = getDistanceKm(userLat, userLng, nearest.lat, nearest.lng);
    return d < nd ? hosp : nearest;
  });
};

/**
 * Format distance in a human-readable way.
 */
export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

/**
 * Format ETA in minutes from distance and speed.
 * @param {number} distanceKm
 * @param {number} speedKmh
 */
export const formatETA = (distanceKm, speedKmh = 40) => {
  const mins = Math.ceil((distanceKm / speedKmh) * 60);
  if (mins < 1) return '< 1 min';
  return `${mins} min${mins > 1 ? 's' : ''}`;
};
