/**
 * ProfileView.jsx — Extended user profile and preferences.
 * 
 * Allows setting medical records, government schemes, and explicit doctor/hospital preferences.
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Shield, Target, Activity, FileText, Building2, Stethoscope, Moon, Sun, Settings2, Beaker } from 'lucide-react';
import { INSURANCE_OPTIONS } from '../../data/hospitals';
import DarkModeToggle from './DarkModeToggle';
import DemoControl from './DemoControl';

const PrefRow = ({ label, icon: Icon, value, options, onChange, placeholder, isDark }) => {
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 border-b last:border-0 ${isDark ? 'border-slate-700' : 'border-gray-50'}`}>
      <div className="flex items-center gap-3 w-1/2">
        <div className={`w-8 h-8 rounded-xl flex shrink-0 items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-blue-50'}`}>
          <Icon className="w-4 h-4 text-blue-500" />
        </div>
        <span className={`text-sm font-medium truncate ${textPrimary}`}>{label}</span>
      </div>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`text-sm font-semibold text-right pr-1 w-1/2 bg-transparent outline-none cursor-pointer truncate ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
      >
        <option value="">{placeholder || 'None'}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
};

const ProfileView = ({ 
  isDark = false, 
  hospitals = [], 
  doctors = [], 
  onToggleDark,
  demoProps = {} 
}) => {
  const { user, updateUserPrefs, logout } = useAuth();
  const [conditions, setConditions] = useState(user?.medicalConditions || '');
  
  if (!user) return null;

  const bg = isDark ? 'bg-slate-900' : 'bg-gray-50';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  const handleConditionsBlur = () => {
    updateUserPrefs({ medicalConditions: conditions });
  };

  const handleToggleScheme = (schemeName) => {
    const current = user.enrolledSchemes || [];
    const updated = current.includes(schemeName)
      ? current.filter(s => s !== schemeName)
      : [...current, schemeName];
    updateUserPrefs({ enrolledSchemes: updated });
  };

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-24`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border-b px-6 py-6 sticky top-0 z-10 backdrop-blur-md bg-opacity-90`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <User className="w-8 h-8 text-white" />
            }
          </div>
          <div>
            <h2 className={`text-xl font-black ${textPrimary}`}>{user.name}</h2>
            <p className={`text-sm ${textSecondary}`}>{user.email}</p>
            <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Patient
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        
        {/* Medical Records Section */}
        <section>
          <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary} mb-2 px-1 flex items-center gap-2`}>
            <Activity className="w-3.5 h-3.5" /> Medical Profile
          </p>
          <div className={`rounded-2xl border p-4 ${card}`}>
            <label className={`text-sm font-medium ${textPrimary} mb-2 block`}>Medical Conditions & Allergies</label>
            <textarea
              className={`w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              rows="3"
              placeholder="E.g., Heart patient, Diabetic, Penicillin allergy..."
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              onBlur={handleConditionsBlur}
            />
            <p className={`text-[10px] mt-2 ${textSecondary}`}>This information helps us recommend the best specialized hospital (e.g., Cardiology vs Neurology) during an emergency.</p>
          </div>
        </section>

        {/* Insurance Section */}
        <section>
          <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary} mb-2 px-1 flex items-center gap-2`}>
            <Shield className="w-3.5 h-3.5" /> Healthcare Coverage
          </p>
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <PrefRow
              label="Private Insurance"
              icon={FileText}
              value={user.insurance || 'none'}
              options={[
                { value: 'none', label: 'None' },
                ...INSURANCE_OPTIONS.map(i => ({ value: i, label: i })),
              ]}
              onChange={val => updateUserPrefs({ insurance: val })}
              placeholder="No Insurance"
              isDark={isDark}
            />
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary} mb-2 px-1 flex items-center gap-2`}>
            <Target className="w-3.5 h-3.5" /> Emergency Preferences
          </p>
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <PrefRow
              label="Preferred Hospital"
              icon={Building2}
              value={user.preferredHospitalId || ''}
              options={hospitals.map(h => ({ value: h.id, label: h.name }))}
              onChange={val => updateUserPrefs({ preferredHospitalId: val })}
              placeholder="Any Hospital"
              isDark={isDark}
            />
            <PrefRow
              label="Preferred Doctor"
              icon={Stethoscope}
              value={user.preferredDoctorId || ''}
              options={doctors.map(d => ({ value: d.id, label: `Dr. ${d.name}` }))}
              onChange={val => updateUserPrefs({ preferredDoctorId: val })}
              placeholder="Any Doctor"
              isDark={isDark}
            />
            <PrefRow
              label="Matching Priority"
              icon={Target}
              value={user.priority || 'nearest'}
              options={[
                { value: 'nearest', label: '📍 Nearest First' },
                { value: 'cheapest', label: '💰 Cheapest First' },
                { value: 'best_doctor', label: '👨‍⚕️ Available Doctors' },
              ]}
              onChange={val => updateUserPrefs({ priority: val })}
              isDark={isDark}
            />
          </div>
        </section>

        {/* System Settings Section */}
        <section>
          <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary} mb-2 px-1 flex items-center gap-2`}>
            <Settings2 className="w-3.5 h-3.5" /> App Settings
          </p>
          <div className={`rounded-2xl border divide-y overflow-hidden ${card}`}>
            <div className={`flex items-center justify-between px-4 py-3.5 ${isDark ? 'divide-slate-700' : 'divide-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-blue-50'}`}>
                  {isDark ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-orange-500" />}
                </div>
                <span className={`text-sm font-medium ${textPrimary}`}>Dark Mode</span>
              </div>
              <button 
                onClick={onToggleDark}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
                  ${isDark ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {/* Demo Control integrated here */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-4 h-4 text-purple-500" />
                <span className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Simulation Tools</span>
              </div>
              <div className="scale-90 -ml-4 -mt-2">
                <DemoControl {...demoProps} isDark={isDark} />
              </div>
            </div>
          </div>
        </section>

        {/* Logout */}
        <div className="py-2">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-sm transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <p className={`text-center text-xs ${textSecondary} opacity-50 pb-6`}>
          MedConnect — Profile Settings v1.0
        </p>
      </div>
    </div>
  );
};

export default ProfileView;
