/**
 * HospitalPortal.jsx — Hospital admin dashboard.
 *
 * Tabs: Overview | ICU Manager | Doctors | Incoming Patient
 * All state changes flow up to App.jsx via callbacks.
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ICUManager from './ICUManager';
import DoctorManager from './DoctorManager';
import IncomingPatient from './IncomingPatient';
import AmbulanceFleet from './AmbulanceFleet';
import {
  LayoutDashboard, BedDouble, Stethoscope, Ambulance, LogOut,
  TrendingUp, Clock, Shield, Activity
} from 'lucide-react';

const TABS = [
  { id: 'overview',  label: 'Overview',  Icon: LayoutDashboard },
  { id: 'icu',       label: 'ICU',        Icon: BedDouble },
  { id: 'doctors',   label: 'Doctors',    Icon: Stethoscope },
  { id: 'incoming',  label: 'Incoming',   Icon: Ambulance },
  { id: 'fleet',     label: 'Fleet',      Icon: Activity },
];

const HospitalPortal = ({
  hospitals = [],
  doctors = [],
  ambulances = [],
  activeRequest = null,
  isDark = false,
  onUpdateICU,
  onUpdateCostLevel,
  onToggleInsurance,
  onToggleDoctorDay,
  onUpdateAmbulanceDriver,
  onAddAmbulance,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Find this admin's hospital
  const hospital = hospitals.find(h => h.id === user?.hospitalId) || null;

  const bg = isDark ? 'bg-slate-900' : 'bg-gray-50';
  const navBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  const icuPct = hospital ? (hospital.icu_available || 0) / (hospital.icu_total || 1) : 0;

  return (
    <div className={`min-h-screen ${bg} flex flex-col`}>
      {/* Top Header */}
      <div className={`${navBg} border-b px-5 py-4 flex items-center justify-between`}>
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest text-blue-600`}>Hospital Portal</p>
          <h1 className={`text-lg font-black truncate ${textPrimary}`}>
            {hospital?.name || 'Hospital Dashboard'}
          </h1>
        </div>
        <button
          onClick={logout}
          className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all active:scale-90"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Bar */}
      <div className={`${navBg} border-b flex overflow-x-auto scrollbar-hide no-scrollbar`}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const showDot = id === 'incoming' && activeRequest?.hospitalId === user?.hospitalId && activeRequest?.status !== 'arrived';
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all relative
                ${isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                  : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`
                }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
              {label}
              {showDot && (
                <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24">
        {/* ── Overview ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {!hospital ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className={`text-sm ${textSecondary}`}>Hospital data not found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={BedDouble}
                    label="ICU Available"
                    value={`${hospital.icu_available ?? 0}/${hospital.icu_total}`}
                    color="blue"
                    isDark={isDark}
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Occupancy"
                    value={`${Math.round((1 - icuPct) * 100)}%`}
                    color={icuPct < 0.2 ? 'red' : 'green'}
                    isDark={isDark}
                  />
                  <StatCard
                    icon={Stethoscope}
                    label="Doctors"
                    value={doctors.filter(d => d.hospitalIds?.includes(hospital.id)).length}
                    color="purple"
                    isDark={isDark}
                  />
                  <StatCard
                    icon={Shield}
                    label="Insurance Plans"
                    value={hospital.insuranceAccepted?.length ?? 0}
                    color="green"
                    isDark={isDark}
                  />
                  <StatCard
                    icon={Activity}
                    label="Fleet Available"
                    value={`${ambulances.filter(a => a.status === 'available').length}/${ambulances.length}`}
                    color="amber"
                    isDark={isDark}
                  />
                </div>

                {/* Hospital info */}
                <div className={`rounded-2xl border p-4 ${card}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-3`}>Details</p>
                  <div className="space-y-2">
                    <InfoRow label="Address" value={hospital.address || 'N/A'} isDark={isDark} />
                    <InfoRow label="Phone" value={hospital.phone || 'N/A'} isDark={isDark} />
                    <InfoRow label="Type" value={hospital.type || 'N/A'} isDark={isDark} />
                    <InfoRow label="Cost Level" value={(hospital.costLevel || 'N/A').toUpperCase()} isDark={isDark} />
                    <InfoRow label="Status" value={hospital.emergencyReady ? '✅ Emergency Ready' : '⚠️ Limited'} isDark={isDark} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ICU Manager ──────────────────────────────────────────── */}
        {activeTab === 'icu' && (
          <div className="animate-fade-in">
            <ICUManager
              hospital={hospital}
              isDark={isDark}
              onUpdateICU={(count) => onUpdateICU?.(hospital?.id, count)}
              onUpdateCostLevel={(level) => onUpdateCostLevel?.(hospital?.id, level)}
              onToggleInsurance={(ins) => onToggleInsurance?.(hospital?.id, ins)}
            />
          </div>
        )}

        {/* ── Doctor Manager ───────────────────────────────────────── */}
        {activeTab === 'doctors' && (
          <div className="animate-fade-in">
            <DoctorManager
              doctors={doctors}
              hospitalId={hospital?.id}
              isDark={isDark}
              onToggleAvailability={(docId, day) => onToggleDoctorDay?.(docId, day)}
            />
          </div>
        )}

        {/* ── Ambulance Fleet ─────────────────────────────────────────── */}
        {activeTab === 'fleet' && (
          <div className="animate-fade-in">
            <AmbulanceFleet
              ambulances={ambulances}
              hospitals={hospitals}
              activeRequest={activeRequest}
              hospitalId={hospital?.id}
              isDark={isDark}
              onUpdateDriver={onUpdateAmbulanceDriver}
              onAddAmbulance={onAddAmbulance}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'text-blue-500' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  icon: 'text-green-500' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    icon: 'text-red-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
};

const StatCard = ({ icon: Icon, label, value, color, isDark }) => {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
      <div className={`w-9 h-9 rounded-xl ${isDark ? 'bg-slate-700' : c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
      </div>
      <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
      <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
    </div>
  );
};

const InfoRow = ({ label, value, isDark }) => (
  <div className="flex items-start justify-between gap-4">
    <span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-gray-400'} shrink-0 w-24`}>{label}</span>
    <span className={`text-xs text-right ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{value}</span>
  </div>
);

export default HospitalPortal;
