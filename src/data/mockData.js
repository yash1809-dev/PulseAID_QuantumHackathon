export const initialHospitals = [
  {
    id: 'hosp-001',
    name: 'Ruby Hall Clinic',
    lat: 18.5309,
    lng: 73.8770,
    icu_total: 40,
    icu_available: 12,
    last_updated: Date.now()
  },
  {
    id: 'hosp-002',
    name: 'Deenanath Mangeshkar Hospital',
    lat: 18.5028,
    lng: 73.8267,
    icu_total: 60,
    icu_available: 0, // Simulate full initially
    last_updated: Date.now()
  },
  {
    id: 'hosp-003',
    name: 'Sahyadri Super Speciality Hospital',
    lat: 18.5147,
    lng: 73.8375,
    icu_total: 30,
    icu_available: 5,
    last_updated: Date.now()
  },
  {
    id: 'hosp-004',
    name: 'Jehangir Hospital',
    lat: 18.5298,
    lng: 73.8765,
    icu_total: 35,
    icu_available: 8,
    last_updated: Date.now()
  },
  {
    id: 'hosp-005',
    name: 'KEM Hospital',
    lat: 18.5218,
    lng: 73.8687,
    icu_total: 50,
    icu_available: 20,
    last_updated: Date.now()
  },
  {
    id: 'hosp-006',
    name: 'Inlaks and Budhrani Hospital',
    lat: 18.5342,
    lng: 73.8906,
    icu_total: 25,
    icu_available: 2,
    last_updated: Date.now()
  },
  {
    id: 'hosp-007',
    name: 'Noble Hospital',
    lat: 18.5033,
    lng: 73.9304,
    icu_total: 45,
    icu_available: 10,
    last_updated: Date.now()
  },
  {
    id: 'hosp-008',
    name: 'Poona Hospital & Research Centre',
    lat: 18.5098,
    lng: 73.8447,
    icu_total: 28,
    icu_available: 6,
    last_updated: Date.now()
  }
];

// Initial ambulance locations intentionally near hospitals
export const initialAmbulances = [
  {
    id: 'amb-001',
    plateNumber: 'MH-12-AM-101',
    driverName: 'Ramesh Kumar',
    type: 'Advance Life Support',
    lat: 18.5300,
    lng: 73.8760,
    status: 'available',
    speed: 40
  },
  {
    id: 'amb-002',
    plateNumber: 'MH-12-AM-102',
    driverName: 'Suresh Patil',
    type: 'Basic Life Support',
    lat: 18.5035,
    lng: 73.8275,
    status: 'available',
    speed: 40
  },
  {
    id: 'amb-003',
    plateNumber: 'MH-12-AM-103',
    driverName: 'Anita Deshmukh',
    type: 'Cardiac Care',
    lat: 18.5220,
    lng: 73.8690,
    status: 'available',
    speed: 40
  },
  {
    id: 'amb-004',
    plateNumber: 'MH-12-AM-104',
    driverName: 'Vikram Singh',
    type: 'Basic Life Support',
    lat: 18.5110,
    lng: 73.8450,
    status: 'busy',
    speed: 40
  },
  {
    id: 'amb-005',
    plateNumber: 'MH-12-AM-105',
    driverName: 'Pooja Hegde',
    type: 'Advance Life Support',
    lat: 18.5140,
    lng: 73.8360,
    status: 'available',
    speed: 40
  }
];
