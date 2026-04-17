/**
 * DoctorCard.jsx — Compact doctor card for search results.
 */

import React from 'react';
import { Star, MapPin, Calendar } from 'lucide-react';

const DAYS_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorCard = ({ doctor, hospitals = [], isDark = false, onClick }) => {
  if (!doctor) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySlots = doctor.schedule?.[today] || [];
  const availableToday = todaySlots.length > 0;
  const docHospitals = hospitals.filter(h => doctor.hospitalIds?.includes(h.id));

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 hover:shadow-md active:scale-[0.98] ${card}`}
    >
      {/* Top row: avatar + name + specialty */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-12 h-12 rounded-xl object-cover bg-gradient-to-br from-blue-100 to-indigo-100"
            onError={e => { e.target.style.display = 'none'; }}
          />
          {availableToday && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${textPrimary}`}>{doctor.name}</p>
          <p className="text-xs text-blue-600 font-semibold">{doctor.specialty}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className={`text-xs font-semibold ${textSecondary}`}>{doctor.rating}</span>
            </span>
            <span className={`text-xs ${textSecondary}`}>·</span>
            <span className={`text-xs ${textSecondary}`}>{doctor.experience} yrs exp</span>
          </div>
        </div>
        <div className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${availableToday ? 'bg-green-100 text-green-700' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
          {availableToday ? 'Today' : 'Busy'}
        </div>
      </div>

      {/* Detailed Today Schedule */}
      {availableToday ? (
        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'} space-y-1.5`}>
          <p className={`text-[10px] uppercase font-bold tracking-wider ${textSecondary}`}>Today's Schedule</p>
          {todaySlots.map((slot, i) => {
            const h = hospitals.find(h => h.id === slot.hospitalId);
            return h ? (
              <div key={i} className={`flex items-center justify-between text-[11px] p-1.5 rounded-lg ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-green-50 text-green-700'}`}>
                <span className="font-semibold truncate mr-2">{h.name.split(' ').slice(0, 3).join(' ')}</span>
                <span className="shrink-0">{slot.time}</span>
              </div>
            ) : null;
          })}
        </div>
      ) : (
        <div className={`mt-3 pt-3 flex items-center justify-between text-[11px] p-1.5 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
           <span className={`${textSecondary}`}>No slots available today</span>
        </div>
      )}

      {/* Week overview dots */}
      <div className="mt-3 flex items-center gap-1.5">
        <Calendar className={`w-3 h-3 ${textSecondary} shrink-0`} />
        <div className="flex gap-1">
          {ALL_DAYS.slice(0, 7).map(day => {
            const hasSlots = (doctor.schedule?.[day] || []).length > 0;
            return (
            <span
              key={day}
              title={day}
              className={`w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center
                ${hasSlots
                  ? 'bg-green-500 text-white'
                  : isDark ? 'bg-slate-700 text-slate-500' : 'bg-gray-100 text-gray-400'
                }
                ${day === today && hasSlots ? 'ring-2 ring-green-400 ring-offset-1' : ''}
              `}
            >
              {DAYS_SHORT[day]?.[0]}
            </span>
          )})}
        </div>
      </div>
    </button>
  );
};

export default DoctorCard;
