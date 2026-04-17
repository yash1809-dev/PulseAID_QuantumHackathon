/**
 * LiveVitalsPanel.jsx — Simulated live vital signs monitor.
 *
 * Streams from vitalsService.startVitalsStream, updates every 3 seconds.
 * Visual design mimics a simplified bedside monitor.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, Wind, Thermometer, Wifi } from 'lucide-react';
import { startVitalsStream, stopVitalsStream, getVitalsSeverity } from '../../services/vitalsService';

const LiveVitalsPanel = ({ patientId, isDark = false }) => {
  const [vitals, setVitals] = useState(null);
  const [tick, setTick] = useState(0); // drives heartbeat animation
  const tickRef = useRef(null);

  useEffect(() => {
    if (!patientId) return;

    startVitalsStream(patientId, (v) => {
      setVitals(v);
      setTick(t => t + 1); // pulse animation trigger
    }, 3000);

    return () => stopVitalsStream(patientId);
  }, [patientId]);

  const severity = vitals ? getVitalsSeverity(vitals) : 'normal';
  const severityColor = {
    normal:   'text-green-500',
    warning:  'text-amber-500',
    critical: 'text-red-500 animate-pulse',
  }[severity];

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500" />
          <span className={`text-xs font-black uppercase tracking-wider ${textPrimary}`}>
            Live Vitals Monitor
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">STREAMING</span>
        </div>
      </div>

      {!vitals ? (
        <div className="flex items-center justify-center py-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xs ${textSecondary}`}>Connecting to monitor...</p>
          </div>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3">
          {/* Heart Rate */}
          <VitalCard
            icon={Heart}
            label="Heart Rate"
            value={vitals.heartRate}
            unit="bpm"
            normal={[60, 100]}
            color="red"
            tick={tick}
            isDark={isDark}
            animated
          />

          {/* SpO2 */}
          <VitalCard
            icon={Wind}
            label="SpO₂"
            value={vitals.spo2}
            unit="%"
            normal={[95, 100]}
            color="blue"
            tick={tick}
            isDark={isDark}
          />

          {/* Pulse */}
          <VitalCard
            icon={Activity}
            label="Pulse"
            value={vitals.pulse}
            unit="bpm"
            normal={[60, 100]}
            color="purple"
            tick={tick}
            isDark={isDark}
          />

          {/* Blood Pressure */}
          <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span className={`text-[10px] font-black uppercase tracking-wider ${textSecondary}`}>Blood Pressure</span>
            </div>
            <p className={`text-2xl font-black ${textPrimary} leading-none`}>
              {vitals.systolic}
              <span className={`text-sm font-bold ${textSecondary}`}>/{vitals.diastolic}</span>
            </p>
            <p className={`text-[10px] font-semibold mt-1 ${textSecondary}`}>mmHg</p>
            <BPBar systolic={vitals.systolic} isDark={isDark} />
          </div>

          {/* Temperature & Respiratory Row */}
          <div className={`col-span-2 rounded-xl p-3 flex gap-6 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider ${textSecondary} mb-1`}>Temperature</p>
              <p className={`text-lg font-black ${textPrimary}`}>
                {vitals.temperature}
                <span className={`text-xs ${textSecondary}`}> °F</span>
              </p>
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider ${textSecondary} mb-1`}>Resp. Rate</p>
              <p className={`text-lg font-black ${textPrimary}`}>
                {vitals.respiratoryRate}
                <span className={`text-xs ${textSecondary}`}> /min</span>
              </p>
            </div>
            <div className="ml-auto flex items-center">
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                severity === 'critical' ? 'bg-red-100 text-red-600' :
                severity === 'warning'  ? 'bg-amber-100 text-amber-600' :
                'bg-green-100 text-green-600'
              }`}>
                {severity === 'critical' ? '⚠ Critical' :
                 severity === 'warning'  ? '⚠ Warning' : '✓ Stable'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── VitalCard ──────────────────────────────────────────────────────────────────

const VitalCard = ({ icon: Icon, label, value, unit, normal, color, tick, isDark, animated }) => {
  const isLow  = value < normal[0];
  const isHigh = value > normal[1];
  const isAbnormal = isLow || isHigh;

  const colorMap = {
    red:    { icon: 'text-red-500',    bar: 'bg-red-500' },
    blue:   { icon: 'text-blue-500',   bar: 'bg-blue-500' },
    purple: { icon: 'text-purple-500', bar: 'bg-purple-500' },
    amber:  { icon: 'text-amber-500',  bar: 'bg-amber-500' },
  };
  const c = colorMap[color] || colorMap.blue;

  const textPrimary   = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bg            = isDark ? 'bg-slate-700' : 'bg-gray-50';

  // Percentage within typical range for the bar
  const pct = Math.min(100, Math.max(5, ((value - normal[0]) / (normal[1] - normal[0])) * 100));

  return (
    <div className={`rounded-xl p-3 ${bg} ${isAbnormal ? 'ring-1 ring-red-400' : ''}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon
          className={`w-3.5 h-3.5 ${c.icon} ${animated && tick % 2 === 0 ? 'scale-125' : 'scale-100'} transition-transform duration-300`}
        />
        <span className={`text-[10px] font-black uppercase tracking-wider ${textSecondary}`}>{label}</span>
      </div>
      <p className={`text-2xl font-black leading-none ${isAbnormal ? 'text-red-500' : textPrimary}`}>
        {value}
        <span className={`text-xs font-semibold ml-1 ${textSecondary}`}>{unit}</span>
      </p>
      {/* Mini progress bar */}
      <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${isAbnormal ? 'bg-red-500' : c.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isAbnormal && (
        <p className="text-[9px] text-red-500 font-bold mt-1">{isHigh ? '▲ HIGH' : '▼ LOW'}</p>
      )}
    </div>
  );
};

// ── BPBar ──────────────────────────────────────────────────────────────────────

const BPBar = ({ systolic, isDark }) => {
  const pct = Math.min(100, Math.max(5, ((systolic - 80) / (180 - 80)) * 100));
  const color = systolic > 140 ? 'bg-red-500' : systolic > 120 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default LiveVitalsPanel;
