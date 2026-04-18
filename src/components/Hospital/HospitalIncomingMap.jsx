/**
 * HospitalIncomingMap.jsx — Compact live ambulance map for Hospital Portal.
 *
 * Reads ambulance coordinates from ambulanceStore (synced from user's App.jsx).
 * Shows:
 *   - 🚑 Animated ambulance marker (live moving)
 *   - 🏥 Hospital destination marker
 * Height: 240px — embedded inside IncomingPatient card.
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { ambulanceStore } from '../../services/syncService';

const PUNE_CENTER = [73.8567, 18.5204];

const HospitalIncomingMap = ({ hospital, isDark = false, height = 240 }) => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const ambMarkerRef = useRef(null);
  const hospMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded]     = useState(false);
  const [liveData, setLiveData]       = useState(() => ambulanceStore.get());
  const [mapError, setMapError]       = useState(null);

  // ── Subscribe to live ambulance position ──────────────────────────────────
  useEffect(() => {
    // Hydrate immediately
    setLiveData(ambulanceStore.get());
    const unsub = ambulanceStore.subscribe(data => setLiveData(data));
    return unsub;
  }, []);

  // ── Init Mapbox ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const center = hospital
      ? [hospital.lng || PUNE_CENTER[0], hospital.lat || PUNE_CENTER[1]]
      : PUNE_CENTER;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 13,
      interactive: false,
      attributionControl: false,
    });

    map.on('load', () => setMapLoaded(true));
    map.on('error', (e) => setMapError(e.error?.message || 'Map error'));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Place/update hospital marker ──────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !hospital) return;

    const lat = hospital.lat;
    const lng = hospital.lng;
    if (!lat || !lng) return;

    if (hospMarkerRef.current) {
      hospMarkerRef.current.setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.style.cssText = `
        width:36px;height:36px;border-radius:50%;
        background:#2563eb;border:3px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);
      `;
      el.textContent = '🏥';

      hospMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(hospital.name))
        .addTo(mapRef.current);
    }
  }, [mapLoaded, hospital]);

  // ── Place/update ambulance marker ─────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !liveData) {
      // Remove marker if ambulance is gone
      if (ambMarkerRef.current && !liveData) {
        ambMarkerRef.current.remove();
        ambMarkerRef.current = null;
      }
      return;
    }

    const { lat, lng } = liveData;
    if (!lat || !lng) return;

    if (ambMarkerRef.current) {
      ambMarkerRef.current.setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.style.cssText = `
        width:40px;height:40px;border-radius:50%;
        background:#dc2626;border:3px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;box-shadow:0 2px 12px rgba(220,38,38,0.5);
        animation:pulse-red 1.5s ease-in-out infinite;
      `;
      el.textContent = '🚑';

      ambMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      // Inject pulse keyframes if not already present
      if (!document.getElementById('amb-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'amb-pulse-style';
        style.textContent = `
          @keyframes pulse-red {
            0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.5); }
            50%       { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    // Pan map to keep ambulance visible
    mapRef.current.panTo([lng, lat], { duration: 600, essential: false });
  }, [mapLoaded, liveData]);

  if (mapError) {
    return (
      <div className={`w-full h-[240px] rounded-2xl flex items-center justify-center text-xs ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>
        Map unavailable
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: typeof height === 'number' ? height : '100%' }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Live badge */}
      {liveData && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
      )}

      {/* No signal */}
      {!liveData && mapLoaded && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
            Waiting for ambulance signal...
          </span>
        </div>
      )}
    </div>
  );
};

export default HospitalIncomingMap;
