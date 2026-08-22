import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Cloud, 
  CloudCheck, 
  CloudAlert, 
  RefreshCw, 
  Code, 
  Check, 
  ExternalLink, 
  Save, 
  Send,
  Table,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GoogleSheetConfig, AttendanceRecord } from '../types';
import { storageService } from '../services/storageService';

interface GoogleSheetsIntegrationProps {
  config: GoogleSheetConfig;
  onSaveConfig: (config: GoogleSheetConfig) => void;
  pendingRecords: AttendanceRecord[];
  onOpenAppsScriptModal: () => void;
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  config,
  onSaveConfig,
  pendingRecords,
  onOpenAppsScriptModal
}) => {
  const [webAppUrl, setWebAppUrl] = useState<string>(config.webAppUrl);
  const [autoSync, setAutoSync] = useState<boolean>(config.autoSync);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncingBatch, setIsSyncingBatch] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...config,
      webAppUrl: webAppUrl.trim(),
      autoSync: autoSync
    };
    onSaveConfig(updated);
    setTestResult({
      success: true,
      message: 'Konfigurasi Google Sheets berhasil disimpan!'
    });
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test Ping to Webhook
      await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'absen',
          data: {
            id: 'test-' + Date.now(),
            userName: 'Tes Koneksi Sistem',
            nip: '1985000000000000',
            schoolName: 'Uji Coba API Presensi',
            type: 'masuk',
            status: 'tepat_waktu',
            timeOnly: new Date().toLocaleTimeString('id-ID'),
            date: new Date().toISOString().split('T')[0],
            distanceMeters: 10,
            isWithinRadius: true,
            latitude: -6.2297,
            longitude: 106.8295,
            notes: 'Tes kirim data presensi dari Webhook Hub'
          }
        }),
        mode: 'no-cors'
      });

      setIsTesting(false);
      setTestResult({
        success: true,
        message: '✓ Payload Webhook berhasil dikirim ke Google Apps Script Spreadsheet!'
      });
    } catch (err: any) {
      setIsTesting(false);
      setTestResult({
        success: false,
        message: 'Gagal menghubungkan: ' + (err.message || 'Cek URL Web App')
      });
    }
  };

  const handleSyncAllPending = async () => {
    if (!webAppUrl.trim()) {
      alert('Masukkan URL Web App terlebih dahulu');
      return;
    }
    setIsSyncingBatch(true);
    const result = await storageService.syncBatchToGoogleSheet(pendingRecords, webAppUrl.trim());
    setIsSyncingBatch(false);
    setBatchResult(result.message);
    setTimeout(() => setBatchResult(null), 5000);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Workspace Integration Hub</span>
            </div>
            <h2 className="text-xl font-black text-white">Integrasi Google Sheets &amp; Apps Script</h2>
            <p className="text-xs text-slate-200/80 max-w-lg">
              Hubungkan presensi selfie &amp; GPS langsung ke Google Spreadsheet sekolah Anda tanpa database pihak ketiga berbayar.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAppsScriptModal}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition shrink-0"
          >
            <Code className="w-4 h-4 text-emerald-700" />
            <span>Lihat Script Code.gs</span>
          </button>
        </div>
      </div>

      {/* Connection Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>Konfigurasi Webhook URL Google Sheets</span>
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            config.webAppUrl
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${config.webAppUrl ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {config.webAppUrl ? 'Terhubung (Active)' : 'Belum Terhubung'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            URL Aplikasi Web Google Apps Script (Web App URL)
          </label>
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
            value={webAppUrl}
            onChange={e => setWebAppUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Dapatkan URL ini setelah menerapkan (Deploy as Web App) di menu Ekstensi &gt; Apps Script spreadsheet Anda.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Auto-Sync Real-Time</p>
            <p className="text-[11px] text-slate-500">
              Kirim data kehadiran ke Google Sheets secara otomatis saat guru menekan tombol presensi
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={e => setAutoSync(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>

        {testResult && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            testResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Menguji...' : 'Uji Kirim Data Tes'}</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan URL Web App</span>
          </button>
        </div>
      </form>

      {/* Batch Sync Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Antrean Sinkronisasi Massal (Batch Sync)
            </h4>
            <p className="text-xs text-slate-500">
              Total catatan presensi yang tersimpan lokal: <strong className="text-slate-800 dark:text-slate-200">{pendingRecords.length} data</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSyncAllPending}
            disabled={isSyncingBatch || pendingRecords.length === 0}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBatch ? 'animate-spin' : ''}`} />
            <span>{isSyncingBatch ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>

        {batchResult && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{batchResult}</span>
          </div>
        )}
      </div>

      {/* Transaction Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Log Riwayat Pengiriman ke Google Sheets
        </h4>

        <div className="space-y-2">
          {config.syncLogs.slice(0, 5).map(log => (
            <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{log.message}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
