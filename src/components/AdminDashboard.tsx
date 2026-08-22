import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Download, 
  Printer, 
  RefreshCw,
  Search,
  Eye,
  MapPin,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { School, User, AttendanceRecord } from '../types';
import { exportToCSV, printOfficialAttendanceReport } from '../utils/exportUtils';
import { getGoogleMapsUrl } from '../utils/gpsUtils';

interface AdminDashboardProps {
  schools: School[];
  selectedSchool: School;
  onSelectSchool: (school: School) => void;
  users: User[];
  records: AttendanceRecord[];
  onApproveRecord: (recordId: string, status: 'approved' | 'rejected') => void;
  onViewSelfie: (record: AttendanceRecord) => void;
  onOpenGSheets: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  schools,
  selectedSchool,
  onSelectSchool,
  users,
  records,
  onApproveRecord,
  onViewSelfie,
  onOpenGSheets
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter teachers belonging to this school
  const schoolTeachers = users.filter(u => u.schoolId === selectedSchool.id && u.role === 'guru');
  
  // Filter records for selected school and date
  const dateRecords = records.filter(
    r => r.schoolId === selectedSchool.id && r.date === selectedDate
  );

  // Group check-in records
  const checkIns = dateRecords.filter(r => r.type === 'masuk');
  const permits = dateRecords.filter(r => ['izin', 'sakit', 'dinas_luar'].includes(r.type));

  const countTepatWaktu = checkIns.filter(r => r.status === 'tepat_waktu').length;
  const countTerlambat = checkIns.filter(r => r.status === 'terlambat').length;
  const countIzinSakit = permits.length;
  const countLuarRadius = dateRecords.filter(r => !r.isWithinRadius && r.type === 'masuk').length;

  const totalRecordedUsers = new Set(dateRecords.map(r => r.userId)).size;
  const countBelumAbsen = Math.max(0, schoolTeachers.length - totalRecordedUsers);

  const percentageHadir = schoolTeachers.length > 0
    ? Math.round(((countTepatWaktu + countTerlambat) / schoolTeachers.length) * 100)
    : 0;

