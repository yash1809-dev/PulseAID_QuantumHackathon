# 🏗️ PulseAID — System Design & Architecture

---

## 1. High-Level Architecture

PulseAID follows a four-layer architecture that cleanly separates concerns and ensures every layer is independently replaceable in production.

```
┌─────────────────────────────────────────────────────────┐
│                      UI LAYER                           │
│         React Components + Mapbox Visualization         │
│  MapView │ BottomSheet │ HospitalCard │ DoctorModal      │
└────────────────────────┬────────────────────────────────┘
                         │  calls
┌────────────────────────▼────────────────────────────────┐
│                   SERVICE LAYER                         │
│              API Abstraction (mock → real)              │
│  hospitalService │ ambulanceService │ doctorService      │
└────────────────────────┬────────────────────────────────┘
                         │  feeds
┌────────────────────────▼────────────────────────────────┐
│                    LOGIC LAYER                          │
│          Matching Engine + Simulation Engine            │
│  filterHospitals() │ rankResults() │ moveAmbulance()    │
└────────────────────────┬────────────────────────────────┘
                         │  reads from
┌────────────────────────▼────────────────────────────────┐
│                    DATA LAYER                           │
│              Mock JSON (production-ready schema)        │
│  hospitals.json │ ambulances.json │ doctors.json        │
│                                                         │
│              ← Replaceable with real APIs →            │
└─────────────────────────────────────────────────────────┘
```

The key principle: the UI never touches raw data directly. Every data request goes through a service function, so swapping mock JSON for a real backend requires changing only the service layer — nothing in the UI or logic layers needs modification.

---

## 2. Component Architecture

```
App
├── AuthWrapper
│   ├── LoginPage (role selection)
│   └── MainApp
│       ├── UserDashboard
│       │   ├── MapView (Mapbox)
│       │   │   ├── HospitalMarkers
│       │   │   ├── AmbulanceMarker (animated)
│       │   │   └── RouteLayer
│       │   ├── BottomSheet (draggable)
│       │   │   ├── BestMatchCard
│       │   │   ├── HospitalList
│       │   │   │   └── HospitalCard (×n)
│       │   │   ├── FilterPanel
│       │   │   └── DoctorSearch
│       │   │       └── DoctorModal
│       │   └── StatusPanel (ETA tracker)
│       │
│       └── HospitalDashboard
│           ├── ICUBedManager
│           ├── DoctorRoster
│           ├── SchemeToggle
│           └── IncomingPatientView
```

---

## 3. Data Flow Diagrams

### 3a. User Emergency Request Flow

```
User Opens App
      │
      ▼
Geolocation API
(or fallback: Pune demo coords)
      │
      ▼
hospitalService.getHospitals()
ambulanceService.getAmbulances()
      │
      ▼
Map renders all markers
      │
      ▼
User selects preferences
  ┌───┴────────────────┐
  │ insurance type     │
  │ budget level       │
  │ priority           │
  └───┬────────────────┘
      │
      ▼
matchingEngine.filterHospitals()
  ┌───┴──────────────────────────┐
  │ Filter: ICU beds > 0         │
  │ Filter: insurance match      │
  │ Filter: cost compatibility   │
  │ Rank: distance               │
  │ Rank: user priority          │
  │ Rank: doctor availability    │
  └───┬──────────────────────────┘
      │
      ▼
Best Match displayed on map
(highlighted marker + bottom sheet card)
      │
      ▼
User clicks "Request Ambulance"
      │
      ▼
ambulanceService.assignNearest()
      │
      ▼
Mapbox Directions API
(hospital → user route)
      │
      ▼
simulationEngine.startTracking()
  ┌───┴──────────────────────────┐
  │ every 1–2 seconds:           │
  │   move ambulance along route │
  │   recalculate distance       │
  │   update ETA display         │
  └───┬──────────────────────────┘
      │
      ▼
Status: "Ambulance Arrived"
Hospital portal shows: "Patient Incoming"
```

### 3b. Hospital Portal Update Flow

