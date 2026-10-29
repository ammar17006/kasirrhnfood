import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Clock,
  PieChart,
  Award,
  Layers,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { calculateAnalytics, formatIDR } from '../utils/posLogic';

export const OverviewDashboard: React.FC = () => {
  const { orders, products, setActiveTab } = usePOS();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const analytics = calculateAnalytics(orders, products);

  // Peak hour finder
  const peakHour = [...analytics.hourlySales].sort((a, b) => b.sales - a.sales)[0] || {
    hour: '12:00',
    sales: 0,
  };

  const maxHourlySale = Math.max(...analytics.hourlySales.map((h) => h.sales), 100000);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800">Dashboard Analitik Penjualan</h2>
          <p className="text-xs text-slate-500">
            Pemantauan performa kasir, laba kotor, dan tren pesanan restoran secara mendalam
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs self-start">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === 'today' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === 'week' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === 'month' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Penjualan</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {formatIDR(analytics.totalSales)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% dari target bulanan</span>
          </div>
        </div>

        {/* Laba Kotor (Gross Profit) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Estimasi Laba Kotor</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {formatIDR(analytics.totalGrossProfit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Margin: {analytics.totalSales > 0 ? Math.round((analytics.totalGrossProfit / analytics.totalSales) * 100) : 0}%
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {analytics.totalOrders} Transaksi
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Rata-rata: {formatIDR(analytics.avgOrderValue)} / transaksi
          </div>
        </div>

        {/* Jam Sibuk Restoran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Jam Paling Sibuk</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            Pukul {peakHour.hour}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mencapai omset {formatIDR(peakHour.sales)}
          </div>
        </div>
      </div>

      {/* Visual Charts: Hourly Trend & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Hourly Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Grafik Jam Sibuk Penjualan (08:00 - 22:00)</h3>
              <p className="text-xs text-slate-400">Intensitas transaksi per jam hari ini</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Laporan Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100">
            {analytics.hourlySales.map((item, idx) => {
              const heightPercent = maxHourlySale > 0 ? Math.max(8, Math.round((item.sales / maxHourlySale) * 100)) : 8;
              const isPeak = item.hour === peakHour.hour && item.sales > 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-20 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-md whitespace-nowrap">
                    {item.hour}: {formatIDR(item.sales)} ({item.count} pesanan)
                  </div>

                  {/* Visual Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isPeak
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm'
                        : item.sales > 0
                        ? 'bg-indigo-200 group-hover:bg-indigo-400'
                        : 'bg-slate-100'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-2 block rotate-[-45deg] sm:rotate-0">
                    {item.hour.split(':')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Distribusi Pembayaran</h3>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {analytics.paymentDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Belum ada riwayat transaksi.</p>
            ) : (
              analytics.paymentDistribution.map((item, idx) => {
                const percent = analytics.totalSales > 0 ? Math.round((item.total / analytics.totalSales) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.label}</span>
                      <span>{percent}% ({formatIDR(item.total)})</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.method === 'qris'
                            ? 'bg-indigo-600'
                            : item.method === 'cash'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: 5 Menu Terlaris & Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best Sellers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-800">5 Menu Paling Laris (Best Seller)</h3>
            </div>
            <span className="text-xs text-slate-400">Hari ini</span>
          </div>

          <div className="divide-y divide-slate-100">
            {analytics.topProducts.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-black text-indigo-600">#{idx + 1}</span>
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-100" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{p.name}</h5>
                    <p className="text-[11px] text-slate-400">{p.quantity} porsi terjual</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800">{formatIDR(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kategori Penjualan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-800">Kontribusi Penjualan per Kategori</h3>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.categorySales.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">{cat.category}</span>
                  <span className="font-semibold text-slate-500">{cat.count} item • {formatIDR(cat.sales)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{
                      width: `${analytics.totalSales > 0 ? Math.round((cat.sales / analytics.totalSales) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
