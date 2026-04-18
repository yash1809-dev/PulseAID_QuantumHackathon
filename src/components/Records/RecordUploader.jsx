/**
 * RecordUploader.jsx — Category-first medical document upload (no OCR/AI).
 *
 * Flow:
 *   1. User taps a category card (Prescription, Lab Report, etc.)
 *   2. File picker opens (image or PDF)
 *   3. File uploads directly to Supabase bucket
 *   4. Record saved with category slug + optional note
 *   5. onUploaded() called so parent can refresh list
 */

import React, { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle, CheckCircle2, X, StickyNote } from 'lucide-react';
import { uploadFile, saveCategorizedRecord, CATEGORY_META } from '../../services/recordsService';

const CATEGORIES = Object.entries(CATEGORY_META).map(([key, meta]) => ({ key, ...meta }));

const RecordUploader = ({ userId, isDark = false, onUploaded }) => {
  const [selectedCat, setSelectedCat] = useState(null); // category key
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const inputBg = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400';

  async function handleFile(file) {
    if (!file || !selectedCat || !userId) return;
    setError(null);
    setUploading(true);
    try {
      const { url, error: upErr } = await uploadFile(file, userId);
      if (upErr) throw new Error(upErr);

      const { error: saveErr } = await saveCategorizedRecord({
        user_id: userId,
        file_url: url,
        category: selectedCat,
        note: note.trim(),
      });
      if (saveErr) throw new Error(saveErr);

      setSuccess(true);
      setSelectedCat(null);
      setNote('');
      if (onUploaded) onUploaded();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[RecordUploader]', err);
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function openPicker() {
    if (!selectedCat) return;
    fileRef.current?.click();
  }

  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Upload Medical Document</p>
        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Select a category, then upload your file
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Feedback banners */}
        {success && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-xs font-semibold">Document uploaded successfully!</p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        {/* Category grid */}
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(cat => {
            const isActive = selectedCat === cat.key;
            const colorCls = {
              blue:   isActive ? 'bg-blue-600 text-white border-blue-600'   : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
              purple: isActive ? 'bg-purple-600 text-white border-purple-600' : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-purple-500' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
              indigo: isActive ? 'bg-indigo-600 text-white border-indigo-600' : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-indigo-500' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
              yellow: isActive ? 'bg-yellow-500 text-white border-yellow-500' : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-yellow-500' : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
              teal:   isActive ? 'bg-teal-600 text-white border-teal-600'   : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-teal-500' : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
              gray:   isActive ? 'bg-gray-600 text-white border-gray-600'   : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100',
            }[cat.color] || '';

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCat(isActive ? null : cat.key)}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 font-bold transition-all active:scale-95 text-center ${colorCls}`}
              >
                {isActive && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </span>
                )}
                <span className="text-xl leading-none">{cat.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-wide leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Note + Upload (revealed when a category is selected) */}
        {selectedCat && (
          <div className="space-y-3 animate-fade-in">
            {/* Optional note */}
            <div className="relative">
              <StickyNote className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note (optional)…"
                className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
              />
            </div>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0])}
            />

            <button
              onClick={openPicker}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload {CATEGORY_META[selectedCat]?.icon} {CATEGORY_META[selectedCat]?.label.replace(/s$/, '')}</>
              )}
            </button>

            <p className={`text-center text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              Accepts JPG, PNG, or PDF · Max 10 MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordUploader;
