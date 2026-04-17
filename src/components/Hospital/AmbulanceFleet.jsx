/**
 * AmbulanceFleet.jsx — Fleet monitoring + driver info editing for hospital admins.
 */

import React, { useState } from 'react';
import {
  Ambulance, User, ArrowRight, CheckCircle2, AlertCircle, Clock,
  Edit3, Save, X, Phone
} from 'lucide-react';

const AmbulanceFleet = ({
  ambulances = [], hospitals = [], activeRequest = null,
  hospitalId = null, isDark = false, onUpdateDriver, onAddAmbulance,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ plateNumber: '', driverName: '', driverPhone: '', type: 'Basic Life Support' });

  const total = ambulances.length;
  const availableCount = ambulances.filter(a => a.status === 'available').length;
  const busyCount = total - availableCount;

  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';

  const startEdit = (amb) => {
    setEditingId(amb.id);
    setEditForm({
      driverName: amb.driverName || '',
      driverPhone: amb.driverPhone || '',
      type: amb.type || '',
    });
  };

  const saveEdit = (ambId) => {
    onUpdateDriver?.(ambId, editForm);
    setEditingId(null);
  };

  const inputCls = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatItem label="Total" value={total} icon={Ambulance} color="blue" isDark={isDark} />
        <StatItem label="Available" value={availableCount} icon={CheckCircle2} color="green" isDark={isDark} />
        <StatItem label="On-Duty" value={busyCount} icon={Clock} color="amber" isDark={isDark} />
      </div>

      {/* Fleet List */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-100 bg-blue-50/50'} flex items-center justify-between`}>
          <h3 className={`text-xs font-bold flex items-center gap-2 ${textPrimary}`}>
            <Ambulance className="w-4 h-4 text-blue-500" /> Live Fleet Status
          </h3>
          <button
            onClick={() => setIsAdding(true)}
            className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition"
          >
            + Add Unit
          </button>
        </div>

        {isAdding && (
          <div className={`p-4 border-b ${isDark ? 'border-slate-700 bg-slate-900/30' : 'border-gray-100 bg-gray-50/50'}`}>
            <p className="text-[10px] font-black uppercase text-blue-600 mb-3">Register New Ambulance</p>
            <div className="space-y-2">
              <input value={addForm.plateNumber}
                onChange={e => setAddForm(f => ({...f, plateNumber: e.target.value}))}
                placeholder="Plate Number (e.g. MH-12-AM-XXX)"
                className={`w-full rounded-xl border px-3 py-2 text-xs ${inputCls}`} />
              <input value={addForm.driverName}
                onChange={e => setAddForm(f => ({...f, driverName: e.target.value}))}
                placeholder="Driver Name"
                className={`w-full rounded-xl border px-3 py-2 text-xs ${inputCls}`} />
              <input value={addForm.driverPhone}
                onChange={e => setAddForm(f => ({...f, driverPhone: e.target.value}))}
                placeholder="Contact Phone"
                className={`w-full rounded-xl border px-3 py-2 text-xs ${inputCls}`} />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAddAmbulance?.(addForm);
                    setIsAdding(false);
                    setAddForm({ plateNumber: '', driverName: '', driverPhone: '', type: 'Basic Life Support' });
                  }}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Confirm Registration
                </button>
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-600 text-xs font-bold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-100'}`}>
          {ambulances.map(amb => {
            const isBusy = amb.status === 'busy';
            const isEditing = editingId === amb.id;
            const isAssignedToUs = activeRequest?.ambulanceId === amb.id && activeRequest?.hospitalId === hospitalId;

            return (
              <div key={amb.id} className={`p-4 ${isAssignedToUs ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50/50') : ''}`}>
                {isEditing ? (
                  /* ── Edit Mode ────────────────────── */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${textPrimary}`}>{amb.plateNumber}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => saveEdit(amb.id)}
                          className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center text-white active:scale-95">
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 active:scale-95">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input value={editForm.driverName}
                      onChange={e => setEditForm(f => ({...f, driverName: e.target.value}))}
                      placeholder="Driver Name"
                      className={`w-full rounded-xl border px-3 py-2 text-xs ${inputCls}`} />
                    <input value={editForm.driverPhone}
                      onChange={e => setEditForm(f => ({...f, driverPhone: e.target.value}))}
                      placeholder="Phone Number"
                      className={`w-full rounded-xl border px-3 py-2 text-xs ${inputCls}`} />
                    <select value={editForm.type}
                      onChange={e => setEditForm(f => ({...f, type: e.target.value}))}
                      className={`w-full rounded-xl border px-3 py-2 text-xs ${inputCls}`}>
                      <option value="Basic Life Support">Basic Life Support</option>
                      <option value="Advance Life Support">Advance Life Support</option>
                      <option value="Cardiac Care">Cardiac Care</option>
                    </select>
                  </div>
                ) : (
                  /* ── View Mode ────────────────────── */
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                        ${isBusy ? (isDark ? 'bg-amber-900/30 text-amber-500' : 'bg-amber-100 text-amber-600')
                                 : (isDark ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-600')}`}>
                        <Ambulance className={`w-4 h-4 ${isBusy && !isAssignedToUs ? 'animate-pulse' : ''}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${textPrimary}`}>{amb.plateNumber}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase
                            ${isBusy ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {amb.status}
                          </span>
                          {isAssignedToUs && (
                            <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase">
                              Incoming
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-3 mt-1 text-[11px] ${textSecondary}`}>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {amb.driverName || 'Not assigned'}
                          </span>
                        </div>
                        <div className={`flex items-center gap-3 mt-0.5 text-[10px] ${textSecondary}`}>
                          <span className="italic">{amb.type || 'Standard'}</span>
                          {amb.driverPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" /> {amb.driverPhone}
                            </span>
                          )}
                        </div>
                        {isBusy && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-amber-600">
                            <Clock className="w-3 h-3" />
                            {isAssignedToUs
                              ? <span>ETA {activeRequest?.eta || '...'} → {hospitals.find(h => h.id === hospitalId)?.name}</span>
                              : <span>Emergency Dispatch Active</span>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => startEdit(amb)}
                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90
                        ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      title="Edit driver info">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div className={`p-3 rounded-xl border flex gap-3 text-[11px] ${isDark ? 'bg-blue-900/10 border-blue-900/30 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p>Fleet is shared across the Pune municipal ecosystem. Tap the edit icon to update driver details for any unit.</p>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon: Icon, color, isDark }) => {
  const colors = {
    blue:  isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800'  : 'bg-blue-50 text-blue-600 border-blue-100',
    green: isDark ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-600 border-green-100',
    amber: isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className={`p-3 rounded-2xl border ${colors[color]} flex flex-col items-center text-center`}>
      <Icon className="w-4 h-4 mb-1" />
      <p className="text-xl font-black">{value}</p>
      <p className="text-[9px] uppercase font-bold tracking-wider opacity-70">{label}</p>
    </div>
  );
};

export default AmbulanceFleet;
