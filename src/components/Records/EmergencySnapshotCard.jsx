/**
 * EmergencySnapshotCard.jsx — Compact read-only emergency snapshot panel.
 *
 * Used in:
 *   • EmergencyDoctorAssist.jsx (when alert.snapshotId is present)
 *   • HospitalPortal.jsx (specialist banner area)
 *   • MedicalRecordsPage.jsx (patient's own snapshot summary)
 *
 * Props:
 *   snapshot   — pre-fetched snapshot object (used by MedicalRecordsPage)
 *   snapshotId — UUID to fetch from Supabase (used by doctor/hospital views)
 *   isDark     — dark mode flag
 *   compact    — if true, shows a smaller pill-style version
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Pill, Heart, Scissors, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { getSnapshotById } from '../../services/emergencySnapshotService';

// ── Sub-components ─────────────────────────────────────────────────────────────

const Tag = ({ label, color = 'red', isDark }) => {
  const colors = {
    red:    isDark ? 'bg-red-900/50 text-red-300 border-red-700/50'    : 'bg-red-50 text-red-700 border-red-200',
    amber:  isDark ? 'bg-amber-900/50 text-amber-300 border-amber-700/50' : 'bg-amber-50 text-amber-700 border-amber-200',
    blue:   isDark ? 'bg-blue-900/50 text-blue-300 border-blue-700/50'  : 'bg-blue-50 text-blue-700 border-blue-200',
    green:  isDark ? 'bg-green-900/50 text-green-300 border-green-700/50' : 'bg-green-50 text-green-700 border-green-200',
    slate:  isDark ? 'bg-slate-700 text-slate-300 border-slate-600'     : 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${colors[color]}`}>
      {label}
    </span>
  );
};

const SnapshotSection = ({ Icon, title, children, iconColor, isDark }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1.5">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
        {title}
      </span>
    </div>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const EmergencySnapshotCard = ({
  snapshot:   propSnapshot = null,
  snapshotId  = null,
  isDark      = false,
  compact     = false,
}) => {
  const [snapshot, setSnapshot] = useState(propSnapshot);
  const [loading,  setLoading]  = useState(!propSnapshot && !!snapshotId);
  const [error,    setError]    = useState(null);

  // Fetch by ID if not pre-loaded
  useEffect(() => {
    if (propSnapshot) { setSnapshot(propSnapshot); return; }
    if (!snapshotId)  return;

    setLoading(true);
    getSnapshotById(snapshotId)
      .then(({ data, error }) => {
        if (error) setError(error);
        else       setSnapshot(data);
      })
      .finally(() => setLoading(false));
  }, [snapshotId, propSnapshot]);

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';

  // ── Loading state ──
  if (loading) {
    return (
      <div className={`rounded-2xl border p-4 ${card} flex items-center gap-2`}>
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Loading medical snapshot…
        </span>
      </div>
    );
  }

  // ── Error / empty state ──
  if (error || !snapshot) return null;

  const {
    blood_group,
    allergies = [],
    chronic_diseases = [],
    current_medications = [],
    previous_surgeries = [],
    last_updated,
  } = snapshot;

  // compact = used in DoctorDashboard emergency panel
  if (compact) {
    return (
      <div className={`rounded-xl border p-3 ${isDark ? 'bg-red-950/30 border-red-800/40' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span className="text-[11px] font-black uppercase tracking-widest text-red-500">
            Emergency Medical Summary
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {blood_group && <Tag label={`🩸 ${blood_group}`} color="red" isDark={isDark} />}
          {allergies.slice(0, 3).map(a => (
            <Tag key={a} label={`⚠️ ${a}`} color="amber" isDark={isDark} />
          ))}
          {chronic_diseases.slice(0, 2).map(d => (
            <Tag key={d} label={d} color="blue" isDark={isDark} />
          ))}
          {current_medications.slice(0, 3).map(m => (
            <Tag key={m.name} label={`💊 ${m.name}`} color="slate" isDark={isDark} />
          ))}
        </div>
      </div>
    );
  }

  // ── Full card ──
  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b
        ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-r from-red-50 to-orange-50 border-gray-100'}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Emergency Medical Snapshot
            </p>
            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              Verified · {last_updated ? new Date(last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
            </p>
          </div>
        </div>
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Blood Group */}
        {blood_group && (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
              ${isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}
            >
              {blood_group}
            </div>
            <div>
              <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Blood Group
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                For transfusions and compatibility
              </p>
            </div>
          </div>
        )}

        {/* Allergies */}
        {allergies.length > 0 && (
          <SnapshotSection Icon={AlertTriangle} title="Allergies" iconColor="text-amber-500" isDark={isDark}>
            {allergies.map(a => <Tag key={a} label={a} color="amber" isDark={isDark} />)}
          </SnapshotSection>
        )}

        {/* Chronic Diseases */}
        {chronic_diseases.length > 0 && (
          <SnapshotSection Icon={Heart} title="Chronic Conditions" iconColor="text-red-500" isDark={isDark}>
            {chronic_diseases.map(d => <Tag key={d} label={d} color="red" isDark={isDark} />)}
          </SnapshotSection>
        )}

        {/* Current Medications */}
        {current_medications.length > 0 && (
          <SnapshotSection Icon={Pill} title="Current Medications" iconColor="text-blue-500" isDark={isDark}>
            {current_medications.map(m => (
              <div
                key={m.name}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium
                  ${isDark ? 'bg-blue-900/30 text-blue-200 border-blue-700/40' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
              >
                <span className="font-black">{m.name}</span>
                {m.dose && <span className="opacity-70"> · {m.dose}</span>}
                {m.frequency && <span className="opacity-60"> · {m.frequency}</span>}
              </div>
            ))}
          </SnapshotSection>
        )}

        {/* Previous Surgeries */}
        {previous_surgeries.length > 0 && (
          <SnapshotSection Icon={Scissors} title="Past Surgeries" iconColor="text-purple-500" isDark={isDark}>
            {previous_surgeries.map(s => <Tag key={s} label={s} color="slate" isDark={isDark} />)}
          </SnapshotSection>
        )}

        {/* Empty state */}
        {!blood_group && allergies.length === 0 && chronic_diseases.length === 0 &&
         current_medications.length === 0 && previous_surgeries.length === 0 && (
          <p className={`text-xs text-center py-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            No data extracted yet. Upload a medical record to begin.
          </p>
        )}
      </div>
    </div>
  );
};

export default EmergencySnapshotCard;
