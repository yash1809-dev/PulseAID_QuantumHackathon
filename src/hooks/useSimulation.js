import { useEffect, useRef } from 'react';

/**
 * useSimulation
 * Manages:
 * 1. ICU bed fluctuation (every 5 seconds)
 * 2. Idle ambulance slight position drift (every 2 seconds)
 * 
 * Only runs when no active request is dispatched (ambulance is idle).
 */
const useSimulation = ({ hospitals, ambulances, setHospitals, setAmbulances, isRequestActive }) => {
  const icuIntervalRef = useRef(null);
  const ambIntervalRef = useRef(null);

  // --- ICU BED SIMULATION (every 5 seconds) ---
  useEffect(() => {
    if (!hospitals || hospitals.length === 0) return;

    icuIntervalRef.current = setInterval(() => {
      setHospitals(prev =>
        prev.map(hospital => {
          // Random delta between -2 and +2
          const delta = Math.floor(Math.random() * 5) - 2;
          const newAvailable = Math.max(0, Math.min(hospital.icu_total, hospital.icu_available + delta));
          return {
            ...hospital,
            icu_available: newAvailable,
            last_updated: Date.now()
          };
        })
      );
    }, 5000);

    return () => {
      if (icuIntervalRef.current) clearInterval(icuIntervalRef.current);
    };
  }, [hospitals.length, setHospitals]); // only re-run if number of hospitals changes

  // --- AMBULANCE IDLE DRIFT (every 2 seconds) ---
  // Only move ambulances that are NOT 'busy' (i.e. not dispatched)
  useEffect(() => {
    if (!ambulances || ambulances.length === 0) return;
    if (isRequestActive) return; // freeze idle drift when ambulance is en route

    ambIntervalRef.current = setInterval(() => {
      setAmbulances(prev =>
        prev.map(amb => {
          if (amb.status === 'busy') return amb; // don't drift busy ambulances

          // Slight drift: ~0.0005 degrees ≈ ~55 meters max
          const driftLat = (Math.random() - 0.5) * 0.0005;
          const driftLng = (Math.random() - 0.5) * 0.0005;
          return {
            ...amb,
            lat: amb.lat + driftLat,
            lng: amb.lng + driftLng,
          };
        })
      );
    }, 2000);

    return () => {
      if (ambIntervalRef.current) clearInterval(ambIntervalRef.current);
    };
  }, [ambulances.length, isRequestActive, setAmbulances]);
};

export default useSimulation;
