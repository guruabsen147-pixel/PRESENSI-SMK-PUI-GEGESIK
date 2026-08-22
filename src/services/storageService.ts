import { User, School, AttendanceRecord, GoogleSheetConfig } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'presensi_current_user_v1',
  USERS: 'presensi_users_v1',
  SCHOOLS: 'presensi_schools_v1',
  RECORDS: 'presensi_records_v1',
  GSHEET_CONFIG: 'presensi_gsheet_config_v1',
};

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-sma1',
    name: 'SMA Negeri 1 Maju Pintar',
    npsn: '20108921',
    address: 'Jl. Pendidikan No. 45, Kebayoran, Jakarta Selatan',
    latitude: -6.229728,
    longitude: 106.829518,
    radiusMeters: 100, // 100 meter radius
    workStart: '07:00',
    lateTolerance: 15, // up to 07:15
    workEnd: '15:30',
  },
  {
    id: 'sch-smp2',
    name: 'SMP Negeri 2 Prestasi Gemilang',
    npsn: '20107754',
    address: 'Jl. Merdeka Barat No. 12, Gambir, Jakarta Pusat',
    latitude: -6.175392,
    longitude: 106.827153,
    radiusMeters: 120,
    workStart: '07:15',
    lateTolerance: 15,
    workEnd: '15:00',
  },
  {
    id: 'sch-sd3',
    name: 'SD Negeri Cerdas Mandiri 03',
    npsn: '20105512',
    address: 'Jl. Melati Indah No. 8, Cilandak, Jakarta Selatan',
    latitude: -6.291244,
    longitude: 106.804153,
    radiusMeters: 80,
    workStart: '06:45',
    lateTolerance: 15,
    workEnd: '13:30',
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    nip: '198503152010011012',
    name: 'Budi Santoso, S.Pd, M.Kom',
    email: 'budi.santoso@guru.smp.belajar.id',
    role: 'guru',
    schoolId: 'sch-sma1',
    subject: 'Informatika & Matematika',
    phone: '081234567890',
    pin: '1234'
  },
  {
    id: 'usr-2',
    nip: '199008222014022005',
    name: 'Siti Nurhaliza, M.Pd',
    email: 'siti.nurhaliza@guru.sma.belajar.id',
    role: 'guru',
    schoolId: 'sch-sma1',
    subject: 'Bahasa Indonesia',
    phone: '081398765432',
    pin: '1234'
  },
  {
    id: 'usr-3',
    nip: '198206142008011009',
    name: 'Ahmad Fauzi, S.Si',
    email: 'ahmad.fauzi@guru.sma.belajar.id',
    role: 'guru',
    schoolId: 'sch-sma1',
    subject: 'Fisika & IPA',
    phone: '085712345678',
    pin: '1234'
  },
  {
    id: 'usr-4',
    nip: '197601052002121001',
    name: 'Drs. Hendra Gunawan, M.M',
    email: 'hendra.gunawan@admin.sekolah.id',
    role: 'admin',
    schoolId: 'sch-sma1',
    subject: 'Wakil Kepala Sekolah Bid. Kurikulum',
    phone: '081122334455',
    pin: '1234'
  },
  {
    id: 'usr-5',
    nip: '197405121998021003',
    name: 'Dr. H. Bambang Sutrisno, M.Pd',
    email: 'kepsek@sman1.sch.id',
    role: 'kepsek',
    schoolId: 'sch-sma1',
    subject: 'Kepala Sekolah',
    phone: '081288990011',
    pin: '1234'
  }
];

