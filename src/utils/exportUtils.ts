import { AttendanceRecord, School } from '../types';

export function exportToCSV(records: AttendanceRecord[], filename = 'rekap_presensi_guru.csv'): void {
  const headers = [
    'No',
    'Tanggal',
    'Jam',
    'NIP',
    'Nama Guru',
    'Sekolah',
    'Jenis',
    'Status',
    'Jarak (m)',
    'Dalam Radius',
    'Latitude',
    'Longitude',
    'Status Persetujuan',
    'Keterangan'
  ];

  const rows = records.map((r, index) => [
    index + 1,
    `"${r.date}"`,
    `"${r.timeOnly}"`,
    `"${r.nip}"`,
    `"${r.userName.replace(/"/g, '""')}"`,
    `"${r.schoolName.replace(/"/g, '""')}"`,
    `"${r.type.toUpperCase()}"`,
    `"${r.status.toUpperCase()}"`,
    r.distanceMeters,
    r.isWithinRadius ? 'YA' : 'TIDAK',
    r.latitude,
    r.longitude,
    `"${r.approvalStatus}"`,
    `"${(r.notes || '-').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printOfficialAttendanceReport(
  records: AttendanceRecord[],
  school: School,
  periodTitle = 'Harian'
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const tableRows = records
    .map(
      (r, idx) => `
    <tr>
      <td style="text-align: center; padding: 6px; border: 1px solid #cbd5e1;">${idx + 1}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: 500;">${r.userName}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1; font-family: monospace;">${r.nip}</td>
      <td style="text-align: center; padding: 6px; border: 1px solid #cbd5e1;">${r.timeOnly}</td>
      <td style="text-align: center; padding: 6px; border: 1px solid #cbd5e1;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${
          r.status === 'tepat_waktu' ? '#dcfce7; color: #166534' : r.status === 'terlambat' ? '#fef3c7; color: #92400e' : '#e0e7ff; color: #3730a3'
        };">
          ${r.status.replace(/_/g, ' ').toUpperCase()}
        </span>
      </td>
      <td style="text-align: center; padding: 6px; border: 1px solid #cbd5e1;">${r.distanceMeters} m (${r.isWithinRadius ? '✓ Sesuai' : '✕ Luar Radius'})</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.notes || '-'}</td>
      <td style="text-align: center; padding: 6px; border: 1px solid #cbd5e1;">
        ${r.photoUrl ? `<img src="${r.photoUrl}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 50%; border: 1px solid #94a3b8;" alt="Selfie" />` : '-'}
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Presensi Guru - ${school.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }
        .kop { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
        .kop h2 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
        .kop h3 { margin: 4px 0; font-size: 16px; font-weight: 600; }
        .kop p { margin: 2px 0; font-size: 12px; color: #475569; }
        .meta-box { margin-bottom: 14px; font-size: 13px; display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background-color: #0f766e; color: white; padding: 8px; border: 1px solid #0f766e; text-align: center; }
        .signature-grid { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
        .sign-box { text-align: center; width: 220px; font-size: 12px; }
        .sign-space { height: 65px; }
        @media print {
          @page { margin: 15mm; size: landscape; }
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="kop">
        <h2>PEMERINTAH DAERAH DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
        <h3>${school.name.toUpperCase()}</h3>
        <p>NPSN: ${school.npsn} | Alamat: ${school.address}</p>
        <p>Email: info@${school.npsn}.sch.id | Sistem Presensi Digital Geofence & Selfie</p>
      </div>

      <div style="text-align: center; margin-bottom: 16px;">
        <h4 style="margin: 0; font-size: 15px; text-decoration: underline;">DAFTAR HADIR GURU DAN TENAGA KEPENDIDIKAN</h4>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">Periode: ${periodTitle} | Tanggal Cetak: ${todayStr}</p>
      </div>

      <div class="meta-box">
        <div><strong>Total Guru Hadir:</strong> ${records.length} Orang</div>
        <div><strong>Radius Geofence:</strong> ${school.radiusMeters} Meter | <strong>Jam Masuk:</strong> ${school.workStart} WIB</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 35px;">No</th>
            <th>Nama Lengkap Guru</th>
            <th>NIP</th>
            <th>Waktu Absen</th>
            <th>Status</th>
            <th>Jarak GPS & Radius</th>
            <th>Keterangan</th>
            <th style="width: 50px;">Selfie</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || '<tr><td colspan="8" style="text-align:center; padding: 16px;">Belum ada data presensi untuk periode ini.</td></tr>'}
        </tbody>
      </table>

      <div class="signature-grid">
        <div class="sign-box">
          <p>Mengetahui,<br>Kepala Sekolah</p>
          <div class="sign-space"></div>
          <p style="font-weight: bold; text-decoration: underline;">Dr. H. Bambang Sutrisno, M.Pd</p>
          <p>NIP. 197405121998021003</p>
        </div>
        <div class="sign-box">
          <p>Kota Terkait, ${todayStr}<br>Operator / Petugas Presensi</p>
          <div class="sign-space"></div>
          <p style="font-weight: bold; text-decoration: underline;">Rina Wulandari, S.Kom</p>
          <p>NIP. 198811042014032001</p>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
