import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Search,
  DollarSign,
  TrendingUp,
  Receipt,
  Eye,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatIDR, generateSalesCSV, calculateAnalytics } from '../utils/posLogic';
import { Order } from '../types';

export const ReportsView: React.FC = () => {
  const { orders, products, settings, openReceiptModal } = usePOS();
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');
  const [searchOrder, setSearchOrder] = useState<string>('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Filter orders by date range
  const now = new Date();
  const filteredOrders = orders.filter((o) => {
    const oDate = new Date(o.timestamp);
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.cashierName.toLowerCase().includes(searchOrder.toLowerCase());

    if (!matchesSearch) return false;

    if (filterPeriod === 'today') {
      return oDate.toDateString() === now.toDateString();
    }
    if (filterPeriod === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return oDate.toDateString() === yesterday.toDateString();
    }
    if (filterPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return oDate >= weekAgo;
    }
    if (filterPeriod === 'month') {
      return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const analytics = calculateAnalytics(filteredOrders, products);

  const handleExportCSV = () => {
    const csv = generateSalesCSV(filteredOrders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-penjualan-restoren-${filterPeriod}-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Laporan Penjualan</h2>
          <p className="text-xs text-slate-500">
            Rekap transaksi harian & bulanan dengan fasilitas ekspor Excel (.csv) dan cetak laporan PDF
          </p>
        </div>

        {/* Export & Print Actions */}
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.csv)</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'yesterday', label: 'Kemarin' },
            { id: 'week', label: '7 Hari Terakhir' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'all', label: 'Semua Waktu' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setFilterPeriod(period.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterPeriod === period.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no order / kasir..."
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">Total Omset</span>
          <div className="text-xl font-black text-slate-800 mt-1">{formatIDR(analytics.totalSales)}</div>
          <span className="text-[10px] text-slate-400">Periode terpilih</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">Total Pesanan</span>
          <div className="text-xl font-black text-slate-800 mt-1">{analytics.totalOrders} Transaksi</div>
          <span className="text-[10px] text-slate-400">Selesai bayar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">Laba Kotor Bersih</span>
          <div className="text-xl font-black text-emerald-600 mt-1">{formatIDR(analytics.totalGrossProfit)}</div>
          <span className="text-[10px] text-slate-400">Penjualan dikurang modal HPP</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">Rata-rata Keranjang (AOV)</span>
          <div className="text-xl font-black text-indigo-700 mt-1">{formatIDR(analytics.avgOrderValue)}</div>
          <span className="text-[10px] text-slate-400">Rata-rata per transaksi</span>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">
            Daftar Riwayat Transaksi ({filteredOrders.length})
          </h3>
          <span className="text-xs text-slate-400">Klik "Struk" untuk mencetak ulang tanda terima</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">No. Pesanan</th>
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5">Meja / Pelanggan</th>
                <th className="p-3.5">Kasir</th>
                <th className="p-3.5">Metode Bayar</th>
                <th className="p-3.5">Item Terjual</th>
                <th className="p-3.5 text-right">Total Transaksi</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada transaksi dalam periode ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{order.orderNumber}</td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(order.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{order.tableNumber}</div>
                      <div className="text-[11px] text-slate-400">{order.customerName}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">{order.cashierName}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        {order.payment.method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-[200px] truncate">
                      {order.items.map((i) => `${i.product.name} (${i.quantity}x)`).join(', ')}
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-800">
                      {formatIDR(order.total)}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => openReceiptModal(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Struk</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
