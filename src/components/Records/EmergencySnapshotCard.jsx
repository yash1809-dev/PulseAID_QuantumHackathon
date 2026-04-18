/**
 * EmergencySnapshotCard.jsx — Emergency snapshot panel with inline editing.
 *
 * In patient view (MedicalRecordsPage), shows an "Edit" button.
 * Edit mode lets the user fill/update all fields manually:
 *   - Blood Group (dropdown)
 *   - Allergies (comma-separated chips)
 *   - Chronic Conditions (comma-separated chips)
 *   - Current Medications (name + dose + frequency per row)
 *   - Previous Surgeries (comma-separated chips)
 *
 * Saves directly to Supabase via upsertSnapshot.
 * Compact / read-only mode (for doctor views) is unchanged.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Pill, Heart, Scissors, AlertTriangle,
  CheckCircle2, Loader2, Edit3, Save, X, Plus, Trash2
} from 'lucide-react';
import { getSnapshotById, upsertSnapshot } from '../../services/emergencySnapshotService';

// ── Constants ─────────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ── Tag chip ──────────────────────────────────────────────────────────────────
const Tag = ({ label, color = 'red', isDark, onRemove }) => {
  const colors = {
    red:    isDark ? 'bg-red-900/50 text-red-300 border-red-700/50'    : 'bg-red-50 text-red-700 border-red-200',
    amber:  isDark ? 'bg-amber-900/50 text-amber-300 border-amber-700/50' : 'bg-amber-50 text-amber-700 border-amber-200',
    blue:   isDark ? 'bg-blue-900/50 text-blue-300 border-blue-700/50'  : 'bg-blue-50 text-blue-700 border-blue-200',
    green:  isDark ? 'bg-green-900/50 text-green-300 border-green-700/50' : 'bg-green-50 text-green-700 border-green-200',
    slate:  isDark ? 'bg-slate-700 text-slate-300 border-slate-600'     : 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${colors[color]}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 opacity-60 hover:opacity-100 transition">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
};

// ── Section header (read-only) ─────────────────────────────────────────────
const SnapshotSection = ({ Icon, title, children, iconColor, isDark }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1.5">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
        {title}
      </span>
    </div>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

// ── Chip input (comma-add) ────────────────────────────────────────────────────
const ChipInput = ({ label, values, onChange, placeholder, isDark }) => {
  const [input, setInput] = useState('');
  const inputCls = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400';

  function add() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    const next = [...new Set([...values, ...parts])];
    onChange(next);
    setInput('');
  }

  return (
    <div>
      <p className={`text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map(v => (
          <Tag
            key={v}
            label={v}
            color="slate"
            isDark={isDark}
            onRemove={() => onChange(values.filter(x => x !== v))}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputCls}`}
        />
        <button
          onClick={add}
          className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className={`text-[9px] mt-1 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
        Press Enter or + to add · Separate multiple with commas
      </p>
    </div>
  );
};

// ── Medication row ────────────────────────────────────────────────────────────
const MedRow = ({ med, onChange, onRemove, isDark }) => {
  const inputCls = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500 text-xs'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 text-xs';
  return (
    <div className={`flex gap-2 items-start p-2.5 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-blue-50/50 border-blue-100'}`}>
      <div className="flex-1 grid grid-cols-3 gap-1.5">
        <input
          value={med.name || ''}
          onChange={e => onChange({ ...med, name: e.target.value })}
          placeholder="Medicine name"
          className={`col-span-3 px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400 ${inputCls}`}
        />
        <input
          value={med.dose || ''}
          onChange={e => onChange({ ...med, dose: e.target.value })}
          placeholder="Dose e.g. 500mg"
          className={`px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400 ${inputCls}`}
        />
        <input
          value={med.frequency || ''}
          onChange={e => onChange({ ...med, frequency: e.target.value })}
          placeholder="e.g. Twice daily"
          className={`col-span-2 px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400 ${inputCls}`}
        />
      </div>
      <button
        onClick={onRemove}
        className="mt-1 w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition active:scale-90 shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const EmergencySnapshotCard = ({
  snapshot:   propSnapshot = null,
  snapshotId  = null,
  userId      = null,      // required for editing
  isDark      = false,
  compact     = false,
  onUpdated   = null,      // called after successful save
}) => {
  const [snapshot, setSnapshot]   = useState(propSnapshot);
  const [loading, setLoading]     = useState(!propSnapshot && !!snapshotId);
  const [error, setError]         = useState(null);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Edit form state
  const [form, setForm] = useState({
    blood_group: '',
    allergies: [],
    chronic_diseases: [],
    current_medications: [],
    previous_surgeries: [],
  });

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const inputCls = isDark
    ? 'bg-slate-700 border-slate-600 text-white'
    : 'bg-gray-50 border-gray-200 text-gray-800';

  // Fetch by ID if not pre-loaded
  useEffect(() => {
    if (propSnapshot) { setSnapshot(propSnapshot); return; }
    if (!snapshotId) return;
    setLoading(true);
    getSnapshotById(snapshotId)
      .then(({ data, error }) => {
        if (error) setError(error);
        else setSnapshot(data);
      })
      .finally(() => setLoading(false));
  }, [snapshotId, propSnapshot]);

  // When snapshot changes, sync form
  useEffect(() => {
    if (snapshot) {
      setForm({
        blood_group: snapshot.blood_group || '',
        allergies: snapshot.allergies || [],
        chronic_diseases: snapshot.chronic_diseases || [],
        current_medications: snapshot.current_medications || [],
        previous_surgeries: snapshot.previous_surgeries || [],
      });
    }
  }, [snapshot]);

  function startEdit() {
    // If no snapshot yet, start fresh form
    if (!snapshot) {
      setForm({ blood_group: '', allergies: [], chronic_diseases: [], current_medications: [], previous_surgeries: [] });
    }
    setEditing(true);
    setSaveError(null);
  }

  async function handleSave() {
    if (!userId) { setSaveError('User not found. Please log in again.'); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const { data, error } = await upsertSnapshot(userId, form, null);
      if (error) throw new Error(error);
      setSnapshot(data);
      setEditing(false);
      if (onUpdated) onUpdated(data);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className={`rounded-2xl border p-4 ${card} flex items-center gap-2`}>
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading medical snapshot…</span>
      </div>
    );
  }

  // ── Compact (doctor view — always read-only) ──
  if (compact) {
    if (error || !snapshot) return null;
    const { blood_group, allergies = [], chronic_diseases = [], current_medications = [] } = snapshot;
    return (
      <div className={`rounded-xl border p-3 ${isDark ? 'bg-red-950/30 border-red-800/40' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span className="text-[11px] font-black uppercase tracking-widest text-red-500">Emergency Medical Summary</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {blood_group && <Tag label={`🩸 ${blood_group}`} color="red" isDark={isDark} />}
          {allergies.slice(0, 3).map(a => (<Tag key={a} label={`⚠️ ${a}`} color="amber" isDark={isDark} />))}
          {chronic_diseases.slice(0, 2).map(d => (<Tag key={d} label={d} color="blue" isDark={isDark} />))}
          {current_medications.slice(0, 3).map(m => (<Tag key={m.name} label={`💊 ${m.name}`} color="slate" isDark={isDark} />))}
        </div>
      </div>
    );
  }

  // ── Empty state (no snapshot yet) — show "Fill Now" call-to-action ──
  if (!snapshot && !editing) {
    return (
      <div className={`rounded-2xl border ${card} overflow-hidden`}>
        <div className={`px-4 py-3 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-r from-red-50 to-orange-50 border-gray-100'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Emergency Medical Snapshot</p>
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Critical info for doctors in emergencies</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 flex flex-col items-center gap-3 text-center">
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Fill in your medical information so doctors can treat you instantly in an emergency.
          </p>
          <button
            onClick={startEdit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" /> Fill My Medical Info
          </button>
        </div>
      </div>
    );
  }

  // ── Edit Form ──
  if (editing) {
    return (
      <div className={`rounded-2xl border ${card} overflow-hidden`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-r from-red-50 to-orange-50 border-gray-100'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Edit Emergency Snapshot</p>
          </div>
          <button
            onClick={() => setEditing(false)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition hover:opacity-80 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500'}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-5">
          {saveError && (
            <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              ❌ {saveError}
            </div>
          )}

          {/* Blood Group */}
          <div>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              🩸 Blood Group
            </p>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  onClick={() => setForm(f => ({ ...f, blood_group: bg }))}
                  className={`py-2 rounded-xl text-xs font-black border transition-all active:scale-95
                    ${form.blood_group === bg
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
                      : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-red-500' : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-red-400 hover:bg-red-50'
                    }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <ChipInput
            label="⚠️ Allergies"
            values={form.allergies}
            onChange={v => setForm(f => ({ ...f, allergies: v }))}
            placeholder="e.g. Penicillin, Peanuts"
            isDark={isDark}
          />

          {/* Chronic Conditions */}
          <ChipInput
            label="❤️ Chronic Conditions"
            values={form.chronic_diseases}
            onChange={v => setForm(f => ({ ...f, chronic_diseases: v }))}
            placeholder="e.g. Diabetes, Hypertension"
            isDark={isDark}
          />

          {/* Current Medications */}
          <div>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              💊 Current Medications
            </p>
            <div className="space-y-2">
              {form.current_medications.map((med, i) => (
                <MedRow
                  key={i}
                  med={med}
                  isDark={isDark}
                  onChange={updated => setForm(f => {
                    const meds = [...f.current_medications];
                    meds[i] = updated;
                    return { ...f, current_medications: meds };
                  })}
                  onRemove={() => setForm(f => ({
                    ...f,
                    current_medications: f.current_medications.filter((_, idx) => idx !== i),
                  }))}
                />
              ))}
              <button
                onClick={() => setForm(f => ({ ...f, current_medications: [...f.current_medications, { name: '', dose: '', frequency: '' }] }))}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed text-xs font-bold transition hover:opacity-80
                  ${isDark ? 'border-slate-600 text-slate-400' : 'border-blue-200 text-blue-500'}`}
              >
                <Plus className="w-3.5 h-3.5" /> Add Medication
              </button>
            </div>
          </div>

          {/* Previous Surgeries */}
          <ChipInput
            label="🏥 Previous Surgeries"
            values={form.previous_surgeries}
            onChange={v => setForm(f => ({ ...f, previous_surgeries: v }))}
            placeholder="e.g. Appendectomy, Knee replacement"
            isDark={isDark}
          />

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Emergency Snapshot</>}
          </button>
        </div>
      </div>
    );
  }

  // ── Full read-only card ──
  const {
    blood_group,
    allergies = [],
    chronic_diseases = [],
    current_medications = [],
    previous_surgeries = [],
    last_updated,
  } = snapshot;

  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b
        ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-r from-red-50 to-orange-50 border-gray-100'}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Emergency Medical Snapshot</p>
            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              Updated · {last_updated ? new Date(last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          {userId && (
            <button
              onClick={startEdit}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition active:scale-90 hover:opacity-80
                ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500'}`}
              title="Edit snapshot"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Blood Group */}
        {blood_group && (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
              ${isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}
            >
              {blood_group}
            </div>
            <div>
              <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Blood Group</p>
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>For transfusions and compatibility</p>
            </div>
          </div>
        )}

        {allergies.length > 0 && (
          <SnapshotSection Icon={AlertTriangle} title="Allergies" iconColor="text-amber-500" isDark={isDark}>
            {allergies.map(a => <Tag key={a} label={a} color="amber" isDark={isDark} />)}
          </SnapshotSection>
        )}

        {chronic_diseases.length > 0 && (
          <SnapshotSection Icon={Heart} title="Chronic Conditions" iconColor="text-red-500" isDark={isDark}>
            {chronic_diseases.map(d => <Tag key={d} label={d} color="red" isDark={isDark} />)}
          </SnapshotSection>
        )}

        {current_medications.length > 0 && (
          <SnapshotSection Icon={Pill} title="Current Medications" iconColor="text-blue-500" isDark={isDark}>
            {current_medications.map(m => (
              <div
                key={m.name}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium
                  ${isDark ? 'bg-blue-900/30 text-blue-200 border-blue-700/40' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
              >
                <span className="font-black">{m.name}</span>
                {m.dose && <span className="opacity-70"> · {m.dose}</span>}
                {m.frequency && <span className="opacity-60"> · {m.frequency}</span>}
              </div>
            ))}
          </SnapshotSection>
        )}

        {previous_surgeries.length > 0 && (
          <SnapshotSection Icon={Scissors} title="Past Surgeries" iconColor="text-purple-500" isDark={isDark}>
            {previous_surgeries.map(s => <Tag key={s} label={s} color="slate" isDark={isDark} />)}
          </SnapshotSection>
        )}

        {!blood_group && allergies.length === 0 && chronic_diseases.length === 0 &&
         current_medications.length === 0 && previous_surgeries.length === 0 && (
          <div className="text-center py-3">
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              No information added yet.
            </p>
            {userId && (
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 transition-all active:scale-95"
              >
                <Edit3 className="w-3 h-3" /> Fill Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySnapshotCard;
