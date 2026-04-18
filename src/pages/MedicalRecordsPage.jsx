/**
 * MedicalRecordsPage.jsx — Patient medical records management page.
 *
 * Flow: pick category → upload file → saved to Supabase bucket → grouped list.
 * No AI/OCR extraction. EmergencySnapshotCard stays at the top (existing).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import RecordUploader from '../components/Records/RecordUploader';
import EmergencySnapshotCard from '../components/Records/EmergencySnapshotCard';
import CategoryRecordList from '../components/Records/CategoryRecordList';
import { getRecords, deleteRecord } from '../services/recordsService';
import { getSnapshotByUserId } from '../services/emergencySnapshotService';
import { isSupabaseConfigured } from '../lib/supabase';

const MedicalRecordsPage = ({ user, isDark = false }) => {
  const [snapshot, setSnapshot]             = useState(null);
  const [records, setRecords]               = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const bg   = isDark ? 'bg-slate-900' : 'bg-gray-50';

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

  async function handleDelete(recordId) {
    if (!window.confirm('Delete this document?')) return;
    await deleteRecord(recordId);
    setRecords(prev => prev.filter(r => r.id !== recordId));
  }

  return (
    <div className={`${bg} h-full w-full flex flex-col`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b shrink-0 flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div>
          <h1 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>🩺 Medical Records</h1>
          <p className="text-[10px] text-gray-500">Upload and organise your documents by category</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black ${isSupabaseConfigured ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {isSupabaseConfigured ? '● ONLINE' : '● OFFLINE'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24">
        {/* Emergency Snapshot */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Emergency Summary</p>
          {snapshot ? (
            <EmergencySnapshotCard
              snapshot={snapshot}
              userId={user?.id}
              isDark={isDark}
              onUpdated={(updated) => setSnapshot(updated)}
            />
          ) : (
            <EmergencySnapshotCard
              userId={user?.id}
              isDark={isDark}
              onUpdated={(updated) => setSnapshot(updated)}
            />
          )}
        </section>

        {/* Uploader — passes userId and onUploaded callback */}
        <RecordUploader
          userId={user?.id}
          isDark={isDark}
          onUploaded={loadData}
        />

        {/* Grouped records list */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Documents</p>
          {loadingRecords ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin opacity-20" />
            </div>
          ) : (
            <CategoryRecordList
              records={records}
              isDark={isDark}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
