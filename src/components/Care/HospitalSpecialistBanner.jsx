/**
 * HospitalSpecialistBanner.jsx — Shown in HospitalPortal when an external
 * doctor is actively assisting with an emergency case.
 */

import React, { useState } from 'react';
import { Stethoscope, CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';

const HospitalSpecialistBanner = ({ recommendation, isDark = false }) => {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded]   = useState(true);

  if (!recommendation || dismissed) return null;

  const { text, doctorName, timestamp } = recommendation;
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="rounded-2xl overflow-hidden border border-teal-500/40 shadow-md shadow-teal-500/10 mb-4">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white text-[10px] font-black uppercase tracking-widest">
            External Specialist Connected
          </p>
          <p className="text-white/90 text-xs font-semibold mt-0.5">{doctorName}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/30 uppercase tracking-wider animate-pulse">
            Assisting
          </span>
          {/* Toggle expand */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Recommendation body */}
      {expanded && (
        <div className={`px-4 py-4 ${isDark ? 'bg-teal-900/20' : 'bg-teal-50/60'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isDark ? 'bg-teal-800' : 'bg-teal-100'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                Recommendation Received · {timeStr}
              </p>
              <p className={`text-sm font-semibold leading-relaxed ${isDark ? 'text-teal-200' : 'text-teal-900'}`}>
                {text}
              </p>
              <p className={`text-[11px] mt-1.5 ${isDark ? 'text-teal-500' : 'text-teal-600'}`}>
                — {doctorName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalSpecialistBanner;
