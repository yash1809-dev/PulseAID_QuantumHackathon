/**
 * DoctorSearch.jsx — Full-screen doctor search view.
 *
 * Features: search by name/specialty, specialty chips, DoctorCard grid, DoctorModal.
 * Handles empty and loading states.
 */

import React, { useState, useMemo } from 'react';
import DoctorCard from './DoctorCard';
import DoctorModal from './DoctorModal';
import { doctorService } from '../../services/doctorService';
import { Search, Stethoscope } from 'lucide-react';
import { SPECIALTIES } from '../../data/doctors';

const DoctorSearch = ({ doctors = [], hospitals = [], isDark = false, onSelectHospital }) => {
  const [query, setQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const filtered = useMemo(() => {
    let result = doctorService.search(doctors, query);
    result = doctorService.getBySpecialty(result, selectedSpecialty);
    return result;
  }, [doctors, query, selectedSpecialty]);

  const bg = isDark ? 'bg-slate-900' : 'bg-gray-50';
  const inputBg = isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const chipActive = isDark ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-600 text-white border-blue-600';
  const chipInactive = isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-gray-600 border-gray-200';

  return (
    <div className={`h-full overflow-y-auto pb-24 ${bg}`}>
      {/* Search Header */}
      <div className={`sticky top-0 z-10 px-4 py-4 ${isDark ? 'bg-slate-900/95' : 'bg-gray-50/95'} backdrop-blur-sm border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Find Doctors</h2>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or specialty..."
            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${inputBg}`}
          />
        </div>

        {/* Specialty Chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedSpecialty('all')}
            className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${selectedSpecialty === 'all' ? chipActive : chipInactive}`}
          >
            All
          </button>
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(selectedSpecialty === s ? 'all' : s)}
              className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${selectedSpecialty === s ? chipActive : chipInactive}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4 space-y-3">
        {/* Count */}
        {doctors.length > 0 && (
          <p className={`text-xs font-semibold ${textSecondary}`}>
            {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Loading state */}
        {doctors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className={`text-sm ${textSecondary}`}>Loading doctors...</p>
          </div>
        )}

        {/* Empty state */}
        {doctors.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="text-4xl">🔍</div>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>No doctors found</p>
            <p className={`text-xs ${textSecondary}`}>
              Try a different name or specialty
            </p>
          </div>
        )}

        {/* Doctor cards */}
        {filtered.map((doctor, idx) => (
          <div key={doctor.id} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
            <DoctorCard
              doctor={doctor}
              hospitals={hospitals}
              isDark={isDark}
              onClick={() => setSelectedDoctor(doctor)}
            />
          </div>
        ))}
      </div>

      {/* Doctor Modal */}
      {selectedDoctor && (
        <DoctorModal
          doctor={selectedDoctor}
          hospitals={hospitals}
          isDark={isDark}
          onClose={() => setSelectedDoctor(null)}
          onSelectHospital={(h) => {
            setSelectedDoctor(null);
            onSelectHospital?.(h);
          }}
        />
      )}
    </div>
  );
};

export default DoctorSearch;
