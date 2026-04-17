/**
 * ICUManager.jsx — Hospital admin: manage ICU beds, cost level, insurance.
 *
 * Calls onUpdateICU / onUpdateCostLevel / onToggleInsurance
 * which flow up to App.jsx central state via hospitalService.
 */

import React from 'react';
import { BedDouble, Plus, Minus, DollarSign, Shield } from 'lucide-react';
import { INSURANCE_OPTIONS } from '../../data/hospitals';


const ICUManager = ({
  hospital,
  isDark = false,
  onUpdateICU,
  onToggleInsurance,
}) => {
  if (!hospital) return (
    <div className="flex items-center justify-center py-16">
      <p className="text-gray-400 text-sm">No hospital data.</p>
    </div>
  );

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const icuPct = (hospital.icu_available || 0) / (hospital.icu_total || 1);
  const icuBarColor = icuPct === 0 ? 'bg-red-500' : icuPct < 0.4 ? 'bg-yellow-400' : 'bg-green-500';

  return (
    <div className="space-y-5">
      {/* ICU Beds */}
      <div className={`rounded-2xl border p-5 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <BedDouble className="w-5 h-5 text-blue-500" />
          <h3 className={`text-sm font-bold ${textPrimary}`}>ICU Beds</h3>
          <span className={`ml-auto text-xs ${textSecondary}`}>Total: {hospital.icu_total}</span>
        </div>

        {/* Big number */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onUpdateICU?.(Math.max(0, (hospital.icu_available || 0) - 1))}
            disabled={(hospital.icu_available || 0) === 0}
            className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 hover:bg-red-100 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className={`text-5xl font-black ${textPrimary}`}>{hospital.icu_available ?? 0}</p>
            <p className={`text-xs ${textSecondary} mt-1`}>beds available</p>
          </div>

          <button
            onClick={() => onUpdateICU?.((hospital.icu_available || 0) + 1)}
            disabled={(hospital.icu_available || 0) >= (hospital.icu_total || 0)}
            className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 hover:bg-green-100 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className={`h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'} overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${icuBarColor}`}
            style={{ width: `${Math.max(2, icuPct * 100)}%` }}
          />
        </div>
        <p className={`text-xs ${textSecondary} mt-2 text-right`}>
          {hospital.icu_available} of {hospital.icu_total} available
        </p>

        {/* Quick set buttons */}
        <div className="flex gap-2 mt-4">
          {[0, Math.floor((hospital.icu_total || 10) / 2), hospital.icu_total].map(val => (
            <button
              key={val}
              onClick={() => onUpdateICU?.(val)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95
                ${(hospital.icu_available ?? 0) === val
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isDark ? 'bg-slate-700 text-slate-300 border-slate-600 hover:border-blue-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-400'
                }`}
            >
              {val === 0 ? 'Full' : val === hospital.icu_total ? 'All Free' : 'Half'}
            </button>
          ))}
        </div>
      </div>


      {/* Insurance Schemes */}
      <div className={`rounded-2xl border p-5 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className={`text-sm font-bold ${textPrimary}`}>Insurance Schemes Accepted</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {INSURANCE_OPTIONS.map(ins => {
            const accepted = hospital.insuranceAccepted?.includes(ins);
            return (
              <button
                key={ins}
                onClick={() => onToggleInsurance?.(ins)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95
                  ${accepted
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-400'
                  }`}
              >
                {accepted ? '✓ ' : ''}{ins}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ICUManager;
