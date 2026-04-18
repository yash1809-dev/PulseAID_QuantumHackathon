/**
 * CategoryRecordList.jsx — Shared categorized records viewer.
 *
 * Used by:
 *   - MedicalRecordsPage (patient view — shows delete button)
 *   - IncomingPatient (doctor view — shows view + download only, no delete)
 *
 * Records are grouped by category and displayed in collapsible sections.
 * Supports image lightbox preview inline and download of any file type.
 */

import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, Eye, Download, Trash2,
  FileText, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import { CATEGORY_META } from '../../services/recordsService';

// ── Colour token maps ─────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue:   { header: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700',   icon: 'text-blue-500' },
  purple: { header: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700', icon: 'text-purple-500' },
  indigo: { header: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', icon: 'text-indigo-500' },
  yellow: { header: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-600' },
  teal:   { header: 'bg-teal-50 border-teal-200',   badge: 'bg-teal-100 text-teal-700',   icon: 'text-teal-500' },
  gray:   { header: 'bg-gray-50 border-gray-200',   badge: 'bg-gray-100 text-gray-600',   icon: 'text-gray-400' },
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ url, onClose }) {
  const isImage = /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url);
  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/90 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <span className="text-xs text-gray-400 truncate max-w-[70vw]">{url.split('/').pop()}</span>
        <div className="flex items-center gap-3">
          <a
            href={url}
            download
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </a>
          <button className="text-gray-400 hover:text-white text-lg leading-none px-2">✕</button>
        </div>
      </div>
      <div
        className="flex-1 flex items-center justify-center p-4 overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {isImage ? (
          <img
            src={url}
            alt="Medical document"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        ) : (
          <iframe
            src={url}
            title="Medical document"
            className="w-full h-full min-h-[70vh] rounded-xl bg-white"
          />
        )}
      </div>
    </div>
  );
}

// ── Single record card ────────────────────────────────────────────────────────
function RecordCard({ record, onDelete, isDark }) {
  const [lightbox, setLightbox] = useState(false);

  const isImage = /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(record.file_url);
  const date = new Date(record.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const note = record.extracted?.note;

  const cardBg = isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-100';

  return (
    <>
      {lightbox && <Lightbox url={record.file_url} onClose={() => setLightbox(false)} />}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${cardBg} hover:shadow-sm transition`}>
        {/* Thumbnail or icon */}
        <button
          onClick={() => setLightbox(true)}
          className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 hover:opacity-80 transition active:scale-95"
          title="Preview"
        >
          {isImage ? (
            <img
              src={record.file_url}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <FileText className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {isImage ? 'Image' : 'PDF'} · {date}
          </p>
          {note && (
            <p className="text-[10px] text-gray-400 truncate mt-0.5">{note}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setLightbox(true)}
            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition active:scale-90"
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <a
            href={record.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition active:scale-90"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
          {onDelete && (
            <button
              onClick={() => onDelete(record.id)}
              className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition active:scale-90"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Category section accordion ────────────────────────────────────────────────
function CategorySection({ categoryKey, records, onDelete, isDark, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = CATEGORY_META[categoryKey] || { label: categoryKey, icon: '📁', color: 'gray' };
  const colors = COLOR_MAP[meta.color] || COLOR_MAP.gray;

  return (
    <div className={`rounded-2xl border overflow-hidden ${colors.header}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 hover:opacity-90 transition active:scale-[0.99]`}
      >
        <span className="text-xl">{meta.icon}</span>
        <span className={`flex-1 text-left text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
          {meta.label}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
          {records.length}
        </span>
        {open
          ? <ChevronDown className={`w-4 h-4 ${colors.icon}`} />
          : <ChevronRight className={`w-4 h-4 ${colors.icon}`} />
        }
      </button>

      {open && (
        <div className={`px-3 pb-3 space-y-2 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'} pt-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          {records.map(r => (
            <RecordCard key={r.id} record={r} onDelete={onDelete} isDark={isDark} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
/**
 * @param {object[]} records   - from getRecords / getRecordsByUser
 * @param {boolean}  isDark
 * @param {function} onDelete  - if provided, shows delete button (patient view). Omit for doctor view.
 * @param {boolean}  doctorView - if true, opens Prescriptions by default
 */
const CategoryRecordList = ({ records = [], isDark = false, onDelete, doctorView = false }) => {
  if (records.length === 0) {
    return (
      <p className={`text-xs text-center py-6 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
        No documents uploaded yet.
      </p>
    );
  }

  // Group by category (file_type holds the slug)
  const grouped = {};
  for (const rec of records) {
    const cat = rec.file_type || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(rec);
  }

  // Display in defined order
  const ORDER = ['prescription', 'lab_report', 'radiology', 'discharge', 'bill', 'other'];
  const sorted = [
    ...ORDER.filter(k => grouped[k]),
    ...Object.keys(grouped).filter(k => !ORDER.includes(k)),
  ];

  return (
    <div className="space-y-3">
      {sorted.map(cat => (
        <CategorySection
          key={cat}
          categoryKey={cat}
          records={grouped[cat]}
          onDelete={onDelete}
          isDark={isDark}
          defaultOpen={doctorView ? cat === 'prescription' : false}
        />
      ))}
    </div>
  );
};

export default CategoryRecordList;