  // Filtered table records
  const filteredRecords = dateRecords.filter(r => {
    const matchSearch =
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nip.includes(searchQuery);
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'tepat_waktu'
        ? r.status === 'tepat_waktu'
        : statusFilter === 'terlambat'
        ? r.status === 'terlambat'
        : statusFilter === 'izin'
        ? ['izin', 'sakit', 'dinas_luar'].includes(r.type)
        : statusFilter === 'luar_radius'
        ? !r.isWithinRadius
        : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* School Picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Unit Sekolah:
          </label>
          <select
            value={selectedSchool.id}
            onChange={e => {
              const found = schools.find(s => s.id === e.target.value);
              if (found) onSelectSchool(found);
            }}
            className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            {schools.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} (NPSN: {s.npsn})
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => exportToCSV(dateRecords, `Presensi_${selectedSchool.npsn}_${selectedDate}.csv`)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            title="Download Spreadsheet / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => printOfficialAttendanceReport(dateRecords, selectedSchool, `Tanggal ${selectedDate}`)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition"
            title="Cetak Format Dokumen Resmi"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF/Laporan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Teachers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Guru</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
            {schoolTeachers.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Terdaftar Aktif</div>
        </div>

        {/* Tepat Waktu */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <span>Tepat Waktu</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {countTepatWaktu}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Sebelum {selectedSchool.workStart} WIB</div>
        </div>

        {/* Terlambat */}
        <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-medium">
            <span>Terlambat</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {countTerlambat}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">&gt; Jam Toleransi</div>
        </div>

        {/* Izin / Sakit / Dinas */}
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300 text-xs font-medium">
            <span>Izin / Sakit</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
            {countIzinSakit}
          </div>
          <div className="text-[11px] text-indigo-600/80 mt-0.5">Ada Surat Keterangan</div>
        </div>

        {/* Belum Presensi / Alpha */}
        <div className="col-span-2 sm:col-span-1 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 text-xs font-medium">
            <span>Belum Hadir</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
            {countBelumAbsen}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Perlu konfirmasi</div>
        </div>
      </div>

      {/* Real-time Attendance Rate Progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Tingkat Kehadiran Guru Hari Ini: <span className="text-emerald-600 dark:text-emerald-400">{percentageHadir}%</span>
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            {countTepatWaktu + countTerlambat} dari {schoolTeachers.length} Guru Hadir
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(countTepatWaktu / Math.max(1, schoolTeachers.length)) * 100}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Tepat Waktu: ${countTepatWaktu}`}
          />
          <div
            style={{ width: `${(countTerlambat / Math.max(1, schoolTeachers.length)) * 100}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Terlambat: ${countTerlambat}`}
          />
          <div
            style={{ width: `${(countIzinSakit / Math.max(1, schoolTeachers.length)) * 100}%` }}
            className="bg-indigo-500 h-full transition-all duration-500"
            title={`Izin/Sakit: ${countIzinSakit}`}
          />
        </div>
      </div>

      {/* Attendance Real-time Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Daftar Catatan Presensi Masuk & Pulang
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredRecords.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama guru / NIP..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48"
              />
            </div>

            {/* Status Filter Buttons */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
            >
              <option value="all">Semua Status</option>
              <option value="tepat_waktu">Tepat Waktu</option>
              <option value="terlambat">Terlambat</option>
              <option value="izin">Izin / Sakit / Dinas</option>
              <option value="luar_radius">Di Luar Radius</option>
            </select>
          </div>
        </div>

        {/* Table Element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Foto Selfie</th>
                <th className="p-3.5">Nama Guru & NIP</th>
                <th className="p-3.5">Jenis & Waktu</th>
                <th className="p-3.5">Jarak & Radius</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5 text-right">Aksi / Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data presensi untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => {
                  const mapsUrl = getGoogleMapsUrl(record.latitude, record.longitude);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      {/* Photo Selfie Thumbnail */}
                      <td className="p-3.5">
                        {record.photoUrl ? (
                          <button
                            type="button"
                            onClick={() => onViewSelfie(record)}
                            className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group"
                            title="Klik untuk perbesar selfie"
                          >
                            <img src={record.photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                            {record.userName.charAt(0)}
                          </div>
                        )}
                      </td>

                      {/* Name & NIP */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{record.userName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">NIP. {record.nip}</div>
                      </td>

                      {/* Type & Time */}
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {record.timeOnly} WIB
                        </div>
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          record.type === 'masuk' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          record.type === 'pulang' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {record.type}
                        </span>
                      </td>

                      {/* Distance & GPS Geofence */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <span className={`font-mono font-semibold ${record.isWithinRadius ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {record.distanceMeters} m
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            record.isWithinRadius
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {record.isWithinRadius ? 'Valid' : 'Luar'}
                          </span>
                        </div>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Lihat Maps</span>
                        </a>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                          record.status === 'tepat_waktu' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          record.status === 'terlambat' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          record.status === 'dinas_luar' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {record.status === 'tepat_waktu' && <CheckCircle2 className="w-3 h-3" />}
                          {record.status === 'terlambat' && <Clock className="w-3 h-3" />}
                          {record.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>

                      {/* Notes / Reason */}
                      <td className="p-3.5 max-w-xs truncate text-slate-600 dark:text-slate-400 text-[11px]">
                        {record.notes || '-'}
                      </td>

                      {/* Action Approval */}
                      <td className="p-3.5 text-right">
                        {record.approvalStatus === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onApproveRecord(record.id, 'approved')}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                              title="Setujui Presensi / Izin"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onApproveRecord(record.id, 'rejected')}
                              className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
                              title="Tolak Presensi / Izin"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[11px] font-semibold ${
                            record.approvalStatus === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {record.approvalStatus === 'approved' ? '✓ Disetujui' : '✕ Ditolak'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
