/**
 * schemeService.js — Simulated open source API for Indian Govt Health Schemes.
 * 
 * Returns data about various government health schemes available.
 */

const simulateDelay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const MOCK_SCHEMES = [
  { id: 'gov-001', name: 'Ayushman Bharat (PM-JAY)', type: 'National', description: 'Health cover up to ₹5 lakh per family per year for secondary and tertiary care.' },
  { id: 'gov-002', name: 'CGHS (Central Government Health Scheme)', type: 'Central Employees', description: 'Comprehensive medical care to the Central Government employees and pensioners.' },
  { id: 'gov-003', name: 'ECHS (Ex-Servicemen Contributory Health Scheme)', type: 'Military', description: 'Medical care for all Ex-Servicemen in receipt of pension.' },
  { id: 'gov-004', name: 'Aam Aadmi Bima Yojana', type: 'State/National', description: 'Social security scheme for rural landless households.' },
  { id: 'gov-005', name: 'Mahatma Phule Jan Arogya Yojana', type: 'State (Maharashtra)', description: 'Cashless medical facilities for BPL/APL families in Maharashtra.' },
];

export const schemeService = {
  /**
   * GET /api/govt-schemes
   * Simulates fetching available government medical schemes from Open API.
   */
  getAll: async () => {
    await simulateDelay();
    return MOCK_SCHEMES;
  }
};
