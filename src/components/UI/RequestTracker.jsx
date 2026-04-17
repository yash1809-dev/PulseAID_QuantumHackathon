import React from 'react';
import { Ambulance, CheckCircle, Clock, MapPin, X, Navigation } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    color: 'bg-orange-500',
    icon: <Clock className="w-5 h-5 text-white" />,
    label: 'Requesting Ambulance...',
    sublabel: 'Finding nearest unit',
  },
  en_route: {
    color: 'bg-blue-600',
    icon: <Ambulance className="w-5 h-5 text-white" />,
    label: 'Ambulance En Route',
    sublabel: 'Moving toward your location',
  },
  arrived: {
    color: 'bg-green-500',
    icon: <CheckCircle className="w-5 h-5 text-white" />,
    label: 'Ambulance Arrived!',
    sublabel: 'Emergency services are here',
  },
};

const RequestTracker = ({ request, onDismiss }) => {
  const config = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`${config.color} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {config.icon}
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">{config.label}</p>
              <p className="text-white/75 text-xs mt-0.5">{config.sublabel}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Stats Row */}
        {request.status !== 'arrived' && (
          <div className="px-4 py-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">ETA</p>
                <p className="text-sm font-bold text-gray-800">
                  {request.status === 'pending' ? '...' : request.eta}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2">
              <Navigation className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Distance</p>
                <p className="text-sm font-bold text-gray-800">
                  {request.status === 'pending' ? '...' : request.distance}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Arrived state */}
        {request.status === 'arrived' && (
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Your ambulance has arrived. Please stay calm and follow instructions.
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="shrink-0 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition"
            >
              Done
            </button>
          </div>
        )}

        {/* Hospital assignment */}
        {request.nearestHospital && (
          <div className="border-t border-gray-50 px-4 py-2.5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500 truncate">
              Assigned: <span className="font-semibold text-gray-700">{request.nearestHospital.name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestTracker;
