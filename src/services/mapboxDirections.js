/**
 * mapboxDirections.js
 * 
 * Fetches a driving route from Mapbox Directions API.
 * 
 * OPTIMIZATION RULES:
 * - Routes are cached by key (origin → destination) to avoid repeated API calls
 * - Cache persists for the app session (in-memory)
 * - Only called ONCE per ambulance dispatch
 */

const routeCache = {};

const getRouteKey = (fromLng, fromLat, toLng, toLat) =>
  `${fromLng.toFixed(4)},${fromLat.toFixed(4)}-${toLng.toFixed(4)},${toLat.toFixed(4)}`;

/**
 * Fetch a driving route from Mapbox Directions API.
 * Returns an array of [lng, lat] coordinate pairs representing the route.
 * 
 * @param {number} fromLng
 * @param {number} fromLat
 * @param {number} toLng
 * @param {number} toLat
 * @returns {Promise<Array<[number, number]>>}  array of [lng, lat] points
 */
export const fetchRoute = async (fromLng, fromLat, toLng, toLat) => {
  const cacheKey = getRouteKey(fromLng, fromLat, toLng, toLat);

  // Return cached route if available (Optimization: zero API calls on repeat)
  if (routeCache[cacheKey]) {
    console.log('[Mapbox] Serving route from cache.');
    return routeCache[cacheKey];
  }

  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full&access_token=${token}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Mapbox API error: ${response.status}`);

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found.');
    }

    const coords = data.routes[0].geometry.coordinates; // [[lng, lat], ...]
    const durationSeconds = data.routes[0].duration; // seconds
    const distanceMeters = data.routes[0].distance; // meters

    const result = { coords, durationSeconds, distanceMeters };

    // Cache it! (Optimization: avoids hitting Mapbox Directions API again)
    routeCache[cacheKey] = result;
    console.log(`[Mapbox] Route fetched and cached. ${coords.length} waypoints.`);

    return result;
  } catch (err) {
    console.error('[Mapbox] Failed to fetch route:', err.message);
    // Fallback: return a straight line between origin and destination
    return {
      coords: [[fromLng, fromLat], [toLng, toLat]],
      durationSeconds: 300,
      distanceMeters: 2000,
    };
  }
};
