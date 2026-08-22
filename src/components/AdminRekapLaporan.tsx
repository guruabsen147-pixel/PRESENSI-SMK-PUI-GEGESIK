import React, { useState } from 'react';
import { FileSpreadsheet, Calendar, Download, Printer, Filter, Users, TrendingUp } from 'lucide-react';
import { School, User, AttendanceRecord } from '../types';
import { exportToCSV, printOfficialAttendanceReport } from '../utils/exportUtils';

interface AdminRekapLaporanProps {
  schools: School[];
  selectedSchool: School;
  users: User[];
  records: AttendanceRecord[];
}

export const AdminRekapLaporan: React.FC<AdminRekapLaporanProps> = ({
  schools,
  selectedSchool,
  users,
  records
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const schoolTeachers = users.filter(u => u.schoolId === selectedSchool.id && u.role === 'guru');
  const monthRecords = records.filter(
    r => r.schoolId === selectedSchool.id && r.date.startsWith(selectedMonth)
  );

  // Compute stats per teacher
  const teacherStats = schoolTeachers.map(teacher => {
    const teacherRecords = monthRecords.filter(r => r.userId === teacher.id);
    const hadirTepat = teacherRecords.filter(r => r.type === 'masuk' && r.status === 'tepat_waktu').length;
    const terlambat = teacherRecords.filter(r => r.type === 'masuk' && r.status === 'terlambat').length;
    const izin = teacherRecords.filter(r => r.type === 'izin').length;
    const sakit = teacherRecords.filter(r => r.type === 'sakit').length;
    const dinas = teacherRecords.filter(r => r.type === 'dinas_luar').length;
    
    // Assuming standard 22 work days in a month
    const totalKehadiran = hadirTepat + terlambat + dinas;
    const persentase = Math.min(100, Math.round((totalKehadiran / 22) * 100));

    return {
      teacher,
      hadirTepat,
      terlambat,
      izin,
      sakit,
      dinas,
      totalKehadiran,
      persentase
    };
  });

  const handleExportMonth = () => {
    exportToCSV(monthRecords, `Rekap_Presensi_${selectedSchool.npsn}_${selectedMonth}.csv`);
  };

  const handlePrintReport = () => {
    printOfficialAttendanceReport(monthRecords, selectedSchool, `Bulan ${selectedMonth}`);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Rekapitulasi Kehadiran Bulanan & Penilaian Disiplin</span>
          </h3>
          <p className="text-xs text-slate-500">
            {selectedSchool.name} • Periode {selectedMonth}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={handleExportMonth}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Summary Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Nama Guru & NIP</th>
                <th className="p-3.5">Mata Pelajaran</th>
                <th className="p-3.5 text-center text-emerald-700 dark:text-emerald-400">Tepat Waktu (H)</th>
                <th className="p-3.5 text-center text-amber-700 dark:text-amber-400">Terlambat (T)</th>
                <th className="p-3.5 text-center text-blue-700 dark:text-blue-400">Izin (I)</th>
                <th className="p-3.5 text-center text-rose-700 dark:text-rose-400">Sakit (S)</th>
                <th className="p-3.5 text-center text-purple-700 dark:text-purple-400">Dinas Luar (DL)</th>
                <th className="p-3.5 text-center font-bold">Skor Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teacherStats.map((stat, idx) => (
                <tr key={stat.teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-3.5 text-center font-medium text-slate-400">{idx + 1}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{stat.teacher.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">NIP. {stat.teacher.nip}</div>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {stat.teacher.subject || '-'}
                  </td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {stat.hadirTepat}
                  </td>
                  <td className="p-3.5 text-center font-bold text-amber-700 dark:text-amber-400 font-mono">
                    {stat.terlambat}
                  </td>
                  <td className="p-3.5 text-center font-bold text-blue-700 dark:text-blue-400 font-mono">
                    {stat.izin}
                  </td>
                  <td className="p-3.5 text-center font-bold text-rose-700 dark:text-rose-400 font-mono">
                    {stat.sakit}
                  </td>
                  <td className="p-3.5 text-center font-bold text-purple-700 dark:text-purple-400 font-mono">
                    {stat.dinas}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-12 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${stat.persentase}%` }}
                          className={`h-full ${
                            stat.persentase >= 85 ? 'bg-emerald-500' : stat.persentase >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <span className="font-bold text-xs font-mono">{stat.persentase}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
