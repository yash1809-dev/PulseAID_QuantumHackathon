/**
 * IncomingPatient.jsx — Hospital admin view for incoming ambulance/patient.
 *
 * Shows when an activeRequest is assigned to this hospital.
 * Status: Preparing → Arriving → Arrived.
 */

import React from 'react';
import { Ambulance, Clock, Navigation, CheckCircle, AlertCircle } from 'lucide-react';

const IncomingPatient = ({ activeRequest, hospitalId, isDark = false }) => {
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  // Only show if request is assigned to this hospital
  const isAssigned = activeRequest && activeRequest.hospitalId === hospitalId;

  if (!isAssigned) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
          <Ambulance className="w-8 h-8 text-blue-300" />
        </div>
        <p className={`text-sm font-semibold ${textPrimary}`}>No Incoming Patients</p>
        <p className={`text-xs ${textSecondary}`}>
          When a patient is dispatched to your hospital, their status will appear here in real time.
        </p>
      </div>
    );
  }

  const { status, eta, distance, ambulanceId } = activeRequest;

  const STATUS_INFO = {
    pending:  { label: 'Preparing...', color: 'bg-orange-500', icon: Clock, sub: 'Ambulance being assigned' },
    en_route: { label: 'Patient En Route', color: 'bg-blue-600', icon: Ambulance, sub: 'Ambulance dispatched' },
    arrived:  { label: 'Patient Arrived!', color: 'bg-green-600', icon: CheckCircle, sub: 'Please receive the patient' },
  };

  const info = STATUS_INFO[status] || STATUS_INFO.pending;
  const { label, color, icon: Icon, sub } = info;

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className={`rounded-2xl overflow-hidden border ${card}`}>
        <div className={`${color} px-5 py-4 flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{label}</p>
            <p className="text-white/70 text-xs">{sub}</p>
          </div>
          {status === 'en_route' && (
            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </div>

        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-xl p-3`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-1 flex items-center gap-1`}>
              <Clock className="w-3 h-3" /> ETA
            </p>
            <p className={`text-xl font-black ${textPrimary}`}>{status === 'pending' ? '...' : status === 'arrived' ? '0 min' : eta}</p>
          </div>
          <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-xl p-3`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-1 flex items-center gap-1`}>
              <Navigation className="w-3 h-3" /> Distance
            </p>
            <p className={`text-xl font-black ${textPrimary}`}>{status === 'pending' ? '...' : status === 'arrived' ? '0 m' : distance}</p>
          </div>
        </div>
      </div>

      {/* Ambulance ID */}
      <div className={`rounded-2xl border p-4 flex items-center gap-3 ${card}`}>
        <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-blue-50'} flex items-center justify-center`}>
          <span className="text-lg">🚑</span>
        </div>
        <div>
          <p className={`text-xs ${textSecondary} mb-0.5`}>Ambulance Unit</p>
          <p className={`text-sm font-bold upper-case ${textPrimary}`}>{ambulanceId?.toUpperCase() || 'N/A'}</p>
        </div>
      </div>

      {/* Prep checklist */}
      <div className={`rounded-2xl border p-5 ${card}`}>
        <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-3`}>
          Preparation Checklist
        </p>
        {[
          'ICU bed allocated',
          'Medical team on standby',
          'Emergency kit ready',
          'Patient intake form prepared',
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-slate-700' : 'border-gray-50'}`}>
            <CheckCircle className={`w-4 h-4 ${status !== 'pending' ? 'text-green-500' : isDark ? 'text-slate-600' : 'text-gray-200'}`} />
            <span className={`text-sm ${status !== 'pending' ? 'text-green-600 line-through' : textPrimary}`}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomingPatient;
