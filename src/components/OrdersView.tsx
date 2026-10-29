import React, { useState } from 'react';
import { Search, Receipt, Printer, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatIDR } from '../utils/posLogic';
import { Order } from '../types';

export const OrdersView: React.FC = () => {
  const { orders, openReceiptModal } = usePOS();
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.tableNumber.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Daftar & Riwayat Pesanan</h2>
          <p className="text-xs text-slate-500">
            Lihat semua pesanan masuk, status meja, dan cetak ulang struk pembayaran
          </p>
        </div>

        <div className="relative w-72 self-start">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari order, meja, pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Orders Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full bg-white p-10 rounded-2xl text-center border border-slate-100">
            <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada pesanan ditemukan.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                  <div className="text-[11px] text-slate-400">
                    {new Date(order.timestamp).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Selesai
                </span>
              </div>

              {/* Table & Customer */}
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400">Pelanggan:</span>{' '}
                  <span className="font-bold text-slate-800">{order.customerName}</span>
                </div>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[11px]">
                  {order.tableNumber}
                </span>
              </div>

              {/* Items summary */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span className="line-clamp-1">{it.product.name} x{it.quantity}</span>
                    <span className="font-semibold">{formatIDR(it.product.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Total & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400">Total Tagihan:</span>
                  <div className="text-sm font-black text-slate-900">{formatIDR(order.total)}</div>
                </div>

                <button
                  onClick={() => openReceiptModal(order)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Struk</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
