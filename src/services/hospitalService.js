/**
 * hospitalService.js — Hospital data access service.
 *
 * Merges base ICU data (mockData.js) with extended data (hospitals.js).
 * Central state in App.jsx must call this service — never import data files directly from UI.
 *
 * All updates (ICU, cost, insurance) apply to in-memory state via setter callback.
 */

import { initialHospitals } from '../data/mockData';
import { extendedHospitals } from '../data/hospitals';

const simulateDelay = (ms = 300) => new Promise(r => setTimeout(r, ms));

/**
 * Merge base hospital (ICU counts) with extended data (insurance, cost, doctors, etc.)
 */
const mergeHospitals = (baseList) => {
  return baseList.map(base => {
    const ext = extendedHospitals.find(e => e.id === base.id) || {};
    return { ...base, ...ext };
  });
};

export const hospitalService = {
  /**
   * GET /hospitals — merged list with ICU data.
   * Call once on app mount; pass result to central state.
   */
  getAll: async () => {
    await simulateDelay();
    return mergeHospitals(initialHospitals);
  },

  /**
   * GET /hospitals/:id
   */
  getById: (hospitals, id) => {
    return hospitals?.find(h => h.id === id) || null;
  },

  /**
   * Filter hospitals by insurance type.
   */
  getByInsurance: (hospitals, insuranceType) => {
    if (!insuranceType || insuranceType === 'none') return hospitals;
    return (hospitals || []).filter(h =>
      h.insuranceAccepted?.includes(insuranceType)
    );
  },

  /**
   * Update ICU bed count — returns new hospitals array for setState.
   * Hospital admin portal uses this.
   */
  updateICU: (hospitals, hospitalId, newCount) => {
    return hospitals.map(h =>
      h.id === hospitalId
        ? { ...h, icu_available: Math.max(0, Math.min(h.icu_total, newCount)), last_updated: Date.now() }
        : h
    );
  },

  /**
   * Update cost level — returns new hospitals array for setState.
   */
  updateCostLevel: (hospitals, hospitalId, costLevel) => {
    return hospitals.map(h =>
      h.id === hospitalId ? { ...h, costLevel } : h
    );
  },

  /**
   * Toggle insurance scheme for a hospital.
   */
  toggleInsurance: (hospitals, hospitalId, insuranceType) => {
    return hospitals.map(h => {
      if (h.id !== hospitalId) return h;
      const accepted = h.insuranceAccepted || [];
      const updated = accepted.includes(insuranceType)
        ? accepted.filter(i => i !== insuranceType)
        : [...accepted, insuranceType];
      return { ...h, insuranceAccepted: updated };
    });
  },

  /**
   * Merge latest ICU simulation updates into extended hospital list.
   * Called when useSimulation changes ICU counts.
   */
  syncICUData: (extendedHospitals, simulatedHospitals) => {
    if (!simulatedHospitals?.length) return extendedHospitals;
    return extendedHospitals.map(h => {
      const sim = simulatedHospitals.find(s => s.id === h.id);
      return sim ? { ...h, icu_available: sim.icu_available, last_updated: sim.last_updated } : h;
    });
  },
};
