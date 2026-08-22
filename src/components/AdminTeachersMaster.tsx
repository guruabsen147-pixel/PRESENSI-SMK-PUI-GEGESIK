import React, { useState } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Key, Check, Plus, X } from 'lucide-react';
import { User, School } from '../types';

interface AdminTeachersMasterProps {
  users: User[];
  schools: School[];
  onSaveUsers: (users: User[]) => void;
}

export const AdminTeachersMaster: React.FC<AdminTeachersMasterProps> = ({
  users,
  schools,
  onSaveUsers
}) => {
  const [search, setSearch] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formName, setFormName] = useState<string>('');
  const [formNip, setFormNip] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formSubject, setFormSubject] = useState<string>('');
  const [formSchoolId, setFormSchoolId] = useState<string>(schools[0]?.id || '');
  const [formRole, setFormRole] = useState<any>('guru');
  const [formPin, setFormPin] = useState<string>('1234');

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.nip.includes(search) ||
      (u.subject && u.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormNip('19' + Math.floor(1000000000000000 + Math.random() * 900000000000000));
    setFormEmail('');
    setFormSubject('Guru Mata Pelajaran');
    setFormSchoolId(schools[0]?.id || '');
    setFormRole('guru');
    setFormPin('1234');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormNip(user.nip);
    setFormEmail(user.email);
    setFormSubject(user.subject || '');
    setFormSchoolId(user.schoolId);
    setFormRole(user.role);
    setFormPin(user.pin || '1234');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      const updated = users.filter(u => u.id !== userId);
      onSaveUsers(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNip.trim()) {
      alert('Nama dan NIP wajib diisi!');
      return;
    }

    if (editingUser) {
      const updated = users.map(u =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formName.trim(),
              nip: formNip.trim(),
              email: formEmail.trim() || `${formNip}@sekolah.id`,
              subject: formSubject.trim(),
              schoolId: formSchoolId,
              role: formRole,
              pin: formPin.trim() || '1234'
            }
          : u
      );
      onSaveUsers(updated);
    } else {
      const newUser: User = {
        id: 'usr-' + Date.now(),
        name: formName.trim(),
        nip: formNip.trim(),
        email: formEmail.trim() || `${formNip}@sekolah.id`,
        subject: formSubject.trim(),
        schoolId: formSchoolId,
        role: formRole,
        pin: formPin.trim() || '1234'
      };
      onSaveUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Master Data Guru & Tenaga Kependidikan</span>
          </h3>
          <p className="text-xs text-slate-500">
            Total terdaftar: <strong className="text-slate-800 dark:text-slate-200">{users.length}</strong> guru & staf
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIP, mapel..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Teachers List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Nama Guru</th>
                <th className="p-3.5">NIP</th>
                <th className="p-3.5">Mata Pelajaran / Tugas</th>
                <th className="p-3.5">Unit Sekolah</th>
                <th className="p-3.5">Role Akses</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(u => {
                const userSchool = schools.find(s => s.id === u.schoolId);
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {u.nip}
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {u.subject || '-'}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {userSchool?.name || '-'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                        u.role === 'kepsek' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Data Guru"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {users.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Hapus Data Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {editingUser ? 'Edit Data Guru / Tenaga Kependidikan' : 'Tambah Guru / Pegawai Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap beserta Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Contoh: Dra. Hj. Ratna Sari, M.Pd"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIP / NUPTK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNip}
                    onChange={e => setFormNip(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    placeholder="Matematika"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Akun Presensi
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="guru@belajar.id"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Sekolah
                  </label>
                  <select
                    value={formSchoolId}
                    onChange={e => setFormSchoolId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Akses
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="guru">Guru Pengajar</option>
                    <option value="staff">Staf Tata Usaha</option>
                    <option value="admin">Administrator</option>
                    <option value="kepsek">Kepala Sekolah</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
