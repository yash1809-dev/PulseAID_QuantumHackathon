/**
 * PatientReportsPanel.jsx — Historical records viewer for doctor.
 * Tabs: Past Reports | Prescriptions | Test History
 */

import React, { useState, useMemo } from 'react';
import {
  FileText, Pill, TestTube2, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import {
  getPatientReports,
  getPrescriptions,
  getTestHistory,
} from '../../services/reportService';

const TABS = [
  { id: 'reports',       label: 'Reports',       Icon: FileText   },
  { id: 'prescriptions', label: 'Prescriptions', Icon: Pill       },
  { id: 'tests',         label: 'Test History',  Icon: TestTube2  },
];

const PatientReportsPanel = ({ patientId, isDark = false }) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [expanded, setExpanded] = useState(null);

  const reports       = useMemo(() => getPatientReports(patientId),   [patientId]);
  const prescriptions = useMemo(() => getPrescriptions(patientId),    [patientId]);
  const tests         = useMemo(() => getTestHistory(patientId),      [patientId]);

  const card          = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const headerBg      = isDark ? 'bg-slate-700/50' : 'bg-gray-50';
  const textPrimary   = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const divider       = isDark ? 'divide-slate-700' : 'divide-gray-100';

  const toggleExpand = (id) => setExpanded(prev => (prev === id ? null : id));

  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      {/* Panel header */}
      <div className={`px-4 py-3 flex items-center gap-2 ${headerBg}`}>
        <FileText className="w-4 h-4 text-blue-500" />
        <span className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
          Patient Medical Records
        </span>
      </div>

      {/* Tab bar */}
      <div className={`flex border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all border-b-2
              ${activeTab === id
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${textSecondary} hover:${textPrimary}`
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={`divide-y ${divider} max-h-72 overflow-y-auto`}>

        {/* ── Reports Tab ──────────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          reports.length === 0 ? (
            <Empty label="No reports found." isDark={isDark} />
          ) : (
            reports.map(r => (
              <div key={r.id}>
                <button
                  onClick={() => toggleExpand(r.id)}
                  className={`w-full flex items-start justify-between px-4 py-3 text-left transition-colors
                    ${isDark ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <StatusIcon status={r.status} />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${textPrimary}`}>{r.type}</p>
                      <p className={`text-[11px] ${textSecondary} truncate`}>{r.summary}</p>
                      <p className={`text-[10px] ${textSecondary} mt-0.5`}>
                        {r.date} · {r.doctor} · {r.hospital}
                      </p>
                    </div>
                  </div>
                  {expanded === r.id
                    ? <ChevronUp className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${textSecondary}`} />
                    : <ChevronDown className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${textSecondary}`} />
                  }
                </button>

                {expanded === r.id && (
                  <div className={`px-4 pb-4 ${isDark ? 'bg-slate-700/30' : 'bg-blue-50/40'}`}>
                    <p className={`text-xs leading-relaxed ${textPrimary}`}>{r.details}</p>
                  </div>
                )}
              </div>
            ))
          )
        )}

        {/* ── Prescriptions Tab ─────────────────────────────────────────── */}
        {activeTab === 'prescriptions' && (
          prescriptions.length === 0 ? (
            <Empty label="No prescriptions found." isDark={isDark} />
          ) : (
            prescriptions.map(p => (
              <div key={p.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isDark ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
                    <Pill className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${textPrimary}`}>{p.drug}</p>
                    <p className={`text-[11px] ${textSecondary}`}>{p.frequency} · {p.duration}</p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
                      For: {p.indication}
                    </p>
                    <p className={`text-[10px] ${textSecondary}`}>{p.date} · {p.doctor}</p>
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* ── Test History Tab ──────────────────────────────────────────── */}
        {activeTab === 'tests' && (
          tests.length === 0 ? (
            <Empty label="No test history found." isDark={isDark} />
          ) : (
            tests.map((t, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDark ? 'bg-purple-400' : 'bg-purple-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${textPrimary}`}>{t.test}</p>
                  <p className={`text-[10px] ${textSecondary}`}>{t.date}</p>
                </div>
                <p className={`text-[11px] font-semibold text-right max-w-[45%] ${
                  t.result?.toLowerCase().includes('critical') || t.result?.toLowerCase().includes('high')
                    ? 'text-red-500'
                    : t.result?.toLowerCase().includes('normal')
                    ? 'text-green-600'
                    : textSecondary
                }`}>
                  {t.result}
                </p>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const StatusIcon = ({ status }) => {
  if (status === 'critical')
    return <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
  if (status === 'reviewed')
    return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />;
  return <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
};

const Empty = ({ label, isDark }) => (
  <div className={`flex items-center justify-center py-8 ${isDark ? 'text-slate-500' : 'text-gray-400'} text-xs`}>
    {label}
  </div>
);

export default PatientReportsPanel;
