/**
 * RecommendationModal.jsx — Doctor submits a treatment recommendation.
 * Modal/sheet with preset quick-picks and a free-text field.
 */

import React, { useState } from 'react';
import { Send, X, CheckCircle2, Zap } from 'lucide-react';

// Quick recommendation presets
const PRESETS = [
  'Monitor cardiac arrhythmia continuously',
  'Administer emergency protocol per on-site team',
  'Start IV fluids — normal saline at 100 mL/hr',
  'Administer glucose 50% IV for hypoglycemia',
  'Avoid beta-blockers — history of bronchospasm',
  'Keep patient NPO — surgery may be required',
  'Check troponin + 12-lead ECG immediately',
  'Prioritize BP control — target <140/90',
];

const RecommendationModal = ({
  alert,
  doctorName,
  isDark = false,
  onSubmit,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(!!alert?.recommendation);
  const [loading, setLoading] = useState(false);

  const card         = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const overlay      = isDark ? 'bg-slate-900/80' : 'bg-gray-900/60';
  const inputCls     = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400';
  const textPrimary  = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  if (submitted) {
    return (
      <div className={`fixed inset-0 z-50 flex items-end justify-center ${overlay} backdrop-blur-sm`}>
        <div className={`w-full max-w-md mx-auto rounded-t-3xl border ${card} p-6 animate-slide-up`}>
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className={`text-base font-black ${textPrimary}`}>Recommendation Sent!</h3>
            <p className={`text-xs text-center ${textSecondary}`}>
              The hospital team and patient have been notified of your recommendation.
            </p>
            {alert?.recommendation && (
              <div className={`w-full rounded-xl border ${isDark ? 'border-teal-800 bg-teal-900/30' : 'border-teal-200 bg-teal-50'} px-4 py-3 mt-2`}>
                <p className={`text-xs italic ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                  "{alert.recommendation.text}"
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-black uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate latency
    onSubmit?.(text.trim());
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center ${overlay} backdrop-blur-sm`}>
      <div className={`w-full max-w-md mx-auto rounded-t-3xl border ${card} p-5 animate-slide-up`}>
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-base font-black ${textPrimary}`}>Send Recommendation</h3>
            <p className={`text-xs ${textSecondary}`}>As {doctorName}</p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick presets */}
        <div className="mb-3">
          <p className={`text-[10px] font-black uppercase tracking-wider ${textSecondary} mb-2 flex items-center gap-1`}>
            <Zap className="w-3 h-3" /> Quick Picks
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => setText(p)}
                className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-semibold transition-all
                  ${text === p
                    ? 'bg-teal-600 text-white border-teal-600'
                    : isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-teal-500'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-teal-400'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Free-text */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a custom recommendation or select a quick pick above..."
          rows={3}
          className={`w-full rounded-xl border px-3 py-2.5 text-xs resize-none ${inputCls} mb-3`}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-black uppercase tracking-wider text-xs transition-all
            ${!text.trim() || loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-90 active:scale-98 shadow-lg shadow-teal-500/20'
            }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {loading ? 'Sending...' : 'Send to Hospital & Patient'}
        </button>
      </div>
    </div>
  );
};

export default RecommendationModal;
