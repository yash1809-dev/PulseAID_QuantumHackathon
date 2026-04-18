/**
 * IncomingPatient.jsx — Hospital admin view for incoming ambulance & patient.
 *
 * OVERHAULED: Now shows:
 *  1. Status header (Preparing / En Route / Arrived)
 *  2. LIVE Mapbox mini-map (ambulance moving toward hospital)
 *  3. Patient brief card (from alertsStore)
 *  4. Medical record snapshot (blood group, allergies, meds)
 *  5. Preparation checklist
 *  6. Contact Family Doctor chat button
 */

import React, { useState, useEffect } from 'react';
import {
  Ambulance, Clock, Navigation, CheckCircle, CheckCircle2,
  AlertTriangle, Heart, Pill, Syringe, User, MessageCircle,
  Phone, Activity, Droplets, Maximize2, Minimize2, X, FileText
} from 'lucide-react';
import HospitalIncomingMap from './HospitalIncomingMap';
import DoctorHospitalChat  from '../Care/DoctorHospitalChat';
import CategoryRecordList  from '../Records/CategoryRecordList';
import { alertsStore, ambulanceStore } from '../../services/syncService';
import { getSnapshotById } from '../../services/emergencySnapshotService';
import { getRecordsByUser } from '../../services/recordsService';
import { mockUsers }       from '../../data/users';

