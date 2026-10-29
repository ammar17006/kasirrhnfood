import React from 'react';
import {
  LayoutDashboard,
  Store,
  Receipt,
  Grid,
  UtensilsCrossed,
  Users,
  BarChart3,
  DollarSign,
  UserCog,
  Settings,
  ShieldCheck,
  CloudCheck,
  Sparkles,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, lowStockItems, exportBackupJSON } = usePOS();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Kasir', icon: Store },
    { id: 'orders', label: 'Pesanan', icon: Receipt },
    { id: 'tables', label: 'Meja Resto', icon: Grid },
    { id: 'menu', label: 'Menu & Stok', icon: UtensilsCrossed, badge: lowStockItems.length > 0 ? lowStockItems.length : undefined },
    { id: 'customers', label: 'Pelanggan', icon: Users },
    { id: 'reports', label: 'Laporan Penjualan', icon: BarChart3 },
    { id: 'expenses', label: 'Pengeluaran', icon: DollarSign },
    { id: 'staff', label: 'Staf & Akses', icon: UserCog, adminOnly: true },
    { id: 'settings', label: 'Pengaturan & Backup', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/70 flex flex-col h-screen shrink-0 select-none z-20 transition-all">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight tracking-tight">RestoDash</h1>
          <p className="text-xs text-indigo-600 font-medium tracking-wide">POS System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && currentUser.role !== 'admin') {
            return null;
          }
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Backup & System Status Card */}
      <div className="p-3 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-100/70">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Data Terproteksi</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
          Auto-backup aktif. Stok dan transaksi tersinkron lokal.
        </p>
        <button
          onClick={exportBackupJSON}
          className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unduh Backup</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400">RestoDash POS v2.4 • Made for Indonesia</p>
      </div>
    </aside>
  );
};
