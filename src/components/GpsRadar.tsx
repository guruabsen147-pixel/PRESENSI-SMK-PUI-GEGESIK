import React from 'react';
import { MapPin, Navigation, Compass, CheckCircle2, AlertCircle, ExternalLink, Sliders } from 'lucide-react';
import { School } from '../types';
import { formatDistance, getGoogleMapsUrl } from '../utils/gpsUtils';

interface GpsRadarProps {
  school: School;
  currentLat: number | null;
  currentLng: number | null;
  distanceMeters: number;
  isWithinRadius: boolean;
  accuracy: number | null;
  isLoading: boolean;
  isSimulated: boolean;
  onToggleSimulated: (mode: 'school' | 'outside' | 'device') => void;
  onRefreshGps: () => void;
}

export const GpsRadar: React.FC<GpsRadarProps> = ({
  school,
  currentLat,
  currentLng,
  distanceMeters,
  isWithinRadius,
  accuracy,
  isLoading,
  isSimulated,
  onToggleSimulated,
  onRefreshGps
}) => {
  const mapsUrl = currentLat && currentLng ? getGoogleMapsUrl(currentLat, currentLng) : '#';

  // Calculate percentage distance relative to 2x radius for visual ring positioning
  const maxVisualRange = Math.max(school.radiusMeters * 2.5, 300);
  const visualDistancePercent = Math.min(Math.round((distanceMeters / maxVisualRange) * 100), 92);

  return (
    <div id="gps-radar-widget" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isWithinRadius ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'}`}>
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Geofencing GPS Presensi
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {school.name}
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-gps"
          type="button"
          onClick={onRefreshGps}
          disabled={isLoading}
          className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition"
          title="Segarkan Koordinat GPS"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Mencari...' : 'Cek GPS'}</span>
        </button>
      </div>

      {/* Visual Radar Animation & Status */}
      <div className="py-4 flex flex-col sm:flex-row items-center gap-4">
        {/* Radar concentric circle */}
        <div className="relative w-36 h-36 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border-2 border-slate-800 shrink-0">
          {/* Grid lines */}
          <div className="absolute inset-0 border border-emerald-500/20 rounded-full scale-75" />
          <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-50" />
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/20" />
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/20" />
          
          {/* Radar Sweep Effect */}
          <div className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.25)_60deg,transparent_70deg)] pointer-events-none" />

          {/* School Center Point (Target) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-emerald-500/30 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 mt-1 bg-slate-900/90 px-1 rounded">
              Sekolah
            </span>
          </div>

          {/* User Location Blip relative to center */}
          <div
            className="absolute z-20 transition-all duration-700"
            style={{
              top: `${50 - (isWithinRadius ? 15 : visualDistancePercent / 2.5)}%`,
              left: `${50 + (isWithinRadius ? 12 : visualDistancePercent / 2.5)}%`,
            }}
          >
            <div className={`w-3.5 h-3.5 rounded-full ring-4 animate-bounce ${
              isWithinRadius ? 'bg-sky-400 ring-sky-400/40' : 'bg-amber-400 ring-amber-400/40'
            }`} />
            <span className="absolute -top-4 -left-3 text-[9px] font-semibold text-white bg-slate-900/90 px-1 rounded whitespace-nowrap">
              Posisi Anda
            </span>
          </div>
        </div>

        {/* Distance & Status Details */}
        <div className="flex-1 w-full space-y-2.5">
          <div className={`p-3 rounded-xl border ${
            isWithinRadius
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
              : 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              {isWithinRadius ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold">
                  {isWithinRadius ? 'Lokasi Valid dalam Radius Sekolah' : 'Di Luar Radius Sekolah'}
                </p>
                <p className="text-[11px] opacity-90">
                  Jarak Anda: <span className="font-bold underline">{formatDistance(distanceMeters)}</span> (Batas Maksimal: {school.radiusMeters} m)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
            <div>
              <span className="block text-slate-400 dark:text-slate-500">Koordinat Anda:</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {currentLat ? `${currentLat.toFixed(5)}, ${currentLng?.toFixed(5)}` : 'Memuat...'}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 dark:text-slate-500">Akurasi GPS:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {accuracy ? `±${Math.round(accuracy)} meter` : 'Tinggi (GPS Satelit)'}
              </span>
            </div>
          </div>

          {currentLat && currentLng && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium pt-0.5"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Simulator / Test Mode Switcher (Convenient for testing) */}
      <div className="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
          <Sliders className="w-3.5 h-3.5" />
          <span>Simulasi Uji Coba:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleSimulated('school')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
              isSimulated && isWithinRadius
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🏫 Di Titik Sekolah (25m)
          </button>
          <button
            type="button"
            onClick={() => onToggleSimulated('outside')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
              isSimulated && !isWithinRadius
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🚗 Luar Radius (450m)
          </button>
          <button
            type="button"
            onClick={() => onToggleSimulated('device')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
              !isSimulated
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            📱 GPS Asli HP
          </button>
        </div>
      </div>
    </div>
  );
};
