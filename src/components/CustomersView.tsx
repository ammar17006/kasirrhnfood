import React, { useState } from 'react';
import { Users, Search, UserPlus, Phone, DollarSign, Calendar, Plus, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatIDR } from '../utils/posLogic';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c-1', name: 'Pak Daniel', phone: '0812-9901-2291', email: 'daniel@gmail.com', totalOrders: 14, totalSpent: 1240000, lastVisit: 'Hari Ini' },
  { id: 'c-2', name: 'Sarah Amalia', phone: '0813-8821-3991', email: 'sarah@yahoo.com', totalOrders: 8, totalSpent: 750000, lastVisit: 'Hari Ini' },
  { id: 'c-3', name: 'Dimas Kurniawan', phone: '0857-1123-4554', email: 'dimas@gmail.com', totalOrders: 5, totalSpent: 480000, lastVisit: 'Kemarin' },
  { id: 'c-4', name: 'Ibu Ratna', phone: '0811-3442-9912', email: 'ratna.k@gmail.com', totalOrders: 12, totalSpent: 1890000, lastVisit: '2 hari lalu' },
];

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setCustomers([
      ...customers,
      {
        id: `c-${Date.now()}`,
        name: newName,
        phone: newPhone || '-',
        email: newEmail || '-',
        totalOrders: 1,
        totalSpent: 0,
        lastVisit: 'Baru Saja',
      },
    ]);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setIsAddOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Data Pelanggan Restoran</h2>
          <p className="text-xs text-slate-500">Daftar pelanggan setia dan riwayat akumulasi belanja</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau no HP pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{c.name}</h4>
                <p className="text-[11px] text-slate-400">{c.phone}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Belanja:</span>
                <span className="font-bold text-indigo-700">{formatIDR(c.totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kunjungan:</span>
                <span className="font-semibold text-slate-700">{c.totalOrders} kali</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Terakhir Hadir:</span>
                <span className="text-slate-600">{c.lastVisit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-800">Tambah Data Pelanggan</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Pelanggan:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Telepon / WA:</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email:</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
