/**
 * chatService.js — Doctor ↔ Hospital real-time chat for emergency coordination.
 *
 * Synced via chatStore (BroadcastChannel + localStorage).
 * All message types:
 *   'message'         — normal text
 *   'call_start'      — one party initiated a call
 *   'call_connected'  — call answered
 *   'call_ended'      — call ended
 */

import { chatStore } from './syncService';

let _nextId = Date.now();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Send a chat message.
 * @param {string} from   — sender name (e.g. "Dr. Arjun Mehta")
 * @param {string} role   — 'doctor' | 'hospital'
 * @param {string} text   — message content
 * @param {string} alertId — which emergency this chat belongs to
 */
export function sendMessage(from, role, text, alertId) {
  const msg = {
    id: `msg-${_nextId++}`,
    from,
    role,
    text,
    alertId,
    timestamp: Date.now(),
    type: 'message',
  };
  chatStore.update(msgs => [...(msgs || []), msg]);
  return msg;
}

/**
 * Add a system event (call started / ended).
 * @param {string} type   — 'call_start' | 'call_connected' | 'call_ended'
 * @param {string} from   — caller name
 * @param {string} role   — 'doctor' | 'hospital'
 * @param {string} alertId
 */
export function sendCallEvent(type, from, role, alertId) {
  const event = {
    id: `call-${_nextId++}`,
    from,
    role,
    type,
    alertId,
    timestamp: Date.now(),
    text: null,
  };
  chatStore.update(msgs => [...(msgs || []), event]);
  return event;
}

/**
 * Get all messages for a specific alert.
 * @param {string} alertId
 * @returns {Array}
 */
export function getMessages(alertId) {
  const all = chatStore.get() || [];
  return all.filter(m => m.alertId === alertId);
}

/**
 * Subscribe to chat changes. Returns unsubscribe function.
 * @param {function} listener — called with full messages array on every change
 * @returns {function}
 */
export function subscribeChat(listener) {
  return chatStore.subscribe(listener);
}

/**
 * Clear all chat messages for an alert (call on resolve).
 * @param {string} alertId
 */
export function clearChat(alertId) {
  chatStore.update(msgs => (msgs || []).filter(m => m.alertId !== alertId));
}

/**
 * Auto-reply from hospital side (for demo/simulation).
 * Simulates hospital responding after 1.5 seconds.
 */
export function simulateHospitalReply(alertId, hospitalName) {
  const REPLIES = [
    'Understood. We are preparing ICU bay 3 for the patient.',
    'Noted. Blood type confirmed — cross-matched units on standby.',
    'Cardiac team has been paged. ETA to ER: 2 minutes.',
    'Understood. We have the patient\'s medical history from the system.',
    'ER doors will be open. Please advise on current vitals.',
  ];
  const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  setTimeout(() => {
    sendMessage(hospitalName || 'Receiving Hospital', 'hospital', text, alertId);
  }, 1500);
}

/**
 * Auto-reply from doctor side (for demo/simulation).
 */
export function simulateDoctorReply(alertId, doctorName) {
  const REPLIES = [
    'Patient is on amiodarone 200mg. Avoid lidocaine. Keep crash cart ready.',
    'Watch for hypoglycaemia on arrival. Have dextrose 50% ready.',
    'Patient has latex allergy. Please flag for team.',
    'I will join your ER in 10 minutes. Do not delay treatment.',
    'Previous stent placed in LAD. Notify interventional cardiology.',
  ];
  const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  setTimeout(() => {
    sendMessage(doctorName, 'doctor', text, alertId);
  }, 1500);
}

const chatService = {
  sendMessage,
  sendCallEvent,
  getMessages,
  subscribeChat,
  clearChat,
  simulateHospitalReply,
  simulateDoctorReply,
};

export default chatService;
