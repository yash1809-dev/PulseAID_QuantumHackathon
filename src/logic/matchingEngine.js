/**
 * matchingEngine.js — Rule-based hospital matching algorithm.
 *
 * Input:  { userLocation, insurance, budget, priority, hospitals, doctors }
 * Output: { bestMatch, rankedList, matchReason, hasResults }
 *
 * Steps:
 *  1. Filter: ICU > 0, insurance match, budget compatibility
 *  2. Score:  distance + cost + doctor availability weighted by priority
 *  3. Explain: generate a human-readable matchReason for the best match
 *
 * Smart Matching Scenario (CORE):
 *  If a doctor works at multiple hospitals but only one of those accepts the
 *  user's insurance → recommend that hospital with a specific explanation.
 */

import { getDistanceKm } from '../utils/geo';

const COST_ORDER = { low: 0, medium: 1, high: 2 };
const BUDGET_MAX = { low: 0, medium: 1, high: 2 };

// ── Step 1: Filter ─────────────────────────────────────────────────────────────
function filterHospitals(hospitals, { insurance, budget, user }) {
  const enrolledSchemes = user?.enrolledSchemes || [];

  return hospitals.filter(h => {
    // Must have ICU beds
    if ((h.icu_available || 0) <= 0) return false;

    // Check if hospital matches either insurance or enrolled scheme
    let hasCoverage = true;
    if (insurance && insurance !== 'none') {
      const acceptsInsurance = h.insuranceAccepted?.includes(insurance);
      const acceptsScheme = enrolledSchemes.some(scheme => h.insuranceAccepted?.includes(scheme));
      if (!acceptsInsurance && !acceptsScheme) return false;
    }

    // Budget compatibility
    if (budget) {
      const maxAffordable = BUDGET_MAX[budget] ?? 2;
      const hospitalCost = COST_ORDER[h.costLevel] ?? 1;
      if (hospitalCost > maxAffordable) return false;
    }

    return true;
  });
}

// ── Step 2: Score ──────────────────────────────────────────────────────────────
function scoreHospital(hospital, { userLocation, priority, doctors, user }) {
  let score = 0;

  // Distance score (0–40 pts): closer = higher score
  if (userLocation) {
    const distKm = getDistanceKm(userLocation.lat, userLocation.lng, hospital.lat, hospital.lng);
    const distScore = Math.max(0, 40 - distKm * 5);
    score += priority === 'nearest' ? distScore * 2 : distScore;
    hospital._distanceKm = parseFloat(distKm.toFixed(1));
  }

  // Cost score (0–30 pts): lower cost = higher score
  const costScore = { low: 30, medium: 15, high: 0 }[hospital.costLevel] ?? 15;
  score += priority === 'cheapest' ? costScore * 2 : costScore;

  // Doctor availability score (0–30 pts)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const hospitalDoctors = (doctors || []).filter(d => (d.schedule?.[today] || []).some(slot => slot.hospitalId === hospital.id));
  const availableToday = hospitalDoctors.length;
  const docScore = Math.min(30, availableToday * 10);
  score += priority === 'best_doctor' ? docScore * 2 : docScore;

  // ICU availability bonus
  const icuRatio = (hospital.icu_available || 0) / (hospital.icu_total || 1);
  score += Math.round(icuRatio * 10);

  // Rating bonus
  score += (hospital.rating || 0) * 2;

  // ── NEW: Profile Preferences Bonus ──
  const prefHospitalId = user?.preferredHospitalId;
  const prefDoctorId = user?.preferredDoctorId;
  const medicalConditions = (user?.medicalConditions || '').toLowerCase();

  // Massive boost if it's the preferred hospital
  if (prefHospitalId === hospital.id) {
    score += 100;
  }

  // Boost if preferred doctor is available here today
  if (prefDoctorId) {
    const isPrefDocHereToday = hospitalDoctors.some(d => d.id === prefDoctorId);
    if (isPrefDocHereToday) score += 50;
  }

  // Mild boost for medical conditions matching specialties (e.g. Heart -> Cardiology)
  if (medicalConditions) {
    if ((medicalConditions.includes('heart') || medicalConditions.includes('cardiac')) && hospital.specialties?.includes('Cardiology')) score += 15;
    if ((medicalConditions.includes('diabet') || medicalConditions.includes('sugar')) && hospital.specialties?.includes('General Medicine')) score += 15;
    if ((medicalConditions.includes('brain') || medicalConditions.includes('neuro')) && hospital.specialties?.includes('Neurology')) score += 15;
    if ((medicalConditions.includes('bone') || medicalConditions.includes('fracture')) && hospital.specialties?.includes('Orthopedics')) score += 15;
  }

  hospital._score = Math.round(score);
  hospital._availableDoctorsToday = availableToday;
  return hospital;
}

