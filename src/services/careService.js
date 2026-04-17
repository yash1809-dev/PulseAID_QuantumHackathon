/**
 * careService.js — Orchestrator for the Continuity of Care emergency flow.
 *
 * SYNCED: Recommendations are persisted to localStorage and broadcast
 * across tabs/devices via syncService. The hospital and user dashboards
 * on other tabs/laptops will see recommendations appear in real time.
 *
 * Called by App.jsx after ambulance dispatch. Coordinates:
 *   1. Doctor notification (via notificationService)
 *   2. Synced recommendation store (via syncService)
 *
 * REPLACEABLE: all calls here can be swapped with real API endpoints.
 */

import { notifyDoctor, attachRecommendation, getLatestAlert } from './notificationService';
import { recommendationsStore } from './syncService';

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Trigger the full emergency care flow when a patient dispatches an ambulance.
 *
 * @param {object} user       - Logged-in patient user object
 * @param {object} hospital   - Admitting hospital
 * @param {object} ambulance  - Assigned ambulance
 * @param {string} eta        - Formatted ETA string
 * @returns {object|null} alert if doctor was found
 */
export function triggerEmergencyFlow(user, hospital, ambulance, eta, snapshotId = null) {
  if (!user?.primaryDoctorId) return null;

  try {
    const alert = notifyDoctor(
      user.primaryDoctorId,
      user,
      hospital,
      eta,
      ambulance,
      snapshotId   // ← passed to alert object for doctor/hospital UIs
    );
    return alert;
  } catch (err) {
    console.warn('[careService] triggerEmergencyFlow failed:', err);
    return null;
  }
}

/**
 * Doctor submits a treatment recommendation.
 *
 * @param {string} alertId    - The active alert ID
 * @param {string} text       - Recommendation text
 * @param {string} doctorName - Doctor's display name
 * @param {string} patientId  - Patient to store result against
 */
export function sendRecommendation(alertId, text, doctorName, patientId) {
  // 1. Update the alert in notificationService (synced via alertsStore)
  attachRecommendation(alertId, text, doctorName);

  // 2. Store recommendation keyed by patientId (synced via recommendationsStore)
  recommendationsStore.update((recs) => ({
    ...(recs || {}),
    [patientId]: {
      text,
      doctorName,
      timestamp: Date.now(),
      alertId,
    },
  }));
}

/**
 * Get the latest recommendation for a patient (for Hospital + User views).
 * @param {string} patientId
 * @returns {{ text, doctorName, timestamp } | null}
 */
export function getRecommendation(patientId) {
  const recs = recommendationsStore.get() || {};
  return recs[patientId] || null;
}

/**
 * Get the alert for a patient's primary doctor (convenience lookup).
 * @param {string} primaryDoctorId
 * @returns {object|null} alert
 */
export function getEmergencyAlert(primaryDoctorId) {
  return getLatestAlert(primaryDoctorId);
}

/**
 * Clear all care state for a patient (call on dismiss/resolve).
 * @param {string} patientId
 */
export function clearPatientCare(patientId) {
  recommendationsStore.update((recs) => {
    const next = { ...(recs || {}) };
    delete next[patientId];
    return next;
  });
}

const careService = {
  triggerEmergencyFlow,
  sendRecommendation,
  getRecommendation,
  getEmergencyAlert,
  clearPatientCare,
};

export default careService;
