/**
 * users.js — Mock user and hospital admin profiles for simulated auth.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  DEMO ACCOUNTS — built specifically to showcase all features         ║
 * ║  including the Continuity of Care emergency flow.                    ║
 * ║                                                                      ║
 * ║  PATIENTS  (role: user)                                              ║
 * ║    p1  Anil Kapoor       — Cardiac patient → Dr. Arjun Mehta         ║
 * ║    p2  Priya Iyer        — Diabetic patient → Dr. Anjali Tiwari      ║
 * ║    p3  Rohan Desai       — Neuro patient → Dr. Priya Sharma          ║
 * ║                                                                      ║
 * ║  HOSPITALS (role: hospital)                                          ║
 * ║    h1  Ruby Hall Clinic  — premium cardiac facility                  ║
 * ║    h2  KEM Hospital      — public multi-specialty                    ║
 * ║    h3  Sahyadri Hospital — mid-tier neurology                        ║
 * ║                                                                      ║
 * ║  DOCTORS   (role: doctor)                                            ║
 * ║    d1  Dr. Arjun Mehta   — Cardiology  (gets alerted for Anil)       ║
 * ║    d2  Dr. Anjali Tiwari — Gen Medicine (gets alerted for Priya)     ║
 * ║    d3  Dr. Priya Sharma  — Neurology   (gets alerted for Rohan)      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * user_type: 'user' | 'hospital' | 'doctor'
 */

