/**
 * DemoControl.jsx — Hidden demo control panel for smooth presentations.
 *
 * Toggle with: press 'D' key or click the corner indicator.
 * Allows judge-ready control without randomness.
 */

import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';

const DemoControl = ({
  hospitals = [],
  onSetAllICUFull,
  onSetAllICUAvailable,
  onSetHospitalICU,
  onSwitchInsurance,
  isDark = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle with 'D' key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'd' || e.key === 'D') setIsOpen(prev => !prev);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const bg = isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95';

  return (
    <>
      {/* Indicator dot */}
      <button
        onClick={() => setIsOpen(v => !v)}
        title="Demo Control (or press D)"
        className="fixed top-4 left-4 z-[100] w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Settings className="w-3.5 h-3.5 text-white" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className={`fixed top-14 left-4 z-[100] w-72 rounded-2xl border shadow-2xl p-4 ${bg}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">⚡ Demo Control</p>
              <h3 className={`text-sm font-bold ${textPrimary}`}>Scenario Controls</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* ICU controls */}
          <div className="mb-4">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-2`}>ICU Scenario</p>
            <div className="flex gap-2">
              <button
                onClick={onSetAllICUFull}
                className={`${btnBase} bg-red-100 text-red-700 hover:bg-red-200 flex-1`}
              >
                🔴 All ICU Full
              </button>
              <button
                onClick={onSetAllICUAvailable}
                className={`${btnBase} bg-green-100 text-green-700 hover:bg-green-200 flex-1`}
              >
                🟢 All ICU Open
              </button>
            </div>
          </div>

          {/* Hospital-specific ICU */}
          <div className="mb-4">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-2`}>Individual Hospital</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {hospitals.slice(0, 6).map(h => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className={`text-[10px] truncate flex-1 ${textPrimary}`}>{h.name.split(' ').slice(0, 2).join(' ')}</span>
                  <button
                    onClick={() => onSetHospitalICU?.(h.id, 0)}
                    className={`${btnBase} bg-red-50 text-red-600 px-2 py-1`}
                  >Full</button>
                  <button
                    onClick={() => onSetHospitalICU?.(h.id, Math.floor(h.icu_total / 2))}
                    className={`${btnBase} bg-yellow-50 text-yellow-600 px-2 py-1`}
                  >Half</button>
                  <button
                    onClick={() => onSetHospitalICU?.(h.id, h.icu_total)}
                    className={`${btnBase} bg-green-50 text-green-700 px-2 py-1`}
                  >Free</button>
                </div>
              ))}
            </div>
          </div>

          <p className={`text-[9px] ${textSecondary} text-center`}>
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[9px]">D</kbd> to toggle · For demo use only
          </p>
        </div>
      )}
    </>
  );
};

export default DemoControl;
