/**
 * StatusBar.jsx — Animated status messages during ambulance dispatch flow.
 *
 * Shows as a floating pill above the bottom sheet.
 * Status messages reflect system state transitions.
 */

import React, { useEffect, useState } from 'react';

const STATUS_MESSAGES = {
  idle:      null,
  searching: { emoji: '🔍', text: 'Searching best hospitals...', color: 'bg-slate-800 text-white' },
  matched:   { emoji: '🏥', text: null,                          color: 'bg-blue-600 text-white' },
  pending:   { emoji: '📡', text: 'Requesting ambulance...',     color: 'bg-orange-500 text-white' },
  en_route:  { emoji: '🚑', text: null,                          color: 'bg-blue-600 text-white' },
  arrived:   { emoji: '✅', text: 'Ambulance arrived!',           color: 'bg-green-600 text-white' },
};

const StatusBar = ({ activeRequest, bestMatch, isSearching, isDark = false }) => {
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let m = null;

    if (activeRequest?.status === 'pending') {
      m = STATUS_MESSAGES.pending;
    }

    if (m) {
      setMsg(m);
      setVisible(true);
    } else {
      setVisible(false);
      setTimeout(() => setMsg(null), 400);
    }
  }, [activeRequest, bestMatch, isSearching]);

  if (!msg) return null;

  return (
    <div
      className={`z-40 transition-all duration-400 pointer-events-auto
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}
      `}
    >
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-semibold whitespace-nowrap ${msg.color}`}>
        <span>{msg.emoji}</span>
        <span>{msg.text}</span>
      </div>
    </div>
  );
};

export default StatusBar;
