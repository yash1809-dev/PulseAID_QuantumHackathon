/**
 * DoctorManager.jsx — Hospital admin: toggle doctor availability by day.
 */

import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

const DoctorManager = ({ doctors = [], hospitalId, isDark = false, onToggleAvailability }) => {
  const hospitalDoctors = doctors.filter(d => d.hospitalIds?.includes(hospitalId));
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  if (hospitalDoctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <span className="text-4xl">👨‍⚕️</span>
        <p className={`text-sm ${textSecondary}`}>No doctors assigned to this hospital.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hospitalDoctors.map(doctor => {
        const availableToday = doctor.availableDays?.includes(today) || false;
        return (
          <div key={doctor.id} className={`rounded-2xl border p-4 ${card}`}>
            {/* Doctor header */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-10 h-10 rounded-xl object-cover bg-blue-100"
                onError={e => e.target.classList.add('opacity-0')}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${textPrimary}`}>{doctor.name}</p>
                <p className="text-xs text-blue-600 font-medium">{doctor.specialty}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold
                ${availableToday
                  ? 'bg-green-100 text-green-700'
                  : isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {availableToday ? '✓ Active Today' : 'Off Today'}
              </span>
            </div>

            {/* Detailed Day Schedule (Read-Only due to complex time rules) */}
            <div className="space-y-1.5 mt-2">
              {ALL_DAYS.map(day => {
                const slots = doctor.schedule?.[day] || [];
                const localSlots = slots.filter(s => s.hospitalId === hospitalId);
                const isAvail = localSlots.length > 0;
                const isToday = day === today;
                
                return (
                  <div key={day} className={`flex items-center justify-between p-2 rounded-xl border ${isToday ? (isDark ? 'border-blue-500/50 bg-blue-900/20' : 'border-blue-200 bg-blue-50') : isDark ? 'border-slate-700' : 'border-gray-50'}`}>
                    <span className={`text-xs font-bold w-12 ${isToday ? 'text-blue-600' : textSecondary}`}>{day.slice(0, 3)}</span>
                    <div className="flex-1 flex flex-wrap gap-1">
                      {isAvail ? (
                        localSlots.map((slot, i) => (
                           <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-green-100 text-green-700">
                             {slot.time}
                           </span>
                        ))
                      ) : (
                        <span className={`text-[10px] font-medium ${textSecondary}`}>Off</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DoctorManager;
