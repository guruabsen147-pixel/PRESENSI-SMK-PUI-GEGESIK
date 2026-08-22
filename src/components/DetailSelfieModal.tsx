import React from 'react';
import { X, MapPin, Clock, User, ShieldCheck, ExternalLink, Calendar, Info } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { getGoogleMapsUrl } from '../utils/gpsUtils';

interface DetailSelfieModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const DetailSelfieModal: React.FC<DetailSelfieModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const mapsUrl = getGoogleMapsUrl(record.latitude, record.longitude);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Bukti Verifikasi Presensi &amp; Selfie</h3>
              <p className="text-[11px] text-slate-400 font-mono">{record.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Photo Frame */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-inner">
            {record.photoUrl ? (
              <img
                src={record.photoUrl}
                alt="Foto Bukti Selfie"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Info className="w-8 h-8 mb-2 text-slate-400" />
                <span>Foto selfie tidak tersedia</span>
              </div>
            )}

            {/* Status Stamp */}
            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
              {record.type.toUpperCase()} • {record.status.replace(/_/g, ' ').toUpperCase()}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">Nama Guru:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{record.userName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">NIP Guru:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{record.nip}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Waktu Presensi:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                {record.date} • {record.timeOnly} WIB
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Jarak ke Titik Sekolah:</span>
              <span className={`font-semibold ${record.isWithinRadius ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {record.distanceMeters} meter ({record.isWithinRadius ? '✓ Dalam Radius' : '⚠️ Di Luar Radius'})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Koordinat GPS:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                {record.latitude.toFixed(5)}, {record.longitude.toFixed(5)}
              </span>
            </div>

            {record.notes && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 font-medium block mb-0.5">Catatan / Keterangan:</span>
                <p className="text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  &quot;{record.notes}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Maps Button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Lihat Lokasi Presensi di Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
