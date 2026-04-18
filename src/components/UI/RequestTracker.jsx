/**
 * RequestTracker.jsx — Live ambulance request tracker for the user.
 *
 * Shows: status header, ETA/distance, driver info card, cancel/dismiss button.
 */

import React, { useState } from 'react';
import { Ambulance, CheckCircle, Clock, MapPin, X, Navigation, Phone, ShieldCheck, Maximize2 } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    color: 'bg-orange-500',
    pulse: true,
    icon: <Clock className="w-4 h-4 text-white" />,
    label: 'Requesting Ambulance…',
    sublabel: 'Finding nearest unit',
  },
  en_route: {
    color: 'bg-blue-600',
    pulse: false,
    icon: <Ambulance className="w-4 h-4 text-white" />,
    label: 'Ambulance En Route',
    sublabel: 'Moving toward your location',
  },
  arrived: {
    color: 'bg-green-500',
    pulse: false,
    icon: <CheckCircle className="w-4 h-4 text-white" />,
    label: 'Ambulance Arrived!',
    sublabel: 'Emergency services are here',
  },
};

const RequestTracker = ({ request, ambulances = [], onDismiss }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const config = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const driver = ambulances.find(a => a.id === request.ambulanceId);
  const canCancel = request.status !== 'arrived';

  if (isMinimized) {
    return (
      <div className="w-full max-w-sm px-3 animate-slide-up mx-auto pointer-events-auto">
        <button
          onClick={() => setIsMinimized(false)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl shadow-lg border border-gray-100 ${config.color} hover:opacity-90 transition-all active:scale-95`}
        >
          <div className="flex items-center gap-2 text-white">
            <div className={`${config.pulse ? 'animate-pulse' : ''}`}>{config.icon}</div>
            <span className="text-sm font-bold">{request.status === 'en_route' ? `ETA: ${request.eta}` : config.label}</span>
          </div>
          <Maximize2 className="w-4 h-4 text-white/70" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm px-3 animate-slide-up mx-auto pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className={`${config.color} px-4 py-2.5 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-full bg-white/20 flex items-center justify-center ${config.pulse ? 'animate-pulse' : ''}`}>
              {config.icon}
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">{config.label}</p>
              <p className="text-white/70 text-[10px] mt-0.5">{config.sublabel}</p>
            </div>
          </div>
          {canCancel && (
            <button
              onClick={() => setIsMinimized(true)}
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition active:scale-95"
              title="Minimize Tracker"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* ETA + Distance */}
        {request.status !== 'arrived' && (
          <div className="px-3 pt-3 pb-2 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">ETA</p>
                <p className="text-sm font-bold text-gray-800">{request.status === 'pending' ? '…' : request.eta}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Navigation className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Distance</p>
                <p className="text-sm font-bold text-gray-800">{request.status === 'pending' ? '…' : request.distance}</p>
              </div>
            </div>
          </div>
        )}

        {/* Driver Info Card */}
        {driver && request.status !== 'arrived' && (
          <div className="mx-3 mb-2 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
            <img
              src={driver.driverPhoto || `https://api.dicebear.com/7.x/personas/svg?seed=${driver.driverName}`}
              alt={driver.driverName}
              className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 shrink-0 object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{driver.driverName}</p>
              <p className="text-[10px] text-blue-600 font-semibold">{driver.type}</p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{driver.plateNumber}</p>
            </div>
            {driver.driverPhone && (
              <a
                href={`tel:${driver.driverPhone.replace(/\s/g, '')}`}
                className="shrink-0 w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition active:scale-90"
                title={`Call ${driver.driverName}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Arrived state */}
        {request.status === 'arrived' && (
          <div className="px-4 py-3 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Help has arrived!</p>
              <p className="text-xs text-gray-500">Stay calm and follow the crew's instructions.</p>
            </div>
            <button
              onClick={onDismiss}
              className="shrink-0 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition active:scale-95"
            >
              Done
            </button>
          </div>
        )}

        {/* Hospital assignment */}
        {request.nearestHospital && (
          <div className="border-t border-gray-50 px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <p className="text-[11px] text-gray-500 truncate">
                <span className="font-semibold text-gray-700">{request.nearestHospital.name}</span>
              </p>
            </div>
            {canCancel && (
              <button
                onClick={onDismiss}
                className="shrink-0 px-3 py-1 bg-red-50 text-[10px] font-bold text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition active:scale-95"
              >
                Cancel Ambulance
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestTracker;
