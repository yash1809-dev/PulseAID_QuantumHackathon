/**
 * EmergencyAlertCard.jsx — Alert card shown at top of Doctor's Emergency tab.
 * Displays patient name, emergency type, hospital, ETA, and action buttons.
 */

import React, { useState } from 'react';
import {
  AlertTriangle, User, Building2, Clock, Heart,
  Eye, Radio, Send, CheckCircle2
} from 'lucide-react';
import { markDoctorJoined } from '../../services/notificationService';

const EmergencyAlertCard = ({
  alert,
  isDark = false,
  onViewCase,
  onJoinConsultation,
  onSendRecommendation,
}) => {
  const [joined, setJoined] = useState(alert?.doctorJoined || false);
  const [joinFlash, setJoinFlash] = useState(false);

  if (!alert) return null;

  const elapsed = Math.floor((Date.now() - alert.timestamp) / 60000);
  const elapsedLabel = elapsed < 1 ? 'Just now' : `${elapsed} min ago`;

  const handleJoin = () => {
    markDoctorJoined(alert.id);
    setJoined(true);
    setJoinFlash(true);
    setTimeout(() => setJoinFlash(false), 2500);
    onJoinConsultation?.();
  };

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  return (
    <div className="space-y-3">
      {/* Pulsing alert banner */}
      <div className="rounded-2xl overflow-hidden border border-red-500/40 shadow-lg shadow-red-500/10">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white text-[10px] font-black uppercase tracking-widest">
              🚨 Emergency Alert
            </p>
            <p className="text-white/80 text-xs mt-0.5">{elapsedLabel}</p>
          </div>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/30">
            ACTIVE
          </span>
        </div>

        {/* Patient info */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-red-50/60'} px-4 py-4`}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <InfoChip
              icon={User}
              label="Patient"
              value={alert.patientName}
              color="red"
              isDark={isDark}
            />
            <InfoChip
              icon={AlertTriangle}
              label="Emergency"
              value={alert.emergencyType}
              color="red"
              isDark={isDark}
            />
            <InfoChip
              icon={Building2}
              label="Hospital"
              value={alert.hospitalName}
              color="blue"
              isDark={isDark}
            />
            <InfoChip
              icon={Clock}
              label="ETA"
              value={alert.eta || 'Calculating...'}
              color="amber"
              isDark={isDark}
            />
          </div>

          {/* Patient quick facts */}
          <div className={`flex gap-3 text-xs ${textSecondary}`}>
            {alert.bloodGroup && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span className="font-semibold text-red-500">{alert.bloodGroup}</span>
              </span>
            )}
            {alert.age && (
              <span>Age: <span className={`font-semibold ${textPrimary}`}>{alert.age} yrs</span></span>
            )}
            {alert.medicalConditions && (
              <span className="truncate">
                <span className="text-amber-500 font-semibold">⚠ </span>
                {alert.medicalConditions}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Join flash */}
      {joinFlash && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          You have joined the consultation. Hospital has been notified.
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <ActionButton
          icon={Eye}
          label="View Case"
          color="blue"
          onClick={onViewCase}
          isDark={isDark}
        />
        <ActionButton
          icon={Radio}
          label={joined ? 'Joined ✓' : 'Join Consult'}
          color={joined ? 'green' : 'purple'}
          onClick={handleJoin}
          disabled={joined}
          isDark={isDark}
        />
        <ActionButton
          icon={Send}
          label="Recommend"
          color="teal"
          onClick={onSendRecommendation}
          isDark={isDark}
        />
      </div>

      {/* Existing recommendation badge */}
      {alert.recommendation && (
        <div className={`rounded-xl border ${isDark ? 'border-teal-800 bg-teal-900/30' : 'border-teal-200 bg-teal-50'} px-4 py-3`}>
          <p className="text-[10px] font-black uppercase tracking-wider text-teal-600 mb-1">
            ✅ Recommendation Sent
          </p>
          <p className={`text-xs ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
            {alert.recommendation.text}
          </p>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const InfoChip = ({ icon: Icon, label, value, color, isDark }) => {
  const colorMap = {
    red:   { bg: isDark ? 'bg-red-900/40' : 'bg-red-50',   icon: 'text-red-500' },
    blue:  { bg: isDark ? 'bg-blue-900/40' : 'bg-blue-50', icon: 'text-blue-500' },
    amber: { bg: isDark ? 'bg-amber-900/40' : 'bg-amber-50', icon: 'text-amber-500' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`${c.bg} rounded-xl p-2.5`}>
      <div className={`flex items-center gap-1 mb-1 ${c.icon}`}>
        <Icon className="w-3 h-3" />
        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
      </div>
      <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, color, onClick, disabled, isDark }) => {
  const colorMap = {
    blue:   'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    purple: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200',
    teal:   'bg-teal-600 hover:bg-teal-700 shadow-teal-200',
    green:  'bg-green-600 cursor-default',
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm
        ${disabled ? 'opacity-60 cursor-not-allowed' : colorMap[color] || colorMap.blue}
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

export default EmergencyAlertCard;
