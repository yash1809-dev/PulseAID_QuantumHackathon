# 🧪 PulseAID — Prototype Explanation

> This document explains what the PulseAID prototype does, how each feature works, and how the simulated system mirrors a real-world emergency response platform.

---

## 1. What the Prototype Demonstrates

PulseAID's prototype is a **simulation-first system** — it uses controlled mock data and JavaScript-driven logic to produce behaviour indistinguishable from a live system during a demo. Every design decision was made to ensure the prototype's architecture is directly promotable to production without structural changes.

The prototype covers two complete user journeys:

**Journey 1 — Patient in Emergency**
Finding the best hospital, requesting an ambulance, and tracking it in real time.

**Journey 2 — Hospital Administrator**
Updating ICU availability, managing doctors and schemes, and monitoring an incoming patient.

---

## 2. Prototype Scope

### What IS Simulated (intentionally)
- ICU bed availability changes (real-time updates every 5 seconds)
- Ambulance GPS movement (follows actual Mapbox road routes)
- Hospital data updates from the admin portal
- ETA and distance calculations
- Smart hospital matching decisions
- Insurance and cost-based filtering

### What IS Real
- Mapbox map rendering
- Mapbox Directions API (actual road routes)
- Browser Geolocation API (real user coordinates)
- React state management
- Filter and matching logic

### What is Deliberately Out of Scope
- Real hospital or government API integration
- Aadhaar / ABHA identity verification
- Document upload and encryption
- Live WebSocket connections
- Payment or booking systems

---

## 3. Phase 1 Prototype — Core Tracking System

Phase 1 established the foundational layer: a working map dashboard with live hospital markers, ambulance simulation, and basic request flow.

```
PHASE 1 FEATURE SET

┌─────────────────────────────────────┐
│  Map Dashboard                      │
│  ├── Hospital markers (color-coded) │
│  ├── Ambulance marker (moving)      │
│  └── Route visualization            │
│                                     │
│  ICU Tracking                       │
│  ├── Live bed count per hospital    │
│  ├── Green = available              │
│  └── Red = full                     │
│                                     │
│  Ambulance Request                  │
│  ├── Nearest unit auto-selected     │
│  ├── Route computed via Mapbox      │
│  └── Animated movement to user      │
│                                     │
│  ETA System                         │
│  ├── Distance calculated            │
│  └── "Arriving in X min" display    │
└─────────────────────────────────────┘
```

### How Ambulance Movement Works

```
User clicks "Request Ambulance"
           │
           ▼
    Find nearest available
    ambulance (distance formula)
           │
           ▼
    Call Mapbox Directions API
    → returns GeoJSON route
    → array of [lng, lat] points
           │
           ▼
    Draw route line on map
           │
           ▼
    setInterval (every 1500ms)
    ┌──────────────────────────┐
    │  index++                 │
    │  marker → route[index]   │
    │  recalculate distance    │
    │  update ETA label        │
    └──────────────────────────┘
           │
           ▼
    index === route.length
           │
           ▼
    status = "ARRIVED"
    Stop interval
    Show arrival notification
```

The ambulance does not jump randomly — it follows the exact road path returned by Mapbox, making the simulation realistic to observers.

---

## 4. Phase 2 Prototype — Intelligent Health Ecosystem

Phase 2 transformed PulseAID from a tracking tool into a decision-support ecosystem. The core additions were: smart hospital matching, dual-role portals, doctor registry, and insurance-aware routing.

### 4a. Dual-Role Login System

```
LOGIN SCREEN
┌─────────────────────────────────────┐
│  PulseAID                           │
│                                     │
│  Email: [________________]          │
│                                     │
│  I am:  ○ Patient  ○ Hospital Admin │
│                                     │
│         [Continue]                  │
└─────────────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
 Patient       Hospital
 Portal        Portal
 (user         (admin
  dashboard)    dashboard)
```

Session is stored in `localStorage` so the user does not need to log in again during the demo. A `DEV_MODE` flag allows instant role switching without credentials for development and judging scenarios.

### 4b. Smart Matching Engine

This is PulseAID's primary differentiator from basic tracking apps. The engine does not just show the nearest hospital — it finds the *right* hospital for that specific patient.

```
MATCHING ENGINE PIPELINE

Input: user preferences + hospital database
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAGE 1 — HARD FILTERS (eliminates ineligible)
  ├── ICU beds available? (must be > 0)
  ├── Insurance scheme accepted?
  └── Cost level within budget?

          ↓ only eligible hospitals proceed

STAGE 2 — SOFT RANKING (scores remaining)
  ├── Proximity score    (1 / distance)
  ├── ICU abundance      (available / total)
  ├── Doctor availability bonus
  └── Priority weight    (user's chosen factor)

          ↓ sorted by combined score

STAGE 3 — OUTPUT
  ├── Best Match (highlighted on map)
  ├── Ranked list in bottom sheet
  └── Explanation text:
      "Best match based on your PM-JAY
       insurance and Dr. Sharma's Friday
       availability at this hospital."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Smart Matching Scenario Walkthrough

```
SCENARIO: User has PM-JAY insurance, low budget, needs cardiology

