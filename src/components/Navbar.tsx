import React from 'react';
import { 
  Building2, 
  Smartphone, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Code, 
  Users, 
  HelpCircle, 
  Moon, 
  Sun, 
  LogIn, 
  ShieldCheck, 
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { User, School } from '../types';

interface NavbarProps {
  currentTab: 'guru' | 'admin' | 'gsheet';
  onChangeTab: (tab: 'guru' | 'admin' | 'gsheet') => void;
  adminSubTab: 'dashboard' | 'schools' | 'teachers' | 'rekap';
  onChangeAdminSubTab: (subTab: 'dashboard' | 'schools' | 'teachers' | 'rekap') => void;
  currentUser: User;
  currentSchool: School;
  onOpenLogin: () => void;
  onOpenAppsScript: () => void;
  onOpenMobileGuide: () => void;
  isMobileDeviceView: boolean;
  onToggleDeviceView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onChangeTab,
  adminSubTab,
  onChangeAdminSubTab,
  currentUser,
  currentSchool,
  onOpenLogin,
  onOpenAppsScript,
  onOpenMobileGuide,
  isMobileDeviceView,
  onToggleDeviceView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & School */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-emerald-950/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                  Presensi Guru Pintar
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  GPS &amp; SHEETS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {currentSchool.name}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <button
              id="nav-tab-guru"
              type="button"
              onClick={() => onChangeTab('guru')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentTab === 'guru'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Presensi Guru (HP)</span>
            </button>

            <button
              id="nav-tab-admin"
              type="button"
              onClick={() => onChangeTab('admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Control Panel Admin</span>
            </button>

            <button
              id="nav-tab-gsheet"
              type="button"
              onClick={() => onChangeTab('gsheet')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentTab === 'gsheet'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sheets Hub</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Apps Script Code Button */}
            <button
              id="btn-nav-apps-script"
              type="button"
              onClick={onOpenAppsScript}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              title="Buka Kode Google Apps Script"
            >
              <Code className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Code.gs</span>
            </button>

            {/* Mobile Install Guide */}
            <button
              id="btn-nav-mobile-guide"
              type="button"
              onClick={onOpenMobileGuide}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Panduan Pasang di Android & iOS"
            >
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">APK &amp; iOS</span>
            </button>

            {/* Device Viewport Toggle (Phone Mockup vs Full Desktop) */}
            {currentTab === 'guru' && (
              <button
                type="button"
                onClick={onToggleDeviceView}
                className={`p-2 rounded-xl border transition text-xs font-semibold hidden sm:flex items-center gap-1 ${
                  isMobileDeviceView
                    ? 'bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-950 dark:border-teal-800 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
                title="Beralih antara Mode Frame Smartphone dan Full View"
              >
                {isMobileDeviceView ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                <span className="text-[11px]">{isMobileDeviceView ? 'Frame HP' : 'Layar Penuh'}</span>
              </button>
            )}

            {/* User Profile / Switch Role Button */}
            <button
              id="btn-user-switch"
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title="Ganti Akun / Login"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[90px]">
                  {currentUser.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase leading-tight">
                  {currentUser.role}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row (Below header on small screens) */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => onChangeTab('guru')}
            className={`flex-1 py-1.5 text-center rounded-lg ${currentTab === 'guru' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Presensi Guru
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('admin')}
            className={`flex-1 py-1.5 text-center rounded-lg ${currentTab === 'admin' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Admin Panel
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('gsheet')}
            className={`flex-1 py-1.5 text-center rounded-lg ${currentTab === 'gsheet' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Google Sheets
          </button>
        </div>

        {/* Admin Subtabs (when in admin view) */}
        {currentTab === 'admin' && (
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onChangeAdminSubTab('dashboard')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                adminSubTab === 'dashboard'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              📊 Live Monitor Harian
            </button>
            <button
              type="button"
              onClick={() => onChangeAdminSubTab('rekap')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                adminSubTab === 'rekap'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              📑 Rekap Bulanan &amp; Cetak
            </button>
            <button
              type="button"
              onClick={() => onChangeAdminSubTab('teachers')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                adminSubTab === 'teachers'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              👥 Master Data Guru ({currentSchool.name.split(' ')[0]})
            </button>
            <button
              type="button"
              onClick={() => onChangeAdminSubTab('schools')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                adminSubTab === 'schools'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              ⚙️ Pengaturan GPS &amp; Radius
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
