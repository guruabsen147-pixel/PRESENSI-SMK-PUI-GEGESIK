import React, { useState } from 'react';
import { X, Lock, User, Key, LogIn, Sparkles, Building, ShieldCheck, Check } from 'lucide-react';
import { User as UserType, School } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  schools: School[];
  currentUser: UserType;
  onSelectUser: (user: UserType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  schools,
  currentUser,
  onSelectUser
}) => {
  const [nipInput, setNipInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(
      u => (u.nip === nipInput.trim() || u.email === nipInput.trim())
    );

    if (found) {
      onSelectUser(found);
      onClose();
    } else {
      setErrorMessage('NIP atau Email tidak terdaftar dalam sistem.');
    }
  };

  const handleQuickSwitch = (user: UserType) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Autentikasi &amp; Ganti Akun Presensi</h3>
              <p className="text-xs text-emerald-200/90">
                Masuk sebagai Guru, Staf, atau Administrator Sekolah
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

        <div className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Quick Demo Switcher (Instant test presets) */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilih Akun Cepat (Mode Uji Coba):</span>
            </label>

            <div className="space-y-2">
              {users.map(user => {
                const school = schools.find(s => s.id === user.schoolId);
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickSwitch(user)}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        user.role === 'admin' || user.role === 'kepsek'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{user.name}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md uppercase ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                            user.role === 'kepsek' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          NIP. {user.nip} • {user.subject || school?.name}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200 dark:border-slate-800" />
            <span className="shrink mx-3 text-slate-400 text-[11px] uppercase font-semibold">
              atau Masuk dengan NIP &amp; PIN
            </span>
            <div className="grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {/* Form Login */}
          <form onSubmit={handleManualLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP / NUPTK / Email
              </label>
              <input
                type="text"
                value={nipInput}
                onChange={e => setNipInput(e.target.value)}
                placeholder="Masukkan 18 digit NIP atau Email..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PIN Akses (Default: 1234)
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Aplikasi Presensi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
