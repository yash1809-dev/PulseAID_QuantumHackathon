/**
 * DoctorDashboard.jsx — Doctor's personal portal.
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doctorService } from '../services/doctorService';
import { SPECIALTIES } from '../data/doctors';
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
  onLinkHospital,
  onUnlinkHospital,
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

  const [addDay, setAddDay] = useState('Monday');
  const [addHospital, setAddHospital] = useState('');
  const [addTime, setAddTime] = useState('');
  
  // Link hospital state
  const [linkHospitalId, setLinkHospitalId] = useState('');

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
      <div className={`${navBg} border-b flex overflow-x-auto scrollbar-hide no-scrollbar`}>
        {[
          { id: 'profile', label: 'Profile', Icon: User },
          { id: 'schedule', label: 'Schedule', Icon: Calendar },
          { id: 'hospitals', label: 'My Hospitals', Icon: Building2 },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all
              ${activeTab === id
                ? 'border-teal-600 text-teal-600 bg-teal-50/30'
                : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`
              }`}
          >
            <Icon className={`w-3.5 h-3.5 transition-transform ${activeTab === id ? 'scale-110' : 'scale-100'}`} />
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

        <div className="grid grid-cols-3 gap-3 mb-6">
          <MiniStat icon={Building2} value={connectedHospitals} label="Hospitals" color="blue" isDark={isDark} />
          <MiniStat icon={Calendar} value={activeDays} label="Active Days" color="teal" isDark={isDark} />
          <MiniStat icon={Clock} value={totalSlots} label="Weekly Slots" color="purple" isDark={isDark} />
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Stethoscope className="w-4 h-4 text-teal-500" /> Doctor Profile
                </h2>
                {!editMode ? (
                  <button onClick={enterEdit} className="text-xs font-bold text-teal-600">Edit</button>
                ) : (
                  <button onClick={handleSaveProfile} className="text-xs font-bold bg-teal-600 text-white px-3 py-1.5 rounded-lg">Save</button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <FieldInput label="Full Name" value={editName} onChange={setEditName} cls={inputCls} isDark={isDark} />
                  <FieldInput label="Experience" value={editExperience} onChange={setEditExperience} type="number" cls={inputCls} isDark={isDark} />
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Bio</label>
                    <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} className={`w-full rounded-xl border px-3 py-2.5 text-sm ${inputCls}`} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow label="Name" value={doctor.name} isDark={isDark} />
                  <InfoRow label="Specialty" value={doctor.specialty} isDark={isDark} />
                  <InfoRow label="Experience" value={`${doctor.experience} years`} isDark={isDark} />
                  <div className="pt-2 border-t dark:border-slate-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bio</p>
                    <p className={`text-sm ${textPrimary}`}>{doctor.bio || 'No bio set.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
             {/* Add slot and schedule display (using components/Doctor pattern) */}
             <div className={`rounded-2xl border p-4 ${card}`}>
              <p className={`text-xs font-bold flex items-center gap-2 mb-3 ${textPrimary}`}>
                <Plus className="w-3.5 h-3.5 text-teal-500" /> Add Schedule Slot
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select value={addDay} onChange={e => setAddDay(e.target.value)} className={`rounded-xl border px-3 py-2.5 text-xs ${inputCls}`}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={addHospital} onChange={e => setAddHospital(e.target.value)} className={`rounded-xl border px-3 py-2.5 text-xs ${inputCls}`}>
                  <option value="">Select Hospital</option>
                  {hospitals.filter(h => doctor.hospitalIds?.includes(h.id)).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input type="text" value={addTime} onChange={e => setAddTime(e.target.value)} placeholder="09:00 AM - 01:00 PM" className={`flex-1 rounded-xl border px-3 py-2.5 text-xs ${inputCls}`} />
                <button onClick={handleAddSlot} disabled={!addHospital || !addTime} className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold">Add</button>
              </div>
            </div>

            {DAYS.map(day => {
              const slots = doctor.schedule?.[day] || [];
              return (
                <div key={day} className={`rounded-2xl border overflow-hidden ${card}`}>
                  <div className={`px-4 py-3 flex items-center justify-between ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <span className={`text-xs font-bold ${textPrimary}`}>{day}</span>
                  </div>
                  <div className="divide-y dark:divide-slate-700">
                    {slots.map((slot, i) => {
                      const h = hospitals.find(h => h.id === slot.hospitalId);
                      return (
                        <div key={i} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className={`text-xs font-bold ${textPrimary}`}>{h?.name}</p>
                            <p className="text-[11px] text-gray-500">{slot.time}</p>
                          </div>
                          <button onClick={() => handleRemoveSlot(day, i)} className="text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hospitals Tab */}
        {activeTab === 'hospitals' && (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${card}`}>
              <p className={`text-xs font-bold flex items-center gap-2 mb-3 ${textPrimary}`}>
                <Building2 className="w-3.5 h-3.5 text-blue-500" /> Link New Hospital
              </p>
              <div className="flex gap-2">
                <select value={linkHospitalId} onChange={e => setLinkHospitalId(e.target.value)} className={`flex-1 rounded-xl border px-3 py-2.5 text-xs ${inputCls}`}>
                  <option value="">Select Hospital to Link</option>
                  {hospitals.filter(h => !doctor.hospitalIds?.includes(h.id)).map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!linkHospitalId) return;
                    onLinkHospital?.(doctor.id, linkHospitalId);
                    setLinkHospitalId('');
                    setSaveFlash(true);
                    setTimeout(() => setSaveFlash(false), 2000);
                  }}
                  disabled={!linkHospitalId}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  Link
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {doctor.hospitalIds?.map(hId => {
                const hosp = hospitals.find(h => h.id === hId);
                return hosp ? (
                  <div key={hId} className={`rounded-2xl border p-4 ${card} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      <p className={`text-sm font-bold ${textPrimary}`}>{hosp.name}</p>
                    </div>
                    <button
                      onClick={() => onUnlinkHospital?.(doctor.id, hId)}
                      className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Unlink
                    </button>
                  </div>
                ) : null;
              })}
              {(!doctor.hospitalIds || doctor.hospitalIds.length === 0) && (
                <p className={`text-sm text-center py-6 ${textSecondary}`}>No hospitals linked yet. Link one above!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MiniStat = ({ icon: Icon, value, label, color, isDark }) => (
  <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
    <Icon className={`w-4 h-4 mx-auto mb-1 ${color === 'teal' ? 'text-teal-500' : color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`} />
    <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
    <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
  </div>
);

const InfoRow = ({ label, value, isDark }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-gray-400 font-bold uppercase">{label}</span>
    <span className={isDark ? 'text-white' : 'text-gray-800'}>{value}</span>
  </div>
);

const FieldInput = ({ label, value, onChange, type = 'text', cls, isDark }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className={`w-full rounded-xl border px-3 py-2.5 text-sm ${cls}`} />
  </div>
);

export default DoctorDashboard;
