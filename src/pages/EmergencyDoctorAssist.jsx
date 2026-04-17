/**
 * EmergencyDoctorAssist.jsx — Full emergency assist view for the doctor.
 *
 * Shown inside DoctorDashboard when an emergency alert is active.
 * Composed from Care components — no direct API calls here.
 *
 * LAYOUT: Uses fixed viewport height (100dvh) with a sticky header
 * and a scrollable body so the entire page scrolls naturally on mobile.
 */

import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import EmergencyAlertCard from '../components/Care/EmergencyAlertCard';
import LiveVitalsPanel    from '../components/Care/LiveVitalsPanel';
import PatientReportsPanel from '../components/Care/PatientReportsPanel';
import RecommendationModal from '../components/Care/RecommendationModal';
import { sendRecommendation }  from '../services/careService';

const EmergencyDoctorAssist = ({
  alert,          // active notification alert object
  doctor,         // the logged-in doctor object
  isDark = false,
  onBack,         // callback to go back to normal dashboard tabs
}) => {
  const [showModal, setShowModal] = useState(false);
  const [localAlert, setLocalAlert] = useState(alert);

  const bg           = isDark ? 'bg-slate-900' : 'bg-gray-50';
  const textPrimary  = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  const handleSendRecommendation = (text) => {
    sendRecommendation(localAlert.id, text, doctor?.name || 'Doctor', localAlert.patientId);
    setLocalAlert(prev => ({
      ...prev,
      recommendation: {
        text,
        doctorName: doctor?.name || 'Doctor',
        timestamp: Date.now(),
      },
    }));
    setShowModal(false);
  };

  return (
    /*
     * FIXED: Use position:fixed to break out of parent flex constraints.
     * This gives us a true full-viewport container with a scrollable body.
     */
    <div
      className={`${bg}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <div
        className={`px-4 py-4 flex items-center gap-3 border-b shrink-0
          ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}
      >
        <button
          onClick={onBack}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
            ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Emergency Case Active
            </p>
          </div>
          <h1 className={`text-base font-black truncate ${textPrimary}`}>
            {localAlert?.patientName || 'Unknown Patient'}
          </h1>
        </div>

        {/* Emergency badge */}
        <div className="shrink-0 flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-wider">
            {localAlert?.emergencyType || 'Emergency'}
          </span>
        </div>
      </div>

      {/* ── Scrollable content ──────────────────────────────────────── */}
      <div
        className="px-4 py-5 pb-10 space-y-4"
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch', // smooth iOS scroll
        }}
      >
        {/* 1 — Alert card with action buttons */}
        <EmergencyAlertCard
          alert={localAlert}
          isDark={isDark}
          onViewCase={() => {
            document.getElementById('reports-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onJoinConsultation={() => {
            // Visual feedback already handled inside EmergencyAlertCard
          }}
          onSendRecommendation={() => setShowModal(true)}
        />

        {/* 2 — Live vitals */}
        <SectionLabel label="❤️ Live Vitals (Simulated)" isDark={isDark} />
        <LiveVitalsPanel
          patientId={localAlert?.patientId}
          isDark={isDark}
        />

        {/* 3 — Patient medical records */}
        <div id="reports-section">
          <SectionLabel label="📄 Patient Medical Records" isDark={isDark} />
          <PatientReportsPanel
            patientId={localAlert?.patientId}
            isDark={isDark}
          />
        </div>

        {/* Bottom send button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black uppercase tracking-wider text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          {localAlert?.recommendation ? '✅ Update Recommendation' : '🩺 Send Treatment Recommendation'}
        </button>

      </div>

      {/* Recommendation Modal */}
      {showModal && (
        <RecommendationModal
          alert={localAlert}
          doctorName={doctor?.name}
          isDark={isDark}
          onSubmit={handleSendRecommendation}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// ── Section label helper ───────────────────────────────────────────────────────
const SectionLabel = ({ label, isDark }) => (
  <p className={`text-[11px] font-black uppercase tracking-widest px-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
    {label}
  </p>
);

export default EmergencyDoctorAssist;
