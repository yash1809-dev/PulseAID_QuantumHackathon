/**
 * HospitalList.jsx — Ranked hospital cards with match score and explanation.
 *
 * Shows "Best Match" highlight with matchReason on #1 result.
 * Handles: loading, no results, populated states.
 */

import React from 'react';
import {
  MapPin, BedDouble, Shield, Star, ChevronRight, Trophy, Loader2, AlertCircle
} from 'lucide-react';

const COST_BADGE = {
  low:    { label: '₹ Low',    classes: 'bg-green-100 text-green-700' },
  medium: { label: '₹₹ Mid',   classes: 'bg-yellow-100 text-yellow-700' },
  high:   { label: '₹₹₹ High', classes: 'bg-red-100 text-red-700' },
};

const HospitalList = ({
  rankedList = [],
  matchReason = '',
  hasResults = false,
  isProcessing = false,
  filterStats = {},
  onSelectHospital,
  selectedHospital,
  isDark = false,
}) => {
  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  // Loading
  // Loading state removed for instantaneous feel.
  if (isProcessing && rankedList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin opacity-20" />
      </div>
    );
  }

  // No results
  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-orange-400" />
        </div>
        <p className={`text-sm font-semibold ${textPrimary}`}>No hospitals match your filters</p>
        <p className={`text-xs ${textSecondary} max-w-xs`}>
          {matchReason || 'Try removing some filters to see more results.'}
        </p>
        {filterStats.total > 0 && (
          <p className={`text-xs ${textSecondary}`}>
            {filterStats.total} hospitals total — 0 match your current filters
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 space-y-2.5">
      {/* Result count & Hint */}
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-semibold ${textSecondary}`}>
          {rankedList.length} hospital{rankedList.length !== 1 ? 's' : ''} found
          {filterStats.total > 0 && rankedList.length < filterStats.total && (
            <span> (filtered from {filterStats.total})</span>
          )}
        </p>
        <p className={`text-[10px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md`}>
          Tap any to select manually
        </p>
      </div>

      {rankedList.map((hospital, idx) => {
        const isTop = idx === 0;
        const isSelected = selectedHospital?.id === hospital.id;
        const costInfo = COST_BADGE[hospital.costLevel] || COST_BADGE.medium;
        const icuColor = hospital.icu_available === 0 ? 'text-red-500' :
          (hospital.icu_available / hospital.icu_total) > 0.4 ? 'text-green-600' : 'text-yellow-600';

        return (
          <div key={hospital.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
            {/* Best Match explanation banner */}
            {isTop && matchReason && (
              <div className="flex items-start gap-2 bg-blue-600 rounded-t-xl px-3 py-2 -mb-1">
                <Trophy className="w-3.5 h-3.5 text-white/90 mt-0.5 shrink-0" />
                <p className="text-white text-[11px] leading-snug font-medium">{matchReason}</p>
              </div>
            )}

            <button
              onClick={() => onSelectHospital?.(hospital)}
              className={`w-full text-left rounded-xl border-2 p-3.5 transition-all duration-200 hover:shadow-md active:scale-[0.99]
                ${isTop ? 'rounded-tl-none rounded-tr-none border-blue-500 shadow-sm shadow-blue-100' : ''}
                ${isSelected && !isTop ? 'border-purple-500' : ''}
                ${!isTop && !isSelected ? (isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white') : ''}
                ${isTop ? (isDark ? 'bg-slate-800' : 'bg-blue-50/50') : ''}
                ${isSelected && !isTop ? (isDark ? 'bg-slate-800' : 'bg-purple-50/50') : ''}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Rank + Name */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0
                      ${isTop ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                      {idx + 1}
                    </span>
                    <h3 className={`text-sm font-bold truncate ${textPrimary}`}>{hospital.name}</h3>
                  </div>

                  {/* Stats row */}
                  <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 text-xs ${textSecondary}`}>
                    {hospital._distanceKm !== undefined && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {hospital._distanceKm} km
                      </span>
                    )}
                    <span className={`flex items-center gap-1 font-semibold ${icuColor}`}>
                      <BedDouble className="w-3 h-3 shrink-0" />
                      {hospital.icu_available} ICU
                    </span>
                    {hospital.rating && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {hospital.rating}
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-2">
                    {costInfo && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${costInfo.classes}`}>
                        {costInfo.label}
                      </span>
                    )}
                    {hospital.insuranceAccepted?.slice(0, 2).map(ins => (
                      <span key={ins} className="flex items-center gap-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        <Shield className="w-2.5 h-2.5" />
                        {ins}
                      </span>
                    ))}
                    {(hospital.insuranceAccepted?.length || 0) > 2 && (
                      <span className="text-[10px] text-gray-400">+{hospital.insuranceAccepted.length - 2} more</span>
                    )}
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${textSecondary}`} />
              </div>

              {/* Available doctors today */}
              {(hospital._availableDoctorsToday || 0) > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex items-center gap-1.5">
                  <span className="text-[10px] text-green-600 font-semibold">
                    👨‍⚕️ {hospital._availableDoctorsToday} doctor{hospital._availableDoctorsToday > 1 ? 's' : ''} available today
                  </span>
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default HospitalList;
