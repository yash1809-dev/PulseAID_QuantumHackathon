/**
 * smartDecisionEngine.js — Multi-dimensional hospital decision engine.
 *
 * Acts like a local AI by running 6 specialized analyzers over all mock data,
 * then combining weighted scores with detailed natural-language reasoning.
 *
 * Analyzers:
 *  1. Coverage Analyzer     — insurance + govt schemes compatibility
 *  2. Medical Fit Analyzer  — condition ↔ specialty + medical history
 *  3. Proximity Analyzer    — distance + estimated arrival time
 *  4. Cost Analyzer         — budget, expense history, affordability
 *  5. Preference Analyzer   — explicit preferred hospital / doctor
 *  6. Availability Analyzer — ICU beds, doctor slots today
 *
 * Output per hospital: { score (0–100), breakdown, flags, confidence }
 * Final output: { bestMatch, rankedList, report, reasoning[] }
 */

import { getDistanceKm } from '../utils/geo';

// ── Condition → Specialty keyword map ─────────────────────────────────────────
const CONDITION_SPECIALTY_MAP = [
  { keywords: ['heart', 'cardiac', 'cardio', 'ecg', 'angina', 'arrhythmia', 'chest pain', 'stent'], specialty: 'Cardiology', urgency: 'high' },
  { keywords: ['brain', 'neuro', 'stroke', 'epilepsy', 'seizure', 'migraine', 'headache'], specialty: 'Neurology', urgency: 'high' },
  { keywords: ['bone', 'fracture', 'joint', 'ortho', 'spine', 'knee', 'hip'], specialty: 'Orthopedics', urgency: 'medium' },
  { keywords: ['diabet', 'sugar', 'hba1c', 'insulin', 'glucose', 'endocrin'], specialty: 'General Medicine', urgency: 'medium' },
  { keywords: ['lung', 'breath', 'copd', 'asthma', 'pulmon', 'respiratory'], specialty: 'Pulmonology', urgency: 'high' },
  { keywords: ['cancer', 'tumor', 'oncology', 'chemo', 'biopsy'], specialty: 'Oncology', urgency: 'high' },
  { keywords: ['kidney', 'urology', 'urinary', 'bladder', 'prostate'], specialty: 'Urology', urgency: 'medium' },
  { keywords: ['stomach', 'gastro', 'liver', 'endoscopy', 'ibd', 'ulcer'], specialty: 'Gastroenterology', urgency: 'medium' },
  { keywords: ['child', 'infant', 'pediatric', 'neonatal', 'baby'], specialty: 'Pediatrics', urgency: 'high' },
  { keywords: ['pregnancy', 'gynaec', 'gynecol', 'obstetric', 'delivery'], specialty: 'Gynecology', urgency: 'high' },
  { keywords: ['ear', 'nose', 'throat', 'ent', 'hearing', 'sinus'], specialty: 'ENT', urgency: 'low' },
  { keywords: ['sports', 'athlete', 'ligament', 'shoulder', 'acl'], specialty: 'Sports Medicine', urgency: 'low' },
];

// ── Cost sensitivity from spending history ─────────────────────────────────────
function deriveSpendingProfile(user) {
  const expenses = user?.healthExpenses || [];
  if (!expenses.length) return { avgMonthly: 0, tier: 'unknown', isHighSpender: false };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const avg = Math.round(total / expenses.length);
  const tier = avg < 2000 ? 'frugal' : avg < 8000 ? 'moderate' : 'high-spender';

  // Dominant category
  const categories = {};
  expenses.forEach(e => { categories[e.category] = (categories[e.category] || 0) + e.amount; });
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return { avgMonthly: avg, tier, isHighSpender: avg >= 8000, topCategory };
}

