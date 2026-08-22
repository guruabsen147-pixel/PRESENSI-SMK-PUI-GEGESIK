import React, { useState } from 'react';
import { School as SchoolIcon, MapPin, Navigation, Save, Plus, Building, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { School } from '../types';
import { getGoogleMapsUrl } from '../utils/gpsUtils';

interface AdminSchoolSettingsProps {
  schools: School[];
  onSaveSchools: (schools: School[]) => void;
}

export const AdminSchoolSettings: React.FC<AdminSchoolSettingsProps> = ({
  schools,
  onSaveSchools
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || '');
  const [schoolList, setSchoolList] = useState<School[]>(schools);
  const [isGettingCurrentGps, setIsGettingCurrentGps] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentSchool = schoolList.find(s => s.id === selectedSchoolId) || schoolList[0];

  const handleUpdateCurrentSchool = (field: keyof School, value: any) => {
    setSchoolList(prev =>
      prev.map(s => (s.id === selectedSchoolId ? { ...s, [field]: value } : s))
    );
  };

  const handleFetchCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung GPS.');
      return;
    }
    setIsGettingCurrentGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        handleUpdateCurrentSchool('latitude', pos.coords.latitude);
        handleUpdateCurrentSchool('longitude', pos.coords.longitude);
        setIsGettingCurrentGps(false);
        alert(`Koordinat berhasil diperbarui ke posisi Anda saat ini: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      },
      err => {
        setIsGettingCurrentGps(false);
        alert('Gagal mengambil GPS: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleAddNewSchool = () => {
    const newSchool: School = {
      id: 'sch-' + Date.now(),
      name: 'Sekolah Baru / Unit Cabang',
      npsn: '20' + Math.floor(100000 + Math.random() * 900000),
      address: 'Jl. Lokasi Sekolah Baru',
      latitude: -6.2088,
      longitude: 106.8456,
      radiusMeters: 100,
      workStart: '07:00',
      lateTolerance: 15,
      workEnd: '15:00'
    };
    const updated = [...schoolList, newSchool];
    setSchoolList(updated);
    setSelectedSchoolId(newSchool.id);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSchools(schoolList);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Lokasi GPS & Geofence Sekolah</span>
          </h3>
          <p className="text-xs text-slate-500">
            Atur titik koordinat pusat sekolah, radius toleransi absensi guru, dan jam operasional.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewSchool}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Tambah Unit Sekolah</span>
        </button>
      </div>

      {/* School Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {schoolList.map(school => (
          <button
            key={school.id}
            type="button"
            onClick={() => setSelectedSchoolId(school.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedSchoolId === school.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {school.name}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      {currentSchool && (
        <form onSubmit={handleSaveAll} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Sekolah / Unit Pendidikan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentSchool.name}
                onChange={e => handleUpdateCurrentSchool('name', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Pokok Sekolah Nasional (NPSN)
              </label>
              <input
                type="text"
                value={currentSchool.npsn}
                onChange={e => handleUpdateCurrentSchool('npsn', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Sekolah
            </label>
            <input
              type="text"
              value={currentSchool.address}
              onChange={e => handleUpdateCurrentSchool('address', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* GPS Coordinates Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Titik Koordinat Pusat Sekolah (Latitude & Longitude)</span>
              </div>
              <button
                type="button"
                onClick={handleFetchCurrentGps}
                disabled={isGettingCurrentGps}
                className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Navigation className={`w-3.5 h-3.5 ${isGettingCurrentGps ? 'animate-spin' : ''}`} />
                <span>{isGettingCurrentGps ? 'Mendeteksi...' : 'Ambil Lokasi Saya Sekarang'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                  Latitude (Lintang)
                </label>
                <input
                  type="number"
                  step="any"
                  value={currentSchool.latitude}
                  onChange={e => handleUpdateCurrentSchool('latitude', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                  Longitude (Bujur)
                </label>
                <input
                  type="number"
                  step="any"
                  value={currentSchool.longitude}
                  onChange={e => handleUpdateCurrentSchool('longitude', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <a
                href={getGoogleMapsUrl(currentSchool.latitude, currentSchool.longitude)}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
              >
                <span>Cek Posisi Titik Sekolah di Google Maps</span>
              </a>
            </div>
          </div>

          {/* Geofence Radius & Operating Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Radius Geofence (Meter)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={currentSchool.radiusMeters}
                  onChange={e => handleUpdateCurrentSchool('radiusMeters', parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">meter</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Jarak maksimal guru saat absen</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Masuk (Batas Datang)
              </label>
              <input
                type="time"
                value={currentSchool.workStart}
                onChange={e => handleUpdateCurrentSchool('workStart', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Toleransi Keterlambatan
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={currentSchool.lateTolerance}
                  onChange={e => handleUpdateCurrentSchool('lateTolerance', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">menit</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengaturan berhasil disimpan!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Sekolah</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
