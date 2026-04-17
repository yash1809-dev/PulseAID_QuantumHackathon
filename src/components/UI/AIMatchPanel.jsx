/**
 * AIMatchPanel.jsx — Smart Decision Engine result visualization.
 *
 * Shows:
 *  - Confidence meter
 *  - 6-dimension score bars (Coverage, Medical, Proximity, Cost, Preference, Availability)
 *  - Natural-language reasoning bullets
 *  - Flags (positive / warning / critical)
 *  - Spending profile insight
 */

import React, { useState } from 'react';
import {
  Brain, Shield, Stethoscope, MapPin, DollarSign,
  Star, BedDouble, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle2, XCircle, Zap, TrendingUp
} from 'lucide-react';

const DIM_CONFIG = {
  coverage:     { label: 'Coverage',     icon: Shield,      color: 'blue'   },
  medical:      { label: 'Medical Fit',  icon: Stethoscope, color: 'purple' },
  proximity:    { label: 'Proximity',    icon: MapPin,      color: 'green'  },
  cost:         { label: 'Cost Fit',     icon: DollarSign,  color: 'yellow' },
  preference:   { label: 'Preference',   icon: Star,        color: 'orange' },
  availability: { label: 'Availability', icon: BedDouble,   color: 'teal'   },
};

const COLOR_CLASSES = {
  blue:   { bar: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'text-blue-500'  },
  purple: { bar: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500'},
  green:  { bar: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-600',  icon: 'text-green-500' },
  yellow: { bar: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500'},
  orange: { bar: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500'},
  teal:   { bar: 'bg-teal-500',   bg: 'bg-teal-50',   text: 'text-teal-600',   icon: 'text-teal-500'  },
};

const FLAG_STYLE = {
  positive: { icon: CheckCircle2, classes: 'text-green-600 bg-green-50 border-green-100' },
  warning:  { icon: AlertTriangle, classes: 'text-amber-600 bg-amber-50 border-amber-100' },
  critical: { icon: XCircle, classes: 'text-red-600 bg-red-50 border-red-100' },
};

function ScoreBar({ dim, data, isDark }) {
  const config = DIM_CONFIG[dim];
  const colors = COLOR_CLASSES[config.color];
  const Icon = config.icon;
  const score = data?.score ?? 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3 h-3 ${colors.icon}`} />
          <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {config.label}
          </span>
        </div>
        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
          {score}
          <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>/100</span>
        </span>
      </div>
      <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {data?.label && (
        <p className={`text-[9px] font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          {data.label}
        </p>
      )}
    </div>
  );
}

function ConfidenceMeter({ confidence, isDark }) {
  const color = confidence >= 75 ? 'text-green-600' : confidence >= 50 ? 'text-amber-600' : 'text-red-500';
  const barColor = confidence >= 75 ? 'bg-green-500' : confidence >= 50 ? 'bg-amber-400' : 'bg-red-400';
  const label = confidence >= 75 ? 'High Confidence' : confidence >= 50 ? 'Moderate' : 'Low Confidence';

  return (
    <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-100'} space-y-1.5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Brain className={`w-3.5 h-3.5 ${color}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>
            Decision Confidence
          </span>
        </div>
        <span className={`text-sm font-black ${color}`}>{confidence}%</span>
      </div>
      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
      <p className={`text-[9px] font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{label}</p>
    </div>
  );
}

const AIMatchPanel = ({ report, bestMatch, isDark = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!report || !bestMatch) return null;

  const { reasoning, breakdown, flags, confidence, spendingProfile, detectedConditions } = report;

  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const sectionBg = isDark ? 'bg-slate-900/50' : 'bg-gray-50';

  return (
    <div className={`rounded-2xl border overflow-hidden ${card} mt-3`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}
        onClick={() => setShowDetails(v => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-bold">Smart Analysis</p>
            <p className="text-white/60 text-[10px]">6-factor decision engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/90 text-xs font-black">{confidence}%</span>
          {showDetails
            ? <ChevronUp className="w-4 h-4 text-white/70" />
            : <ChevronDown className="w-4 h-4 text-white/70" />
          }
        </div>
      </div>

      {/* Quick reasoning */}
      {reasoning?.length > 0 && (
        <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
          {reasoning.slice(0, 2).map((r, i) => (
            <div key={i} className={`flex items-start gap-2 ${i > 0 ? 'mt-2' : ''}`}>
              <Zap className={`w-3 h-3 mt-0.5 shrink-0 ${i === 0 ? 'text-blue-500' : textSecondary}`} />
              <p className={`text-[11px] leading-relaxed ${i === 0 ? textPrimary : textSecondary}`}>{r}</p>
            </div>
          ))}
        </div>
      )}

      {/* Expandable details */}
      {showDetails && (
        <div className="px-4 py-4 space-y-4">

          {/* Confidence meter */}
          <ConfidenceMeter confidence={confidence} isDark={isDark} />

          {/* Score breakdown */}
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-3`}>
              Score Breakdown
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Object.entries(breakdown).map(([dim, data]) => (
                <ScoreBar key={dim} dim={dim} data={data} isDark={isDark} />
              ))}
            </div>
          </div>

          {/* Flags */}
          {flags?.length > 0 && (
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-2`}>
                Signals
              </p>
              <div className="flex flex-wrap gap-1.5">
                {flags.map((flag, i) => {
                  const { icon: FlagIcon, classes } = FLAG_STYLE[flag.type] || FLAG_STYLE.warning;
                  return (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border ${classes}`}
                    >
                      <FlagIcon className="w-2.5 h-2.5 shrink-0" />
                      {flag.text}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Medical conditions matched */}
          {detectedConditions?.length > 0 && (
            <div className={`p-3 rounded-xl ${sectionBg}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-1.5`}>
                Conditions Analyzed
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detectedConditions.map((c, i) => (
                  <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                    {c.specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spending profile */}
          {spendingProfile?.avgMonthly > 0 && (
            <div className={`p-3 rounded-xl flex items-center gap-3 ${sectionBg}`}>
              <TrendingUp className={`w-4 h-4 shrink-0 ${textSecondary}`} />
              <div>
                <p className={`text-[10px] font-bold ${textPrimary}`}>
                  Avg. ₹{spendingProfile.avgMonthly.toLocaleString()}/month health spend
                </p>
                <p className={`text-[9px] ${textSecondary}`}>
                  Profile: {spendingProfile.tier} — Top category: {spendingProfile.topCategory}
                </p>
              </div>
            </div>
          )}

          {/* Full reasoning */}
          {reasoning?.length > 2 && (
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-2`}>
                Full Analysis
              </p>
              <div className="space-y-1.5">
                {reasoning.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold mt-0.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-300'}`}>{i + 1}.</span>
                    <p className={`text-[11px] leading-relaxed ${textSecondary}`}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMatchPanel;
