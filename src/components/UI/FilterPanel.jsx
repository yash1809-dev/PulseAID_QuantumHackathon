/**
 * FilterPanel.jsx — Insurance, budget, and priority filter chips.
 *
 * Used inside the BottomSheet. Feeds into matching engine in real-time.
 * All state is lifted up to App.jsx through callbacks.
 */

import React from 'react';
import { Shield, DollarSign, Target } from 'lucide-react';
import { INSURANCE_OPTIONS } from '../../data/hospitals';

const BUDGET_OPTIONS = [
  { value: 'low', label: 'Low', emoji: '₹' },
  { value: 'medium', label: 'Medium', emoji: '₹₹' },
  { value: 'high', label: 'High', emoji: '₹₹₹' },
];

const PRIORITY_OPTIONS = [
  { value: 'nearest', label: 'Nearest', emoji: '📍' },
  { value: 'cheapest', label: 'Cheapest', emoji: '💰' },
  { value: 'best_doctor', label: 'Best Doctor', emoji: '👨‍⚕️' },
];

const FilterPanel = ({
  insurance, setInsurance,
  budget, setBudget,
  priority, setPriority,
  isDark = false,
}) => {
  const rowLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const chip = (active, col = 'blue') => {
    const colors = {
      blue:   active ? 'bg-blue-600 text-white border-blue-600' : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400',
      green:  active ? 'bg-green-600 text-white border-green-600' : isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-gray-600 border-gray-200',
      purple: active ? 'bg-purple-600 text-white border-purple-600' : isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-gray-600 border-gray-200',
    };
    return `px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 whitespace-nowrap ${colors[col]}`;
  };

  return (
    <div className="space-y-3 px-4 py-3">
      {/* Insurance */}
      <div>
        <div className={`flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider ${rowLabel}`}>
          <Shield className="w-3 h-3" />
          Insurance
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setInsurance('none')}
            className={chip(insurance === 'none' || !insurance, 'blue')}
          >
            None
          </button>
          {INSURANCE_OPTIONS.slice(0, 5).map(ins => (
            <button
              key={ins}
              onClick={() => setInsurance(insurance === ins ? 'none' : ins)}
              className={chip(insurance === ins, 'blue')}
            >
              {ins}
            </button>
          ))}
          {/* Show remaining in a submenu only if there are more */}
        </div>
        {/* Second row of insurance options */}
        <div className="flex gap-2 flex-wrap mt-1.5">
          {INSURANCE_OPTIONS.slice(5).map(ins => (
            <button
              key={ins}
              onClick={() => setInsurance(insurance === ins ? 'none' : ins)}
              className={chip(insurance === ins, 'blue')}
            >
              {ins}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <div className={`flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider ${rowLabel}`}>
          <DollarSign className="w-3 h-3" />
          Budget
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBudget(null)}
            className={chip(!budget, 'green')}
          >
            Any
          </button>
          {BUDGET_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setBudget(budget === opt.value ? null : opt.value)}
              className={chip(budget === opt.value, 'green')}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <div className={`flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider ${rowLabel}`}>
          <Target className="w-3 h-3" />
          Priority
        </div>
        <div className="flex gap-2">
          {PRIORITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPriority(opt.value)}
              className={chip(priority === opt.value, 'purple')}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
