/**
 * Google Apps Script Code.gs Template
 * Salin dan tempelkan script ini ke Google Spreadsheet Anda:
 * Menu: Ekstensi > Apps Script > Tempel Kode > Terapkan / Deploy sebagai Web App
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SISTEM ABSENSI GURU GPS & SELFIE REAL-TIME
 * Versi: 2.5 (Support Multi-Sekolah, Verifikasi Selfie, Geofencing & Rekap)
 * =========================================================================
 * 
 * PANDUAN PEMASANGAN CEPAT:
 * 1. Buka Google Spreadsheet baru (https://sheets.new)
 * 2. Klik menu "Ekstensi" > "Apps Script"
 * 3. Hapus semua kode default dan tempelkan seluruh kode ini
 * 4. Klik menu dropdown fungsi, pilih "inisialisasiSheet" lalu klik "Jalankan" (Run)
 *    (Beri izin akses saat diminta)
 * 5. Klik tombol biru "Terapkan" (Deploy) > "Penerapan Baru" (New Deployment)
 * 6. Pilih Jenis: "Aplikasi Web" (Web App)
 *    - Keterangan: "API Presensi Guru v1"
 *    - Jalankan sebagai: "Saya" (Me)
 *    - Siapa yang memiliki akses: "Siapa saja" (Anyone)
 * 7. Klik "Terapkan" lalu SALIN URL APLIKASI WEB (Web App URL)
 * 8. Tempelkan URL tersebut ke Pengaturan Google Sheets di Aplikasi Presensi Guru.
 */

// Konstanta Nama Sheet
const SHEET_PRESENSI = "PRESENSI_HARIAN";
const SHEET_GURU = "DATA_GURU";
const SHEET_SEKOLAH = "DATA_SEKOLAH";
const SHEET_REKAP = "REKAP_BULANAN";

/**
 * Fungsi Otomatis Inisialisasi Format & Header Spreadsheet
 */
function inisialisasiSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Buat / Format Sheet PRESENSI_HARIAN
  let sheetPresensi = ss.getSheetByName(SHEET_PRESENSI);
  if (!sheetPresensi) {
    sheetPresensi = ss.insertSheet(SHEET_PRESENSI, 0);
  }
  
  const headersPresensi = [
    "ID Presensi",
    "Waktu Catat",
    "Tanggal",
    "Jam",
    "NIP",
    "Nama Lengkap Guru",
    "Sekolah",
    "Jenis Absen",
    "Status Kehadiran",
    "Jarak (Meter)",
    "Dalam Radius?",
    "Latitude",
    "Longitude",
    "Link Google Maps",
    "Status Persetujuan",
    "Catatan / Keterangan",
    "Foto Selfie (URL/Base64 Preview)"
  ];
  
  sheetPresensi.getRange(1, 1, 1, headersPresensi.length).setValues([headersPresensi]);
  sheetPresensi.getRange(1, 1, 1, headersPresensi.length)
    .setBackground("#0F766E")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  
  sheetPresensi.setFrozenRows(1);
  sheetPresensi.autoResizeColumns(1, headersPresensi.length);
  
  // 2. Buat Sheet DATA_GURU jika belum ada
  let sheetGuru = ss.getSheetByName(SHEET_GURU);
  if (!sheetGuru) {
    sheetGuru = ss.insertSheet(SHEET_GURU, 1);
    const headersGuru = ["NIP", "Nama Guru", "Email", "No HP", "Mata Pelajaran", "Sekolah", "Status Aktif"];
    sheetGuru.getRange(1, 1, 1, headersGuru.length).setValues([headersGuru]);
    sheetGuru.getRange(1, 1, 1, headersGuru.length)
      .setBackground("#1E3A8A")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold");
    sheetGuru.setFrozenRows(1);
  }

  // 3. Buat Sheet DATA_SEKOLAH jika belum ada
  let sheetSekolah = ss.getSheetByName(SHEET_SEKOLAH);
  if (!sheetSekolah) {
    sheetSekolah = ss.insertSheet(SHEET_SEKOLAH, 2);
    const headersSekolah = ["ID Sekolah", "Nama Sekolah", "NPSN", "Alamat", "Latitude", "Longitude", "Radius Toleransi (m)", "Jam Masuk", "Jam Pulang"];
    sheetSekolah.getRange(1, 1, 1, headersSekolah.length).setValues([headersSekolah]);
    sheetSekolah.getRange(1, 1, 1, headersSekolah.length)
      .setBackground("#374151")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold");
    sheetSekolah.setFrozenRows(1);
  }

  return "Inisialisasi Sheet Presensi Guru Berhasil!";
}

/**
 * Handle HTTP POST Request (Menerima Data Absensi dari Aplikasi Android/iOS/Web)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || "absen";
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_PRESENSI);
    if (!sheet) {
      inisialisasiSheet();
      sheet = ss.getSheetByName(SHEET_PRESENSI);
    }
    
    // 1. Single Record Insert
    if (action === "absen" || action === "izin") {
      const record = postData.data || postData;
      const mapsLink = "https://www.google.com/maps?q=" + record.latitude + "," + record.longitude;
      
      const newRow = [
        record.id || Utilities.getUuid(),
        new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
        record.date || new Date().toISOString().split("T")[0],
        record.timeOnly || record.timestamp || new Date().toLocaleTimeString("id-ID"),
        record.nip || "-",
        record.userName || "Guru",
        record.schoolName || "Sekolah",
        record.type || "masuk",
        record.status || "tepat_waktu",
        record.distanceMeters !== undefined ? record.distanceMeters : 0,
        record.isWithinRadius ? "YA" : "TIDAK",
        record.latitude || 0,
        record.longitude || 0,
        mapsLink,
        record.approvalStatus || "approved",
        record.notes || "-",
        record.photoUrl ? (record.photoUrl.substring(0, 100) + "... [Tersimpan]") : "-"
      ];
      
      sheet.appendRow(newRow);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data presensi berhasil dicatat di Google Sheets!",
        recordId: record.id,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Batch Sync Insert (Sinkronisasi Massal)
    if (action === "sync_batch") {
      const records = postData.records || [];
      const rowsToAdd = [];
      
      records.forEach(function(record) {
        const mapsLink = "https://www.google.com/maps?q=" + record.latitude + "," + record.longitude;
        rowsToAdd.push([
          record.id || Utilities.getUuid(),
          new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
          record.date || new Date().toISOString().split("T")[0],
          record.timeOnly || record.timestamp || new Date().toLocaleTimeString("id-ID"),
          record.nip || "-",
          record.userName || "Guru",
          record.schoolName || "Sekolah",
          record.type || "masuk",
          record.status || "tepat_waktu",
          record.distanceMeters !== undefined ? record.distanceMeters : 0,
          record.isWithinRadius ? "YA" : "TIDAK",
          record.latitude || 0,
          record.longitude || 0,
          mapsLink,
          record.approvalStatus || "approved",
          record.notes || "-",
          record.photoUrl ? (record.photoUrl.substring(0, 100) + "... [Tersimpan]") : "-"
        ]);
      });
      
      if (rowsToAdd.length > 0) {
        const lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: rowsToAdd.length + " data presensi berhasil disinkronkan!",
        count: rowsToAdd.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Action tidak dikenal: " + action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle HTTP GET Request (Cek Koneksi Webhook & Ambil Data Rekap)
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PRESENSI);
  
  const totalRows = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Sistem API Presensi Guru GPS & Selfie",
    spreadsheetTitle: ss.getName(),
    totalPresensiTercatat: totalRows,
    waktuServer: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
