import React, { useState, useEffect } from 'react';
import { 
  User, 
  School, 
  AttendanceRecord, 
  GoogleSheetConfig 
} from './types';
import { storageService, INITIAL_USERS, INITIAL_SCHOOLS, INITIAL_RECORDS } from './services/storageService';
import { Navbar } from './components/Navbar';
import { GuruPresensiView } from './components/GuruPresensiView';
import { GuruHistoryView } from './components/GuruHistoryView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminSchoolSettings } from './components/AdminSchoolSettings';
import { AdminTeachersMaster } from './components/AdminTeachersMaster';
import { AdminRekapLaporan } from './components/AdminRekapLaporan';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';
import { AppsScriptModal } from './components/AppsScriptModal';
import { MobileInstallGuideModal } from './components/MobileInstallGuideModal';
import { DetailSelfieModal } from './components/DetailSelfieModal';
import { LoginModal } from './components/LoginModal';
import { Smartphone, CheckCircle2, CloudCheck, Sparkles, Building } from 'lucide-react';

export default function App() {
  // Main Data States
  const [schools, setSchools] = useState<School[]>(() => storageService.getSchools());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [records, setRecords] = useState<AttendanceRecord[]>(() => storageService.getRecords());
  const [gsheetConfig, setGSheetConfig] = useState<GoogleSheetConfig>(() => storageService.getGSheetConfig());

  // Selected School (derived from current user or first school)
  const [selectedSchool, setSelectedSchool] = useState<School>(() => {
    const userSchool = schools.find(s => s.id === currentUser.schoolId);
    return userSchool || schools[0] || INITIAL_SCHOOLS[0];
  });

  // Navigation States
  const [currentTab, setCurrentTab] = useState<'guru' | 'admin' | 'gsheet'>('guru');
  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'schools' | 'teachers' | 'rekap'>('dashboard');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState<boolean>(false);
  const [isMobileGuideModalOpen, setIsMobileGuideModalOpen] = useState<boolean>(false);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<AttendanceRecord | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync selected school when user changes
  useEffect(() => {
    const userSchool = schools.find(s => s.id === currentUser.schoolId);
    if (userSchool) {
      setSelectedSchool(userSchool);
    }
  }, [currentUser, schools]);

  // Handler for saving new attendance
  const handleAttendanceCreated = (newRecord: AttendanceRecord) => {
    storageService.addRecord(newRecord);
    setRecords(storageService.getRecords());
    showToast(`✓ Presensi ${newRecord.type.toUpperCase()} ${currentUser.name} berhasil disimpan!`);
  };

  // Handler for approving/rejecting attendance from admin
  const handleApproveRecord = (recordId: string, status: 'approved' | 'rejected') => {
    const target = records.find(r => r.id === recordId);
    if (target) {
      const updated: AttendanceRecord = {
        ...target,
        approvalStatus: status,
        approvedBy: currentUser.name
      };
      storageService.updateRecord(updated);
      setRecords(storageService.getRecords());
      showToast(status === 'approved' ? '✓ Presensi disetujui' : 'Presensi ditolak');
    }
  };

  // Handler for school updates
  const handleSaveSchools = (updatedSchools: School[]) => {
    storageService.saveSchools(updatedSchools);
    setSchools(updatedSchools);
    const updatedSelected = updatedSchools.find(s => s.id === selectedSchool.id) || updatedSchools[0];
    setSelectedSchool(updatedSelected);
    showToast('✓ Pengaturan sekolah berhasil diperbarui!');
  };

  // Handler for users updates
  const handleSaveUsers = (updatedUsers: User[]) => {
    storageService.saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showToast('✓ Data guru berhasil diperbarui!');
  };

  // Handler for GSheet Config save
  const handleSaveGSheetConfig = (newConfig: GoogleSheetConfig) => {
    storageService.saveGSheetConfig(newConfig);
    setGSheetConfig(newConfig);
    showToast('✓ Konfigurasi Google Sheets berhasil disimpan!');
  };

  // Switch User
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
    const userSchool = schools.find(s => s.id === user.schoolId);
    if (userSchool) setSelectedSchool(userSchool);
    if (user.role === 'admin' || user.role === 'kepsek') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('guru');
    }
    showToast(`Beralih ke akun: ${user.name} (${user.role.toUpperCase()})`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onChangeTab={tab => {
          setCurrentTab(tab);
          setIsHistoryOpen(false);
        }}
        adminSubTab={adminSubTab}
        onChangeAdminSubTab={setAdminSubTab}
        currentUser={currentUser}
        currentSchool={selectedSchool}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAppsScript={() => setIsAppsScriptModalOpen(true)}
        onOpenMobileGuide={() => setIsMobileGuideModalOpen(true)}
        isMobileDeviceView={isMobileDeviceView}
        onToggleDeviceView={() => setIsMobileDeviceView(prev => !prev)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* VIEW 1: Guru Presensi View (with optional Smartphone Device Mockup frame) */}
        {currentTab === 'guru' && (
          <div>
            {isMobileDeviceView ? (
              /* Smartphone Mockup Frame */
              <div className="flex flex-col items-center py-4">
                <div className="text-center mb-3">
                  <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs inline-flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mode Simulasi Smartphone (Android &amp; iOS PWA)</span>
                  </span>
                </div>

                {/* Smartphone Chassis */}
                <div className="w-full max-w-[400px] bg-slate-950 p-3 rounded-[44px] shadow-2xl border-4 border-slate-800 relative ring-1 ring-white/10">
                  {/* Dynamic Island / Camera Notch */}
                  <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800" />
                  </div>

                  {/* Inner Screen */}
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-[32px] overflow-hidden p-3 min-h-[620px] max-h-[750px] overflow-y-auto">
                    {isHistoryOpen ? (
                      <GuruHistoryView
                        user={currentUser}
                        school={selectedSchool}
                        records={records}
                        onBack={() => setIsHistoryOpen(false)}
                        onViewSelfie={record => setSelectedDetailRecord(record)}
                      />
                    ) : (
                      <GuruPresensiView
                        user={currentUser}
                        school={selectedSchool}
                        records={records}
                        onAttendanceCreated={handleAttendanceCreated}
                        onOpenHistory={() => setIsHistoryOpen(true)}
                        onOpenGoogleSheets={() => setCurrentTab('gsheet')}
                      />
                    )}
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
                </div>
              </div>
            ) : (
              /* Full Responsive View */
              <div>
                {isHistoryOpen ? (
                  <GuruHistoryView
                    user={currentUser}
                    school={selectedSchool}
                    records={records}
                    onBack={() => setIsHistoryOpen(false)}
                    onViewSelfie={record => setSelectedDetailRecord(record)}
                  />
                ) : (
                  <GuruPresensiView
                    user={currentUser}
                    school={selectedSchool}
                    records={records}
                    onAttendanceCreated={handleAttendanceCreated}
                    onOpenHistory={() => setIsHistoryOpen(true)}
                    onOpenGoogleSheets={() => setCurrentTab('gsheet')}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Control Panel Admin & Sub-views */}
        {currentTab === 'admin' && (
          <div className="space-y-6">
            {adminSubTab === 'dashboard' && (
              <AdminDashboard
                schools={schools}
                selectedSchool={selectedSchool}
                onSelectSchool={setSelectedSchool}
                users={users}
                records={records}
                onApproveRecord={handleApproveRecord}
                onViewSelfie={record => setSelectedDetailRecord(record)}
                onOpenGSheets={() => setCurrentTab('gsheet')}
              />
            )}

            {adminSubTab === 'rekap' && (
              <AdminRekapLaporan
                schools={schools}
                selectedSchool={selectedSchool}
                users={users}
                records={records}
              />
            )}

            {adminSubTab === 'teachers' && (
              <AdminTeachersMaster
                users={users}
                schools={schools}
                onSaveUsers={handleSaveUsers}
              />
            )}

            {adminSubTab === 'schools' && (
              <AdminSchoolSettings
                schools={schools}
                onSaveSchools={handleSaveSchools}
              />
            )}
          </div>
        )}

        {/* VIEW 3: Google Sheets & Apps Script Integration Hub */}
        {currentTab === 'gsheet' && (
          <GoogleSheetsIntegration
            config={gsheetConfig}
            onSaveConfig={handleSaveGSheetConfig}
            pendingRecords={records}
            onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <AppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
      />

      <MobileInstallGuideModal
        isOpen={isMobileGuideModalOpen}
        onClose={() => setIsMobileGuideModalOpen(false)}
      />

      <DetailSelfieModal
        record={selectedDetailRecord}
        onClose={() => setSelectedDetailRecord(null)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        schools={schools}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}
