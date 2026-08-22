import React, { useState } from 'react';
import { X, FileText, Upload, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { User, School, AttendanceType } from '../types';

interface IzinModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  school: School;
  currentLat: number | null;
  currentLng: number | null;
  onSubmit: (data: {
    type: AttendanceType;
    notes: string;
    documentUrl?: string;
  }) => void;
}

export const IzinModal: React.FC<IzinModalProps> = ({
  isOpen,
  onClose,
  user,
  school,
  onSubmit
}) => {
  const [type, setType] = useState<AttendanceType>('izin');
  const [notes, setNotes] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setDocumentUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Mohon tuliskan alasan atau keterangan lengkap pengajuan.');
      return;
    }
    setError(null);
    onSubmit({
      type,
      notes: notes.trim(),
      documentUrl
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold text-base">Pengajuan Izin / Sakit / Dinas Luar</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* User Info pill */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
              <p className="text-slate-500 dark:text-slate-400">NIP: {user.nip}</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium rounded-md">
              {school.name.split(' ')[0]}
            </span>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Jenis Keterangan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('izin')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  type === 'izin'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950 dark:border-blue-500 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                📋 Izin Keperluan
              </button>
              <button
                type="button"
                onClick={() => setType('sakit')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  type === 'sakit'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950 dark:border-rose-500 dark:text-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                🏥 Sakit
              </button>
              <button
                type="button"
                onClick={() => setType('dinas_luar')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  type === 'dinas_luar'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950 dark:border-amber-500 dark:text-amber-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                🚗 Dinas Luar
              </button>
            </div>
          </div>

          {/* Notes TextArea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Alasan & Keterangan Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={
                type === 'sakit'
                  ? 'Contoh: Sakit demam dan batuk, istirahat dokter 1 hari...'
                  : type === 'dinas_luar'
                  ? 'Contoh: Menghadiri Rapat Koordinasi Kurikulum Merdeka di Kantor Dinas Pendidikan...'
                  : 'Contoh: Ada keperluan keluarga mendesak di luar kota...'
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Document / Doctor note upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Lampiran Bukti / Surat Dokter / Surat Tugas (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition">
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
                  {documentUrl ? '✓ File Bukti Terpilih' : 'Klik Unggah Foto Surat / Dokumen'}
                </span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
              </label>
              {documentUrl && (
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-300 relative shrink-0">
                  <img src={documentUrl} alt="Bukti" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kirim Pengajuan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
