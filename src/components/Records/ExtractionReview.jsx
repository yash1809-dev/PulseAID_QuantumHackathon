/**
 * ExtractionReview.jsx — User verification step after OCR extraction.
 *
 * Shows extracted fields as editable inputs.
 * Warns on low confidence. Flags medication suggestions.
 * On confirm → calls onConfirm(editedFields).
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Plus, Lightbulb } from 'lucide-react';
import { isLowConfidence, isFieldLowConfidence, CONFIDENCE_WARNING_THRESHOLD } from '../../services/ocrService';

// ── Tag list editor (allergies / chronic diseases / surgeries) ────────────────
const TagEditor = ({ items, onChange, isDark, placeholder }) => {
  const [input, setInput] = useState('');
  const chip = isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-gray-100 border-gray-200 text-gray-700';

  function add() {
    const v = input.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setInput('');
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <span key={item} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${chip}`}>
            {item}
            <button onClick={() => onChange(items.filter(i => i !== item))} className="ml-0.5 opacity-60 hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className={`flex-1 text-xs px-3 py-2 rounded-lg border outline-none
            ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
        />
        <button onClick={add} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ── Field label with optional low-confidence indicator ───────────────────────
const FieldLabel = ({ label, field, fieldConfidence, isDark }) => {
  const low = isFieldLowConfidence(fieldConfidence, field);
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        {label}
      </span>
      {low && (
        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
          ⚠ Low confidence
        </span>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ExtractionReview = ({ extractionResult, onConfirm, onCancel, isDark = false }) => {
  const { extracted, confidence, fieldConfidence, hasSuggestions } = extractionResult;

  const [bloodGroup, setBloodGroup]     = useState(extracted?.blood_group || '');
  const [allergies, setAllergies]       = useState(extracted?.allergies || []);
  const [diseases, setDiseases]         = useState(extracted?.chronic_diseases || []);
  const [medications, setMedications]   = useState(extracted?.current_medications || []);
  const [surgeries, setSurgeries]       = useState(extracted?.previous_surgeries || []);

  const lowConf = isLowConfidence(confidence);
  const confPct = Math.round((confidence || 0) * 100);

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const inputCls = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400';

  function applyMedSuggestion(idx) {
    setMedications(prev => prev.map((m, i) => {
      if (i !== idx || !m.suggested) return m;
      const { suggested, ...rest } = m;
      return { ...rest, name: suggested };
    }));
  }

  function updateMed(idx, field, value) {
    setMedications(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  }

  function removeMed(idx) {
    setMedications(prev => prev.filter((_, i) => i !== idx));
  }

  function addMed() {
    setMedications(prev => [...prev, { name: '', dose: '', frequency: '' }]);
  }

  function handleConfirm() {
    const cleaned = medications.map(({ suggested, ...m }) => m);
    onConfirm({
      blood_group:          bloodGroup || null,
      allergies,
      chronic_diseases:     diseases,
      current_medications:  cleaned,
      previous_surgeries:   surgeries,
    });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column' }}
      className={isDark ? 'bg-slate-900' : 'bg-gray-50'}
    >
      {/* Header */}
      <div className={`px-4 py-4 border-b flex items-center gap-3 shrink-0
        ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <button onClick={onCancel}
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Verify Extracted Data
          </h1>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Confidence: {confPct}% · Review and edit before saving
          </p>
        </div>
        {/* Confidence bar */}
        <div className="w-16">
          <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full transition-all ${confPct >= 70 ? 'bg-green-500' : confPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${confPct}%` }}
            />
          </div>
          <p className={`text-[9px] text-right mt-0.5 font-bold ${confPct >= 70 ? 'text-green-500' : 'text-amber-500'}`}>
            {confPct}%
          </p>
        </div>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* Low confidence warning */}
        {lowConf && (
          <div className={`flex items-start gap-3 p-4 rounded-2xl border
            ${isDark ? 'bg-amber-950/40 border-amber-800/40' : 'bg-amber-50 border-amber-200'}`}>
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-600">Low Confidence Detected ({confPct}%)</p>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
                This may be due to handwriting or image quality. Please verify all fields carefully before saving.
              </p>
            </div>
          </div>
        )}

        {/* Medication suggestions banner */}
        {hasSuggestions && (
          <div className={`flex items-start gap-3 p-4 rounded-2xl border
            ${isDark ? 'bg-blue-950/40 border-blue-800/40' : 'bg-blue-50 border-blue-200'}`}>
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className={`text-[11px] ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              <span className="font-black">Spelling suggestions detected</span> — review medications below and tap "Fix" to apply corrections.
            </p>
          </div>
        )}

        {/* Blood Group */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <FieldLabel label="Blood Group" field="blood_group" fieldConfidence={fieldConfidence} isDark={isDark} />
          <select
            value={bloodGroup}
            onChange={e => setBloodGroup(e.target.value)}
            className={`w-full text-sm px-3 py-2 rounded-lg border outline-none ${inputCls}`}
          >
            <option value="">— Not found —</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        {/* Allergies */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <FieldLabel label="Allergies" field="allergies" fieldConfidence={fieldConfidence} isDark={isDark} />
          <TagEditor items={allergies} onChange={setAllergies} isDark={isDark} placeholder="Add allergy (e.g. Penicillin)…" />
        </div>

        {/* Chronic Diseases */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <FieldLabel label="Chronic Conditions" field="chronic_diseases" fieldConfidence={fieldConfidence} isDark={isDark} />
          <TagEditor items={diseases} onChange={setDiseases} isDark={isDark} placeholder="Add condition (e.g. Hypertension)…" />
        </div>

        {/* Medications */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <FieldLabel label="Current Medications" field="current_medications" fieldConfidence={fieldConfidence} isDark={isDark} />
          <div className="space-y-3">
            {medications.map((med, idx) => (
              <div key={idx} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                {/* Suggestion banner */}
                {med.suggested && (
                  <div className={`flex items-center justify-between mb-2 px-2 py-1 rounded-lg text-[11px]
                    ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                    <span>Possible typo: <strong>{med.name}</strong> → {med.suggested}</span>
                    <button onClick={() => applyMedSuggestion(idx)}
                      className="font-black text-blue-500 hover:text-blue-700 ml-2">Fix</button>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {[['name', 'Name'], ['dose', 'Dose'], ['frequency', 'Frequency']].map(([field, ph]) => (
                    <input key={field} value={med[field] || ''} onChange={e => updateMed(idx, field, e.target.value)}
                      placeholder={ph}
                      className={`text-xs px-2 py-1.5 rounded-lg border outline-none ${inputCls}`} />
                  ))}
                </div>
                <button onClick={() => removeMed(idx)}
                  className={`mt-2 text-[10px] font-bold text-red-500 hover:text-red-700`}>
                  Remove
                </button>
              </div>
            ))}
            <button onClick={addMed}
              className={`w-full py-2 rounded-xl border-2 border-dashed text-xs font-bold transition-colors
                ${isDark ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
              + Add Medication
            </button>
          </div>
        </div>

        {/* Surgeries */}
        <div className={`rounded-2xl border p-4 ${card}`}>
          <FieldLabel label="Previous Surgeries" field="previous_surgeries" fieldConfidence={fieldConfidence} isDark={isDark} />
          <TagEditor items={surgeries} onChange={setSurgeries} isDark={isDark} placeholder="Add surgery (e.g. Appendectomy 2019)…" />
        </div>

      </div>

      {/* Footer buttons */}
      <div className={`px-4 py-4 border-t flex gap-3 shrink-0
        ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <button onClick={onCancel}
          className={`flex-1 py-3 rounded-2xl text-sm font-black border transition-colors
            ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          Cancel
        </button>
        <button onClick={handleConfirm}
          className="flex-2 flex-[2] py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:opacity-95 active:scale-98 transition-all">
          <CheckCircle2 className="w-4 h-4" />
          Confirm & Save
        </button>
      </div>
    </div>
  );
};

export default ExtractionReview;
