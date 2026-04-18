/**
 * MedicalRecordsPage.jsx — Patient medical records management page.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, FileText, Clock, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import RecordUploader from '../components/Records/RecordUploader';
import ExtractionReview from '../components/Records/ExtractionReview';
import EmergencySnapshotCard from '../components/Records/EmergencySnapshotCard';
import { uploadFile, saveRecord, getRecords, deleteRecord } from '../services/recordsService';
import { upsertSnapshot, getSnapshotByUserId } from '../services/emergencySnapshotService';
import { isSupabaseConfigured } from '../lib/supabase';

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
      console.error('[Records] loadData error:', err);
    } finally {
      setLoadingRecords(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleConfirm(editedFields) {
    if (!pendingExtraction || !user?.id) return;
    const { file } = pendingExtraction;
    console.log('[Records] 🚀 Starting save sequence...');
    setSaving(true);
    setSaveError(null);

    try {
      // 1. Upload
      const { url, error: uploadErr } = await uploadFile(file, user.id);
      if (uploadErr) throw new Error(uploadErr);

      // 2. DB Save
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
      const { data: record, error: saveErr } = await saveRecord({
        user_id: user.id,
        file_url: url,
        file_type: fileType,
        extracted: editedFields,
        confidence: pendingExtraction.result.confidence,
        verified: true,
      });
      if (saveErr) throw new Error(saveErr);

      // 3. Snapshot
      await upsertSnapshot(user.id, editedFields, record?.id);

      await loadData();
      setPendingExtraction(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[Records] ❌ Save failed:', err.message);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(recordId) {
    if (!window.confirm('Delete this record?')) return;
    await deleteRecord(recordId);
    setRecords(prev => prev.filter(r => r.id !== recordId));
  }

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
    <div className={`${bg} h-full w-full flex flex-col`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b shrink-0 flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div>
          <h1 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>🩺 Medical Records</h1>
          <p className="text-[10px] text-gray-500">Auto-extracts emergency data via Gemini AI</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black ${isSupabaseConfigured ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {isSupabaseConfigured ? '● ONLINE' : '● DB OFFLINE'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24">
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold">
            ❌ {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-xs font-bold">
            ✅ Record Saved Successfully!
          </div>
        )}

        {/* Snapshot Section */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Emergency Summary</p>
          {snapshot ? <EmergencySnapshotCard snapshot={snapshot} isDark={isDark} /> : (
            <div className={`p-6 border-2 border-dashed rounded-2xl text-center ${isDark ? 'border-slate-800 text-slate-600' : 'border-gray-200 text-gray-400'}`}>
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold">No Snapshot Yet</p>
            </div>
          )}
        </section>

        {/* Uploader Section */}
        <RecordUploader isDark={isDark} onExtracted={(result, file) => setPendingExtraction({ result, file })} />

        {/* List Section */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">All Records</p>
          {loadingRecords ? <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-20" /> : records.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-10">No records found.</p>
          ) : (
            <div className="space-y-3">
              {records.map(rec => (
                <div key={rec.id} className={`p-4 rounded-2xl border ${card}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{rec.file_type === 'pdf' ? 'PDF' : 'Image'} Report</p>
                        <p className="text-[10px] text-gray-500">{new Date(rec.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(rec.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