export const mockUsers = [

  // ════════════════════════════════════════════════════════════════════
  // PATIENTS
  // ════════════════════════════════════════════════════════════════════

  {
    // DEMO PATIENT 1 — Cardiac case, triggers Dr. Arjun Mehta on emergency
    id: 'u-001',
    name: 'Anil Kapoor',
    email: 'anil@demo.com',
    password: 'demo123',
    user_type: 'user',
    insurance: 'ICICI Lombard',
    enrolledSchemes: ['CGHS (Central Government Health Scheme)'],
    medicalConditions: 'Heart patient — PAF, prior stent, on amiodarone',
    preferredHospitalId: 'hosp-001',  // Ruby Hall Clinic
    preferredDoctorId: 'doc-001',     // Dr. Arjun Mehta
    // ── Continuity of Care ───────────────────────────────────────────
    primaryDoctorId: 'doc-001',       // Dr. Arjun Mehta (Cardiology)
    emergencyType: 'Cardiac Arrhythmia',
    // ─────────────────────────────────────────────────────────────────
    budget: 'high',
    priority: 'best_doctor',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=AnilKapoor',
    bloodGroup: 'A+',
    age: 58,
    healthExpenses: [
      { month: 'Nov 2024', amount: 12000, category: 'Cardiology Consult + ECG' },
      { month: 'Dec 2024', amount: 8500,  category: 'Medicines (Cardiac)' },
      { month: 'Jan 2025', amount: 22000, category: 'Echo + Stress Test' },
      { month: 'Feb 2025', amount: 9500,  category: 'Cardiology Follow-up' },
      { month: 'Mar 2025', amount: 6800,  category: 'Medicines (Cardiac)' },
      { month: 'Apr 2025', amount: 15000, category: 'ECG + Holter Monitor' },
    ],
    medicalHistory: [
      { year: 2019, event: 'Mild angina — DES stent placed (Ruby Hall Clinic)' },
      { year: 2021, event: 'Cardiac rehabilitation — 3 months' },
      { year: 2023, event: 'Follow-up angiography — no new blockages' },
      { year: 2024, event: 'PAF detected — started amiodarone + rivaroxaban' },
    ],
  },

  {
    // DEMO PATIENT 2 — Diabetic case, triggers Dr. Anjali Tiwari on emergency
    id: 'u-002',
    name: 'Priya Iyer',
    email: 'priya@demo.com',
    password: 'demo123',
    user_type: 'user',
    insurance: 'Ayushman Bharat',
    enrolledSchemes: ['Ayushman Bharat (PM-JAY)'],
    medicalConditions: 'Type 2 Diabetes, Hypertension, Early nephropathy',
    preferredHospitalId: 'hosp-005',  // KEM Hospital
    preferredDoctorId: 'doc-012',     // Dr. Anjali Tiwari
    // ── Continuity of Care ───────────────────────────────────────────
    primaryDoctorId: 'doc-012',       // Dr. Anjali Tiwari (General Medicine)
    emergencyType: 'Diabetic Emergency',
    // ─────────────────────────────────────────────────────────────────
    budget: 'low',
    priority: 'cheapest',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=PriyaIyer',
    bloodGroup: 'O+',
    age: 45,
    healthExpenses: [
      { month: 'Nov 2024', amount: 800,  category: 'Diabetes Medicines' },
      { month: 'Dec 2024', amount: 1100, category: 'OPD + Blood Tests' },
      { month: 'Jan 2025', amount: 950,  category: 'Diabetes Medicines' },
      { month: 'Feb 2025', amount: 2200, category: 'Endocrinology Consult' },
      { month: 'Mar 2025', amount: 750,  category: 'Diabetes Medicines' },
      { month: 'Apr 2025', amount: 1300, category: 'OPD + HbA1c Test' },
    ],
    medicalHistory: [
      { year: 2020, event: 'Type 2 Diabetes diagnosed — oral medication started' },
      { year: 2022, event: 'Hypertension — managed with telmisartan' },
      { year: 2024, event: 'Hypoglycemic episode — hospital visit (KEM)' },
    ],
  },

  {
    // DEMO PATIENT 3 — Neuro case, triggers Dr. Priya Sharma on emergency
    id: 'u-003',
    name: 'Rohan Desai',
    email: 'rohan@demo.com',
    password: 'demo123',
    user_type: 'user',
    insurance: 'Star Health',
    enrolledSchemes: [],
    medicalConditions: 'Chronic migraines, mild hypertension, stress-induced episodes',
    preferredHospitalId: 'hosp-001',  // Ruby Hall Clinic
    preferredDoctorId: 'doc-002',     // Dr. Priya Sharma
    // ── Continuity of Care ───────────────────────────────────────────
    primaryDoctorId: 'doc-002',       // Dr. Priya Sharma (Neurology)
    emergencyType: 'Acute Neurological Episode',
    // ─────────────────────────────────────────────────────────────────
    budget: 'medium',
    priority: 'nearest',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=RohanDesai',
    bloodGroup: 'B+',
    age: 34,
    healthExpenses: [
      { month: 'Nov 2024', amount: 2400, category: 'OPD' },
      { month: 'Dec 2024', amount: 1200, category: 'Medicines' },
      { month: 'Jan 2025', amount: 5800, category: 'Neurology Consult' },
      { month: 'Feb 2025', amount: 900,  category: 'Medicines' },
      { month: 'Mar 2025', amount: 3100, category: 'Imaging (MRI)' },
      { month: 'Apr 2025', amount: 2200, category: 'OPD' },
    ],
    medicalHistory: [
      { year: 2022, event: 'Chronic migraine diagnosed — topiramate started' },
      { year: 2023, event: 'MRI Brain — mild white matter changes (non-acute)' },
      { year: 2024, event: 'Mild hypertension detected — amlodipine added' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // HOSPITAL ADMINS
  // ════════════════════════════════════════════════════════════════════

  {
    // DEMO HOSPITAL 1 — Ruby Hall: premium, cardiac specialist, sees Anil's emergency
    id: 'h-admin-001',
    name: 'Admin — Ruby Hall Clinic',
    email: 'rubyhall@demo.com',
    password: 'demo123',
    user_type: 'hospital',
    hospitalId: 'hosp-001',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=RubyHall',
  },

  {
    // DEMO HOSPITAL 2 — KEM Hospital: public multi-specialty, sees Priya's emergency
    id: 'h-admin-002',
    name: 'Admin — KEM Hospital',
    email: 'kem@demo.com',
    password: 'demo123',
    user_type: 'hospital',
    hospitalId: 'hosp-005',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=KEMHospital',
  },

  {
    // DEMO HOSPITAL 3 — Sahyadri: mid-tier, sees Rohan's neuro emergency
    id: 'h-admin-003',
    name: 'Admin — Sahyadri Hospital',
    email: 'sahyadri@demo.com',
    password: 'demo123',
    user_type: 'hospital',
    hospitalId: 'hosp-003',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sahyadri',
  },

  // ════════════════════════════════════════════════════════════════════
  // DOCTORS
  // ════════════════════════════════════════════════════════════════════

  {
    // DEMO DOCTOR 1 — Dr. Arjun Mehta, Cardiology
    // Gets emergency alert when Anil Kapoor calls ambulance
    id: 'd-001',
    name: 'Dr. Arjun Mehta',
    email: 'arjun@demo.com',
    password: 'demo123',
    user_type: 'doctor',
    doctorId: 'doc-001',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=ArjunMehta',
  },

  {
    // DEMO DOCTOR 2 — Dr. Anjali Tiwari, General Medicine
    // Gets emergency alert when Priya Iyer calls ambulance
    id: 'd-002',
    name: 'Dr. Anjali Tiwari',
    email: 'anjali@demo.com',
    password: 'demo123',
    user_type: 'doctor',
    doctorId: 'doc-012',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=AnjaliTiwari',
  },

  {
    // DEMO DOCTOR 3 — Dr. Priya Sharma, Neurology
    // Gets emergency alert when Rohan Desai calls ambulance
    id: 'd-003',
    name: 'Dr. Priya Sharma',
    email: 'priya.doc@demo.com',
    password: 'demo123',
    user_type: 'doctor',
    doctorId: 'doc-002',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=PriyaSharma',
  },
];

// ── Demo quick-login shortcuts ────────────────────────────────────────────────
// Index reference:  0=Anil  1=Priya  2=Rohan  3=RubyHall  4=KEM  5=Sahyadri  6=Arjun  7=Anjali  8=Priya.doc
export const DEMO_ACCOUNTS = {
  // Patients
  user:          mockUsers[0],  // Anil Kapoor  — Cardiac, → Dr. Arjun Mehta
  user2:         mockUsers[1],  // Priya Iyer   — Diabetic, → Dr. Anjali Tiwari
  user3:         mockUsers[2],  // Rohan Desai  — Neuro,   → Dr. Priya Sharma

  // Hospitals
  hospitalAdmin:  mockUsers[3], // Ruby Hall Clinic (receives Anil's specialist banner)
  hospitalAdmin2: mockUsers[4], // KEM Hospital     (receives Priya's specialist banner)
  hospitalAdmin3: mockUsers[5], // Sahyadri         (receives Rohan's specialist banner)

  // Doctors (emergency-flow aware)
  doctor:        mockUsers[6],  // Dr. Arjun Mehta   — alerted for Anil
  doctor2:       mockUsers[7],  // Dr. Anjali Tiwari  — alerted for Priya
  doctor3:       mockUsers[8],  // Dr. Priya Sharma   — alerted for Rohan
};
