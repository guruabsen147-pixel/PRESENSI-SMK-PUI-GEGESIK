export type UserRole = 'guru' | 'kepsek' | 'admin' | 'staff';

export interface User {
  id: string;
  nip: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  schoolId: string;
  phone?: string;
  subject?: string; // e.g. "Matematika", "Bahasa Indonesia"
  pin?: string;
}

export interface School {
  id: string;
  name: string;
  npsn: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // e.g. 100 meters
  workStart: string; // "07:00"
  lateTolerance: number; // 15 minutes -> up to 07:15 considered on-time or with grace
  workEnd: string; // "15:00"
}

export type AttendanceType = 'masuk' | 'pulang' | 'izin' | 'sakit' | 'dinas_luar';
export type AttendanceStatus = 'tepat_waktu' | 'terlambat' | 'izin' | 'sakit' | 'dinas_luar' | 'di_luar_radius';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';
export type SyncStatus = 'synced' | 'pending' | 'failed';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  nip: string;
  schoolId: string;
  schoolName: string;
  date: string; // YYYY-MM-DD
  type: AttendanceType;
  timestamp: string; // ISO string or readable time "06:52:10"
  timeOnly: string; // "06:52:10"
  photoUrl: string; // base64 selfie data URL
  latitude: number;
  longitude: number;
  distanceMeters: number;
  isWithinRadius: boolean;
  status: AttendanceStatus;
  notes?: string;
  documentUrl?: string; // for doctor note/letter
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  syncStatus: SyncStatus;
  syncedAt?: string;
  addressName?: string;
  deviceInfo?: string;
}

export interface GoogleSheetConfig {
  webAppUrl: string;
  spreadsheetId: string;
  sheetName: string;
  autoSync: boolean;
  lastSync?: string;
  syncLogs: Array<{
    id: string;
    time: string;
    status: 'success' | 'error';
    recordCount: number;
    message: string;
  }>;
}

export interface GeolocationPositionState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}