User Profile:
  insurance = "PM-JAY"
  budget    = "low"
  priority  = "best doctor"

Hospital Database:
  ┌──────────────┬──────────┬───────┬──────────────┐
  │ Hospital     │ PM-JAY?  │ Cost  │ Cardiologist? │
  ├──────────────┼──────────┼───────┼──────────────┤
  │ City General │ YES  ✓   │ low ✓ │ Fri only ✓   │
  │ Ruby Hall    │ NO   ✗   │ high  │ Daily        │
  │ Jehangir     │ YES  ✓   │ high ✗│ Daily        │
  │ Govt Civil   │ YES  ✓   │ low ✓ │ NO ✗         │
  └──────────────┴──────────┴───────┴──────────────┘

Today: Friday

Result:
  → Ruby Hall: FILTERED (no PM-JAY)
  → Jehangir:  FILTERED (too expensive)
  → Govt Civil: FILTERED (no cardiologist)
  → City General: BEST MATCH ✓

Display:
  "City General Hospital
   Dr. Sharma available today (Fri)
   PM-JAY accepted | Low cost
   ICU: 5/20 beds | 2.3 km | ~8 min"
```

### 4c. Doctor Registry

```
DOCTOR SEARCH FLOW

Search bar: "Cardiol..."
     │
     ▼
doctorService.search("cardiol")
     │
     ▼
Filter by name OR specialty
     │
     ▼
┌─────────────────────────────────┐
│ Dr. Priya Sharma                │
│ Specialty: Cardiology           │
│ Available: City General (Fri)   │
│            Jehangir (Tue/Thu)   │
└─────────────────────────────────┘
     │ click
     ▼
DOCTOR PROFILE MODAL
┌─────────────────────────────────┐
│ Dr. Priya Sharma                │
│ MBBS, MD (Cardiology)           │
│                                 │
│ Schedule:                       │
│  Mon  ─  Tue ✓  Wed ─           │
│  Thu ✓   Fri ✓  Sat ─           │
│                                 │
│ Hospitals:                      │
│  • City General   (Mon/Wed/Fri) │
│  • Jehangir Hosp  (Tue/Thu/Sat) │
│                                 │
│ [Find Available Hospital Today] │
└─────────────────────────────────┘
```

### 4d. Hospital Admin Portal

```
HOSPITAL ADMIN DASHBOARD

┌──────────────────────────────────────────┐
│  City General Hospital — Admin Panel     │
├──────────────────────────────────────────┤
│                                          │
│  ICU Beds                                │
│  Available: [5] ─────── Total: 20       │
│             [+ Add] [- Remove]           │
│                                          │
│  Equipment                               │
│  Ventilators: 8  Oxygen: Full            │
│                                          │
│  Doctors on Duty Today                   │
│  ● Dr. Sharma     Cardiology  [Active]   │
│  ○ Dr. Mehta      Neurology   [Off]      │
│                                          │
│  Schemes Accepted                        │
│  ☑ PM-JAY  ☑ CGHS  ☐ EHS  ☑ Star Health │
│                                          │
│  Incoming Patient                        │
│  ┌─────────────────────────────────┐    │
│  │ 🟡 Patient inbound              │    │
│  │    ETA: 6 minutes               │    │
│  │    Mini-map with live location  │    │
│  │    [Prepare ICU Bed]            │    │
│  └─────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

Any update made by the hospital admin is immediately reflected on the user-facing map — if beds drop to zero, that hospital's marker turns red and it is removed from the matching engine results.

---

## 5. UI Component Breakdown

### Bottom Sheet (Draggable)

The bottom sheet is the primary control interface. It sits above the map and can be dragged between three states:

