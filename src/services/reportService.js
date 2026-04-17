/**
 * reportService.js — Patient medical records access layer.
 *
 * In production, this would call a secured EHR / FHIR API.
 * Here it reads from reports.json (mock structured data).
 *
 * REPLACEABLE: swap import with real API calls.
 */

import reportsData from '../data/reports.json';

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get all historical reports for a patient.
 * @param {string} patientId
 * @returns {Array} reports[]
 */
export function getPatientReports(patientId) {
  return reportsData[patientId]?.reports || [];
}

/**
 * Get prescription history for a patient.
 * @param {string} patientId
 * @returns {Array} prescriptions[]
 */
export function getPrescriptions(patientId) {
  return reportsData[patientId]?.prescriptions || [];
}

/**
 * Get test history for a patient.
 * @param {string} patientId
 * @returns {Array} testHistory[]
 */
export function getTestHistory(patientId) {
  return reportsData[patientId]?.testHistory || [];
}

/**
 * Get a specific report by ID.
 * @param {string} patientId
 * @param {string} reportId
 * @returns {object|null}
 */
export function getReportById(patientId, reportId) {
  const reports = getPatientReports(patientId);
  return reports.find(r => r.id === reportId) || null;
}

/**
 * Get summary of all records (count per type).
 */
export function getRecordsSummary(patientId) {
  const data = reportsData[patientId];
  if (!data) return { reports: 0, prescriptions: 0, tests: 0 };
  return {
    reports: data.reports?.length || 0,
    prescriptions: data.prescriptions?.length || 0,
    tests: data.testHistory?.length || 0,
  };
}

const reportService = {
  getPatientReports,
  getPrescriptions,
  getTestHistory,
  getReportById,
  getRecordsSummary,
};

export default reportService;
