/**
 * DoctorDashboard.jsx — Doctor's personal portal.
 *
 * Sections:
 *  1. Profile — view/edit name, specialty, experience, bio
 *  2. Schedule — manage per-day hospital time slots
 *  3. My Hospitals — see which hospitals they're attached to
 *  4. Stats — quick overview of connected hospitals and weekly slots
 *
 * All mutations go through doctorService → App.jsx setState.
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import { SPECIALTIES } from '../../data/doctors';
import {
  User, Stethoscope, Calendar, Building2, LogOut, Save,
  Clock, Plus, X, CheckCircle2, Edit3, MapPin, Star, Award
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorDashboard = ({
  doctors = [],
  hospitals = [],
  isDark = false,
  onUpdateProfile,
  onAddSlot,
  onRemoveSlot,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Find this doctor's data
  const doctor = useMemo(
    () => doctorService.getById(doctors, user?.doctorId),
    [doctors, user?.doctorId]
  );

  // Editable profile state
  const [editName, setEditName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editBio, setEditBio] = useState('');

  // Schedule add-slot state
  const [addDay, setAddDay] = useState('Monday');
  const [addHospital, setAddHospital] = useState('');
  const [addTime, setAddTime] = useState('');

  const enterEdit = () => {
    if (!doctor) return;
    setEditName(doctor.name);
    setEditSpecialty(doctor.specialty);
    setEditExperience(String(doctor.experience));
    setEditBio(doctor.bio || '');
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    if (!doctor) return;
    onUpdateProfile?.(doctor.id, {
      name: editName,
      specialty: editSpecialty,
      experience: parseInt(editExperience) || doctor.experience,
      bio: editBio,
    });
    setEditMode(false);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const handleAddSlot = () => {
    if (!addHospital || !addTime || !doctor) return;
    onAddSlot?.(doctor.id, addDay, { hospitalId: addHospital, time: addTime });
    setAddTime('');
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const handleRemoveSlot = (day, index) => {
    if (!doctor) return;
    onRemoveSlot?.(doctor.id, day, index);
  };

  // Derived stats
  const totalSlots = doctor ? Object.values(doctor.schedule || {}).reduce((sum, s) => sum + s.length, 0) : 0;
  const connectedHospitals = doctor?.hospitalIds?.length || 0;
  const activeDays = doctor?.availableDays?.length || 0;

  const bg = isDark ? 'bg-slate-900' : 'bg-gray-50';
  const navBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const inputCls = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400';

  if (!doctor) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <p className={textSecondary}>Doctor profile not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col`}>
      {/* Header */}
      <div className={`${navBg} border-b px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100"
          />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Doctor Portal</p>
            <h1 className={`text-lg font-black truncate ${textPrimary}`}>{doctor.name}</h1>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all active:scale-90"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Tab bar */}
      <div className={`${navBg} border-b flex overflow-x-auto`}>
        {[
          { id: 'profile', label: 'Profile', Icon: User },
          { id: 'schedule', label: 'Schedule', Icon: Calendar },
          { id: 'hospitals', label: 'My Hospitals', Icon: Building2 },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all
              ${activeTab === id
                ? 'border-teal-600 text-teal-600'
                : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Save flash */}
      {saveFlash && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> Changes saved successfully
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24">

        {/* ── Stats Cards (always visible at top) ─────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MiniStat icon={Building2} value={connectedHospitals} label="Hospitals" color="blue" isDark={isDark} />
          <MiniStat icon={Calendar} value={activeDays} label="Active Days" color="teal" isDark={isDark} />
          <MiniStat icon={Clock} value={totalSlots} label="Weekly Slots" color="purple" isDark={isDark} />
        </div>

        {/* ── Profile Tab ─────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Stethoscope className="w-4 h-4 text-teal-500" /> Doctor Profile
                </h2>
                {!editMode ? (
                  <button
                    onClick={enterEdit}
                    className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-500 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-500 transition-all active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <FieldInput label="Full Name" value={editName} onChange={setEditName} cls={inputCls} isDark={isDark} />
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>Specialty</label>
                    <select
                      value={editSpecialty}
                      onChange={e => setEditSpecialty(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm ${inputCls} focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                    >
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <FieldInput label="Experience (Years)" value={editExperience} onChange={setEditExperience} type="number" cls={inputCls} isDark={isDark} />
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>Bio</label>
                    <textarea
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      rows={3}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm resize-none ${inputCls} focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow label="Name" value={doctor.name} isDark={isDark} />
                  <InfoRow label="Specialty" value={doctor.specialty} isDark={isDark} />
                  <InfoRow label="Experience" value={`${doctor.experience} years`} isDark={isDark} />
                  <InfoRow label="Qualification" value={doctor.qualification || 'N/A'} isDark={isDark} />
                  <InfoRow label="Rating" value={`⭐ ${doctor.rating}/5`} isDark={isDark} />
                  <div className={`pt-2 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>Bio</p>
                    <p className={`text-sm leading-relaxed ${textPrimary}`}>{doctor.bio || 'No bio set.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Schedule Tab ────────────────────────────────────────────── */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-fade-in">
            {/* Add slot form */}
            <div className={`rounded-2xl border p-4 ${card}`}>
              <p className={`text-xs font-bold flex items-center gap-2 mb-3 ${textPrimary}`}>
                <Plus className="w-3.5 h-3.5 text-teal-500" /> Add Schedule Slot
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select value={addDay} onChange={e => setAddDay(e.target.value)}
                  className={`rounded-xl border px-3 py-2.5 text-xs ${inputCls}`}
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={addHospital} onChange={e => setAddHospital(e.target.value)}
                  className={`rounded-xl border px-3 py-2.5 text-xs ${inputCls}`}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addTime}
                  onChange={e => setAddTime(e.target.value)}
                  placeholder="e.g. 09:00 AM - 01:00 PM"
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-xs ${inputCls} focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                />
                <button
                  onClick={handleAddSlot}
                  disabled={!addHospital || !addTime}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Day-by-day schedule */}
            {DAYS.map(day => {
              const slots = doctor.schedule?.[day] || [];
              return (
                <div key={day} className={`rounded-2xl border overflow-hidden ${card}`}>
                  <div className={`px-4 py-3 flex items-center justify-between ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <span className={`text-xs font-bold ${textPrimary}`}>{day}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                      ${slots.length > 0
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                        : `${isDark ? 'bg-slate-600 text-slate-400' : 'bg-gray-200 text-gray-500'}`
                      }`}
                    >
                      {slots.length > 0 ? `${slots.length} slot${slots.length > 1 ? 's' : ''}` : 'Off'}
                    </span>
                  </div>
                  {slots.length > 0 && (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                      {slots.map((slot, i) => {
                        const hosp = hospitals.find(h => h.id === slot.hospitalId);
                        return (
                          <div key={i} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className={`text-xs font-bold ${textPrimary}`}>{hosp?.name || slot.hospitalId}</p>
                              <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${textSecondary}`}>
                                <Clock className="w-3 h-3" /> {slot.time}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveSlot(day, i)}
                              className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all active:scale-90"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── My Hospitals Tab ────────────────────────────────────────── */}
        {activeTab === 'hospitals' && (
          <div className="space-y-3 animate-fade-in">
            {doctor.hospitalIds?.length > 0 ? (
              doctor.hospitalIds.map(hId => {
                const hosp = hospitals.find(h => h.id === hId);
                if (!hosp) return null;
                const slotsHere = Object.entries(doctor.schedule || {})
                  .filter(([, slots]) => slots.some(s => s.hospitalId === hId))
                  .map(([day, slots]) => ({
                    day,
                    times: slots.filter(s => s.hospitalId === hId).map(s => s.time),
                  }));

                return (
                  <div key={hId} className={`rounded-2xl border p-4 ${card}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <Building2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold ${textPrimary}`}>{hosp.name}</h3>
                        <p className={`text-[11px] flex items-center gap-1 ${textSecondary}`}>
                          <MapPin className="w-3 h-3" /> {hosp.address || 'Pune, Maharashtra'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {slotsHere.map(({ day, times }) => (
                            <span key={day} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                              {day.slice(0, 3)} · {times.join(', ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <Building2 className={`w-10 h-10 mb-3 ${textSecondary}`} />
                <p className={`text-sm font-medium ${textSecondary}`}>No hospitals assigned yet.</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                  Add schedule slots to link with hospitals.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const MiniStat = ({ icon: Icon, value, label, color, isDark }) => {
  const colors = {
    blue:   isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800'   : 'bg-blue-50 text-blue-600 border-blue-100',
    teal:   isDark ? 'bg-teal-900/30 text-teal-400 border-teal-800'   : 'bg-teal-50 text-teal-600 border-teal-100',
    purple: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className={`p-3 rounded-2xl border text-center ${colors[color]}`}>
      <Icon className="w-4 h-4 mx-auto mb-1" />
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">{label}</p>
    </div>
  );
};

const InfoRow = ({ label, value, isDark }) => (
  <div className="flex items-start justify-between gap-4">
    <span className={`text-xs font-semibold shrink-0 w-24 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{label}</span>
    <span className={`text-xs text-right ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{value}</span>
  </div>
);

const FieldInput = ({ label, value, onChange, type = 'text', cls, isDark }) => (
  <div>
    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full rounded-xl border px-3 py-2.5 text-sm ${cls} focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
    />
  </div>
);

export default DoctorDashboard;
