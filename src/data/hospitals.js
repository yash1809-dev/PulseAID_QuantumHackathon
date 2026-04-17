/**
 * hospitals.js — Extended hospital data
 *
 * IDs match exactly with mockData.js initialHospitals.
 * This file adds: costLevel, insuranceAccepted, doctors, specialties,
 * phone, address, rating, emergencyReady.
 *
 * hospitalService.js merges this with ICU data from mockData.js at runtime.
 * UI never imports this file directly.
 */

export const extendedHospitals = [
  {
    id: 'hosp-001',
    name: 'Ruby Hall Clinic',
    address: 'Sassoon Road, Camp, Pune - 411001',
    phone: '+91-20-6645-5000',
    rating: 4.6,
    type: 'Multi-Speciality',
    costLevel: 'high',
    emergencyReady: true,
    insuranceAccepted: ['Star Health', 'ICICI Lombard', 'Bajaj Allianz', 'Mediassist'],
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
    doctorIds: ['doc-001', 'doc-002', 'doc-007'],
  },
  {
    id: 'hosp-002',
    name: 'Deenanath Mangeshkar Hospital',
    address: 'Erandwane, Pune - 411004',
    phone: '+91-20-4015-1000',
    rating: 4.5,
    type: 'Super Speciality',
    costLevel: 'high',
    emergencyReady: true,
    insuranceAccepted: ['Ayushman Bharat', 'Star Health', 'Religare', 'Mediassist'],
    specialties: ['Cardiology', 'Gynecology', 'Pediatrics', 'General Surgery'],
    doctorIds: ['doc-002', 'doc-004', 'doc-008'],
  },
  {
    id: 'hosp-003',
    name: 'Sahyadri Super Speciality Hospital',
    address: 'Karve Road, Deccan, Pune - 411004',
    phone: '+91-20-6721-3000',
    rating: 4.4,
    type: 'Super Speciality',
    costLevel: 'medium',
    emergencyReady: true,
    insuranceAccepted: ['ICICI Lombard', 'Bajaj Allianz', 'New India Assurance', 'Ayushman Bharat'],
    specialties: ['Neurology', 'Orthopedics', 'Urology', 'Nephrology'],
    doctorIds: ['doc-003', 'doc-005', 'doc-009'],
  },
  {
    id: 'hosp-004',
    name: 'Jehangir Hospital',
    address: '32 Sassoon Road, Camp, Pune - 411001',
    phone: '+91-20-6681-3000',
    rating: 4.3,
    type: 'Multi-Speciality',
    costLevel: 'medium',
    emergencyReady: true,
    insuranceAccepted: ['Star Health', 'United India', 'Oriental Insurance', 'Religare'],
    specialties: ['Cardiology', 'Oncology', 'Gastroenterology', 'Orthopedics'],
    doctorIds: ['doc-001', 'doc-006', 'doc-010'],
  },
  {
    id: 'hosp-005',
    name: 'KEM Hospital',
    address: 'Rasta Peth, Pune - 411011',
    phone: '+91-20-2618-4444',
    rating: 4.1,
    type: 'Government',
    costLevel: 'low',
    emergencyReady: true,
    insuranceAccepted: ['Ayushman Bharat', 'Mahatma Phule Jan Arogya', 'New India Assurance'],
    specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology'],
    doctorIds: ['doc-004', 'doc-011', 'doc-012'],
  },
  {
    id: 'hosp-006',
    name: 'Inlaks and Budhrani Hospital',
    address: 'Koregaon Park, Pune - 411001',
    phone: '+91-20-2616-6666',
    rating: 4.2,
    type: 'Multi-Speciality',
    costLevel: 'medium',
    emergencyReady: false,
    insuranceAccepted: ['ICICI Lombard', 'Bajaj Allianz', 'Star Health', 'Mediassist'],
    specialties: ['Orthopedics', 'Spine Surgery', 'Sports Medicine'],
    doctorIds: ['doc-003', 'doc-007', 'doc-013'],
  },
  {
    id: 'hosp-007',
    name: 'Noble Hospital',
    address: 'Hadapsar, Pune - 411013',
    phone: '+91-20-6764-1000',
    rating: 4.0,
    type: 'Multi-Speciality',
    costLevel: 'low',
    emergencyReady: true,
    insuranceAccepted: ['Ayushman Bharat', 'United India', 'National Insurance', 'Star Health'],
    specialties: ['General Surgery', 'Cardiology', 'Neurology', 'ENT'],
    doctorIds: ['doc-005', 'doc-008', 'doc-014'],
  },
  {
    id: 'hosp-008',
    name: 'Poona Hospital & Research Centre',
    address: 'Sadashiv Peth, Pune - 411030',
    phone: '+91-20-2445-6001',
    rating: 3.9,
    type: 'Research Hospital',
    costLevel: 'low',
    emergencyReady: true,
    insuranceAccepted: ['Mahatma Phule Jan Arogya', 'Ayushman Bharat', 'National Insurance'],
    specialties: ['General Medicine', 'Geriatrics', 'Pulmonology'],
    doctorIds: ['doc-006', 'doc-009', 'doc-015'],
  },
];

export const INSURANCE_OPTIONS = [
  'Star Health',
  'ICICI Lombard',
  'Bajaj Allianz',
  'Ayushman Bharat',
  'Mediassist',
  'Religare',
  'United India',
  'National Insurance',
  'New India Assurance',
  'Mahatma Phule Jan Arogya',
  'Oriental Insurance',
];

export const COST_LEVELS = ['low', 'medium', 'high'];
export const PRIORITIES = ['nearest', 'cheapest', 'best_doctor'];
