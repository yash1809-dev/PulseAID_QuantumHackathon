/**
 * MedicalRecordsPage.jsx — Patient medical records management page.
 *
 * Flow:
 *   1. RecordUploader → file selected → Gemini extraction
 *   2. ExtractionReview → user edits + confirms
 *   3. recordsService.uploadFile + saveRecord → Supabase
 *   4. emergencySnapshotService.upsertSnapshot → updates snapshot
 *   5. Shows current snapshot + past records list
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, FileText, Clock, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import RecordUploader from '../components/Records/RecordUploader';
import ExtractionReview from '../components/Records/ExtractionReview';
import EmergencySnapshotCard from '../components/Records/EmergencySnapshotCard';
import { uploadFile, saveRecord, getRecords, deleteRecord } from '../services/recordsService';
import { upsertSnapshot, getSnapshotByUserId } from '../services/emergencySnapshotService';

const MedicalRecordsPage = ({ user, isDark = false }) => {
  const [snapshot, setSnapshot]             = useState(null);
  const [records, setRecords]               = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Upload flow state
  const [pendingExtraction, setPendingExtraction] = useState(null); // { result, file }
  const [saving, setSaving]                       = useState(false);
  const [saveError, setSaveError]                 = useState(null);
  const [saveSuccess, setSaveSuccess]             = useState(false);

  const bg   = isDark ? 'bg-slate-900' : 'bg-gray-50';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';

  // Load snapshot + records on mount
  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingRecords(true);
    try {
      const [snapRes, recsRes] = await Promise.all([
        getSnapshotByUserId(user.id),
        getRecords(user.id),
      ]);
      if (snapRes.data) setSnapshot(snapRes.data);
      if (recsRes.data) setRecords(recsRes.data);
    } catch (err) {
      console.error('[MedicalRecordsPage] loadData error:', err);
    } finally {
      setLoadingRecords(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Called by ExtractionReview on confirm
  async function handleConfirm(editedFields) {
    if (!pendingExtraction || !user?.id) return;
    const { file } = pendingExtraction;

    setSaving(true);
    setSaveError(null);

    try {
      // 1. Upload file to Supabase Storage
      const { url, error: uploadErr } = await uploadFile(file, user.id);
      if (uploadErr) throw new Error(uploadErr);

      // 2. Save record to medical_records table
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
      const { data: record, error: saveErr } = await saveRecord({
        user_id:    user.id,
        file_url:   url,
        file_type:  fileType,
        extracted:  editedFields,
        confidence: pendingExtraction.result.confidence,
        verified:   true,
      });
      if (saveErr) throw new Error(saveErr);

      // 3. Upsert emergency snapshot
      await upsertSnapshot(user.id, editedFields, record?.id);

      // 4. Reload
      await loadData();
      setPendingExtraction(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(recordId) {
    if (!window.confirm('Delete this record?')) return;
    await deleteRecord(recordId);
    setRecords(prev => prev.filter(r => r.id !== recordId));
  }

  // ── Extraction Review fullscreen overlay ──────────────────────────────────
  if (pendingExtraction) {
    return (
      <ExtractionReview
        extractionResult={pendingExtraction.result}
        isDark={isDark}
        onConfirm={handleConfirm}
        onCancel={() => setPendingExtraction(null)}
      />
    );
  }

  return (
    <div
      className={`${bg}`}
      style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className={`px-5 py-4 border-b shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <h1 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🩺 Medical Records
        </h1>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Upload records · Auto-extracts emergency data
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* Saving overlay */}
        {saving && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-blue-950/40 border-blue-800/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-xs font-semibold">Saving record and updating emergency snapshot…</p>
          </div>
        )}

        {saveSuccess && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-green-950/40 border-green-800/40 text-green-300' : 'bg-green-50 border-green-200 text-green-700'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-xs font-semibold">Record saved and emergency snapshot updated!</p>
          </div>
        )}

        {saveError && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-red-950/40 border-red-800/40 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs font-semibold">{saveError}</p>
          </div>
        )}

        {/* Emergency Snapshot */}
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 px-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            Emergency Snapshot
          </p>
          {snapshot
            ? <EmergencySnapshotCard snapshot={snapshot} isDark={isDark} />
            : (
              <div className={`rounded-2xl border p-5 text-center ${card}`}>
                <ShieldAlert className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-sm font-black ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  No snapshot yet
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                  Upload a medical record to auto-generate your emergency medical summary.
                </p>
              </div>
            )
          }
        </div>

        {/* Uploader */}
        <RecordUploader
          isDark={isDark}
          onExtracted={(result, file) => setPendingExtraction({ result, file })}
        />

        {/* Past Records */}
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 px-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            Uploaded Records
          </p>
          {loadingRecords ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
            </div>
          ) : records.length === 0 ? (
            <div className={`rounded-2xl border p-5 text-center ${card}`}>
              <FileText className={`w-7 h-7 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                No records uploaded yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map(rec => {
                const ext = rec.extracted || {};
                const confPct = Math.round((rec.confidence || 0) * 100);
                return (
                  <div key={rec.id} className={`rounded-2xl border p-4 ${card}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                          ${rec.file_type === 'pdf'
                            ? isDark ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-50 text-purple-600'
                            : isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'
                          }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-black uppercase ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {rec.file_type === 'pdf' ? 'PDF' : 'Image'} Record
                            </span>
                            {rec.verified && (
                              <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                ✓ Verified
                              </span>
                            )}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full
                              ${confPct >= 70 ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                              {confPct}% confidence
                            </span>
                          </div>
                          <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                            <Clock className="w-3 h-3" />
                            {new Date(rec.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {/* Extracted summary */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ext.blood_group && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>
                                🩸 {ext.blood_group}
                              </span>
                            )}
                            {(ext.chronic_diseases || []).slice(0, 2).map(d => (
                              <span key={d} className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                                {d}
                              </span>
                            ))}
                            {(ext.current_medications || []).slice(0, 2).map(m => (
                              <span key={m.name} className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                                💊 {m.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(rec.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors
                          ${isDark ? 'text-slate-600 hover:bg-red-900/30 hover:text-red-400' : 'text-gray-300 hover:bg-red-50 hover:text-red-500'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {rec.file_url && (
                      <a href={rec.file_url} target="_blank" rel="noopener noreferrer"
                        className={`mt-3 inline-flex items-center gap-1 text-[10px] font-bold transition-colors
                          ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                        View original file ↗
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
