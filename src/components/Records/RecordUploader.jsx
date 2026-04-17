/**
 * RecordUploader.jsx — Medical document upload (camera/image/PDF).
 * On file select → Gemini extraction → calls onExtracted(result, file).
 */

import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, FileText, Loader2, AlertCircle } from 'lucide-react';
import { extractFromFile } from '../../services/ocrService';

const RecordUploader = ({ onExtracted, isDark = false }) => {
  const cameraRef = useRef(null);
  const imageRef  = useRef(null);
  const pdfRef    = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setProcessing(true);
    try {
      const result = await extractFromFile(file);
      if (result.error) setError(result.error);
      else onExtracted(result, file);
    } catch (err) {
      setError(err.message || 'Extraction failed. Please try again.');
    } finally {
      setProcessing(false);
      [cameraRef, imageRef, pdfRef].forEach(r => { if (r.current) r.current.value = ''; });
    }
  }

  const Btn = ({ icon: Icon, label, sub, color, inputRef, accept, capture }) => {
    const cls = {
      blue:   isDark ? 'bg-blue-900/30 border-blue-700/50 text-blue-300 hover:bg-blue-900/50'   : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green:  isDark ? 'bg-green-900/30 border-green-700/50 text-green-300 hover:bg-green-900/50' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      purple: isDark ? 'bg-purple-900/30 border-purple-700/50 text-purple-300'                   : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    }[color];
    return (
      <>
        <input ref={inputRef} type="file" accept={accept} capture={capture}
          className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
        <button onClick={() => inputRef.current?.click()} disabled={processing}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all w-full ${cls} ${processing ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black">{label}</p>
            <p className="text-[10px] opacity-60">{sub}</p>
          </div>
        </button>
      </>
    );
  };

  return (
    <div className={`rounded-2xl border ${card} overflow-hidden`}>
      <div className={`px-4 py-3 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
          Add Medical Record
        </p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
          Upload a prescription, report, or discharge summary
        </p>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Btn icon={Camera}   label="Camera"  sub="Scan doc"    color="blue"   inputRef={cameraRef} accept="image/*" capture="environment" />
          <Btn icon={ImagePlus} label="Gallery" sub="Pick image" color="green"  inputRef={imageRef}  accept="image/jpeg,image/png,image/webp" />
          <Btn icon={FileText} label="PDF"     sub="Upload file" color="purple" inputRef={pdfRef}    accept="application/pdf" />
        </div>
        {processing && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isDark ? 'bg-blue-950/40 border-blue-800/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <p className="text-xs font-semibold">Analysing with Gemini Vision…</p>
          </div>
        )}
        {error && (
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${isDark ? 'bg-red-950/40 border-red-800/40 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black">Extraction Failed</p>
              <p className="text-[11px] mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        )}
        {!processing && !error && (
          <p className={`text-[10px] text-center ${isDark ? 'text-slate-600' : 'text-gray-300'}`}>
            Supports JPEG · PNG · PDF · Handwritten prescriptions
          </p>
        )}
      </div>
    </div>
  );
};

export default RecordUploader;
