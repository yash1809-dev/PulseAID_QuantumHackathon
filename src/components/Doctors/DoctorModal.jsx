/**
 * DoctorModal.jsx — Detailed doctor profile overlay.
 *
 * Shown on tap of a DoctorCard.
 * Allows user to tap a hospital → triggers onSelectHospital (switches to map tab).
 */

import React from 'react';
import { X, Star, MapPin, Calendar, Award, Building2 } from 'lucide-react';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorModal = ({ doctor, hospitals = [], isDark = false, onClose, onSelectHospital }) => {
  if (!doctor) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const docHospitals = hospitals.filter(h => doctor.hospitalIds?.includes(h.id));

  const bg = isDark ? 'bg-slate-900' : 'bg-white';
  const overlay = 'bg-black/60 backdrop-blur-sm';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100';

  return (
    <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 ${overlay}`} onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in ${bg}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 px-6 pt-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-start gap-4">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover bg-blue-500/30"
              onError={e => e.target.classList.add('opacity-0')}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white truncate">{doctor.name}</h2>
              <p className="text-blue-200 font-semibold text-sm">{doctor.specialty}</p>
              <p className="text-blue-200/70 text-xs mt-0.5">{doctor.qualification}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span className="text-white text-xs font-bold">{doctor.rating}</span>
                </span>
                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <Award className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-bold">{doctor.experience} yrs</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Bio */}
          <p className={`text-sm leading-relaxed ${textSecondary}`}>{doctor.bio}</p>

          {/* Weekly Schedule Detail */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-3 flex items-center gap-1.5`}>
              <Calendar className="w-3.5 h-3.5" /> Detailed Schedule
            </h3>
            <div className="space-y-3">
              {ALL_DAYS.map(day => {
                const slots = doctor.schedule?.[day] || [];
                if (slots.length === 0) return null;
                const isToday = day === today;
                
                return (
                  <div key={day} className={`p-3 rounded-xl border ${isToday ? (isDark ? 'border-blue-500/50 bg-blue-900/10' : 'border-blue-200 bg-blue-50') : card}`}>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`text-xs font-bold ${isToday ? 'text-blue-600' : textPrimary}`}>{day} {isToday && '(Today)'}</span>
                    </div>
                    <div className="space-y-1.5">
                      {slots.map((slot, i) => {
                        const h = hospitals.find(h => h.id === slot.hospitalId);
                        return h ? (
                          <div key={i} className={`flex items-center justify-between text-xs ${textSecondary}`}>
                            <span className="font-medium truncate mr-2 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              {h.name}
                            </span>
                            <span className={`shrink-0 font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                              {slot.time}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
              {ALL_DAYS.every(day => !doctor.schedule?.[day]?.length) && (
                <p className={`text-sm ${textSecondary}`}>No schedule available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorModal;
