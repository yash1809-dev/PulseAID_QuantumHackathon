/**
 * ambulanceService.js — Ambulance data service.
 *
 * Wraps existing MockAPI ambulance logic.
 * All new ambulance-related logic goes here.
 */

import { MockAPI } from './api';
import { findNearestAmbulance } from '../utils/geo';

export const ambulanceService = {
  /**
   * Fetch all ambulances (delegates to existing MockAPI).
   */
  getAll: async () => {
    return MockAPI.getAmbulances();
  },

  /**
   * Get nearest available ambulance to a location.
   */
  getNearest: (ambulances, lat, lng) => {
    return findNearestAmbulance(ambulances, lat, lng);
  },

  /**
   * Mark an ambulance as busy (returns updated array for setState).
   */
  markBusy: (ambulances, ambulanceId) => {
    return ambulances.map(a =>
      a.id === ambulanceId ? { ...a, status: 'busy' } : a
    );
  },

  /**
   * Mark an ambulance as available again (returns updated array for setState).
   */
  markAvailable: (ambulances, ambulanceId, lat, lng) => {
    return ambulances.map(a =>
      a.id === ambulanceId
        ? { ...a, status: 'available', ...(lat !== undefined ? { lat, lng } : {}) }
        : a
    );
  },

  /**
   * Update ambulance position (returns updated array for setState).
   */
  updatePosition: (ambulances, ambulanceId, lat, lng) => {
    return ambulances.map(a =>
      a.id === ambulanceId ? { ...a, lat, lng } : a
    );
  },

  /**
   * Count available ambulances.
   */
  countAvailable: (ambulances) => {
    return (ambulances || []).filter(a => a.status === 'available').length;
  },
};
