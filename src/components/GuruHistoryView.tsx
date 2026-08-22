import React, { useState } from 'react';
import { Calendar, ChevronLeft, MapPin, Eye, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { User, AttendanceRecord, School } from '../types';
import { getGoogleMapsUrl } from '../utils/gpsUtils';

interface GuruHistoryViewProps {
  user: User;
  school: School;
  records: AttendanceRecord[];
  onBack: () => void;
  onViewSelfie: (record: AttendanceRecord) => void;
}

export const GuruHistoryView: React.FC<GuruHistoryViewProps> = ({
  user,
  school,
  records,
  onBack,
  onViewSelfie
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const userRecords = records.filter(r => r.userId === user.id);
  const filteredRecords = userRecords.filter(r => r.date.startsWith(selectedMonth));

  // Summary counts
  const totalHadir = filteredRecords.filter(r => r.type === 'masuk' && r.status === 'tepat_waktu').length;
  const totalTerlambat = filteredRecords.filter(r => r.type === 'masuk' && r.status === 'terlambat').length;
  const totalIzin = filteredRecords.filter(r => ['izin', 'sakit', 'dinas_luar'].includes(r.type)).length;

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 rounded-2xl">
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Hadir Tepat Waktu</div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{totalHadir}</div>
          <div className="text-[10px] text-emerald-600/80">Hari</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3.5 rounded-2xl">
          <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">Terlambat</div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{totalTerlambat}</div>
          <div className="text-[10px] text-amber-600/80">Hari</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3.5 rounded-2xl">
          <div className="text-xs text-blue-800 dark:text-blue-300 font-medium">Izin / Sakit / Dinas</div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-0.5">{totalIzin}</div>
          <div className="text-[10px] text-blue-600/80">Pengajuan</div>
        </div>
      </div>

      {/* History Records List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Riwayat Kehadiran Presensi</span>
          </h3>
          <span className="text-xs text-slate-500">{filteredRecords.length} Catatan</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs">Belum ada catatan presensi pada bulan ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRecords.map(record => {
              const mapsUrl = getGoogleMapsUrl(record.latitude, record.longitude);
              return (
                <div key={record.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-start gap-3">
                    {/* Selfie thumbnail */}
                    {record.photoUrl ? (
                      <button
                        type="button"
                        onClick={() => onViewSelfie(record)}
                        className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0 group"
                        title="Klik untuk memperbesar selfie"
                      >
                        <img src={record.photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 font-mono">
                          {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          record.type === 'masuk' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          record.type === 'pulang' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {record.type.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{record.timeOnly} WIB</span>
                        <span>•</span>
                        <span className="text-[11px]">{record.status.replace(/_/g, ' ')}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{record.addressName || 'Lokasi Geofence'} ({record.distanceMeters}m)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      <span>Maps</span>
                    </a>
                    {record.photoUrl && (
                      <button
                        type="button"
                        onClick={() => onViewSelfie(record)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat Bukti</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