```
Hospital Admin logs in
      │
      ▼
Role: "hospital" loaded from localStorage
      │
      ▼
HospitalDashboard renders
      │
      ├──► Update ICU Beds
      │         │
      │         ▼
      │    hospitalService.updateBeds(id, count)
      │    → updates in-memory state
      │    → reflected on user-facing map in real time
      │
      ├──► Toggle Doctor Availability
      │         │
      │         ▼
      │    doctorService.setAvailability(doctorId, bool)
      │    → matching engine re-evaluates
      │
      ├──► Set Accepted Schemes
      │         │
      │         ▼
      │    hospitalService.updateSchemes(id, schemes[])
      │
      └──► View Incoming Patient
                │
                ▼
           Reads from ambulanceService.getActiveRequests()
           Shows: patient location on mini-map + ETA
```

---

## 4. Smart Matching Engine

The matching engine is the core intelligence of PulseAID. It is a rule-based decision system that mirrors how a knowledgeable medical coordinator would route a patient.

```
Input
  user.insurance = "PM-JAY"
  user.budget    = "low"
  user.priority  = "nearest"
  user.location  = { lat, lng }

Step 1: Hard Filters (eliminates ineligible hospitals)
  ┌──────────────────────────────────────┐
  │  hospital.icuBedsAvailable > 0  ✓/✗  │
  │  hospital.insuranceAccepted          │
  │    .includes(user.insurance)    ✓/✗  │
  │  hospital.costLevel ≤ user.budget ✓/✗│
  └──────────────────────────────────────┘

Step 2: Soft Ranking (scores remaining hospitals)
  ┌──────────────────────────────────────┐
  │  score += 1/distance (closer = more) │
  │  score += doctorAvailability bonus   │
  │  score += ICU availability ratio     │
  └──────────────────────────────────────┘

Step 3: Return sorted list
  [Hospital A: score 0.92 ← BEST MATCH]
  [Hospital B: score 0.71]
  [Hospital C: score 0.45]

Output displayed as:
  "Best Match: City Hospital
   Dr. Sharma available | PM-JAY accepted
   ICU: 5/20 beds | 2.3 km away | ~8 min"
```

### Smart Matching Scenario Example

```
User profile:
  insurance = "PM-JAY"

Doctor: Dr. Sharma
  → works at Hospital A (Mon/Wed/Fri) — accepts PM-JAY
  → works at Hospital B (Tue/Thu/Sat) — private only

Today: Friday

Matching engine detects:
  → Dr. Sharma available at Hospital A today
  → Hospital A accepts PM-JAY
  → Recommendation generated:

"Visit Dr. Sharma at City Hospital today.
 Your PM-JAY card is accepted here for cashless treatment."
```

---

## 5. Simulation Engine Design

The simulation engine creates the real-time experience without requiring live GPS or WebSocket infrastructure.

```
simulationEngine.js

State:
  ambulance.position = { lat, lng }   // current position
  ambulance.route    = [ ...points ]  // full Mapbox route
  ambulance.index    = 0              // current step
  ambulance.status   = "dispatched"

Tick (every 1500ms):
  ┌────────────────────────────────────┐
  │  1. index++                        │
  │  2. position = route[index]        │
  │  3. marker.setLngLat(position)     │
  │  4. distance = haversine(          │
  │       position, userLocation)      │
  │  5. eta = distance / speed         │
  │  6. update UI: "Arriving in X min" │
  │  7. if index === route.length:     │
  │       status = "arrived"           │
  │       stop interval               │
  └────────────────────────────────────┘

ICU Update (every 5000ms):
  for each hospital:
    delta = random(-1, +1)
    newCount = clamp(current + delta, 0, total)
    update marker color:
      newCount > 0  → green
      newCount === 0 → red
```

---

## 6. Role-Based Access Control

PulseAID implements a lightweight simulated RBAC system. In production, this is replaced by Firebase Auth or JWT.

```
Login Screen
     │
     ├── email contains "hospital"
     │         │
     │         ▼
     │   role = "hospital"
     │   redirect → HospitalDashboard
     │
     └── all other emails
               │
               ▼
         role = "user"
         redirect → UserDashboard

localStorage.setItem("role", role)
localStorage.setItem("entityId", id)

On app load:
  const role = localStorage.getItem("role")
  if (!role) → redirect to Login
  if (role === "hospital") → HospitalDashboard
  if (role === "user")     → UserDashboard
```

---

## 7. Data Schema (Production-Ready)

All mock data is structured to match what real hospital or government APIs would return, ensuring zero schema changes are needed when switching to live data.