const IncomingPatient = ({
  activeRequest,
  hospitalId,
  hospitals = [],
  ambulances = [],
  isDark = false,
}) => {
  const [showChat, setShowChat]       = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeAlert, setActiveAlert]   = useState(null);
  const [snapshot, setSnapshot]         = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [liveAmbulance, setLiveAmbulance] = useState(() => ambulanceStore.get());

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary    = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary  = isDark ? 'text-slate-400' : 'text-gray-500';
  const sectionBg      = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  const hospital = hospitals.find(h => h.id === hospitalId);

  // ── Listen to alertsStore to find the patient alert for this hospital ────
  useEffect(() => {
    const hydrate = () => {
      const all = alertsStore.get() || [];
      const found = all.find(a => a.hospitalId === hospitalId && a.status !== 'resolved');
      setActiveAlert(found || null);
    };
    hydrate();
    return alertsStore.subscribe(() => hydrate());
  }, [hospitalId]);

  // ── Subscribe to live ambulance store for phase info ─────────────────────
  useEffect(() => {
    setLiveAmbulance(ambulanceStore.get());
    return ambulanceStore.subscribe(data => setLiveAmbulance(data));
  }, []);

  // ── Load medical snapshot when alert has snapshotId ───────────────────────
  useEffect(() => {
    if (!activeAlert?.snapshotId) {
      setSnapshot(null);
      return;
    }
    getSnapshotById(activeAlert.snapshotId)
      .then(({ data }) => setSnapshot(data))
      .catch(() => setSnapshot(null));
  }, [activeAlert?.snapshotId]);

  // ── Load patient's uploaded documents ───────────────────────────────────────
  useEffect(() => {
    if (!activeAlert?.patientId) {
      setPatientRecords([]);
      return;
    }
    setLoadingRecords(true);
    getRecordsByUser(activeAlert.patientId)
      .then(({ data }) => setPatientRecords(data || []))
      .catch(() => setPatientRecords([]))
      .finally(() => setLoadingRecords(false));
  }, [activeAlert?.patientId]);

  // ── Get fallback patient data from mock users ─────────────────────────────
  const mockPatient = activeAlert?.patientId
    ? mockUsers.find(u => u.id === activeAlert.patientId)
    : null;

  // ── Only show if request is assigned to this hospital ─────────────────────
  const isAssigned = activeRequest && activeRequest.hospitalId === hospitalId;

  if (!isAssigned) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
          🚑
        </div>
        <p className={`text-base font-black ${textPrimary}`}>No Incoming Patients</p>
        <p className={`text-sm ${textSecondary} max-w-xs`}>
          When a patient is dispatched to your hospital, their live status and medical record will appear here.
        </p>
      </div>
    );
  }

  const STATUS_INFO = {
    // Phase-aware status map — keyed by ambulanceStore.phase or activeRequest.status
    to_patient: {
      label: '🚑 En Route to Patient',
      color: 'from-blue-600 to-indigo-600',
      icon: Ambulance,
      sub: 'Ambulance dispatched — heading to patient location',
    },
    pickup: {
      label: '⏳ Picking Up Patient...',
      color: 'from-amber-500 to-orange-500',
      icon: Clock,
      sub: 'Ambulance reached patient — loading patient on board',
    },
    to_hospital: {
      label: '🚨 Transporting Patient to Hospital',
      color: 'from-red-600 to-rose-600',
      icon: Ambulance,
      sub: 'Patient on board — en route to your ER',
    },
    pending: {
      label: 'Preparing Dispatch',
      color: 'from-orange-500 to-amber-500',
      icon: Clock,
      sub: 'Ambulance being assigned',
    },
    arrived: {
      label: '✅ Patient Arrived at Hospital',
      color: 'from-green-600 to-emerald-600',
      icon: CheckCircle,
      sub: 'Please receive the patient at ER entrance',
    },
    en_route: {
      label: '🚑 En Route to Patient',
      color: 'from-blue-600 to-indigo-600',
      icon: Ambulance,
      sub: 'Ambulance dispatched — heading to patient location',
    },
  };

  // Determine current phase: prefer ambulanceStore phase, fallback to activeRequest.status
  const currentPhase = liveAmbulance?.phase || activeRequest?.status || 'pending';
  const info = STATUS_INFO[currentPhase] || STATUS_INFO.pending;
  const { label, color, icon: Icon, sub } = info;

  // ETA: for to_hospital phase, use ambulanceStore.eta; otherwise use activeRequest.eta
  const displayEta = currentPhase === 'to_hospital'
    ? (liveAmbulance?.eta || activeRequest?.eta || '—')
    : (currentPhase === 'arrived' ? '0 min' : currentPhase === 'pending' ? '—' : activeRequest?.eta || '—');
  const displayDist = currentPhase === 'arrived' ? '0 m' : currentPhase === 'pickup' ? '0 m' : (activeRequest?.distance || '—');

  // Determine doctor name from alert
  const doctorName = activeAlert?.doctorName || 'Family Doctor';
  const patientName = activeAlert?.patientName || mockPatient?.name || 'Unknown Patient';

  // Medical data — prefer live snapshot, fallback to mock user data
  const bloodGroup      = snapshot?.blood_group        || mockPatient?.bloodGroup || '—';
  const allergies       = snapshot?.allergies           || [];
  const medications     = snapshot?.current_medications || [];
  const conditions      = snapshot?.chronic_diseases    || (mockPatient?.medicalConditions ? [mockPatient.medicalConditions] : []);
  const emergencyType   = activeAlert?.emergencyType    || 'Emergency Admission';
  const age             = activeAlert?.age              || mockPatient?.age || '—';
  const hasMedicalData  = bloodGroup !== '—' || allergies.length > 0 || medications.length > 0;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Status Banner ──────────────────────────────────────────────── */}
      <div className={`rounded-2xl overflow-hidden border ${card}`}>
        <div className={`bg-gradient-to-r ${color} px-5 py-4 flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-base">{label}</p>
            <p className="text-white/70 text-xs mt-0.5">{sub}</p>
          </div>
          {(currentPhase === 'to_patient' || currentPhase === 'to_hospital' || currentPhase === 'en_route') && (
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
          )}
        </div>

        {/* ETA / Distance */}
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          <div className={`${sectionBg} rounded-xl p-3`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-1 flex items-center gap-1`}>
              <Clock className="w-3 h-3" />
              {currentPhase === 'to_hospital' ? 'ETA to Hospital' : 'ETA to Patient'}
            </p>
            <p className={`text-2xl font-black ${textPrimary}`}>{displayEta}</p>
          </div>
          <div className={`${sectionBg} rounded-xl p-3`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-1 flex items-center gap-1`}>
              <Navigation className="w-3 h-3" /> Distance
            </p>
            <p className={`text-2xl font-black ${textPrimary}`}>{displayDist}</p>
          </div>
        </div>
      </div>

      {/* ── Live Ambulance Map ──────────────────────────────────────────── */}
      {currentPhase !== 'arrived' && (
        <div className={`rounded-2xl overflow-hidden border ${card}`}>
          <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'} flex items-center justify-between`}>
            <p className={`text-xs font-black uppercase tracking-wider ${textSecondary} flex items-center gap-2`}>
              <Activity className="w-3.5 h-3.5" /> Live Tracking
              {currentPhase === 'to_hospital' && (
                <span className="text-rose-500 text-[9px] font-bold bg-rose-50 px-2 py-0.5 rounded-full">Patient On Board</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> LIVE
              </span>
              <button
                onClick={() => setIsMapExpanded(true)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                title="Expand map"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="p-3">
            <HospitalIncomingMap hospital={hospital} isDark={isDark} />
          </div>
        </div>
      )}

      {/* ── Patient Brief Card ─────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-4 ${card}`}>
        <p className={`text-[10px] font-black uppercase tracking-wider ${textSecondary} mb-3 flex items-center gap-2`}>
          <User className="w-3.5 h-3.5" /> Incoming Patient
        </p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shrink-0">
            {patientName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-base font-black truncate ${textPrimary}`}>{patientName}</p>
            <p className={`text-xs font-semibold ${textSecondary}`}>Age: {age} • {activeAlert?.bloodGroup || bloodGroup}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
              🚨 {emergencyType}
            </span>
          </div>
          <div className={`text-center shrink-0`}>
            <p className={`text-[10px] ${textSecondary}`}>Ambulance</p>
            <p className={`text-xs font-black uppercase ${textPrimary}`}>{activeRequest?.ambulanceId?.toUpperCase() || '—'}</p>
          </div>
        </div>
      </div>

      {/* ── Medical Record Snapshot ────────────────────────────────────── */}
      <div className={`rounded-2xl border ${card}`}>
        <div className={`px-4 pt-4 pb-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider ${textSecondary} flex items-center gap-2`}>
            <Heart className="w-3.5 h-3.5 text-red-500" /> Medical Record
            {snapshot && <span className="text-green-500 text-[9px] font-bold">● From Patient Records</span>}
            {!snapshot && mockPatient && <span className="text-amber-500 text-[9px] font-bold">● Profile Data</span>}
          </p>
        </div>
        <div className="p-4 space-y-4">

          {/* Blood Group */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase ${textSecondary}`}>Blood Group</p>
              <p className={`text-sm font-black ${textPrimary}`}>{bloodGroup}</p>
            </div>
          </div>

          {/* Allergies */}
          {allergies.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase ${textSecondary} mb-1`}>⚠️ Allergies</p>
                <div className="flex flex-wrap gap-1.5">
                  {allergies.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conditions */}
          {conditions.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase ${textSecondary} mb-1`}>Conditions</p>
                <div className="flex flex-wrap gap-1.5">
                  {conditions.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-100">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Medications */}
          {medications.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <Pill className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold uppercase ${textSecondary} mb-1`}>Current Medications</p>
                <div className="space-y-1">
                  {medications.map((med, i) => (
                    <div key={i} className={`text-[11px] px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-50'} flex justify-between`}>
                      <span className={`font-bold ${textPrimary}`}>{med.name}</span>
                      <span className={textSecondary}>{med.dose} • {med.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!hasMedicalData && (
            <p className={`text-xs text-center py-2 ${textSecondary}`}>
              Patient has not uploaded medical records yet. Basic info from profile shown above.
            </p>
          )}
        </div>
      </div>

      {/* ── Patient Documents (uploaded records) ────────────────────────── */}
      <div className={`rounded-2xl border ${card}`}>
        <div className={`px-4 pt-4 pb-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider ${textSecondary} flex items-center gap-2`}>
            <FileText className="w-3.5 h-3.5 text-blue-500" /> Patient Documents
            {patientRecords.length > 0 && (
              <span className="text-blue-500 text-[9px] font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                {patientRecords.length} file{patientRecords.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
          <p className={`text-[10px] mt-0.5 ${textSecondary}`}>Uploaded by patient — prescriptions expand by default</p>
        </div>
        <div className="p-4">
          {loadingRecords ? (
            <p className={`text-xs text-center py-4 ${textSecondary}`}>Loading documents…</p>
          ) : (
            <CategoryRecordList
              records={patientRecords}
              isDark={isDark}
              doctorView={true}
            />
          )}
        </div>
      </div>

      {/* ── Preparation Checklist ──────────────────────────────────────── */}
      <div className={`rounded-2xl border p-4 ${card}`}>
        <p className={`text-[10px] font-black uppercase tracking-wider ${textSecondary} mb-3 flex items-center gap-2`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Preparation Checklist
        </p>
        {[
          { label: 'ICU bed allocated',         done: currentPhase !== 'pending' },
          { label: 'Medical team on standby',    done: currentPhase !== 'pending' },
          { label: `Blood type (${bloodGroup}) cross-matched`, done: currentPhase === 'to_hospital' || currentPhase === 'arrived' },
          { label: 'Emergency kit ready',        done: currentPhase === 'to_hospital' || currentPhase === 'arrived' },
          { label: 'Patient intake form prepared', done: currentPhase === 'arrived' },
          { label: 'ER team at entrance',        done: currentPhase === 'arrived' },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-slate-700' : 'border-gray-50'}`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.done ? 'text-green-500' : isDark ? 'text-slate-600' : 'text-gray-200'}`} />
            <span className={`text-sm ${item.done ? (isDark ? 'text-green-400' : 'text-green-700') : textPrimary}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Contact Family Doctor ──────────────────────────────────────── */}
      {activeAlert && (
        <button
          onClick={() => setShowChat(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-teal-500/20 hover:opacity-95 active:scale-[0.98] transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          Contact Family Doctor
          {activeAlert && (
            <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
              {activeAlert.doctorName || 'Dr. on file'}
            </span>
          )}
        </button>
      )}

      {/* ── Fullscreen Map Overlay ─────────────────────────────────────── */}
      {isMapExpanded && (
        <div className="fixed inset-0 z-[99999] flex flex-col" style={{ background: '#000' }}>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
            <div>
              <p className="text-[10px] font-black uppercase text-red-400 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> Live Ambulance Tracking
              </p>
              <p className="text-white text-sm font-black">
                {currentPhase === 'to_hospital' ? '🚨 Transporting Patient → Hospital' : '🚑 En Route to Patient'}
              </p>
            </div>
            <button
              onClick={() => setIsMapExpanded(false)}
              className="w-9 h-9 rounded-xl bg-gray-800 text-gray-300 flex items-center justify-center hover:bg-gray-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1" style={{ minHeight: 0 }}>
            <HospitalIncomingMap hospital={hospital} isDark={true} height="100%" interactive={true} />
          </div>
          <div className="px-4 py-3 bg-gray-900 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {currentPhase === 'to_hospital' ? `ETA to Hospital: ${displayEta}` : `ETA to Patient: ${displayEta}`}
            </span>
            <button
              onClick={() => setIsMapExpanded(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-400"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Minimize
            </button>
          </div>
        </div>
      )}

      {/* ── Chat Modal ─────────────────────────────────────────────────── */}
      {showChat && activeAlert && (
        <DoctorHospitalChat
          alertId={activeAlert.id}
          myRole="hospital"
          myName={hospital?.name || 'Hospital'}
          otherName={activeAlert.doctorName || doctorName}
          isDark={isDark}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default IncomingPatient;
