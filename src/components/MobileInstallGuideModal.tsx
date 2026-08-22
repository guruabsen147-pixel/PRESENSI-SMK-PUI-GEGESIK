import React, { useState } from 'react';
import { X, Smartphone, Apple, Download, QrCode, CheckCircle2, Shield, Camera, MapPin, Share2 } from 'lucide-react';

interface MobileInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallGuideModal: React.FC<MobileInstallGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'qrcode'>('android');

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Panduan Aplikasi Mobile (Android &amp; iPhone)</h3>
              <p className="text-xs text-emerald-200/90">
                Akses cepat presensi guru seperti aplikasi native di HP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-2 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Android (APK / Chrome)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            <span>iPhone / iOS (Safari)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qrcode')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'qrcode'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-500" />
            <span>Scan QR Akses</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 text-xs space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  📲 Cara Memasang di HP Android (Google Chrome):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                  <li>Buka tautan aplikasi ini di browser <strong>Google Chrome</strong> di HP Anda.</li>
                  <li>Ketuk tombol titik tiga <strong>(⋮)</strong> di sudut kanan atas browser.</li>
                  <li>Pilih menu <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong>&quot;Instal Aplikasi&quot;</strong>.</li>
                  <li>Ikon <strong>Presensi Guru Pintar</strong> akan langsung muncul di menu aplikasi HP Anda.</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Izin Akses Kamera &amp; Lokasi GPS di Android:</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Saat membuka aplikasi pertama kali, klik <strong>&quot;Izinkan saat aplikasi digunakan&quot;</strong> untuk Kamera dan Lokasi GPS agar verifikasi selfie &amp; geofence berjalan akurat.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/60 text-slate-800 dark:text-slate-200">
                <p className="font-bold text-blue-800 dark:text-blue-300 mb-1">
                  🍎 Cara Memasang di iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                  <li>Buka tautan aplikasi ini di browser resmi <strong>Safari</strong> di iPhone Anda.</li>
                  <li>Ketuk tombol <strong>Bagikan / Share (<Share2 className="w-3.5 h-3.5 inline" />)</strong> di bagian bawah layar.</li>
                  <li>Gulir ke bawah dan pilih <strong>&quot;Tambahkan ke Layar Utama&quot; (Add to Home Screen)</strong>.</li>
                  <li>Ketuk <strong>&quot;Tambah&quot;</strong> di sudut kanan atas. Aplikasi siap dibuka langsung dari Home Screen!</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Pengaturan Privasi iOS:</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Pastikan Pengaturan &gt; Privasi &gt; Layanan Lokasi di iPhone dalam keadaan aktif agar presensi geofence radius sekolah dapat memverifikasi kehadiran.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'qrcode' && (
            <div className="text-center space-y-3 py-2">
              <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center">
                {/* Visual QR Code Generator */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`}
                  alt="QR Code Presensi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Scan dengan Kamera HP Guru</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Arahkan kamera HP Anda ke QR code ini untuk langsung membuka aplikasi presensi di smartphone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Aplikasi mendukung mode offline queue &amp; auto-sync
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
