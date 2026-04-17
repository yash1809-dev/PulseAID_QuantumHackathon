/**
 * users.js — Mock user and hospital admin profiles for simulated auth.
 *
 * Used by authService.js only. UI never imports this directly.
 *
 * user_type: 'user' | 'hospital'
 */

export const mockUsers = [
  // ── Patient / User accounts ──────────────────────────────────────────
  {
    id: 'u-001',
    name: 'Rahul Verma',
    email: 'rahul@demo.com',
    password: 'demo123',
    user_type: 'user',
    insurance: 'Star Health',
    enrolledSchemes: [],
    medicalConditions: 'Occasional migraines, mild hypertension',
    preferredHospitalId: '',
    preferredDoctorId: '',
    budget: 'medium',
    priority: 'nearest',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=RahulVerma',
    // Health expense history (last 6 months)
    healthExpenses: [
      { month: 'Nov 2024', amount: 2400, category: 'OPD' },
      { month: 'Dec 2024', amount: 1200, category: 'Medicines' },
      { month: 'Jan 2025', amount: 5800, category: 'Neurology Consult' },
      { month: 'Feb 2025', amount: 900,  category: 'Medicines' },
      { month: 'Mar 2025', amount: 3100, category: 'Imaging (MRI)' },
      { month: 'Apr 2025', amount: 2200, category: 'OPD' },
    ],
    medicalHistory: [
      { year: 2023, event: 'Migraine episodes diagnosed, on medication' },
      { year: 2024, event: 'Mild hypertension — no hospitalization required' },
    ],
    bloodGroup: 'B+',
    age: 32,
  },
  {
    id: 'u-002',
    name: 'Priya Iyer',
    email: 'priya@demo.com',
    password: 'demo123',
    user_type: 'user',
    insurance: 'Ayushman Bharat',
    enrolledSchemes: ['Ayushman Bharat (PM-JAY)'],
    medicalConditions: 'Diabetic, High Blood Pressure',
    preferredHospitalId: 'hosp-005', // KEM Hospital
    preferredDoctorId: 'doc-012',    // Dr. Anjali Tiwari
    budget: 'low',
    priority: 'cheapest',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=PriyaIyer',
    healthExpenses: [
      { month: 'Nov 2024', amount: 800,  category: 'Diabetes Medicines' },
      { month: 'Dec 2024', amount: 1100, category: 'OPD + Blood Tests' },
      { month: 'Jan 2025', amount: 950,  category: 'Diabetes Medicines' },
      { month: 'Feb 2025', amount: 2200, category: 'Endocrinology Consult' },
      { month: 'Mar 2025', amount: 750,  category: 'Diabetes Medicines' },
      { month: 'Apr 2025', amount: 1300, category: 'OPD + HbA1c Test' },
    ],
    medicalHistory: [
      { year: 2020, event: 'Type 2 Diabetes diagnosed — on oral medication' },
      { year: 2022, event: 'Hypertension — managed with medication' },
      { year: 2024, event: 'Minor hypoglycemic episode — hospital visit (KEM)' },
    ],
    bloodGroup: 'O+',
    age: 45,
  },
  {
    id: 'u-003',
    name: 'Anil Kapoor',
    email: 'anil@demo.com',
    password: 'demo123',
    user_type: 'user',
    insurance: 'ICICI Lombard',
    enrolledSchemes: ['CGHS (Central Government Health Scheme)'],
    medicalConditions: 'Heart patient, requires frequent ECGs',
    preferredHospitalId: 'hosp-001', // Ruby Hall Clinic
    preferredDoctorId: 'doc-001',    // Dr. Arjun Mehta
    budget: 'high',
    priority: 'best_doctor',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=AnilKapoor',
    healthExpenses: [
      { month: 'Nov 2024', amount: 12000, category: 'Cardiology Consult + ECG' },
      { month: 'Dec 2024', amount: 8500,  category: 'Medicines (Cardiac)' },
      { month: 'Jan 2025', amount: 22000, category: 'Echo + Stress Test' },
      { month: 'Feb 2025', amount: 9500,  category: 'Cardiology Follow-up' },
      { month: 'Mar 2025', amount: 6800,  category: 'Medicines (Cardiac)' },
      { month: 'Apr 2025', amount: 15000, category: 'ECG + Holter Monitor' },
    ],
    medicalHistory: [
      { year: 2019, event: 'Mild angina episode — stent placed (Ruby Hall Clinic)' },
      { year: 2021, event: 'Cardiac rehabilitation — 3 months' },
      { year: 2023, event: 'Follow-up angiography — no new blockages' },
      { year: 2024, event: 'Arrhythmia detected — on anti-arrhythmic meds' },
    ],
    bloodGroup: 'A+',
    age: 58,
  },

  // ── Hospital Admin accounts ──────────────────────────────────────────
  {
    id: 'h-admin-001',
    name: 'Admin — Ruby Hall Clinic',
    email: 'admin.ruby@demo.com',
    password: 'demo123',
    user_type: 'hospital',
    hospitalId: 'hosp-001',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=RubyHall',
  },
  {
    id: 'h-admin-002',
    name: 'Admin — KEM Hospital',
    email: 'admin.kem@demo.com',
    password: 'demo123',
    user_type: 'hospital',
    hospitalId: 'hosp-005',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=KEMHospital',
  },
  {
    id: 'h-admin-003',
    name: 'Admin — Sahyadri Hospital',
    email: 'admin.sahyadri@demo.com',
    password: 'demo123',
    user_type: 'hospital',
    hospitalId: 'hosp-003',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sahyadri',
  },
];

// ── Demo quick-login shortcuts ────────────────────────────────────────────────
export const DEMO_ACCOUNTS = {
  user: mockUsers[0],       // Rahul Verma — Star Health, medium budget
  user2: mockUsers[1],      // Priya Iyer — Ayushman Bharat, low budget
  user3: mockUsers[2],      // Anil Kapoor — ICICI Lombard, high budget
  hospitalAdmin: mockUsers[3], // Ruby Hall Clinic admin
};
