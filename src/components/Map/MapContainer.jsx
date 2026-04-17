import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const PUNE_CENTER = [73.8567, 18.5204];

const MapContainer = ({
  hospitals = [],
  ambulances = [],
  userLocation,
  activeRequest,
  nearestHospital,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  onHospitalSelect,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const hospMarkersRef = useRef({});
  const ambMarkersRef = useRef({});
  const userMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // --- Init map ---
  useEffect(() => {
    if (mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle, // Use the prop directly for init
      center: PUNE_CENTER,
      zoom: 12.5,
      pitchWithRotate: false,
      dragRotate: false,
      attributionControl: false,
    });

    map.on('load', () => {
      console.log('[Mapbox] Map loaded event fired');
      setMapLoaded(true);
      map.resize();
    });

    map.on('error', (e) => {
      console.error('[Mapbox] Initialization Error:', e.error?.message || e.message);
      setMapError(e.error?.message || e.message || 'Unknown Mapbox Error');
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // --- Handle Style Switching ---
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.setStyle(mapStyle);
  }, [mapStyle, mapLoaded]);

  // --- User location marker ---
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !userLocation) return;

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      // Explicit sizing prevents anchor drifting on zoom
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.position = 'relative';
      el.innerHTML = `
        <div class="absolute inset-0 rounded-full bg-red-600 border-[3px] border-white shadow-xl z-10 flex items-center justify-center">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
        <div class="absolute inset-0 -m-2 rounded-full bg-red-400 opacity-50 animate-ping"></div>
      `;
      userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);

      // Instantly focus map on user location when first detected
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13.5,
        essential: true,
        duration: 2000
      });
    } else {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation, mapLoaded]);

  // --- Hospital markers ---
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Sync hospital markers
    const currentIds = hospitals.map(h => h.id);
    Object.keys(hospMarkersRef.current).forEach(id => {
      if (!currentIds.includes(id)) {
        hospMarkersRef.current[id].remove();
        delete hospMarkersRef.current[id];
      }
    });

    hospitals.forEach((hospital) => {
      const isAvailable = hospital.icu_available > 0;
      const isNearest = nearestHospital?.id === hospital.id;
      const color = isAvailable ? '#22c55e' : '#ef4444';

      if (hospMarkersRef.current[hospital.id]) {
        const el = hospMarkersRef.current[hospital.id].getElement();
        el.style.backgroundColor = color;
        el.style.boxShadow = isNearest 
          ? `0 0 0 3px white, 0 0 0 5px ${color}`
          : '0 2px 8px rgba(0,0,0,0.2)';
        return;
      }

      const el = document.createElement('div');
      el.style.cssText = `
        width: 26px; height: 26px; border-radius: 50%;
        background-color: ${color}; border: 2.5px solid white;
        box-shadow: ${isNearest ? `0 0 0 3px white, 0 0 0 5px ${color}` : '0 2px 8px rgba(0,0,0,0.2)'};
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: background-color 0.3s, box-shadow 0.3s;
      `;
      const dot = document.createElement('div');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.7)';
      el.appendChild(dot);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onHospitalSelect(hospital);
        mapRef.current.easeTo({
          center: [hospital.lng, hospital.lat],
          offset: [0, 80],
          duration: 700
        });
      });

      hospMarkersRef.current[hospital.id] = new mapboxgl.Marker(el)
        .setLngLat([hospital.lng, hospital.lat])
        .addTo(mapRef.current);
    });
  }, [hospitals, nearestHospital, mapLoaded]);

  // --- Ambulance markers ---
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const currentIds = ambulances.map(a => a.id);
    Object.keys(ambMarkersRef.current).forEach(id => {
      if (!currentIds.includes(id)) {
        ambMarkersRef.current[id].remove();
        delete ambMarkersRef.current[id];
      }
    });

    ambulances.forEach((ambulance) => {
      const color = ambulance.status === 'busy' ? '#f59e0b' : '#2563eb';
      if (ambMarkersRef.current[ambulance.id]) {
        ambMarkersRef.current[ambulance.id].setLngLat([ambulance.lng, ambulance.lat]);
        ambMarkersRef.current[ambulance.id].getElement().style.backgroundColor = color;
        return;
      }

      const el = document.createElement('div');
      el.style.cssText = `
        width: 38px; height: 28px; border-radius: 8px;
        background-color: ${color}; border: 2.5px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        transition: background-color 0.3s;
      `;
      el.innerHTML = `<span style="color:white;font-size:16px;font-weight:bold;line-height:1">🚑</span>`;

      ambMarkersRef.current[ambulance.id] = new mapboxgl.Marker(el)
        .setLngLat([ambulance.lng, ambulance.lat])
        .addTo(mapRef.current);
    });
  }, [ambulances, mapLoaded]);

  // --- Route polyline ---
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;
    if (!activeRequest || activeRequest.status === 'arrived' || activeRequest.route?.length === 0) {
      if (map.getLayer('ambulance-route-line')) map.removeLayer('ambulance-route-line');
      if (map.getSource('ambulance-route')) map.removeSource('ambulance-route');
      return;
    }

    const geojson = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: activeRequest.route },
    };

    if (map.getSource('ambulance-route')) {
      map.getSource('ambulance-route').setData(geojson);
    } else {
      map.addSource('ambulance-route', { type: 'geojson', data: geojson });
      map.addLayer({
        id: 'ambulance-route-line',
        type: 'line',
        source: 'ambulance-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#2563eb',
          'line-width': 4,
          'line-opacity': 0.75,
          'line-dasharray': [1, 2],
        },
      });
    }
  }, [activeRequest?.route, activeRequest?.status, mapLoaded]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
      
      {/* Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-base font-extrabold text-gray-800 tracking-tight mb-2 uppercase">ICU Tracker — Pune</h1>
        
        {/* DEBUG INFO */}
        <div className="mb-2 p-2 bg-red-50 rounded border border-red-100 text-[10px] space-y-1">
          <div><span className="font-bold">Token:</span> {import.meta.env.VITE_MAPBOX_TOKEN ? (import.meta.env.VITE_MAPBOX_TOKEN.substring(0, 15) + '...') : 'NULL (Check .env + Restart)'}</div>
          <div><span className="font-bold">Error:</span> {mapError || 'None'}</div>
          <div><span className="font-bold">State:</span> {mapLoaded ? 'Loaded' : 'Waiting...'}</div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white" />
            <span className="text-[10px] text-gray-600 font-bold uppercase">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white" />
            <span className="text-[10px] text-gray-600 font-bold uppercase">Full</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-4 rounded-md bg-blue-600 border border-white shadow-sm flex items-center justify-center">
              <span style={{fontSize: 8}}>🚑</span>
            </div>
            <span className="text-[10px] text-gray-600 font-bold uppercase">Ambulance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span className="text-[10px] text-gray-600 font-bold uppercase">You</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