export const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'rec-001',
    userId: 'usr-1',
    userName: 'Budi Santoso, S.Pd, M.Kom',
    nip: '198503152010011012',
    schoolId: 'sch-sma1',
    schoolName: 'SMA Negeri 1 Maju Pintar',
    date: new Date().toISOString().split('T')[0],
    type: 'masuk',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeOnly: '06:48:22',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    latitude: -6.229715,
    longitude: 106.829505,
    distanceMeters: 18,
    isWithinRadius: true,
    status: 'tepat_waktu',
    notes: 'Presensi kehadiran pagi tepat waktu di gerbang sekolah',
    approvalStatus: 'approved',
    syncStatus: 'synced',
    syncedAt: new Date().toISOString(),
    addressName: 'Gedung Utama SMA Negeri 1'
  },
  {
    id: 'rec-002',
    userId: 'usr-2',
    userName: 'Siti Nurhaliza, M.Pd',
    nip: '199008222014022005',
    schoolId: 'sch-sma1',
    schoolName: 'SMA Negeri 1 Maju Pintar',
    date: new Date().toISOString().split('T')[0],
    type: 'masuk',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    timeOnly: '07:18:04',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    latitude: -6.229740,
    longitude: 106.829530,
    distanceMeters: 25,
    isWithinRadius: true,
    status: 'terlambat',
    notes: 'Kendala kemacetan arus lalu lintas perempatan',
    approvalStatus: 'approved',
    syncStatus: 'synced',
    syncedAt: new Date().toISOString(),
    addressName: 'Area Parkir Guru SMA Negeri 1'
  },
  {
    id: 'rec-003',
    userId: 'usr-3',
    userName: 'Ahmad Fauzi, S.Si',
    nip: '198206142008011009',
    schoolId: 'sch-sma1',
    schoolName: 'SMA Negeri 1 Maju Pintar',
    date: new Date().toISOString().split('T')[0],
    type: 'izin',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    timeOnly: '06:30:00',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    latitude: -6.235000,
    longitude: 106.832000,
    distanceMeters: 620,
    isWithinRadius: false,
    status: 'dinas_luar',
    notes: 'Mengikuti Workshop Kurikulum Merdeka MGMP Fisika di Dinas Pendidikan',
    approvalStatus: 'pending',
    syncStatus: 'synced',
    syncedAt: new Date().toISOString(),
    addressName: 'Kantor Balai Guru Penggerak'
  }
];

export const INITIAL_GSHEET_CONFIG: GoogleSheetConfig = {
  webAppUrl: '',
  spreadsheetId: '1AbCdEfGhIjKlMnOpQrStUvWxYz_PresensiGuru2026',
  sheetName: 'PRESENSI_HARIAN',
  autoSync: true,
  syncLogs: [
    {
      id: 'log-1',
      time: new Date().toLocaleTimeString('id-ID'),
      status: 'success',
      recordCount: 3,
      message: 'Inisialisasi sistem sinkronisasi Google Sheets'
    }
  ]
};

