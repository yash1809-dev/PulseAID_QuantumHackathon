/**
 * BottomSheet.jsx — Draggable bottom sheet with 3 snap points.
 *
 * Snap points:
 *   COLLAPSED (120px)  — handle + "Best Hospital Found" summary
 *   HALF     (~50vh)  — filter chips + hospital list
 *   EXPANDED (~85vh)  — full content
 *
 * Contains: existing BottomPanel (hospital details) + FilterPanel + HospitalList.
 * Never modifies BottomPanel.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import BottomPanel from './BottomPanel';
import FilterPanel from './FilterPanel';
import HospitalList from './HospitalList';
import AIMatchPanel from './AIMatchPanel';
import { MapPin, ChevronUp, Loader2 } from 'lucide-react';

const SNAP = { COLLAPSED: 120, HALF: null, EXPANDED: null }; // set on mount

const BottomSheet = ({
  // Existing BottomPanel props
  selectedHospital,
  nearestHospital,
  userLocation,
  activeRequest,
  isDark,
  onCallAmbulance,
  onRequestICU,

  // New matching + filter props
  rankedList,
  matchReason,
  hasResults,
  isProcessing,
  filterStats,
  report, // Smart Decision Engine report
  onSelectHospital,

  // Filter state (from App.jsx)
  insurance, setInsurance,
  budget, setBudget,
  priority, setPriority,
}) => {
  const sheetRef = useRef(null);
  const dragRef = useRef({ startY: 0, startHeight: 0, dragging: false });

  const [sheetHeight, setSheetHeight] = useState(260);
  const snapHalf = Math.round(window.innerHeight * 0.5);
  const snapExpanded = Math.round(window.innerHeight * 0.85);
  const snapCollapsed = 120;

  // Determine which "view" to show based on height
  const showFull = sheetHeight > snapHalf - 40;
  const showFilters = sheetHeight > 180;

  const snapTo = useCallback((target) => {
    setSheetHeight(target);
  }, []);

  // Drag handlers (mouse + touch)
  const onDragStart = (e) => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startY: clientY, startHeight: sheetHeight, dragging: true };
  };

  const onDragMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = dragRef.current.startY - clientY;
    const newHeight = Math.max(snapCollapsed, Math.min(snapExpanded, dragRef.current.startHeight + delta));
    setSheetHeight(newHeight);
  }, [snapExpanded]);

  const onDragEnd = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    // Snap to nearest point
    const h = sheetHeight;
    const mid = (snapCollapsed + snapHalf) / 2;
    const top = (snapHalf + snapExpanded) / 2;
    if (h < mid) snapTo(snapCollapsed);
    else if (h < top) snapTo(snapHalf);
    else snapTo(snapExpanded);
  }, [sheetHeight, snapCollapsed, snapHalf, snapExpanded, snapTo]);

  useEffect(() => {
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [onDragMove, onDragEnd]);

  const displayHospital = selectedHospital || nearestHospital;

  const bg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const dividerColor = isDark ? 'bg-slate-700' : 'bg-gray-100';

  return (
    <div
      ref={sheetRef}
      className={`fixed left-0 right-0 bottom-16 z-30 rounded-t-3xl border-t shadow-2xl transition-[height] duration-300 ease-out overflow-hidden ${bg}`}
      style={{ height: sheetHeight }}
    >
      {/* ── Drag Handle ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        onClick={() => {
          if (sheetHeight <= snapCollapsed + 20) snapTo(snapHalf);
          else if (sheetHeight <= snapHalf + 20) snapTo(snapExpanded);
          else snapTo(snapCollapsed);
        }}
      >
        <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`} />
        {sheetHeight <= snapCollapsed + 20 && (
          <div className="flex items-center gap-1 mt-1">
            <ChevronUp className={`w-3 h-3 ${textSecondary}`} />
            <span className={`text-[10px] font-medium ${textSecondary}`}>Drag up for hospitals</span>
          </div>
        )}
      </div>

      {/* ── Collapsed Summary ────────────────────────────────────────── */}
      {sheetHeight <= snapCollapsed + 20 && (
        <div className="px-5 pb-2 flex items-center justify-between">
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className={`text-sm font-medium ${textSecondary}`}>Finding best hospital...</span>
            </div>
          ) : displayHospital ? (
            <>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wide text-blue-600 mb-0.5`}>
                  {selectedHospital ? 'Manually Selected' : 'Best Match Found'}
                </p>
                <p className={`text-sm font-extrabold truncate ${textPrimary}`}>{displayHospital.name}</p>
                {userLocation && displayHospital._distanceKm !== undefined && (
                  <p className={`text-xs flex items-center gap-1 mt-0.5 ${textSecondary}`}>
                    <MapPin className="w-3 h-3" />{displayHospital._distanceKm} km away
                  </p>
                )}
              </div>
              <button
                onClick={onCallAmbulance}
                disabled={activeRequest && activeRequest.status !== 'arrived'}
                className="ml-3 shrink-0 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚑 Dispatch
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${textSecondary}`} />
              <span className={`text-sm font-medium ${textSecondary}`}>Tap a hospital on the map</span>
            </div>
          )}
        </div>
      )}

      {/* ── Expanded Content ─────────────────────────────────────────── */}
      {sheetHeight > snapCollapsed + 20 && (
        <div className="overflow-y-auto h-full pb-4">
          {/* Hospital Detail Panel (existing — UNCHANGED) */}
          {displayHospital && (
            <div className="border-b" style={{ borderColor: isDark ? '#334155' : '#f3f4f6' }}>
              <BottomPanel
                selectedHospital={selectedHospital}
                nearestHospital={nearestHospital}
                userLocation={userLocation}
                activeRequest={activeRequest}
                isDark={isDark}
                onCallAmbulance={onCallAmbulance}
                onRequestICU={onRequestICU}
              />
              
              {/* If this is the best match and not manually overridden, show AI reasoning */}
              {report && nearestHospital?.id === displayHospital.id && !selectedHospital && (
                <div className="px-4 pb-4">
                  <AIMatchPanel report={report} bestMatch={nearestHospital} isDark={isDark} />
                </div>
              )}
            </div>
          )}

          {/* Divider label */}
          <div className="px-4 pt-4 pb-1 flex items-center gap-3">
            <div className={`flex-1 h-px ${dividerColor}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondary}`}>
              Nearby Hospitals
            </span>
            <div className={`flex-1 h-px ${dividerColor}`} />
          </div>

          {/* Filters */}
          {showFilters && (
            <FilterPanel
              insurance={insurance} setInsurance={setInsurance}
              budget={budget} setBudget={setBudget}
              priority={priority} setPriority={setPriority}
              isDark={isDark}
            />
          )}

          {/* Hospital List */}
          <HospitalList
            rankedList={rankedList}
            matchReason={matchReason}
            hasResults={hasResults}
            isProcessing={isProcessing}
            filterStats={filterStats}
            onSelectHospital={onSelectHospital}
            selectedHospital={selectedHospital}
            isDark={isDark}
          />
        </div>
      )}
    </div>
  );
};

export default BottomSheet;
