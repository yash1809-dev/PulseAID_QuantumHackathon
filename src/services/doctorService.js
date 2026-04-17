/**
 * doctorService.js — Doctor data access service.
 *
 * All UI components use this service — never import mockDoctors directly.
 */

import initialDoctorsData from '../data/doctors.json';

const simulateDelay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// Re-derive hospitalIds and availableDays for initial data consistency
const mockDoctors = initialDoctorsData.map(doc => {
  const hospitalSet = new Set();
  const daySet = new Set();
  Object.entries(doc.schedule || {}).forEach(([day, slots]) => {
    if (slots.length > 0) {
      daySet.add(day);
      slots.forEach(s => hospitalSet.add(s.hospitalId));
    }
  });
  return {
    ...doc,
    hospitalIds: Array.from(hospitalSet),
    availableDays: Array.from(daySet),
  };
});

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

  // ── Doctor Dashboard mutations ────────────────────────────────────────

  /**
   * Update doctor profile fields (name, bio, experience, specialty).
   * Returns new doctors array for setState.
   */
  updateProfile: (doctors, doctorId, updates) => {
    return doctors.map(d => {
      if (d.id !== doctorId) return d;
      return { ...d, ...updates };
    });
  },

  /**
   * Replace entire schedule for a doctor and re-derive hospitalIds + availableDays.
   * Returns new doctors array for setState.
   */
  updateSchedule: (doctors, doctorId, newSchedule) => {
    return doctors.map(d => {
      if (d.id !== doctorId) return d;
      const hospitalSet = new Set();
      const daySet = new Set();
      Object.entries(newSchedule).forEach(([day, slots]) => {
        if (slots.length > 0) {
          daySet.add(day);
          slots.forEach(s => hospitalSet.add(s.hospitalId));
        }
      });
      return {
        ...d,
        schedule: newSchedule,
        hospitalIds: Array.from(hospitalSet),
        availableDays: Array.from(daySet),
      };
    });
  },

  /**
   * Add a single schedule slot to a specific day for a doctor.
   * Returns new doctors array for setState.
   */
  addSlot: (doctors, doctorId, day, slot) => {
    return doctors.map(d => {
      if (d.id !== doctorId) return d;
      const schedule = { ...d.schedule };
      schedule[day] = [...(schedule[day] || []), slot];
      // Re-derive availableDays only
      const daySet = new Set();
      Object.entries(schedule).forEach(([dy, slots]) => {
        if (slots.length > 0) {
          daySet.add(dy);
        }
      });
      return {
        ...d,
        schedule,
        availableDays: Array.from(daySet),
      };
    });
  },

  /**
   * Remove a schedule slot from a day by index.
   * Returns new doctors array for setState.
   */
  removeSlot: (doctors, doctorId, day, slotIndex) => {
    return doctors.map(d => {
      if (d.id !== doctorId) return d;
      const schedule = { ...d.schedule };
      schedule[day] = (schedule[day] || []).filter((_, i) => i !== slotIndex);
      // Re-derive availableDays only
      const daySet = new Set();
      Object.entries(schedule).forEach(([dy, slots]) => {
        if (slots.length > 0) {
          daySet.add(dy);
        }
      });
      return {
        ...d,
        schedule,
        availableDays: Array.from(daySet),
      };
    });
  },

  /**
   * Link a hospital to a doctor's profile.
   */
  linkHospital: (doctors, doctorId, hospitalId) => {
    return doctors.map(d => {
      if (d.id !== doctorId) return d;
      if (d.hospitalIds?.includes(hospitalId)) return d;
      return {
        ...d,
        hospitalIds: [...(d.hospitalIds || []), hospitalId]
      };
    });
  },

  /**
   * Unlink a hospital from a doctor, removing associated schedules.
   */
  unlinkHospital: (doctors, doctorId, hospitalId) => {
    return doctors.map(d => {
      if (d.id !== doctorId) return d;
      const newHospitalIds = (d.hospitalIds || []).filter(id => id !== hospitalId);
      const newSchedule = {};
      const daySet = new Set();
      
      Object.entries(d.schedule || {}).forEach(([day, slots]) => {
        const remainingSlots = slots.filter(s => s.hospitalId !== hospitalId);
        newSchedule[day] = remainingSlots;
        if (remainingSlots.length > 0) {
          daySet.add(day);
        }
      });
      
      return {
        ...d,
        hospitalIds: newHospitalIds,
        schedule: newSchedule,
        availableDays: Array.from(daySet)
      };
    });
  },
};