// Storage Service Class
export const storageService = {
  getSchools(): School[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
      return INITIAL_SCHOOLS;
    } catch {
      return INITIAL_SCHOOLS;
    }
  },

  saveSchools(schools: School[]): void {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  },

  getSchoolById(id: string): School | undefined {
    const schools = this.getSchools();
    return schools.find(s => s.id === id) || schools[0];
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser(): User {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
      const defaultUser = INITIAL_USERS[0];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getRecords(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  },

  saveRecords(records: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  addRecord(record: AttendanceRecord): void {
    const records = this.getRecords();
    records.unshift(record);
    this.saveRecords(records);

    // Trigger auto-sync if configured
    const config = this.getGSheetConfig();
    if (config.autoSync && config.webAppUrl) {
      this.syncRecordToGoogleSheet(record, config.webAppUrl);
    }
  },

  updateRecord(record: AttendanceRecord): void {
    const records = this.getRecords();
    const index = records.findIndex(r => r.id === record.id);
    if (index !== -1) {
      records[index] = record;
      this.saveRecords(records);
    }
  },

  getGSheetConfig(): GoogleSheetConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GSHEET_CONFIG);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.GSHEET_CONFIG, JSON.stringify(INITIAL_GSHEET_CONFIG));
      return INITIAL_GSHEET_CONFIG;
    } catch {
      return INITIAL_GSHEET_CONFIG;
    }
  },

  saveGSheetConfig(config: GoogleSheetConfig): void {
    localStorage.setItem(STORAGE_KEYS.GSHEET_CONFIG, JSON.stringify(config));
  },

  // Sync a single record to Google Apps Script Web App
  async syncRecordToGoogleSheet(record: AttendanceRecord, webAppUrl: string): Promise<{ success: boolean; message: string }> {
    if (!webAppUrl) {
      return { success: false, message: 'URL Web App Google Sheets belum dikonfigurasi' };
    }

    try {
      // Send as POST JSON payload to Apps Script endpoint
      // Note: Apps Script Web Apps require no-cors or redirect handling
      await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'absen',
          data: {
            ...record,
            // To prevent massive payloads over Apps Script quotas, pass thumbnail / preview length if huge
            photoUrl: record.photoUrl ? record.photoUrl.substring(0, 150) + '...[Foto Terlampir]' : ''
          }
        }),
        mode: 'no-cors' // Google Apps Script web app endpoint typically needs no-cors from browser
      });

      // Update record sync status
      record.syncStatus = 'synced';
      record.syncedAt = new Date().toISOString();
      this.updateRecord(record);

      const config = this.getGSheetConfig();
      config.lastSync = new Date().toLocaleTimeString('id-ID');
      config.syncLogs.unshift({
        id: 'log-' + Date.now(),
        time: new Date().toLocaleTimeString('id-ID'),
        status: 'success',
        recordCount: 1,
        message: `Presensi ${record.userName} (${record.type.toUpperCase()}) terkirim ke Google Sheets`
      });
      if (config.syncLogs.length > 20) config.syncLogs.pop();
      this.saveGSheetConfig(config);

      return { success: true, message: 'Presensi berhasil disinkronkan ke Google Spreadsheet!' };
    } catch (err: any) {
      const config = this.getGSheetConfig();
      config.syncLogs.unshift({
        id: 'log-' + Date.now(),
        time: new Date().toLocaleTimeString('id-ID'),
        status: 'error',
        recordCount: 1,
        message: `Gagal kirim ke Google Sheets: ${err.message || 'Cek URL Web App'}`
      });
      this.saveGSheetConfig(config);
      return { success: false, message: err.message || 'Gagal tersambung' };
    }
  },

  // Sync batch of pending records
  async syncBatchToGoogleSheet(records: AttendanceRecord[], webAppUrl: string): Promise<{ success: boolean; message: string }> {
    if (!webAppUrl) {
      return { success: false, message: 'URL Web App Google Sheets belum diisi' };
    }

    try {
      await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sync_batch',
          records: records.map(r => ({
            ...r,
            photoUrl: r.photoUrl ? r.photoUrl.substring(0, 150) + '...[Foto Terlampir]' : ''
          }))
        }),
        mode: 'no-cors'
      });

      // Mark all synced
      const allRecords = this.getRecords();
      const updated = allRecords.map(r => {
        if (records.some(synced => synced.id === r.id)) {
          return { ...r, syncStatus: 'synced' as const, syncedAt: new Date().toISOString() };
        }
        return r;
      });
      this.saveRecords(updated);

      const config = this.getGSheetConfig();
      config.lastSync = new Date().toLocaleTimeString('id-ID');
      config.syncLogs.unshift({
        id: 'log-' + Date.now(),
        time: new Date().toLocaleTimeString('id-ID'),
        status: 'success',
        recordCount: records.length,
        message: `Sinkronisasi batch ${records.length} presensi selesai`
      });
      this.saveGSheetConfig(config);

      return { success: true, message: `Berhasil sinkronisasi ${records.length} data ke Google Spreadsheet!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal sinkronisasi batch' };
    }
  },

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.GSHEET_CONFIG, JSON.stringify(INITIAL_GSHEET_CONFIG));
  }
};
