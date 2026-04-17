/**
 * RecordUploader.jsx — Medical document upload (camera/image/PDF).
 */
import React, { useState } from 'react';
import { Camera, ImagePlus, FileText, Loader2, AlertCircle } from 'lucide-react';
import { extractFromFile } from '../../services/ocrService';

const RecordUploader = ({ onExtracted, isDark = false }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';

  async function handleFile(file) {
    if (!file) return;
    console.log('[RecordUploader] 📁 File selected:', file.name);
    setError(null);
    setProcessing(true);
    try {
      const result = await extractFromFile(file);
      if (result.error) {
        setError(result.error);
      } else {
        onExtracted(result, file);
      }
    } catch (err) {
      console.error('[RecordUploader] Error:', err);
      setError(err.message || 'Extraction failed.');
    } finally {
      setProcessing(false);
    }
  }

  const Btn = ({ icon: Icon, label, sub, color, accept, capture }) => {
    const cls = {
      blue:   isDark ? 'bg-blue-900/30 border-blue-700/50 text-blue-300'   : 'bg-blue-50 border-blue-200 text-blue-700',
      green:  isDark ? 'bg-green-900/30 border-green-700/50 text-green-300' : 'bg-green-50 border-green-200 text-green-700',
      purple: isDark ? 'bg-purple-900/30 border-purple-700/50 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700',
    }[color];

    return (
      <div className="relative w-full group active:scale-95 transition-all overflow-hidden rounded-2xl min-h-[100px]">
        <input 
          type="file" 
          accept={accept} 
          capture={capture}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" 
          onClick={e => { e.target.value = null; }}
          onChange={e => {
            console.log('[RecordUploader] 🔔 Input Triggered!');
            handleFile(e.target.files?.[0]);
          }} 
        />
        <div className={`flex flex-col items-center justify-center gap-2 p-4 border-2 w-full h-full ${cls} ${processing ? 'opacity-40' : ''}`}>
          <Icon className="w-5 h-5" />
          <div className="text-center">
            <p className="text-xs font-black">{label}</p>
            <p className="text-[10px] opacity-60">{sub}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      <div className={`px-4 py-3 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Medical Record</p>
      </div>
      <div className="p-4 space-y-3">
        {/* DEBUG RAW INPUT - TO BE REMOVED */}
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-center mb-4">
          <p className="text-xs text-red-800 font-bold mb-2">Debug Upload (Try this!)</p>
          <input 
            type="file" 
            onChange={e => {
              console.log('[DEBUG UPLOADER] 🔔 Raw input fired!', e.target.files?.[0]?.name);
              handleFile(e.target.files?.[0]);
            }} 
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Btn icon={Camera}   label="Camera"  sub="Scan"    color="blue"   accept="image/*" capture="environment" />
          <Btn icon={ImagePlus} label="Gallery" sub="Pick"    color="green"  accept="image/*" />
          <Btn icon={FileText} label="PDF"     sub="Upload"  color="purple" accept="application/pdf" />
        </div>

        {processing && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-xs font-semibold">Gemini is analyzing...</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordUploader;
