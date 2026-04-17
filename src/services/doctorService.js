/**
 * doctorService.js — Doctor data access service.
 *
 * All UI components use this service — never import mockDoctors directly.
 */

import { mockDoctors } from '../data/doctors';

const simulateDelay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export const doctorService = {
  /**
   * GET /doctors — all doctors.
   */
  getAll: async () => {
    await simulateDelay();
    return mockDoctors;
  },

  /**
   * Search doctors by name or specialty (case-insensitive).
   */
  search: (doctors, query) => {
    if (!query?.trim()) return doctors;
    const q = query.toLowerCase();
    return (doctors || []).filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.bio?.toLowerCase().includes(q)
    );
  },

  /**
   * Filter by specialty.
   */
  getBySpecialty: (doctors, specialty) => {
    if (!specialty || specialty === 'all') return doctors;
    return (doctors || []).filter(d => d.specialty === specialty);
  },

  /**
   * Get doctors practicing at a specific hospital.
   */
  getByHospital: (doctors, hospitalId) => {
    return (doctors || []).filter(d => d.hospitalIds?.includes(hospitalId));
  },

  /**
   * Get a single doctor by ID.
   */
  getById: (doctors, id) => {
    return (doctors || []).find(d => d.id === id) || null;
  },

  /**
   * Toggle availability for a specific day (for hospital admin portal).
   * Returns updated doctors array for setState.
   */
  toggleAvailability: (doctors, doctorId, day) => {
    return doctors.map(d => {
      if (d.id !== doctorId) return d;
      const days = d.availableDays || [];
      const updated = days.includes(day)
        ? days.filter(dd => dd !== day)
        : [...days, day];
      return { ...d, availableDays: updated };
    });
  },

  /**
   * Check if a doctor is available today.
   */
  isAvailableToday: (doctor) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return doctor?.availableDays?.includes(today) || false;
  },
};
