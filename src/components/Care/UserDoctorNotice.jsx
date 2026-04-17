/**
 * UserDoctorNotice.jsx — Compact notice shown to the patient in the map view
 * confirming their primary doctor has been alerted.
 */

import React, { useState } from 'react';
import { Stethoscope, X, CheckCircle2 } from 'lucide-react';

const UserDoctorNotice = ({ doctorName, specialty, recommendation, isDark = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const hasRecommendation = !!recommendation;

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg mx-4 mb-2
      ${isDark
        ? 'bg-slate-800 border-teal-800/60 shadow-teal-900/30'
        : 'bg-white border-teal-200 shadow-teal-100'
      }`}
    >
      {/* Top strip */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-2 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
          <Stethoscope className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-white text-[10px] font-black uppercase tracking-widest flex-1">
          Your Primary Doctor Has Been Notified
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-teal-900/40' : 'bg-teal-50'}`}>
            <Stethoscope className="w-4.5 h-4.5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {doctorName || 'Your Doctor'}
            </p>
            {specialty && (
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {specialty} · Currently reviewing your case
              </p>
            )}
          </div>
          <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${hasRecommendation ? 'bg-teal-500' : 'bg-amber-400'}`} />
        </div>

        {/* Recommendation received */}
        {hasRecommendation && (
          <div className={`mt-3 rounded-xl px-3 py-2.5 flex items-start gap-2 ${isDark ? 'bg-teal-900/30 border border-teal-800' : 'bg-teal-50 border border-teal-100'}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                Treatment Guidance Received
              </p>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                {recommendation.text}
              </p>
            </div>
          </div>
        )}

        {!hasRecommendation && (
          <p className={`text-[11px] mt-2 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            <span className="w-3 h-3 border border-current rounded-full flex-shrink-0 animate-spin border-t-transparent inline-block" />
            Awaiting treatment guidance...
          </p>
        )}
      </div>
    </div>
  );
};

export default UserDoctorNotice;
