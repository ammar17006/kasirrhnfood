import React from 'react';
import { Grid, Users, CheckCircle2, Clock, Plus, ArrowRight } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Table } from '../types';

export const TablesView: React.FC = () => {
  const { tables, updateTableStatus, setSelectedTable, setActiveTab } = usePOS();

  const handleSelectTableAndGoPOS = (table: Table) => {
    setSelectedTable(table.number);
    setActiveTab('pos');
  };

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const availableCount = tables.filter((t) => t.status === 'available').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Manajemen Meja Restoran</h2>
          <p className="text-xs text-slate-500">
            Denah lantai meja, pemantauan status okupansi pelanggan, dan pesanan aktif
          </p>
        </div>

        {/* Status Legend Pills */}
        <div className="flex items-center gap-2 self-start">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Tersedia ({availableCount})</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Terisi ({occupiedCount})</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Reservasi ({reservedCount})</span>
          </span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table) => {
          const isOccupied = table.status === 'occupied';
          const isReserved = table.status === 'reserved';

          return (
            <div
              key={table.id}
              className={`bg-white rounded-2xl p-4 border transition-all shadow-2xs flex flex-col justify-between ${
                isOccupied
                  ? 'border-indigo-200 ring-2 ring-indigo-500/10'
                  : isReserved
                  ? 'border-amber-200'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-800">{table.number}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isOccupied
                        ? 'bg-indigo-100 text-indigo-700'
                        : isReserved
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isOccupied ? 'Terisi' : isReserved ? 'Reservasi' : 'Kosong'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>Kapasitas {table.capacity > 0 ? `${table.capacity} Orang` : 'Bungkus'}</span>
                </div>

                {table.customerName && (
                  <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-lg line-clamp-1 mb-3">
                    {table.customerName}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => handleSelectTableAndGoPOS(table)}
                  className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Buka di Kasir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {isOccupied && (
                  <button
                    onClick={() => updateTableStatus(table.id, 'available', undefined)}
                    className="w-full py-1 text-[11px] text-slate-500 hover:text-emerald-700 font-medium"
                  >
                    Kosongkan Meja
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