// ── Step 3: Smart Match Explanation ───────────────────────────────────────────
function buildMatchReason(best, { insurance, budget, priority, doctors, userLocation, user }) {
  if (!best) return 'No hospitals found matching your criteria.';

  const reasons = [];
  const prefHospitalId = user?.preferredHospitalId;
  const prefDoctorId = user?.preferredDoctorId;
  const enrolledSchemes = user?.enrolledSchemes || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // 1. Absolute Top Reasons
  if (prefHospitalId === best.id) {
    return 'This is your Preferred Hospital and it has availability.';
  }

  if (prefDoctorId) {
    const isPrefDocHere = best.doctorIds?.includes(prefDoctorId);
    if (isPrefDocHere) {
      return 'Your Preferred Doctor is available here today.';
    }
  }

  // Insurance / Govt Scheme reason
  const acceptedScheme = enrolledSchemes.find(scheme => best.insuranceAccepted?.includes(scheme));
  if (acceptedScheme) {
    reasons.push(`accepts your ${acceptedScheme} scheme`);
  } else if (insurance && insurance !== 'none' && best.insuranceAccepted?.includes(insurance)) {
    reasons.push(`accepts your ${insurance} insurance`);
  }

  // Medical condition match reason (very simple)
  const mc = (user?.medicalConditions || '').toLowerCase();
  if ((mc.includes('heart') || mc.includes('cardiac')) && best.specialties?.includes('Cardiology')) {
    reasons.push('has excellent Cardiology for your condition');
  } else if (mc.includes('diabet') && best.specialties?.includes('General Medicine')) {
    reasons.push('well-equipped for diabetes care');
  }

  // Distance reason
  if (best._distanceKm !== undefined) {
    reasons.push(`only ${best._distanceKm} km away`);
  }

  // Cost reason
  if (best.costLevel && !acceptedScheme) { // less relevant if covered by scheme
    reasons.push(`${best.costLevel} cost level`);
  }

  // Doctor smart match
  const availableDoctors = (doctors || []).filter(d => (d.schedule?.[today] || []).some(s => s.hospitalId === best.id));
  if (availableDoctors.length > 0) {
    reasons.push(`${availableDoctors.length} doctor${availableDoctors.length > 1 ? 's' : ''} available today`);
  }

  // ICU beds
  if ((best.icu_available || 0) > 0 && priority !== 'best_doctor') { // if not explicitly looking for doctor
    reasons.push(`${best.icu_available} ICU beds available`);
  }

  if (reasons.length === 0) return 'Best available hospital near you.';

  return 'Recommended because: ' + reasons.slice(0, 3).join(', ') + '.';
}

// ── Main Export ────────────────────────────────────────────────────────────────
/**
 * runMatching — entry point for the matching engine.
 *
 * @param {Object} params
 * @param {{ lat: number, lng: number }} params.userLocation
 * @param {string} params.insurance — e.g. 'Star Health' or 'none'
 * @param {'low'|'medium'|'high'} params.budget
 * @param {'nearest'|'cheapest'|'best_doctor'} params.priority
 * @param {Array} params.hospitals — merged hospital list from central state
 * @param {Array} params.doctors — all doctors from central state
 *
 * @returns {{ bestMatch, rankedList, matchReason, hasResults, filterStats }}
 */
export function runMatching({ userLocation, insurance, budget, priority, hospitals, doctors, user }) {
  // Safety: return empty if no data
  if (!hospitals?.length) {
    return {
      bestMatch: null,
      rankedList: [],
      matchReason: 'No hospital data available.',
      hasResults: false,
      filterStats: { total: 0, filtered: 0 },
    };
  }

  // Step 1: Filter
  const params = { insurance, budget, user };
  const filtered = filterHospitals(hospitals, params);

  if (filtered.length === 0) {
    return {
      bestMatch: null,
      rankedList: [],
      matchReason: `No hospitals match your filters (${insurance && insurance !== 'none' ? insurance + ', ' : ''}${budget || 'any'} budget). Try removing some filters.`,
      hasResults: false,
      filterStats: { total: hospitals.length, filtered: 0 },
    };
  }

  // Step 2: Score and rank
  const scored = filtered
    .map(h => scoreHospital({ ...h }, { userLocation, priority, doctors, user }))
    .sort((a, b) => b._score - a._score);

  const bestMatch = scored[0];

  // Step 3: Generate explanation
  const matchReason = buildMatchReason(bestMatch, { insurance, budget, priority, doctors, userLocation, user });

  return {
    bestMatch,
    rankedList: scored,
    matchReason,
    hasResults: true,
    filterStats: { total: hospitals.length, filtered: scored.length },
  };
}
