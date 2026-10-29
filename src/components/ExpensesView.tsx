import React, { useState } from 'react';
import { DollarSign, Plus, Calendar, Tag, Trash2, X } from 'lucide-react';
import { formatIDR } from '../utils/posLogic';

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', title: 'Beli Bahan Baku Segar (Pasar)', category: 'Bahan Baku', amount: 350000, date: '2026-10-28', note: 'Ayam, sayuran, telur' },
  { id: 'exp-2', title: 'Gas LPG 12kg (2 Tabung)', category: 'Operasional', amount: 420000, date: '2026-10-27', note: 'Dapur utama' },
  { id: 'exp-3', title: 'Paper Cup & Kemasan Takeaway', category: 'Packaging', amount: 180000, date: '2026-10-26', note: 'Restock dus & kantong' },
];

export const ExpensesView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bahan Baku');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;
    setExpenses([
      {
        id: `exp-${Date.now()}`,
        title,
        category,
        amount,
        date: new Date().toISOString().slice(0, 10),
        note,
      },
      ...expenses,
    ]);
    setTitle('');
    setAmount(0);
    setNote('');
    setIsAddOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Catatan Pengeluaran Operasional</h2>
          <p className="text-xs text-slate-500">Pencatatan biaya belanja bahan baku, operasional, dan perlengkapan kasir</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengeluaran</span>
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400">Total Pengeluaran Bulan Ini</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatIDR(totalExpense)}</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold">
            <tr>
              <th className="p-3.5">Tanggal</th>
              <th className="p-3.5">Keterangan Pengeluaran</th>
              <th className="p-3.5">Kategori</th>
              <th className="p-3.5">Catatan</th>
              <th className="p-3.5 text-right">Nominal</th>
              <th className="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-3.5 text-slate-500 font-mono">{item.date}</td>
                <td className="p-3.5 font-bold text-slate-800">{item.title}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {item.category}
                  </span>
                </td>
                <td className="p-3.5 text-slate-500">{item.note || '-'}</td>
                <td className="p-3.5 text-right font-bold text-red-600">{formatIDR(item.amount)}</td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => setExpenses(expenses.filter((e) => e.id !== item.id))}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-800">Catat Pengeluaran Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan Biaya:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Minyak Goreng"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Bahan Baku">Bahan Baku Makanan</option>
                  <option value="Operasional">Operasional Dapur / Listrik</option>
                  <option value="Packaging">Packaging / Bungkus</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal (Rp):</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan:</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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
                  Simpan Biaya
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
