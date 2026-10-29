import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  AlertTriangle,
  UserCheck,
  LogOut,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatIDR } from '../utils/posLogic';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    lowStockItems,
    openSwitchUserModal,
    setActiveTab,
    restockProduct,
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/70 px-6 flex items-center justify-between shrink-0 select-none z-10">
      {/* Search Input matching RestoDash */}
      <div className="relative w-80 lg:w-96">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Cari menu, pesanan, pelanggan..."
          className="w-full pl-10 pr-16 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs lg:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
          <span className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell with Low Stock Counter */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileMenuOpen(false);
            }}
            aria-label="Notifikasi Stok Menipis"
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {lowStockItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white animate-bounce">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-800">Peringatan Stok Menipis</h3>
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  {lowStockItems.length} Produk
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-semibold text-slate-600">Semua Stok Aman</p>
                    <p className="text-[11px] text-slate-400 mt-1">Tidak ada produk yang berada di bawah batas minimum.</p>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-red-500 font-semibold">
                            Sisa {item.stock} {item.unit} (Min: {item.minStockAlert})
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => restockProduct(item.id, 10)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap"
                      >
                        +10 Stok
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setActiveTab('menu');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                >
                  Lihat Semua Manajemen Stok <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date and Time Chip */}
        <div className="hidden md:flex flex-col text-right pr-2 border-r border-slate-200">
          <span className="text-xs font-bold text-slate-800">{currentDate}</span>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" /> {currentTime}
          </span>
        </div>

        {/* User Profile & Cashier Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[11px] text-indigo-600 capitalize font-medium">{currentUser.role === 'admin' ? 'Administrator' : currentUser.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400">Sedang login sebagai</p>
                <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                <span className="inline-block px-2 py-0.5 mt-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase">
                  {currentUser.role}
                </span>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    openSwitchUserModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Ganti Kasir (PIN)</span>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveTab('staff');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Kelola Hak Akses Staf</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    openSwitchUserModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Kunci Sesi Kasir</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
