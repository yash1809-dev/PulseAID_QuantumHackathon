/**
 * vitalsService.js — Simulated live vitals monitoring.
 *
 * In production, this would stream from bedside monitors via WebSocket.
 * Here we jitter mock baseline values every 3 seconds to simulate live data.
 *
 * REPLACEABLE: swap startVitalsStream with a real WebSocket connection.
 */

import baselineVitals from '../data/patientVitals.json';

// ── Active stream registry ────────────────────────────────────────────────────
const _streams = {}; // patientId → intervalId

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Add random jitter to a numeric value.
 * @param {number} base   - Baseline reading
 * @param {number} range  - Max deviation in either direction
 * @param {number} min    - Hard floor
 * @param {number} max    - Hard ceiling
 */
function jitter(base, range, min, max) {
  const delta = (Math.random() * 2 - 1) * range;
  return Math.round(Math.max(min, Math.min(max, base + delta)));
}

/**
 * Generate a jittered vitals snapshot from the patient's baseline.
 */
function generateVitals(patientId) {
  const b = baselineVitals[patientId];
  if (!b) {
    // Fallback generic vitals
    return {
      heartRate: jitter(78, 8, 45, 160),
      spo2:      jitter(97, 2, 80, 100),
      pulse:     jitter(76, 8, 45, 160),
      systolic:  jitter(120, 10, 80, 200),
      diastolic: jitter(80, 8, 50, 130),
      temperature: 98.6,
      respiratoryRate: jitter(16, 2, 10, 30),
    };
  }

  return {
    heartRate:       jitter(b.heartRate,       10, 40, 160),
    spo2:            jitter(b.spo2,             2,  80, 100),
    pulse:           jitter(b.pulse,            10, 40, 160),
    systolic:        jitter(b.systolic,         12, 80, 210),
    diastolic:       jitter(b.diastolic,        8,  50, 130),
    temperature:     parseFloat((b.temperature + (Math.random() * 0.6 - 0.3)).toFixed(1)),
    respiratoryRate: jitter(b.respiratoryRate,  2,  10,  35),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get a single vitals snapshot (no streaming).
 */
export function getVitals(patientId) {
  return generateVitals(patientId);
}

/**
 * Start a simulated vitals stream.
 * @param {string}   patientId  - Patient whose vitals to simulate
 * @param {function} callback   - Called immediately + every intervalMs with vitals snapshot
 * @param {number}   intervalMs - Update frequency, default 3000 ms
 */
export function startVitalsStream(patientId, callback, intervalMs = 3000) {
  // Clear any existing stream for this patient
  stopVitalsStream(patientId);

  // Fire immediately
  callback(generateVitals(patientId));

  // Then repeat
  _streams[patientId] = setInterval(() => {
    callback(generateVitals(patientId));
  }, intervalMs);
}

/**
 * Stop a running vitals stream.
 */
export function stopVitalsStream(patientId) {
  if (_streams[patientId]) {
    clearInterval(_streams[patientId]);
    delete _streams[patientId];
  }
}

/**
 * Stop all active streams (cleanup).
 */
export function stopAllStreams() {
  Object.keys(_streams).forEach(stopVitalsStream);
}

/**
 * Get severity classification for a vitals reading.
 * Returns 'normal' | 'warning' | 'critical'
 */
export function getVitalsSeverity(vitals) {
  const { heartRate, spo2, systolic } = vitals;
  if (heartRate > 130 || heartRate < 50 || spo2 < 90 || systolic > 180 || systolic < 85) {
    return 'critical';
  }
  if (heartRate > 100 || heartRate < 60 || spo2 < 94 || systolic > 140) {
    return 'warning';
  }
  return 'normal';
}

const vitalsService = {
  getVitals,
  startVitalsStream,
  stopVitalsStream,
  stopAllStreams,
  getVitalsSeverity,
};

export default vitalsService;
