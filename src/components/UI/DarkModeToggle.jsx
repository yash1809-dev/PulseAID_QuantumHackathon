import React from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className={`
        absolute top-4 right-16 z-10 w-9 h-9 rounded-xl flex items-center justify-center
        shadow-lg border transition-all duration-200 active:scale-90
        ${isDark
          ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700'
          : 'bg-white/95 border-gray-100 text-gray-600 hover:bg-gray-50'
        }
      `}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default DarkModeToggle;
