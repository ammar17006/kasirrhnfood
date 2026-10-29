import React, { useState } from 'react';
import {
  UserPlus,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Trash2,
  Edit2,
  Lock,
  X,
  Check,
  Shield,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { User, Role } from '../types';

export const StaffView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'kasir' as Role,
    pin: '0000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    email: '',
    phone: '',
    active: true,
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      role: 'kasir',
      pin: '0000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      email: '',
      phone: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      role: user.role,
      pin: user.pin,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      active: user.active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.pin.length < 4) {
      alert('Nama staf harus diisi dan PIN minimal 4 angka.');
      return;
    }

    if (editingUser) {
      updateUser({
        ...editingUser,
        ...formData,
      });
    } else {
      addUser(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Manajemen Staf & Hak Akses</h2>
          <p className="text-xs text-slate-500">
            Atur pengguna multi-kasir, PIN autentikasi keamanan, dan perizinan sistem
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all self-start"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Staf Kasir</span>
          </button>
        )}
      </div>

      {/* Role Access Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h4 className="font-bold text-xs text-slate-800 uppercase">Role: Administrator</h4>
          </div>
          <p className="text-[11px] text-slate-500">
            Akses penuh ke seluruh sistem: POS, kelola inventaris barang & hapus produk, laporan laba rugi, kelola staf, dan backup data.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h4 className="font-bold text-xs text-slate-800 uppercase">Role: Kasir</h4>
          </div>
          <p className="text-[11px] text-slate-500">
            Akses operasional transaksi: Buka kasir POS, proses pembayaran, cetak struk thermal, dan lihat riwayat pesanan hari ini.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <h4 className="font-bold text-xs text-slate-800 uppercase">Role: Manager Gudang</h4>
          </div>
          <p className="text-[11px] text-slate-500">
            Akses inventaris: Pantau stok menipis, input stok masuk/restock barang gudang, dan perbarui harga modal HPP.
          </p>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isCurrentUser = currentUser.id === u.id;
          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl p-5 border shadow-2xs space-y-4 ${
                isCurrentUser ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                          Anda
                        </span>
                      )}
                    </h4>
                    <span className="text-xs font-semibold text-slate-400 capitalize">@{u.username}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    u.role === 'admin'
                      ? 'bg-purple-50 text-purple-700'
                      : u.role === 'kasir'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {u.role}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-400">PIN Kasir:</span>
                  <span className="font-mono font-bold tracking-widest text-slate-800">•••• ({u.pin})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-700">{u.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-600">Aktif</span>
                </div>
              </div>

              {currentUser.role === 'admin' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {!isCurrentUser && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus staf ${u.name}?`)) {
                          deleteUser(u.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">
                {editingUser ? 'Edit Staf Pengguna' : 'Tambah Staf Pengguna Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Staf:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Saputra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username:</label>
                  <input
                    type="text"
                    required
                    placeholder="rian_kasir"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hak Akses (Role):</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="kasir">Kasir</option>
                    <option value="manager_gudang">Manager Gudang</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">PIN Kasir (4 - 6 Angka):</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="1234"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email / Kontak:</label>
                <input
                  type="email"
                  placeholder="staf@restodash.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