### Hospital Object
```json
{
  "id": "h_001",
  "name": "City General Hospital",
  "location": { "lat": 18.5204, "lng": 73.8567 },
  "icuBedsAvailable": 5,
  "icuBedsTotal": 20,
  "costLevel": "medium",
  "insuranceAccepted": ["PM-JAY", "CGHS", "EHS", "PrivateA"],
  "specialties": ["Cardiology", "Neurology", "Trauma"],
  "doctors": ["doc_001", "doc_003"],
  "phone": "+91-20-2345-6789",
  "lastUpdated": "2026-04-18T10:30:00Z"
}
```

### Ambulance Object
```json
{
  "id": "amb_01",
  "location": { "lat": 18.5240, "lng": 73.8510 },
  "status": "available",
  "assignedTo": null,
  "speed": 40
}
```

### Doctor Object
```json
{
  "id": "doc_001",
  "name": "Dr. Priya Sharma",
  "specialty": "Cardiology",
  "hospitals": [
    { "hospitalId": "h_001", "days": ["Mon", "Wed", "Fri"] },
    { "hospitalId": "h_003", "days": ["Tue", "Thu", "Sat"] }
  ],
  "available": true
}
```

### User Profile Object
```json
{
  "id": "usr_001",
  "name": "Rahul Mehta",
  "insurance": "PM-JAY",
  "budget": "low",
  "priority": "nearest",
  "location": { "lat": 18.5300, "lng": 73.8600 }
}
```

---

## 8. Service Layer Contract

Each service is a thin adapter. The function signatures remain constant; only the implementation changes from mock to real.

```javascript
// hospitalService.js

export const getHospitals = async () => {
  return hospitalsData;                   // mock
  // return fetch('/api/hospitals').then(r => r.json())  // real
};

export const updateBeds = async (id, count) => {
  hospitalsData.find(h => h.id === id).icuBedsAvailable = count;
  // fetch(`/api/hospital/${id}`, { method: 'PUT', body: { icuBedsAvailable: count } })
};

// ambulanceService.js

export const getAmbulances = async () => { ... };
export const assignNearest = async (userLocation) => { ... };

// doctorService.js

export const searchDoctors = async (query) => { ... };
export const getDoctorById = async (id) => { ... };

// authService.js

export const login = (email) => {
  const role = email.includes("hospital") ? "hospital" : "user";
  localStorage.setItem("role", role);
  return role;
};
export const getRole = () => localStorage.getItem("role");
export const logout = () => localStorage.clear();
```

---

## 9. UI Layout Specification

```
┌──────────────────────────────────────────────────────┐
│  SENTINEL TOPBAR (app name + role indicator)         │
├──────────────────────────────────────────────────────┤
│                                                      │
│                                                      │
│              MAPBOX MAP (full screen)                │
│                                                      │
│    🏥 (green)   🏥 (red)   🚑 (animated)            │
│                                                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│  DRAGGABLE BOTTOM SHEET                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ ● Best Match: City Hospital  [Request]       │   │  ← collapsed
│  │   5 beds | PM-JAY | 2.3 km | ~8 min ETA      │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ─── drag up ───                                     │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Filters: [Insurance ▾] [Cost ▾] [Distance ▾] │   │  ← expanded
│  │                                              │   │
│  │ 🏥 City General    ●●●●○  5/20  2.3km  [→]  │   │
│  │ 🏥 Ruby Hospital   ●●○○○  3/15  4.1km  [→]  │   │
│  │ 🏥 Jehangir        ○○○○○  0/10  5.7km  [✗]  │   │
│  │                                              │   │
│  │ [Hospitals]  [Doctors]                       │   │
│  └──────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────┤
│  BOTTOM NAV:   🗺️ Map   👨‍⚕️ Doctors   👤 Profile    │
└──────────────────────────────────────────────────────┘
```

---

## 10. Production Migration Path

When this prototype moves to production, only the following changes are needed:

| Current (Mock) | Production Replacement |
|---|---|
| `hospitals.json` local file | Hospital Management API / FHIR endpoints |
| `ambulances.json` local file | Real-time GPS WebSocket stream |
| `localStorage` auth | Firebase Auth / JWT + ABDM ABHA |
| `setInterval` simulation | WebSocket server push |
| Manual ICU updates | Hospital EHR system integration |
| Fake route animation | Real vehicle GPS coordinates |
| Mock insurance data | PMJAY / insurance provider APIs |

The frontend UI, service layer contracts, and matching engine logic require **zero changes** in this migration.
