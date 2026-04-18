import React from 'react';
import { Ambulance, BedDouble, MapPin, Clock, Wifi } from 'lucide-react';
import { getDistanceKm, formatDistance, formatETA } from '../../utils/geo';

const BottomPanel = ({
  selectedHospital,
  nearestHospital,
  userLocation,
  activeRequest,
  isDark = false,
  onCallAmbulance,
  onRequestICU,
  requestTracker,
}) => {
  const hospital = selectedHospital || nearestHospital;
  const isRequestActive = activeRequest && activeRequest.status !== 'arrived';
  const availabilityPct = hospital ? hospital.icu_available / hospital.icu_total : 0;

  const availColor =
    !hospital ? 'gray' :
    hospital.icu_available === 0 ? 'red' :
    availabilityPct > 0.4 ? 'green' : 'yellow';

  const colorMap = {
    green:  { bar: 'bg-green-500',  badge: isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700' },
    yellow: { bar: 'bg-yellow-400', badge: isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700' },
    red:    { bar: 'bg-red-500',    badge: isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700' },
    gray:   { bar: 'bg-gray-300',   badge: isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500' },
  };
  const colors = colorMap[availColor];

  const textPrimary   = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const trackBg       = isDark ? 'bg-slate-700' : 'bg-gray-100';
  const dividerBg     = isDark ? 'bg-slate-700' : 'bg-gray-100';
  const statBg        = isDark ? 'bg-slate-800' : 'bg-gray-50';

  const distanceToHospital = hospital && userLocation
    ? formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, hospital.lat, hospital.lng))
    : null;

  const etaToHospital = hospital && userLocation
    ? formatETA(getDistanceKm(userLocation.lat, userLocation.lng, hospital.lat, hospital.lng))
    : null;

  if (!hospital) {
    return (
      <div className="h-full flex items-center justify-center px-6 animate-fade-in">
        <div className="text-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
            <MapPin className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-400'}`} />
          </div>
          <p className={`text-sm font-medium ${textSecondary}`}>Tap a hospital marker on the map</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-gray-300'}`}>to view ICU availability and request help</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center px-4 md:px-6 gap-4 md:gap-6 overflow-x-auto animate-fade-in">
      {/* Hospital Info */}
      <div className="flex-1 min-w-0">
        {/* Badge row */}
        <div className="flex items-center gap-1.5 mb-1">
          {nearestHospital?.id === hospital.id && !selectedHospital && (
            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
              Nearest
            </span>
          )}
          {selectedHospital && nearestHospital?.id !== hospital.id && (
            <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
              Selected
            </span>
          )}
          {selectedHospital && nearestHospital?.id === hospital.id && (
            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
              Nearest
            </span>
          )}
        </div>

        {/* Hospital name */}
        <h2 className={`text-base md:text-lg font-extrabold truncate leading-tight ${textPrimary}`}>
          {hospital.name}
        </h2>

        {/* Distance + ETA + Live badge */}
        <div className={`flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs ${textSecondary}`}>
          {distanceToHospital && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" /> {distanceToHospital} away
            </span>
          )}
          {etaToHospital && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" /> ~{etaToHospital} drive
            </span>
          )}
          <span className="flex items-center gap-1 text-green-500 font-semibold">
            <Wifi className="w-3 h-3 shrink-0" /> Live
          </span>
        </div>

        {/* ICU Progress Bar */}
        <div className="mt-2.5">
          <div className="flex justify-between items-center mb-1.5">
            <span className={`text-xs font-semibold flex items-center gap-1 ${textSecondary}`}>
              <BedDouble className="w-3.5 h-3.5" /> ICU Beds
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
              {hospital.icu_available} / {hospital.icu_total} available
            </span>
          </div>
          <div className={`h-2 w-full ${trackBg} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
              style={{ width: `${Math.max(2, (hospital.icu_available / hospital.icu_total) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={`hidden md:block h-16 w-px ${dividerBg} shrink-0`} />

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 shrink-0 w-[140px] sm:w-[180px]">
        {requestTracker ? (
          <div className="w-full">
            {requestTracker}
          </div>
        ) : (
          <>
            <button
              onClick={onCallAmbulance}
              disabled={isRequestActive}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200
                ${isRequestActive
                  ? isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95 shadow-blue-200'
                }`}
            >
              <Ambulance className="w-4 h-4" />
              {isRequestActive ? 'Dispatching...' : 'Call Ambulance'}
            </button>

            <button
              onClick={onRequestICU}
              disabled={isRequestActive || hospital.icu_available === 0}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200
                ${isRequestActive || hospital.icu_available === 0
                  ? isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md active:scale-95 shadow-red-200'
                }`}
            >
              <BedDouble className="w-4 h-4" />
              {hospital.icu_available === 0 ? 'ICU Full' : 'Reserve ICU'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BottomPanel;
