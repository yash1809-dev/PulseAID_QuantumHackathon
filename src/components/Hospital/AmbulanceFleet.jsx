/**
 * AmbulanceFleet.jsx — Real-time fleet monitoring for hospital admins.
 *
 * Shows:
 *  - Fleet summary (Available vs Busy)
 *  - Detailed list of all ambulances in Pune
 *  - Current task/destination for active vehicles
 *  - Driver details and vehicle type
 */

import React from 'react';
import { Ambulance, User, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const AmbulanceFleet = ({ ambulances = [], hospitals = [], activeRequest = null, hospitalId = null, isDark = false }) => {
  const total = ambulances.length;
  const availableCount = ambulances.filter(a => a.status === 'available').length;
  const busyCount = total - availableCount;

  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const card = isDark ? 'bg-slate-800 border-slate-700 shadow-xl shadow-slate-900/20' : 'bg-white border-gray-100 shadow-sm';
  const headerBg = isDark ? 'bg-slate-800/50' : 'bg-blue-50/50';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <StatItem
          label="Total Fleet"
          value={total}
          icon={Ambulance}
          color="blue"
          isDark={isDark}
        />
        <StatItem
          label="Available"
          value={availableCount}
          icon={CheckCircle2}
          color="green"
          isDark={isDark}
        />
        <StatItem
          label="On-Duty"
          value={busyCount}
          icon={Clock}
          color="amber"
          isDark={isDark}
        />
      </div>

      {/* Fleet List */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'} ${headerBg}`}>
          <h3 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
            <Ambulance className="w-4 h-4 text-blue-500" />
            Live Fleet Status
          </h3>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {ambulances.map((amb) => {
            const isBusy = amb.status === 'busy';
            const isAssignedToUs = activeRequest && activeRequest.ambulanceId === amb.id && activeRequest.hospitalId === hospitalId;
            const targetHospital = isAssignedToUs ? hospitals.find(h => h.id === hospitalId) : null;

            return (
              <div
                key={amb.id}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 transition-colors
                  ${isAssignedToUs ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50/50') : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${isBusy ? (isDark ? 'bg-amber-900/30 text-amber-500' : 'bg-amber-100 text-amber-600')
                             : (isDark ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-600')}
                  `}>
                    <Ambulance className={`w-5 h-5 ${isBusy && !isAssignedToUs ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${textPrimary}`}>{amb.plateNumber || amb.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                        ${isBusy ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                 : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'}
                      `}>
                        {amb.status}
                      </span>
                      {isAssignedToUs && (
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">
                          Incoming
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 mt-1 text-[11px] ${textSecondary}`}>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {amb.driverName || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1 font-medium italic">
                        {amb.type || 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-0 flex items-center gap-4">
                  {isBusy ? (
                    <div className="flex items-center gap-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      {isAssignedToUs ? (
                        <span className="flex items-center gap-2">
                          ETA {activeRequest.eta || 'Calculating...'} <ArrowRight className="w-3 h-3" /> {targetHospital?.name}
                        </span>
                      ) : (
                        <span>Emergency Dispatch in Progress</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Stationary & Ready</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <div className={`p-4 rounded-xl border flex gap-3 ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
        <div>
          <p className={`text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5`}>Fleet Access Note</p>
          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-blue-300/70' : 'text-blue-600'}`}>
            Ambulances are currently shared resources across the Pune municipal ecosystem. You are viewing live statuses for all nearby units to coordinate ICU preparation.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---
const StatItem = ({ label, value, icon: Icon, color, isDark }) => {
  const colors = {
    blue:  isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800'  : 'bg-blue-50 text-blue-600 border-blue-100',
    green: isDark ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-600 border-green-100',
    amber: isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col items-center justify-center text-center`}>
      <div className={`w-8 h-8 rounded-lg mb-2 flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white border-inherit'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-black">{value}</p>
      <p className={`text-[10px] uppercase font-bold tracking-wider opacity-70`}>{label}</p>
    </div>
  );
};

export default AmbulanceFleet;
