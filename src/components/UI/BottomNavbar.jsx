/**
 * BottomNavbar.jsx — Fixed bottom tab bar (Map / Doctors / Profile).
 *
 * Always visible at bottom. Switches main view in App.jsx via onTabChange.
 * Glassmorphism background, active tab indicator.
 */

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Map, Stethoscope, User, Landmark, FileHeart } from 'lucide-react';

const TABS = [
  { id: 'map',     label: 'Map',     Icon: Map },
  { id: 'doctors', label: 'Doctors', Icon: Stethoscope },
  { id: 'schemes', label: 'Schemes', Icon: Landmark },
  { id: 'records', label: 'Records', Icon: FileHeart },
  { id: 'profile', label: 'Profile', Icon: User },
];

const BottomNavbar = ({ activeTab = 'map', onTabChange, isDark = false }) => {
  const { t } = useLanguage();
  const bg = isDark
    ? 'bg-slate-900/95 border-slate-700'
    : 'bg-white/95 border-gray-100';

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl ${bg}`}>
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 relative
                ${isActive
                  ? isDark ? 'text-blue-400' : 'text-blue-600'
                  : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-600" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {t(`nav.${id}`)}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area bottom padding */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
};

export default BottomNavbar;