// ── Detect medical conditions from free-text ───────────────────────────────────
function detectConditions(conditionText) {
  const lower = (conditionText || '').toLowerCase();
  const detected = [];
  for (const mapping of CONDITION_SPECIALTY_MAP) {
    if (mapping.keywords.some(kw => lower.includes(kw))) {
      detected.push(mapping);
    }
  }
  return detected;
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYZER 1 — Coverage
// ══════════════════════════════════════════════════════════════════════════════
function analyzeCoverage(hospital, user) {
  const insurance = user?.insurance;
  const schemes = user?.enrolledSchemes || [];
  const result = { score: 0, label: 'No Coverage', flags: [], detail: '' };

  const acceptsInsurance = insurance && insurance !== 'none' && hospital.insuranceAccepted?.includes(insurance);
  const matchedSchemes = schemes.filter(s => hospital.insuranceAccepted?.includes(s));

  if (matchedSchemes.length > 0) {
    result.score = 100;
    result.label = 'Full Coverage';
    result.detail = `Accepts your govt scheme: ${matchedSchemes[0]}. Treatment costs may be significantly subsidized.`;
    result.flags.push({ type: 'positive', text: `${matchedSchemes[0]} accepted` });
  } else if (acceptsInsurance) {
    result.score = 85;
    result.label = 'Insured';
    result.detail = `Your ${insurance} insurance is accepted here. OPD and ICU costs should be partially or fully covered.`;
    result.flags.push({ type: 'positive', text: `${insurance} accepted` });
  } else if (insurance && insurance !== 'none') {
    result.score = 20;
    result.label = 'No Insurance Match';
    result.detail = `This hospital does not accept ${insurance}. You may need to pay out-of-pocket.`;
    result.flags.push({ type: 'warning', text: 'Out-of-pocket cost likely' });
  } else {
    result.score = 40;
    result.label = 'Self-Pay';
    result.detail = 'No insurance or scheme enrolled. Costs depend on your budget preference.';
  }

  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYZER 2 — Medical Fit
// ══════════════════════════════════════════════════════════════════════════════
function analyzeMedicalFit(hospital, user, doctors) {
  const detected = detectConditions(user?.medicalConditions);
  const history = user?.medicalHistory || [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const result = { score: 50, label: 'General', flags: [], detail: '', matchedSpecialties: [] };

  if (!detected.length) {
    result.detail = 'No specific medical conditions recorded. General-purpose hospitals are suitable.';
    return result;
  }

  let totalScore = 0;
  const matchedSpecialties = [];
  const missingSpecialties = [];

  for (const cond of detected) {
    if (hospital.specialties?.includes(cond.specialty)) {
      matchedSpecialties.push(cond.specialty);
      const urgencyBonus = { high: 30, medium: 20, low: 10 }[cond.urgency] ?? 15;
      totalScore += urgencyBonus;

      // Check if a relevant doctor is here today
      const docHere = doctors?.some(d =>
        d.specialty === cond.specialty &&
        (d.schedule?.[today] || []).some(s => s.hospitalId === hospital.id)
      );
      if (docHere) {
        totalScore += 20;
        result.flags.push({ type: 'positive', text: `${cond.specialty} specialist available today` });
      }
    } else {
      missingSpecialties.push(cond.specialty);
      result.flags.push({ type: 'warning', text: `No ${cond.specialty} department` });
    }
  }

  // Medical history cross-reference: prior treatment here
  const priorHere = history.some(h =>
    hospital.name && h.event?.toLowerCase().includes(hospital.name.split(' ')[0].toLowerCase())
  );
  if (priorHere) {
    totalScore += 25;
    result.flags.push({ type: 'positive', text: 'Patient has prior treatment history here' });
  }

  result.score = Math.min(100, Math.round(totalScore));
  result.matchedSpecialties = matchedSpecialties;

  if (matchedSpecialties.length > 0 && missingSpecialties.length === 0) {
    result.label = 'Excellent Fit';
    result.detail = `Specializes in ${matchedSpecialties.join(', ')} — directly matching your medical conditions.`;
  } else if (matchedSpecialties.length > 0) {
    result.label = 'Partial Fit';
    result.detail = `Has ${matchedSpecialties.join(', ')}, but lacks ${missingSpecialties.join(', ')}.`;
  } else {
    result.label = 'Poor Fit';
    result.detail = `Does not have departments for your conditions (${detected.map(c => c.specialty).join(', ')}).`;
    result.score = Math.max(5, result.score);
  }

  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYZER 3 — Proximity
// ══════════════════════════════════════════════════════════════════════════════
function analyzeProximity(hospital, userLocation) {
  const result = { score: 50, label: 'Unknown', flags: [], detail: '', distanceKm: null, etaMinutes: null };

  if (!userLocation || !hospital.lat || !hospital.lng) {
    result.detail = 'Location unavailable — cannot calculate proximity.';
    return result;
  }

  const distKm = parseFloat(getDistanceKm(userLocation.lat, userLocation.lng, hospital.lat, hospital.lng).toFixed(1));
  // Estimate ambulance ETA: ~40 km/h avg city speed
  const etaMinutes = Math.round((distKm / 40) * 60);

  result.distanceKm = distKm;
  result.etaMinutes = etaMinutes;

  if (distKm <= 2) {
    result.score = 100;
    result.label = 'Very Close';
    result.detail = `Only ${distKm} km away. Ambulance ETA ~${etaMinutes} min — ideal for emergencies.`;
    result.flags.push({ type: 'positive', text: `~${etaMinutes} min ETA` });
  } else if (distKm <= 5) {
    result.score = 80;
    result.label = 'Nearby';
    result.detail = `${distKm} km away. Estimated arrival in ~${etaMinutes} minutes.`;
  } else if (distKm <= 10) {
    result.score = 55;
    result.label = 'Moderate Distance';
    result.detail = `${distKm} km — acceptable, but farther options exist.`;
    result.flags.push({ type: 'warning', text: `~${etaMinutes} min travel time` });
  } else {
    result.score = Math.max(10, 55 - (distKm - 10) * 2);
    result.label = 'Far';
    result.detail = `${distKm} km away — significant transit time (~${etaMinutes} min). Consider closer alternatives.`;
    result.flags.push({ type: 'warning', text: `Long distance: ${distKm} km` });
  }

  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYZER 4 — Cost
// ══════════════════════════════════════════════════════════════════════════════
function analyzeCost(hospital, user) {
  const spending = deriveSpendingProfile(user);
  const budget = user?.budget || 'medium';
  const result = { score: 50, label: 'Moderate Cost', flags: [], detail: '' };

  const COST_RANK = { low: 0, medium: 1, high: 2 };
  const BUDGET_MAX = { low: 0, medium: 1, high: 2 };
  const hospitalRank = COST_RANK[hospital.costLevel] ?? 1;
  const userMax = BUDGET_MAX[budget] ?? 1;

  // Base affordability
  if (hospitalRank <= userMax) {
    result.score = hospitalRank === 0 ? 100 : hospitalRank === 1 ? 80 : 60;
    result.label = hospitalRank === 0 ? 'Very Affordable' : hospitalRank === 1 ? 'Within Budget' : 'Comfortable';
    result.detail = `${hospital.name}'s ${hospital.costLevel} pricing aligns with your ${budget} budget preference.`;
  } else {
    result.score = 25;
    result.label = 'Over Budget';
    result.detail = `This is a ${hospital.costLevel}-cost hospital, which may exceed your ${budget} budget preference.`;
    result.flags.push({ type: 'warning', text: `${hospital.costLevel} cost — above budget` });
  }

  // Spending history insight
  if (spending.tier === 'frugal' && hospitalRank === 2) {
    result.score = Math.max(10, result.score - 20);
    result.flags.push({ type: 'warning', text: 'Your spending history suggests cost-sensitive care' });
  } else if (spending.isHighSpender && hospitalRank === 0) {
    result.flags.push({ type: 'positive', text: `You typically spend ₹${spending.avgMonthly.toLocaleString()}/month — costs here are well within range` });
  }

  if (spending.avgMonthly > 0) {
    result.detail += ` Your avg. monthly health spend is ₹${spending.avgMonthly.toLocaleString()} (${spending.tier}).`;
  }

  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYZER 5 — Patient Preferences
// ══════════════════════════════════════════════════════════════════════════════
function analyzePreference(hospital, user, doctors) {
  const result = { score: 0, label: 'No Preference Set', flags: [], detail: '', preferenceBonus: 0 };
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const prefHospId = user?.preferredHospitalId;
  const prefDocId = user?.preferredDoctorId;

  if (prefHospId && prefHospId === hospital.id) {
    result.score = 100;
    result.label = 'Your Preferred Hospital';
    result.preferenceBonus = 100;
    result.detail = 'This is your explicitly registered preferred hospital. High priority in matching.';
    result.flags.push({ type: 'positive', text: 'Preferred hospital' });
    return result;
  }

  if (prefDocId) {
    const prefDoc = doctors?.find(d => d.id === prefDocId);
    if (prefDoc) {
      const docHereToday = (prefDoc.schedule?.[today] || []).some(s => s.hospitalId === hospital.id);
      if (docHereToday) {
        result.score = 85;
        result.label = 'Preferred Doctor Here Today';
        result.preferenceBonus = 85;
        const timeSlot = (prefDoc.schedule[today].find(s => s.hospitalId === hospital.id))?.time;
        result.detail = `Dr. ${prefDoc.name} (${prefDoc.specialty}) is available at this hospital today (${timeSlot}).`;
        result.flags.push({ type: 'positive', text: `Dr. ${prefDoc.name.split(' ').pop()} here today` });
        return result;
      } else if (prefDoc.hospitalIds?.includes(hospital.id)) {
        result.score = 40;
        result.label = 'Preferred Doctor Based Here';
        result.preferenceBonus = 40;
        result.detail = `Dr. ${prefDoc.name} practices at this hospital, but is not scheduled here today.`;
        result.flags.push({ type: 'warning', text: `Dr. ${prefDoc.name.split(' ').pop()} not today` });
        return result;
      }
    }
  }

  if (!prefHospId && !prefDocId) {
    result.score = 50;
    result.detail = 'No preferred hospital or doctor set. Set preferences in your profile for better matching.';
  } else {
    result.score = 30;
    result.detail = 'Your preferred hospital/doctor is not available here.';
  }

  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYZER 6 — Availability
// ══════════════════════════════════════════════════════════════════════════════
function analyzeAvailability(hospital, doctors) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const result = { score: 0, label: 'Unknown', flags: [], detail: '', icuAvailable: 0, doctorsToday: [] };

  result.icuAvailable = hospital.icu_available || 0;
  const icuTotal = hospital.icu_total || 1;
  const icuRatio = result.icuAvailable / icuTotal;

  // Doctor availability today at this hospital
  result.doctorsToday = (doctors || []).filter(d =>
    (d.schedule?.[today] || []).some(s => s.hospitalId === hospital.id)
  );

  // ICU score
  let icuScore = 0;
  if (result.icuAvailable === 0) {
    icuScore = 0;
    result.flags.push({ type: 'critical', text: 'No ICU beds available' });
  } else if (icuRatio >= 0.5) {
    icuScore = 50;
    result.flags.push({ type: 'positive', text: `${result.icuAvailable} ICU beds ready` });
  } else if (icuRatio > 0) {
    icuScore = 25;
    result.flags.push({ type: 'warning', text: `Only ${result.icuAvailable} ICU bed${result.icuAvailable > 1 ? 's' : ''} left` });
  }

  // Doctor score
  const docScore = Math.min(50, result.doctorsToday.length * 12);

  result.score = Math.min(100, icuScore + docScore);

  if (result.icuAvailable === 0) {
    result.label = 'No ICU Available';
    result.detail = 'No ICU beds currently available. Emergency admission may not be possible.';
  } else if (result.doctorsToday.length > 0) {
    result.label = 'Ready';
    result.detail = `${result.icuAvailable} ICU beds available. ${result.doctorsToday.length} doctor${result.doctorsToday.length > 1 ? 's' : ''} actively scheduled today.`;
  } else {
    result.label = 'Limited';
    result.detail = `${result.icuAvailable} ICU beds available but no doctors specifically scheduled today.`;
  }

  if (hospital.rating) {
    result.score = Math.min(100, result.score + hospital.rating * 2);
    if (hospital.rating >= 4.7) result.flags.push({ type: 'positive', text: `Top-rated: ${hospital.rating}★` });
  }

  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMBINE + RANK
// ══════════════════════════════════════════════════════════════════════════════

// Dimension weights depend on the user's declared priority
const WEIGHTS = {
  nearest: { coverage: 0.20, medical: 0.20, proximity: 0.30, cost: 0.10, preference: 0.10, availability: 0.10 },
  cheapest: { coverage: 0.20, medical: 0.15, proximity: 0.10, cost: 0.30, preference: 0.10, availability: 0.15 },
  best_doctor: { coverage: 0.15, medical: 0.25, proximity: 0.10, cost: 0.10, preference: 0.20, availability: 0.20 },
  default: { coverage: 0.20, medical: 0.20, proximity: 0.20, cost: 0.15, preference: 0.15, availability: 0.10 },
};

function computeFinalScore(breakdown, priority) {
  const w = WEIGHTS[priority] || WEIGHTS.default;
  return Math.round(
    breakdown.coverage.score * w.coverage +
    breakdown.medical.score * w.medical +
    breakdown.proximity.score * w.proximity +
    breakdown.cost.score * w.cost +
    breakdown.preference.score * w.preference +
    breakdown.availability.score * w.availability
  );
}

function generateNarrativeReasoning(best, breakdown, user, priority) {
  const reasons = [];
  const spending = deriveSpendingProfile(user);

  // Lead with the strongest match dimension
  const dims = Object.entries(breakdown).sort((a, b) => b[1].score - a[1].score);

  if (breakdown.preference.score >= 85) {
    reasons.push(breakdown.preference.detail);
  } else if (breakdown.medical.matchedSpecialties?.length > 0) {
    reasons.push(breakdown.medical.detail);
  }

  if (breakdown.coverage.score >= 80) reasons.push(breakdown.coverage.detail);
  if (breakdown.proximity.etaMinutes && breakdown.proximity.etaMinutes <= 12) {
    reasons.push(`Quick response: Ambulance ETA is ~${breakdown.proximity.etaMinutes} minutes.`);
  }
  if (breakdown.cost.score >= 75 && spending.avgMonthly > 0) {
    reasons.push(breakdown.cost.detail);
  }
  if (breakdown.availability.doctorsToday?.length > 1) {
    reasons.push(`${breakdown.availability.doctorsToday.length} doctors are active here today.`);
  }

  if (reasons.length === 0) reasons.push(breakdown.availability.detail);

  // Requirement: Explicit tagline for specific match types
  if (breakdown.coverage.score >= 80 && breakdown.availability.score >= 70) {
    reasons.unshift("Recommended based on your insurance and doctor availability");
  }

  return reasons;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export function runSmartMatching({ userLocation, insurance, budget, priority, hospitals, doctors, user }) {
  if (!hospitals?.length) {
    return {
      bestMatch: null, rankedList: [],
      matchReason: 'No hospital data available.',
      hasResults: false, filterStats: { total: 0, filtered: 0 },
      report: null,
    };
  }

  // Filter out hospitals with no ICU
  const candidates = hospitals.filter(h => (h.icu_available || 0) > 0);

  if (!candidates.length) {
    return {
      bestMatch: null, rankedList: [],
      matchReason: 'No hospitals currently have ICU beds available.',
      hasResults: false, filterStats: { total: hospitals.length, filtered: 0 },
      report: null,
    };
  }

  // Run all 6 analyzers on each candidate
  const analyzed = candidates.map(h => {
    const hosp = { ...h };
    const breakdown = {
      coverage:     analyzeCoverage(hosp, user),
      medical:      analyzeMedicalFit(hosp, user, doctors),
      proximity:    analyzeProximity(hosp, userLocation),
      cost:         analyzeCost(hosp, user),
      preference:   analyzePreference(hosp, user, doctors),
      availability: analyzeAvailability(hosp, doctors),
    };

    const finalScore = computeFinalScore(breakdown, priority);

    // Attach derived values for map display
    hosp._score = finalScore;
    hosp._distanceKm = breakdown.proximity.distanceKm;
    hosp._etaMinutes = breakdown.proximity.etaMinutes;
    hosp._availableDoctorsToday = breakdown.availability.doctorsToday.length;
    hosp._breakdown = breakdown;

    return hosp;
  });

  const ranked = analyzed.sort((a, b) => b._score - a._score);
  const best = ranked[0];
  const breakdown = best._breakdown;

  // Build narrative
  const reasoning = generateNarrativeReasoning(best, breakdown, user, priority);
  const matchReason = reasoning[0] || 'Best available match based on your profile.';

  // Collect all flags across dimensions
  const allFlags = Object.values(breakdown).flatMap(d => d.flags || []);

  // Confidence: how much better is #1 vs #2?
  const gap = ranked.length > 1 ? best._score - ranked[1]._score : 15;
  const confidence = Math.min(100, Math.round(50 + gap * 2.5));

  const report = {
    reasoning,
    breakdown,
    flags: allFlags,
    confidence,
    spendingProfile: deriveSpendingProfile(user),
    detectedConditions: detectConditions(user?.medicalConditions),
  };

  return {
    bestMatch: best,
    rankedList: ranked,
    matchReason,
    hasResults: true,
    filterStats: { total: hospitals.length, filtered: ranked.length },
    report,
  };
}
