/**
 * notificationService.js — Simulated doctor notification system.
 *
 * SYNCED: All alerts are persisted to localStorage and broadcast
 * across tabs/devices via syncService. Open the doctor dashboard
 * on a different tab or laptop — alerts appear in real time.
 *
 * In production, replace with push-notification / SMS / pager API.
 */

import { alertsStore } from './syncService';

// ── Local listener registry (for reactive React updates) ─────────────────────
const _listeners = new Set();

function _notifyLocal() {
  const alerts = alertsStore.get();
  _listeners.forEach(fn => fn(alerts));
}

// Subscribe to remote changes (other tabs / BroadcastChannel)
alertsStore.subscribe((alerts) => {
  _listeners.forEach(fn => fn(alerts));
});

// ── ID generator (simple, collision-safe for demo) ───────────────────────────
let _nextId = Date.now();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fire an alert to a doctor about an incoming patient emergency.
 * @param {string} doctorId   - Target doctor ID
 * @param {object} patient    - Patient user object (from users.js)
 * @param {object} hospital   - Admitting hospital object
 * @param {string} eta        - Formatted ETA string (e.g. "8 min")
 * @param {object} ambulance  - Assigned ambulance object
 * @returns {object} alertObject
 */
export function notifyDoctor(doctorId, patient, hospital, eta, ambulance, snapshotId = null) {
  const alert = {
    id: `alert-${_nextId++}`,
    doctorId,
    patientId: patient.id,
    patientName: patient.name,
    emergencyType: patient.emergencyType || 'Emergency Admission',
    hospitalName: hospital.name,
    hospitalId: hospital.id,
    eta,
    ambulanceId: ambulance?.id,
    medicalConditions: patient.medicalConditions || '',
    bloodGroup: patient.bloodGroup || 'Unknown',
    age: patient.age ?? '—',
    timestamp: Date.now(),
    status: 'active', // 'active' | 'reviewing' | 'resolved'
    doctorJoined: false,
    recommendation: null,
    snapshotId,   // UUID of emergency_snapshot row; null if patient has no records
  };

  // Write to synced store (replaces any previous alert for same doctor+patient)
  alertsStore.update((alerts) => {
    const filtered = (alerts || []).filter(
      a => !(a.doctorId === doctorId && a.patientId === patient.id)
    );
    return [alert, ...filtered];
  });

  _notifyLocal();
  return alert;
}

/**
 * Get all active alerts for a specific doctor.
 */
export function getAlertsForDoctor(doctorId) {
  return (alertsStore.get() || []).filter(
    a => a.doctorId === doctorId && a.status !== 'resolved'
  );
}

/**
 * Get the latest active alert for a doctor (used for the Emergency tab).
 */
export function getLatestAlert(doctorId) {
  return (alertsStore.get() || []).find(
    a => a.doctorId === doctorId && a.status !== 'resolved'
  ) || null;
}

/**
 * Mark doctor as "reviewing" (joined consultation).
 */
export function markDoctorJoined(alertId) {
  alertsStore.update((alerts) =>
    (alerts || []).map(a =>
      a.id === alertId ? { ...a, doctorJoined: true, status: 'reviewing' } : a
    )
  );
  _notifyLocal();
}

/**
 * Attach a recommendation to an alert.
 */
export function attachRecommendation(alertId, text, doctorName) {
  alertsStore.update((alerts) =>
    (alerts || []).map(a =>
      a.id === alertId
        ? {
            ...a,
            recommendation: { text, doctorName, timestamp: Date.now() },
            status: 'reviewing',
          }
        : a
    )
  );
  _notifyLocal();
}

/**
 * Resolve / dismiss an alert.
 */
export function resolveAlert(alertId) {
  alertsStore.update((alerts) =>
    (alerts || []).map(a =>
      a.id === alertId ? { ...a, status: 'resolved' } : a
    )
  );
  _notifyLocal();
}

/**
 * Subscribe to alert changes. Returns unsubscribe function.
 * @param {function} listener - Called with alerts[] on every change
 */
export function subscribeAlerts(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

const notificationService = {
  notifyDoctor,
  getAlertsForDoctor,
  getLatestAlert,
  markDoctorJoined,
  attachRecommendation,
  resolveAlert,
  subscribeAlerts,
};

export default notificationService;
