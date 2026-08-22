import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, FileSpreadsheet, Play } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/googleAppsScriptTemplate';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <Code className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Script Google Apps Script (Code.gs)</h3>
              <p className="text-xs text-emerald-200/90">
                Otomatisasi Database Presensi Real-Time di Google Spreadsheet
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

        {/* Steps Guide & Code Box */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Guide Card */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl space-y-2">
            <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Panduan Pasang dalam 3 Langkah Mudah:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300">
              <li>
                Buka Spreadsheet Anda di{' '}
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 dark:text-emerald-400 underline inline-flex items-center gap-0.5"
                >
                  sheets.new <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Buka menu <strong className="text-slate-900 dark:text-white">Ekstensi &gt; Apps Script</strong>, hapus kode lama, lalu <strong className="text-emerald-700 dark:text-emerald-400">Tempelkan (Paste)</strong> kode di bawah ini.
              </li>
              <li>
                Klik <strong className="text-slate-900 dark:text-white">Terapkan (Deploy) &gt; Penerapan Baru</strong>, pilih <strong className="text-slate-900 dark:text-white">Aplikasi Web</strong> (Akses: <em>Siapa saja</em>), lalu salin Web App URL ke aplikasi ini!
              </li>
            </ol>
          </div>

          {/* Copy Button & Code Container */}
          <div className="relative">
            <div className="flex items-center justify-between pb-2">
              <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">
                File: Code.gs (Siap Salin &amp; Pakai)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '✓ Berhasil Disalin ke Clipboard!' : 'Salin Seluruh Kode (Copy)'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-96 border border-slate-800">
              <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Script ini mendukung multi-sekolah, geofence status, link selfie base64, dan approval.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