```
STATE 1: Collapsed (peek)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ ▬▬▬ (drag handle)           │
│ ● Best Match: City General  │
│ 5 beds | 2.3km | ~8min [→] │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE 2: Half expanded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Filters: Insurance | Cost   │
│ [Hospitals] [Doctors]       │
│                             │
│ 🏥 City General   ████░ [→]│
│ 🏥 Ruby Hall      ███░░ [→]│
│ 🏥 Jehangir       ░░░░░ [✗]│
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE 3: Full expanded (tabs active)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ [Hospitals] [Doctors]       │
│                             │
│ Doctor search: [________]   │
│                             │
│ Dr. Sharma  Cardiology [→] │
│ Dr. Mehta   Neurology  [→] │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Status Panel (ETA Tracker)

When an ambulance is dispatched, a live status panel appears at the top of the screen:

```
┌───────────────────────────────────────┐
│ 🚑  Ambulance on the way              │
│     ████████████░░░░░  2.1 km away   │
│     Arriving in approximately 5 min   │
│     Destination: City General         │
└───────────────────────────────────────┘
```

This panel updates every tick of the simulation engine.

---

## 6. ICU Availability Simulation

The prototype simulates realistic fluctuation in ICU bed counts across all hospitals. This is not purely random — it respects realistic constraints.

```
ICU UPDATE LOGIC (every 5 seconds)

for each hospital in database:
  │
  ├── delta = random integer between -1 and +1
  │
  ├── newCount = currentCount + delta
  │
  ├── CLAMP: newCount = max(0, min(newCount, totalBeds))
  │   (never goes negative, never exceeds total)
  │
  └── Update marker color:
        newCount  > 5    →  green  (available)
        newCount  1–5   →  amber  (limited)
        newCount === 0   →  red    (full)

Side effects:
  → Matching engine re-runs with updated data
  → UI re-renders affected markers
  → Bottom sheet list re-orders if ranking changes
```

---

## 7. End-to-End Demo Script

This is the recommended walkthrough order for a live demo to judges:

```
STEP 1  Open the app
        → Map loads with Pune hospitals visible
        → Ambulance units shown as blue markers

STEP 2  Show ICU indicators
        → Point to green/red markers
        → Explain color logic

STEP 3  Set user preferences (bottom sheet)
        → Select: PM-JAY insurance, low budget
        → Watch: hospitals re-rank
        → Show: only compatible hospitals remain

STEP 4  Point out Best Match card
        → Explain the matching logic
        → Show doctor availability in result

STEP 5  Click "Request Ambulance"
        → Nearest unit highlighted
        → Route drawn on map
        → Ambulance begins moving

STEP 6  Watch live tracking
        → Distance label decreasing
        → ETA countdown ticking
        → Ambulance following road path

STEP 7  Switch to Hospital Portal
        → Toggle role to "hospital"
        → Show incoming patient ETA
        → Update ICU bed count
        → Show it reflected on user map

STEP 8  Show Doctor Registry
        → Search "Cardiology"
        → Open Dr. Sharma's profile
        → Show cross-hospital schedule
        → Explain smart recommendation

STEP 9  Summarise
        → "This is a system that tells you not just
           which hospital is nearest, but which one is
           right for you — based on your insurance,
           your budget, and your doctor."
```

---

## 8. Data Replacement Readiness

Every mock data source follows real-world API response schemas. The table below shows what each mock file is designed to replace:

| Mock File | Real Data Source | Integration Path |
|---|---|---|
| `hospitals.json` | Hospital EHR systems / NHA Health Facility Registry | REST API swap in `hospitalService.js` |
| `ambulances.json` | Ambulance dispatch GPS stream | WebSocket connection in `ambulanceService.js` |
| `doctors.json` | Healthcare Professional Registry (HPR) | ABDM API call in `doctorService.js` |
| `schemes.json` | PMJAY scheme database | Government API in `schemeService.js` |
| `localStorage` auth | Firebase Auth / ABHA login | Replace `authService.js` implementation |
| `setInterval` simulation | Real-time GPS coordinates | WebSocket push replaces polling |

---

## 9. Known Prototype Limitations

These are intentional scope decisions, not oversights:

**No real-time sync between tabs** — if two browser windows are open, they do not share state. In production, WebSockets handle this.

**ICU changes are random** — actual hospitals would push updates from their internal systems. The simulation demonstrates the concept faithfully.

**Ambulance movement is approximate** — the route follows real roads, but the speed is fixed. Real systems use actual vehicle telemetry.

**No data persistence** — refreshing the page resets all state. Production uses a database.

**Doctor schedule is static** — in production, this syncs with the hospital's shift management system.

---

## 10. Why This Architecture Was Chosen

Every decision in the prototype was made with one principle: *build it real enough to upgrade, not just demo.*

The four-layer architecture (UI → Service → Logic → Data) means a hospital could plug in their live API tomorrow and the matching engine, the map, and the user interface would continue working without modification. The mock data uses production-grade schemas. The service functions have the same signatures they would have with a real backend. The simulation engine uses the same timing and state management that WebSocket handlers would use.

This is not a demo built to impress and then be discarded. It is a foundation.

---

*PulseAID Prototype — Built for Phase 2 Hackathon Review*
