/**
 * App.jsx — Main application shell.
 *
 * EXTENSION PRINCIPLES:
 * - All existing state variables, effects, and callbacks are PRESERVED UNCHANGED.
 * - ambulances, activeRequest, dispatch logic = 100% original.
 * - New additions: auth gating, central hospital/doctor state, bottom sheet, navbar.
 *
 * GLOBAL DATA FLOW: Service Layer → Central State (here) → UI Components
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ── Dev Configuration ───────────────────────────────────────────────────────
const DEV_MODE = true; 


// ── Existing imports (UNCHANGED) ─────────────────────────────────────────────
import MapContainer from './components/Map/MapContainer';
import RequestTracker from './components/UI/RequestTracker';
import DarkModeToggle from './components/UI/DarkModeToggle';
import { MockAPI } from './services/api';
import { fetchRoute } from './services/mapboxDirections';
import useSimulation from './hooks/useSimulation';
import useGeolocation from './hooks/useGeolocation';
import { findNearestAmbulance, findNearestHospital, getDistanceKm, formatDistance, formatETA } from './utils/geo';

// ── New imports ───────────────────────────────────────────────────────────────
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './components/Auth/LoginScreen';
import HospitalPortal from './components/Hospital/HospitalPortal';
import DoctorDashboard from './pages/DoctorDashboard';
import BottomSheet from './components/UI/BottomSheet';
import BottomNavbar from './components/UI/BottomNavbar';
import DoctorSearch from './components/Doctors/DoctorSearch';
import ProfileView from './components/UI/ProfileView';
import StatusBar from './components/UI/StatusBar';
import DemoControl from './components/UI/DemoControl';
import GovtSchemes from './components/Govt/GovtSchemes';
import { hospitalService } from './services/hospitalService';
import { doctorService } from './services/doctorService';
import useMatchingEngine from './hooks/useMatchingEngine';
// ── Continuity of Care imports ──────────────────────────────────────────────────────
import careService from './services/careService';
import { recommendationsStore, alertsStore, ambulanceStore } from './services/syncService';
import { getSnapshotByUserId } from './services/emergencySnapshotService';
import UserDoctorNotice from './components/Care/UserDoctorNotice';
import MedicalRecordsPage from './pages/MedicalRecordsPage';

function App() {
  // ── Existing state (ALL UNCHANGED) ───────────────────────────────────────
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const routeAnimRef = useRef(null);
  const { location: userLocation } = useGeolocation();

  // ── New state ─────────────────────────────────────────────────────────────
  const { user, role, isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'doctors' | 'profile'
  const [isTrackerMinimized, setIsTrackerMinimized] = useState(false);

  // Filter state (from user prefs, user can override inline)
  const [insurance, setInsurance] = useState(user?.insurance || 'none');
  const [budget, setBudget] = useState(user?.budget || null);
  const [priority, setPriority] = useState(user?.priority || 'nearest');

  // ── Continuity of Care state (SYNCED across tabs/devices) ───────────────────
  // recommendation: { text, doctorName, timestamp } | null
  const [recommendation, setRecommendation] = useState(
    () => user?.id ? careService.getRecommendation(user.id) : null
  );

  // ── Active emergency alert state (for hospital snapshot card) ─────────────
  const [activeAlert, setActiveAlert] = useState(null);

  // Subscribe to alertsStore to get latest alert with snapshotId
  useEffect(() => {
    const hydrate = alertsStore.get();
    const all = Array.isArray(hydrate) ? hydrate : [];
    const latest = all.find(a => a.status === 'active') || null;
    setActiveAlert(latest);

    const unsub = alertsStore.subscribe((alerts) => {
      const arr = Array.isArray(alerts) ? alerts : [];
      const latest = arr.find(a => a.status === 'active') || null;
      setActiveAlert(latest);
    });
    return unsub;
  }, []);

  // Subscribe to recommendationsStore for instant cross-tab sync
  useEffect(() => {
    if (!user?.id) return;
    // Hydrate on mount
    const rec = careService.getRecommendation(user.id);
    if (rec) setRecommendation(rec);

    // Reactive subscription — fires on any tab/device that writes a recommendation
    const unsub = recommendationsStore.subscribe((allRecs) => {
      const mine = allRecs?.[user.id] || null;
      setRecommendation(mine);
    });
    return unsub;
  }, [user?.id]);

  // Sync user prefs to filter state when user logs in
  useEffect(() => {
    if (user?.user_type === 'user') {
      setInsurance(user.insurance || 'none');
      setBudget(user.budget || null);
      setPriority(user.priority || 'nearest');
    }
  }, [user]);

  // ── Initial data load (EXTENDED: now loads doctors too) ───────────────────
  const [govtSchemes, setGovtSchemes] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        const [hospData, ambData, docData, schemeData] = await Promise.all([
          hospitalService.getAll(userLocation),        // Pass location to shift mock data
          MockAPI.getAmbulances(null, userLocation),   // Pass location to shift mock data
          doctorService.getAll(),      
          import('./services/schemeService').then(m => m.schemeService.getAll())
        ]);
        setHospitals(hospData);
        setAmbulances(ambData);
        setDoctors(docData);
        setGovtSchemes(schemeData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, userLocation]);

  // ── Simulation Engine (UNCHANGED) ────────────────────────────────────────
  useSimulation({
    hospitals,
    ambulances,
    setHospitals,
    setAmbulances,
    isRequestActive: activeRequest !== null && activeRequest.status !== 'arrived',
  });

  // ── Sync selected hospital when hospitals update (UNCHANGED) ──────────────
  useEffect(() => {
    if (!selectedHospital) return;
    const updated = hospitals.find((h) => h.id === selectedHospital.id);
    if (updated) setSelectedHospital(updated);
  }, [hospitals]); // eslint-disable-line

  // ── Nearest hospital to user (UNCHANGED) ─────────────────────────────────
  const nearestHospital = userLocation
    ? findNearestHospital(hospitals, userLocation.lat, userLocation.lng)
    : null;

  // ── Smart Matching Engine ────────────────────────────────────────────────
  const { bestMatch, rankedList, matchReason, hasResults, filterStats, isProcessing, report } = useMatchingEngine({
    userLocation,
    insurance,
    budget,
    priority,
    hospitals,
    doctors,
    user, // pass user details for dynamic matching
  });

  // ── DISPATCH: Call Ambulance (UNCHANGED) ──────────────────────────────────
  const handleCallAmbulance = useCallback(async () => {
    if (!userLocation) return;
    if (activeRequest && activeRequest.status !== 'arrived') return;

    setIsTrackerMinimized(false);
    const nearestAmb = findNearestAmbulance(ambulances, userLocation.lat, userLocation.lng);
    const targetHospital = selectedHospital || bestMatch || nearestHospital;

    if (!nearestAmb) {
      alert('No ambulances available right now. Please try again shortly.');
      return;
    }
    if (!targetHospital) {
      alert('No hospitals with ICU availability found nearby.');
      return;
    }

    setAmbulances((prev) =>
      prev.map((a) => (a.id === nearestAmb.id ? { ...a, status: 'busy' } : a))
    );

    setActiveRequest({
      status: 'pending',
      ambulanceId: nearestAmb.id,
      hospitalId: targetHospital.id,
      nearestHospital: targetHospital,
      route: [],
      routeIndex: 0,
      eta: '...',
      distance: '...',
    });

    try {
      const { coords, durationSeconds, distanceMeters } = await fetchRoute(
        nearestAmb.lng, nearestAmb.lat,
        userLocation.lng, userLocation.lat
      );

      await MockAPI.createRequest({
        user_location: userLocation,
        assigned_ambulance_id: nearestAmb.id,
        assigned_hospital_id: targetHospital.id,
      });

      const totalDistKm = distanceMeters / 1000;

      setActiveRequest((prev) => ({
        ...prev,
        status: 'en_route',
        route: coords,
        routeIndex: 0,
        eta: formatETA(totalDistKm),
        distance: formatDistance(totalDistKm),
      }));

      // ── Trigger Continuity of Care flow (with snapshot if available) ─────────────
      if (user?.primaryDoctorId) {
        // Fetch snapshot non-blocking — don't delay ambulance dispatch
        getSnapshotByUserId(user.id)
          .then(({ data: snap }) => {
            careService.triggerEmergencyFlow(
              user,
              targetHospital,
              nearestAmb,
              formatETA(totalDistKm),
              snap?.id || null   // snapshotId — null if no records uploaded yet
            );
          })
          .catch(() => {
            // Fallback — trigger without snapshot if Supabase unreachable
            careService.triggerEmergencyFlow(user, targetHospital, nearestAmb, formatETA(totalDistKm), null);
          });
      }
      // ─────────────────────────────────────────────────────────────────────

      let idx = 0;
      const totalSteps = coords.length;
      const targetDurationMs = Math.min(durationSeconds * 1000, 45000);
      const stepMs = Math.max(150, Math.floor(targetDurationMs / totalSteps));

      // Helper: generate interpolated coords between two points for phase 2
      function interpolateRoute(fromLat, fromLng, toLat, toLng, steps = 60) {
        const pts = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          pts.push([fromLng + (toLng - fromLng) * t, fromLat + (toLat - fromLat) * t]);
        }
        return pts;
      }

      if (routeAnimRef.current) clearInterval(routeAnimRef.current);

      // ── Phase 1: Ambulance → Patient ──────────────────────────────────────
      routeAnimRef.current = setInterval(() => {
        idx += 1;
        if (idx >= coords.length) {
          // ── Phase 1 complete: ambulance reached patient ────────────────
          clearInterval(routeAnimRef.current);

          // Brief "picking up patient" pause (2 seconds) then start phase 2
          ambulanceStore.set({
            lat: userLocation.lat,
            lng: userLocation.lng,
            ambulanceId: nearestAmb.id,
            hospitalId: targetHospital.id,
            hospitalLat: targetHospital.lat,
            hospitalLng: targetHospital.lng,
            phase: 'pickup',
            timestamp: Date.now(),
          });

          setTimeout(() => {
            // ── Phase 2: Patient → Hospital ──────────────────────────────
            const returnCoords = interpolateRoute(
              userLocation.lat, userLocation.lng,
              targetHospital.lat, targetHospital.lng,
              80   // 80 interpolated steps for smooth animation
            );
            const returnDistKm = getDistanceKm(
              userLocation.lat, userLocation.lng,
              targetHospital.lat, targetHospital.lng
            );

            let returnIdx = 0;
            const returnStepMs = Math.max(150, Math.floor(Math.min(returnDistKm * 1000 * 3, 30000) / returnCoords.length));

            routeAnimRef.current = setInterval(() => {
              returnIdx += 1;
              if (returnIdx >= returnCoords.length) {
                clearInterval(routeAnimRef.current);
                // Ambulance arrived at hospital with patient
                setAmbulances((prev) =>
                  prev.map((a) =>
                    a.id === nearestAmb.id
                      ? { ...a, status: 'available', lat: targetHospital.lat, lng: targetHospital.lng }
                      : a
                  )
                );
                setActiveRequest((prev) => ({ ...prev, status: 'arrived', eta: '0 min', distance: '0 m' }));
                ambulanceStore.clear();
                return;
              }

              const [rLng, rLat] = returnCoords[returnIdx];
              setAmbulances((prev) =>
                prev.map((a) => (a.id === nearestAmb.id ? { ...a, lat: rLat, lng: rLng } : a))
              );

              const remainingReturn = returnCoords.slice(returnIdx);
              const remainingReturnKm = remainingReturn.reduce((acc, coord, i) => {
                if (i === 0) return acc;
                const [pLng, pLat] = remainingReturn[i - 1];
                return acc + getDistanceKm(pLat, pLng, coord[1], coord[0]);
              }, 0);

              // Publish phase 2 position to hospital tab
              ambulanceStore.set({
                lat: rLat,
                lng: rLng,
                ambulanceId: nearestAmb.id,
                hospitalId: targetHospital.id,
                hospitalLat: targetHospital.lat,
                hospitalLng: targetHospital.lng,
                phase: 'to_hospital',
                eta: formatETA(remainingReturnKm),
                timestamp: Date.now(),
              });

              // Update user's display with return ETA (en_route status remains)
              setActiveRequest((prev) => ({
                ...prev,
                eta: formatETA(remainingReturnKm),
                distance: formatDistance(remainingReturnKm),
              }));
            }, returnStepMs);
          }, 2000); // 2 second "pickup" pause

          return;
        }

        const [lng, lat] = coords[idx];
        setAmbulances((prev) =>
          prev.map((a) => (a.id === nearestAmb.id ? { ...a, lat, lng } : a))
        );

        // Publish phase 1 position to hospital tab
        ambulanceStore.set({
          lat,
          lng,
          ambulanceId: nearestAmb.id,
          hospitalId: targetHospital.id,
          hospitalLat: targetHospital.lat,
          hospitalLng: targetHospital.lng,
          phase: 'to_patient',
          timestamp: Date.now(),
        });

        const remaining = coords.slice(idx);
        const remainingDistKm = remaining.reduce((acc, coord, i) => {
          if (i === 0) return acc;
          const [pLng, pLat] = remaining[i - 1];
          return acc + getDistanceKm(pLat, pLng, coord[1], coord[0]);
        }, 0);

        setActiveRequest((prev) => ({
          ...prev,
          routeIndex: idx,
          eta: formatETA(remainingDistKm),
          distance: formatDistance(remainingDistKm),
        }));
      }, stepMs);
    } catch (err) {
      console.error('Dispatch failed:', err);
      setActiveRequest(null);
      setAmbulances((prev) =>
        prev.map((a) => (a.id === nearestAmb.id ? { ...a, status: 'available' } : a))
      );
    }
  }, [userLocation, ambulances, selectedHospital, bestMatch, nearestHospital, activeRequest]);

  // ── DISPATCH: Request ICU (UNCHANGED) ─────────────────────────────────────
  const handleRequestICU = useCallback(async () => {
    const targetHospital = selectedHospital || bestMatch || nearestHospital;
    if (!targetHospital) {
      alert('No hospitals with ICU availability found.');
      return;
    }
    if (targetHospital.icu_available === 0) {
      alert(`${targetHospital.name} has no available ICU beds. Please select another hospital.`);
      return;
    }
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === targetHospital.id
          ? { ...h, icu_available: Math.max(0, h.icu_available - 1) }
          : h
      )
    );
    alert(`✅ ICU bed reserved at ${targetHospital.name}.\nPlease proceed to the hospital immediately.`);
  }, [selectedHospital, bestMatch, nearestHospital]);

  // ── Dismiss request (UNCHANGED) ───────────────────────────────────────────
  const handleDismissRequest = useCallback(() => {
    if (routeAnimRef.current) clearInterval(routeAnimRef.current);
    if (activeRequest?.ambulanceId) {
      setAmbulances((prev) =>
        prev.map((a) =>
          a.id === activeRequest.ambulanceId ? { ...a, status: 'available' } : a
        )
      );
    }
    setActiveRequest(null);
  }, [activeRequest]);

  // ── Hospital Portal callbacks (central state updates) ─────────────────────
  const handleUpdateICU = useCallback((hospitalId, count) => {
    setHospitals(prev => hospitalService.updateICU(prev, hospitalId, count));
  }, []);

  const handleUpdateCostLevel = useCallback((hospitalId, level) => {
    setHospitals(prev => hospitalService.updateCostLevel(prev, hospitalId, level));
  }, []);

  const handleToggleInsurance = useCallback((hospitalId, ins) => {
    setHospitals(prev => hospitalService.toggleInsurance(prev, hospitalId, ins));
  }, []);

  const handleToggleDoctorDay = useCallback((docId, day) => {
    setDoctors(prev => doctorService.toggleAvailability(prev, docId, day));
  }, []);

  // ── Hospital select (from doctor modal or hospital list) ──────────────────
  const handleSelectHospital = useCallback((hospital) => {
    setSelectedHospital(hospital);
    setActiveTab('map'); // switch to map view
  }, []);

  // ── Demo Control callbacks ────────────────────────────────────────────────
  const handleSetAllICUFull = useCallback(() => {
    setHospitals(prev => prev.map(h => ({ ...h, icu_available: 0, last_updated: Date.now() })));
  }, []);

  const handleSetAllICUAvailable = useCallback(() => {
    setHospitals(prev => prev.map(h => ({ ...h, icu_available: h.icu_total, last_updated: Date.now() })));
  }, []);

  const handleSetHospitalICU = useCallback((hospitalId, count) => {
    setHospitals(prev => hospitalService.updateICU(prev, hospitalId, count));
  }, []);

  // ── Doctor Handlers ───────────────────────────────────────────────────────
  const handleUpdateDoctorProfile = useCallback((doctorId, updates) => {
    setDoctors(prev => doctorService.updateProfile(prev, doctorId, updates));
  }, []);

  const handleAddDoctorSlot = useCallback((doctorId, day, slot) => {
    setDoctors(prev => doctorService.addSlot(prev, doctorId, day, slot));
  }, []);

  const handleRemoveDoctorSlot = useCallback((doctorId, day, index) => {
    setDoctors(prev => doctorService.removeSlot(prev, doctorId, day, index));
  }, []);

  const handleUpdateAmbulanceDriver = useCallback((ambId, updates) => {
    setAmbulances(prev => prev.map(a => a.id === ambId ? { ...a, ...updates } : a));
  }, []);

  const handleAddAmbulance = useCallback((newAmb) => {
    setAmbulances(prev => [
      ...prev,
      {
        ...newAmb,
        id: `amb-new-${Date.now()}`,
        status: 'available',
        lat: 18.5204, // Default center or hospital near lat
        lng: 73.8567,
        speed: 40,
        driverPhoto: `https://api.dicebear.com/7.x/personas/svg?seed=${newAmb.driverName}`
      }
    ]);
  }, []);

  const handleLinkHospital = useCallback((doctorId, hospitalId) => {
    setDoctors(prev => doctorService.linkHospital(prev, doctorId, hospitalId));
  }, []);

  const handleUnlinkHospital = useCallback((doctorId, hospitalId) => {
    setDoctors(prev => doctorService.unlinkHospital(prev, doctorId, hospitalId));
  }, []);

  // ── Map style (UNCHANGED) ─────────────────────────────────────────────────
  const mapStyle = isDark
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/streets-v12';

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) return <LoginScreen />;

  // ── Hospital Portal ───────────────────────────────────────────────────────
  if (role === 'hospital') {
    return (
      <>
        <HospitalPortal
          hospitals={hospitals}
          doctors={doctors}
          ambulances={ambulances}
          activeRequest={activeRequest}
          isDark={isDark}
          onUpdateICU={handleUpdateICU}
          onUpdateCostLevel={handleUpdateCostLevel}
          onToggleInsurance={handleToggleInsurance}
          onToggleDoctorDay={handleToggleDoctorDay}
          onUpdateAmbulanceDriver={handleUpdateAmbulanceDriver}
          onAddAmbulance={handleAddAmbulance}
          recommendation={recommendation}
          activeAlert={activeAlert}
        />
      </>
    );
  }

  // ── Doctor Dashboard ──────────────────────────────────────────────────────
  if (role === 'doctor') {
    return (
      <DoctorDashboard
        doctors={doctors}
        hospitals={hospitals}
        isDark={isDark}
        onUpdateProfile={handleUpdateDoctorProfile}
        onAddSlot={handleAddDoctorSlot}
        onRemoveSlot={handleRemoveDoctorSlot}
        onLinkHospital={handleLinkHospital}
        onUnlinkHospital={handleUnlinkHospital}
      />
    );
  }

  // ── User View ─────────────────────────────────────────────────────────────
  return (
    <main className={`w-full h-screen overflow-hidden relative ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Loading splash */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Loading MedConnect...</p>
          </div>
        </div>
      )}

      {/* ── Map (full screen, UNCHANGED) ─────────────────────────────────── */}
      {activeTab === 'map' && (
        <div style={{ position: 'absolute', inset: 0, bottom: '64px' }}>
          <MapContainer
            hospitals={hospitals}
            ambulances={ambulances}
            userLocation={userLocation}
            activeRequest={activeRequest}
            nearestHospital={bestMatch || nearestHospital}
            mapStyle={mapStyle}
            onHospitalSelect={setSelectedHospital}
          />

          {/* ── Floating UI Stack (Tracker, Status) ── */}
          <div className="absolute bottom-[200px] left-0 right-0 z-30 flex flex-col items-center justify-end gap-3 pointer-events-none px-3">
            
            {/* Expanded Request Tracker (Floats on Map) */}
            {activeRequest && !isTrackerMinimized && (
              <div className="pointer-events-auto w-full max-w-sm">
                <RequestTracker
                  request={activeRequest}
                  ambulances={ambulances}
                  isMinimized={false}
                  onMinimize={() => setIsTrackerMinimized(true)}
                  onMaximize={() => setIsTrackerMinimized(false)}
                  onDismiss={handleDismissRequest}
                />
              </div>
            )}

            {/* Status Bar */}
            <StatusBar
              activeRequest={activeRequest}
              bestMatch={bestMatch}
              isSearching={isProcessing}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* ── Doctor Search tab ─────────────────────────────────────────────── */}
      {activeTab === 'doctors' && (
        <div style={{ position: 'absolute', inset: 0, bottom: '64px', overflow: 'hidden' }}>
          <DoctorSearch
            doctors={doctors}
            hospitals={hospitals}
            isDark={isDark}
            onSelectHospital={handleSelectHospital}
          />
        </div>
      )}

      {/* ── Profile tab ───────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div style={{ position: 'absolute', inset: 0, bottom: '64px', overflow: 'hidden' }}>
          <ProfileView 
            isDark={isDark} 
            hospitals={hospitals} 
            doctors={doctors}
            onNavigateMap={() => setActiveTab('map')}
            onToggleDark={() => setIsDark(d => !d)}
            demoProps={{
              hospitals,
              onSetAllICUFull: handleSetAllICUFull,
              onSetAllICUAvailable: handleSetAllICUAvailable,
              onSetHospitalICU: handleSetHospitalICU
            }}
          />
        </div>
      )}

      {/* ── Govt Schemes tab ──────────────────────────────────────────────── */}
      {activeTab === 'schemes' && (
        <div style={{ position: 'absolute', inset: 0, bottom: '64px', overflow: 'hidden' }}>
          <GovtSchemes isDark={isDark} />
        </div>
      )}

      {/* ── Medical Records tab ───────────────────────────────────────────── */}
      {activeTab === 'records' && (
        <div style={{ position: 'absolute', inset: 0, bottom: '64px', overflow: 'hidden' }}>
          <MedicalRecordsPage user={user} isDark={isDark} />
        </div>
      )}

          {/* ── Bottom Sheet (overlays map, map tab only) ─────────────────────── */}
      {activeTab === 'map' && (
        <BottomSheet
          // UI Injections
          doctorNotice={
            activeRequest && user?.primaryDoctorId ? (
              <UserDoctorNotice
                doctorName={doctors.find(d => d.id === user.primaryDoctorId)?.name}
                specialty={doctors.find(d => d.id === user.primaryDoctorId)?.specialty}
                recommendation={recommendation}
                isDark={isDark}
              />
            ) : null
          }
          requestTracker={
            activeRequest && isTrackerMinimized ? (
              <RequestTracker
                request={activeRequest}
                ambulances={ambulances}
                isMinimized={true}
                onMinimize={() => setIsTrackerMinimized(true)}
                onMaximize={() => setIsTrackerMinimized(false)}
                onDismiss={handleDismissRequest}
              />
            ) : null
          }
          // Existing BottomPanel props
          selectedHospital={selectedHospital}
          nearestHospital={bestMatch || nearestHospital}
          userLocation={userLocation}
          activeRequest={activeRequest}
          isDark={isDark}
          onCallAmbulance={handleCallAmbulance}
          onRequestICU={handleRequestICU}
          // Matching props
          rankedList={rankedList}
          matchReason={matchReason}
          hasResults={hasResults}
          isProcessing={isProcessing}
          filterStats={filterStats}
          report={report}
          onSelectHospital={setSelectedHospital}
          // Filter state
          insurance={insurance} setInsurance={setInsurance}
          budget={budget} setBudget={setBudget}
          priority={priority} setPriority={setPriority}
        />
      )}

      {/* ── Bottom Navbar (always visible) ───────────────────────────────── */}
      <BottomNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
      />

    </main>
  );
}

export default App;
