import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  UserCheck, 
  FileText, 
  ArrowRight, 
  CloudCheck, 
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, School, AttendanceRecord, AttendanceType } from '../types';
import { GpsRadar } from './GpsRadar';
import { SelfieCamera } from './SelfieCamera';
import { IzinModal } from './IzinModal';
import { isLocationWithinRadius, getApproximateAddress } from '../utils/gpsUtils';
import { storageService } from '../services/storageService';

interface GuruPresensiViewProps {
  user: User;
  school: School;
  records: AttendanceRecord[];
  onAttendanceCreated: (record: AttendanceRecord) => void;
  onOpenHistory: () => void;
  onOpenGoogleSheets: () => void;
}

export const GuruPresensiView: React.FC<GuruPresensiViewProps> = ({
  user,
  school,
  records,
  onAttendanceCreated,
  onOpenHistory,
  onOpenGoogleSheets
}) => {
  // Live Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // GPS State
  const [currentLat, setCurrentLat] = useState<number | null>(school.latitude + 0.00015);
  const [currentLng, setCurrentLng] = useState<number | null>(school.longitude + 0.0001);
  const [accuracy, setAccuracy] = useState<number | null>(12);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);

  // Active Modals & Camera
  const [activeCameraType, setActiveCameraType] = useState<AttendanceType | null>(null);
  const [isIzinModalOpen, setIsIzinModalOpen] = useState<boolean>(false);
  const [outsideRadiusReason, setOutsideRadiusReason] = useState<string>('');
  const [showOutsideRadiusPrompt, setShowOutsideRadiusPrompt] = useState<boolean>(false);
  const [pendingSelfie, setPendingSelfie] = useState<string | null>(null);

  // Calculate Geofence status
  const { isWithin: isWithinRadius, distanceMeters } = isLocationWithinRadius(
    currentLat || 0,
    currentLng || 0,
    school.latitude,
    school.longitude,
    school.radiusMeters
  );

  // Get Today's records for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(
    r => r.userId === user.id && r.date === todayStr
  );
  const checkInRecord = todayRecords.find(r => r.type === 'masuk');
  const checkOutRecord = todayRecords.find(r => r.type === 'pulang');
  const permitRecord = todayRecords.find(r => ['izin', 'sakit', 'dinas_luar'].includes(r.type));

  // Fetch real device GPS
  const handleFetchDeviceGps = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung geolokasi.');
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCurrentLat(pos.coords.latitude);
        setCurrentLng(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setIsGpsLoading(false);
        setIsSimulated(false);
      },
      err => {
        console.warn('GPS fetch error:', err);
        setIsGpsLoading(false);
        alert('Gagal mengambil lokasi GPS: ' + err.message + '. Menggunakan simulasi koordinat.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSimulatePosition = (mode: 'school' | 'outside' | 'device') => {
    if (mode === 'school') {
      // 25 meters from school center
      setCurrentLat(school.latitude + 0.00015);
      setCurrentLng(school.longitude + 0.00012);
      setAccuracy(8);
      setIsSimulated(true);
    } else if (mode === 'outside') {
      // 450 meters outside
      setCurrentLat(school.latitude + 0.0042);
      setCurrentLng(school.longitude + 0.0035);
      setAccuracy(15);
      setIsSimulated(true);
    } else {
      handleFetchDeviceGps();
    }
  };

  const handleStartAttendance = (type: AttendanceType) => {
    setActiveCameraType(type);
  };

  // Called when selfie is confirmed
  const handleSelfieCaptured = (photoBase64: string) => {
    if (!activeCameraType) return;

    if (!isWithinRadius && activeCameraType === 'masuk') {
      // Prompt for outside radius reason (e.g. WFH, Dinas Luar, Trouble GPS)
      setPendingSelfie(photoBase64);
      setShowOutsideRadiusPrompt(true);
      setActiveCameraType(null);
      return;
    }

    finalizeAttendance(activeCameraType, photoBase64, '');
  };

  const finalizeAttendance = (
    type: AttendanceType,
    photoBase64: string,
    customNotes: string
  ) => {
    const now = new Date();
    const timeOnly = now.toLocaleTimeString('id-ID', { hour12: false });
    const [hours, minutes] = timeOnly.split(':').map(Number);
    const [startH, startM] = school.workStart.split(':').map(Number);
    const totalMinutesNow = hours * 60 + minutes;
    const totalMinutesSchool = startH * 60 + startM;

    let status: any = 'tepat_waktu';
    if (type === 'masuk') {
      if (totalMinutesNow > totalMinutesSchool + school.lateTolerance) {
        status = 'terlambat';
      } else {
        status = 'tepat_waktu';
      }
    } else if (type === 'pulang') {
      status = 'tepat_waktu';
    }

    if (!isWithinRadius) {
      status = 'di_luar_radius';
    }

    const newRecord: AttendanceRecord = {
      id: 'rec-' + Date.now(),
      userId: user.id,
      userName: user.name,
      nip: user.nip,
      schoolId: school.id,
      schoolName: school.name,
      date: now.toISOString().split('T')[0],
      type: type,
      timestamp: now.toISOString(),
      timeOnly: timeOnly,
      photoUrl: photoBase64,
      latitude: currentLat || school.latitude,
      longitude: currentLng || school.longitude,
      distanceMeters: distanceMeters,
      isWithinRadius: isWithinRadius,
      status: status,
      notes: customNotes || (isWithinRadius ? 'Presensi valid di area sekolah' : 'Presensi di luar radius sekolah'),
      approvalStatus: isWithinRadius ? 'approved' : 'pending',
      syncStatus: 'pending',
      addressName: getApproximateAddress(currentLat || school.latitude, currentLng || school.longitude, school.name),
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Smartphone (Mobile App)' : 'Web Browser'
    };

    onAttendanceCreated(newRecord);
    setActiveCameraType(null);
    setShowOutsideRadiusPrompt(false);
    setPendingSelfie(null);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  const handleIzinSubmit = (data: { type: AttendanceType; notes: string; documentUrl?: string }) => {
    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: 'rec-' + Date.now(),
      userId: user.id,
      userName: user.name,
      nip: user.nip,
      schoolId: school.id,
      schoolName: school.name,
      date: now.toISOString().split('T')[0],
      type: data.type,
      timestamp: now.toISOString(),
      timeOnly: now.toLocaleTimeString('id-ID', { hour12: false }),
      photoUrl: data.documentUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=150&auto=format&fit=crop&q=80',
      latitude: currentLat || school.latitude,
      longitude: currentLng || school.longitude,
      distanceMeters: distanceMeters,
      isWithinRadius: false,
      status: data.type as any,
      notes: data.notes,
      documentUrl: data.documentUrl,
      approvalStatus: 'pending',
      syncStatus: 'pending',
      addressName: 'Pengajuan Surat Izin/Dinas'
    };

    onAttendanceCreated(newRecord);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-12">
      {/* Teacher Profile & Live Clock Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-bold shrink-0 shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wide">
                  {user.role === 'guru' ? 'Guru Pengajar' : 'Tenaga Kependidikan'}
                </span>
                <span className="text-[11px] text-emerald-200/80">
                  {school.name.split(' ')[0]}
                </span>
              </div>
              <h2 className="text-base font-bold leading-tight mt-1 text-white">{user.name}</h2>
              <p className="text-xs text-slate-300 font-mono">NIP. {user.nip}</p>
            </div>
          </div>

          {/* Real-time Clock display */}
          <div className="bg-slate-950/40 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-right shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="text-xl font-mono font-black tracking-wider text-white">
              {currentTime.toLocaleTimeString('id-ID', { hour12: false })} <span className="text-xs font-sans text-emerald-400">WIB</span>
            </div>
          </div>
        </div>

        {/* Schedule Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Jam Masuk Sekolah:</span>
            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md font-mono">{school.workStart} WIB</span>
            <span className="text-[11px] text-emerald-300">(Toleransi {school.lateTolerance} mnt)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-200">
            <MapPin className="w-3.5 h-3.5" />
            <span>Radius Geofence: {school.radiusMeters}m</span>
          </div>
        </div>
      </div>

      {/* Today's Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Masuk Card */}
        <div className={`p-3.5 rounded-2xl border transition shadow-xs ${
          checkInRecord
            ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Presensi Masuk</span>
            {checkInRecord ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            )}
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
            {checkInRecord ? checkInRecord.timeOnly : '-- : --'}
          </div>
          <div className="text-[11px] mt-1">
            {checkInRecord ? (
              <span className={`font-semibold ${checkInRecord.status === 'tepat_waktu' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {checkInRecord.status === 'tepat_waktu' ? '✓ Tepat Waktu' : '⚠️ Terlambat'}
              </span>
            ) : (
              <span className="text-slate-400">Belum Presensi</span>
            )}
          </div>
        </div>

        {/* Pulang Card */}
        <div className={`p-3.5 rounded-2xl border transition shadow-xs ${
          checkOutRecord
            ? 'bg-blue-50/70 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Presensi Pulang</span>
            {checkOutRecord ? (
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            )}
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
            {checkOutRecord ? checkOutRecord.timeOnly : '-- : --'}
          </div>
          <div className="text-[11px] mt-1">
            {checkOutRecord ? (
              <span className="font-semibold text-blue-600 dark:text-blue-400">✓ Selesai Mengajar</span>
            ) : (
              <span className="text-slate-400">Mulai {school.workEnd} WIB</span>
            )}
          </div>
        </div>

        {/* Izin / Status Khusus */}
        <div className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border transition shadow-xs ${
          permitRecord
            ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Keterangan Khusus</span>
            {permitRecord && <span className="text-xs">📋</span>}
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {permitRecord ? permitRecord.type.toUpperCase() : 'Hadir Reguler'}
          </div>
          <div className="text-[11px] mt-1 text-slate-500 truncate">
            {permitRecord ? permitRecord.notes : 'Tidak ada pengajuan'}
          </div>
        </div>
      </div>

      {/* GPS Radar Geofence Component */}
      <GpsRadar
        school={school}
        currentLat={currentLat}
        currentLng={currentLng}
        distanceMeters={distanceMeters}
        isWithinRadius={isWithinRadius}
        accuracy={accuracy}
        isLoading={isGpsLoading}
        isSimulated={isSimulated}
        onToggleSimulated={handleSimulatePosition}
        onRefreshGps={handleFetchDeviceGps}
      />

      {/* Camera Live Modal when triggered */}
      {activeCameraType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md">
            <SelfieCamera
              user={user}
              school={school}
              currentLat={currentLat}
              currentLng={currentLng}
              distanceMeters={distanceMeters}
              isWithinRadius={isWithinRadius}
              onCapture={handleSelfieCaptured}
              onCancel={() => setActiveCameraType(null)}
            />
          </div>
        </div>
      )}

      {/* Outside Radius Prompt Modal */}
      {showOutsideRadiusPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base">Peringatan: Di Luar Radius Sekolah</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Posisi Anda terdeteksi berjarak <strong className="text-slate-900 dark:text-white font-mono">{distanceMeters} meter</strong> dari koordinat resmi sekolah (Batas radius: {school.radiusMeters} meter).
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tuliskan Alasan / Keterangan Presensi Luar Radius <span className="text-red-500">*</span>:
              </label>
              <textarea
                rows={3}
                value={outsideRadiusReason}
                onChange={e => setOutsideRadiusReason(e.target.value)}
                placeholder="Contoh: Sedang mendampingi siswa lomba / tugas di luar sekolah / kendala sinyal GPS..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowOutsideRadiusPrompt(false);
                  setPendingSelfie(null);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!outsideRadiusReason.trim()}
                onClick={() => {
                  if (pendingSelfie) {
                    finalizeAttendance('masuk', pendingSelfie, outsideRadiusReason.trim());
                  }
                }}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
              >
                Kirim Presensi (Menunggu Approval)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Attendance Action Buttons */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Aksi Presensi Cepat
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Absen Masuk Button */}
          <button
            id="btn-absen-masuk"
            type="button"
            onClick={() => handleStartAttendance('masuk')}
            disabled={!!checkInRecord}
            className={`p-4 rounded-2xl font-bold text-left transition flex items-center justify-between border ${
              checkInRecord
                ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 shadow-lg shadow-emerald-950/20 active:scale-[0.98]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${checkInRecord ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : 'bg-white/20 text-white'}`}>
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm">{checkInRecord ? 'Sudah Absen Masuk' : 'Absen Masuk (Selfie + GPS)'}</p>
                <p className="text-[11px] font-normal opacity-90">
                  {checkInRecord ? `Tercatat pukul ${checkInRecord.timeOnly}` : 'Foto selfie & verifikasi lokasi'}
                </p>
              </div>
            </div>
            {!checkInRecord && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Absen Pulang Button */}
          <button
            id="btn-absen-pulang"
            type="button"
            onClick={() => handleStartAttendance('pulang')}
            disabled={!checkInRecord || !!checkOutRecord}
            className={`p-4 rounded-2xl font-bold text-left transition flex items-center justify-between border ${
              !checkInRecord || !!checkOutRecord
                ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-600 text-white border-teal-800 shadow-lg shadow-teal-950/20 active:scale-[0.98]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${!checkInRecord || !!checkOutRecord ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : 'bg-white/20 text-white'}`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm">{checkOutRecord ? 'Sudah Absen Pulang' : 'Absen Pulang'}</p>
                <p className="text-[11px] font-normal opacity-90">
                  {checkOutRecord ? `Tercatat pukul ${checkOutRecord.timeOnly}` : 'Sebelum meninggalkan sekolah'}
                </p>
              </div>
            </div>
            {checkInRecord && !checkOutRecord && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Secondary Buttons: Izin & History */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            id="btn-ajukan-izin"
            type="button"
            onClick={() => setIsIzinModalOpen(true)}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-xs transition"
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Ajukan Izin / Sakit</span>
          </button>

          <button
            id="btn-lihat-riwayat"
            type="button"
            onClick={onOpenHistory}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Riwayat Presensi Saya</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Sync Status Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
            <CloudCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Integrasi Google Sheets & Apps Script
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Data otomatis tersinkron real-time ke spreadsheet sekolah
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenGoogleSheets}
          className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline px-2 py-1"
        >
          Lihat Status
        </button>
      </div>

      {/* Leave/Permission Modal */}
      <IzinModal
        isOpen={isIzinModalOpen}
        onClose={() => setIsIzinModalOpen(false)}
        user={user}
        school={school}
        currentLat={currentLat}
        currentLng={currentLng}
        onSubmit={handleIzinSubmit}
      />
    </div>
  );
};
