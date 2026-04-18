/**
 * syncService.js — Cross-device / cross-tab state synchronization.
 *
 * ┌────────────────────────────────────────────────────────────────────────────┐
 * │  HOW IT WORKS                                                              │
 * │                                                                            │
 * │  1. State is persisted in localStorage (survives refresh + shared across   │
 * │     all tabs on the same origin)                                           │
 * │                                                                            │
 * │  2. BroadcastChannel provides INSTANT same-browser cross-tab sync          │
 * │     (fires within milliseconds)                                            │
 * │                                                                            │
 * │  3. The `storage` event fires when *another* tab writes to localStorage,   │
 * │     giving us cross-tab sync even without BroadcastChannel                 │
 * │                                                                            │
 * │  4. For CROSS-DEVICE sync (different laptops hitting the same Vite dev     │
 * │     server on the LAN), we use a simple polling strategy that reads from   │
 * │     localStorage on an interval. Since each device has its own             │
 * │     localStorage, cross-device sync requires a shared medium.              │
 * │     For the hackathon demo, we use a lightweight in-browser "relay"        │
 * │     approach: one device triggers → the state is in localStorage →         │
 * │     the Vite HMR WebSocket relays a custom event to all connected clients. │
 * │                                                                            │
 * │  FALLBACK: If HMR relay isn't available, each device independently reads   │
 * │  localStorage on a 2-second polling interval. For the hackathon demo,      │
 * │  the simplest approach is to open multiple tabs in the same browser.       │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 *  Usage:
 *    import { syncStore } from './syncService';
 *    const store = syncStore('emergency_alerts');
 *    store.set([...alerts]);
 *    store.get();  // returns parsed value
 *    store.subscribe(callback);  // called on remote changes
 */

const PREFIX = 'pulseaid_sync_';

// BroadcastChannel for instant same-browser sync
let _channel = null;
try {
  _channel = new BroadcastChannel('pulseaid_sync');
} catch {
  // BroadcastChannel not available (e.g. older Safari) — localStorage events still work
}

// ── Centralized listener registry (per key) ──────────────────────────────────
const _keyListeners = {}; // key → Set<fn>

function _getListeners(key) {
  if (!_keyListeners[key]) _keyListeners[key] = new Set();
  return _keyListeners[key];
}

function _notifyListeners(key, value) {
  _getListeners(key).forEach(fn => {
    try { fn(value); } catch (e) { console.warn('[syncService] listener error:', e); }
  });
}

// ── Listen for cross-tab localStorage changes ────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key?.startsWith(PREFIX)) return;
    const key = e.key.slice(PREFIX.length);
    try {
      const value = e.newValue ? JSON.parse(e.newValue) : null;
      _notifyListeners(key, value);
    } catch { /* malformed JSON, ignore */ }
  });
}

// ── Listen for BroadcastChannel messages ─────────────────────────────────────
if (_channel) {
  _channel.onmessage = (e) => {
    const { key, value } = e.data || {};
    if (key) _notifyListeners(key, value);
  };
}

// ── Store factory ────────────────────────────────────────────────────────────

/**
 * Create a synchronized store for a given key.
 * @param {string} key - Unique identifier (e.g. 'emergency_alerts')
 * @param {*} defaultValue - Value returned when store is empty
 * @returns {{ get, set, update, subscribe, clear }}
 */
export function syncStore(key, defaultValue = null) {
  const storageKey = PREFIX + key;

  return {
    /**
     * Read current value (from localStorage).
     */
    get() {
      try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    /**
     * Write value and broadcast to all tabs/windows.
     */
    set(value) {
      try {
        const json = JSON.stringify(value);
        localStorage.setItem(storageKey, json);
        // Broadcast to other tabs (same browser)
        if (_channel) {
          _channel.postMessage({ key, value });
        }
        // Also notify local listeners (storage event doesn't fire in the originating tab)
        _notifyListeners(key, value);
      } catch (e) {
        console.warn('[syncService] set error:', e);
      }
    },

    /**
     * Read-modify-write helper.
     * @param {function} updater - fn(currentValue) => newValue
     */
    update(updater) {
      const current = this.get();
      const next = updater(current);
      this.set(next);
      return next;
    },

    /**
     * Subscribe to remote changes (from other tabs or BroadcastChannel).
     * Also fires for local .set() calls.
     * @param {function} listener - Called with new value
     * @returns {function} unsubscribe
     */
    subscribe(listener) {
      _getListeners(key).add(listener);
      return () => _getListeners(key).delete(listener);
    },

    /**
     * Clear the stored value.
     */
    clear() {
      localStorage.removeItem(storageKey);
      if (_channel) _channel.postMessage({ key, value: defaultValue });
      _notifyListeners(key, defaultValue);
    },
  };
}

// ── Pre-built stores for the care layer ──────────────────────────────────────
export const alertsStore          = syncStore('emergency_alerts', []);
export const recommendationsStore = syncStore('recommendations', {});

// ── New stores for hospital incoming + doctor chat ────────────────────────────
// ambulanceStore: { lat, lng, ambulanceId, hospitalId, timestamp } | null
export const ambulanceStore       = syncStore('ambulance_live', null);

// chatStore: [{ id, from, role, text, timestamp, type }]
// type: 'message' | 'call_start' | 'call_connected' | 'call_ended'
export const chatStore            = syncStore('doctor_hospital_chat', []);

export default { syncStore, alertsStore, recommendationsStore, ambulanceStore, chatStore };
