import React, { useState, useRef } from 'react';
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Printer,
  Store,
  CheckCircle,
  FileJson,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { StoreSettings } from '../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportBackupJSON,
    importBackupJSON,
    resetToDefaults,
    currentUser,
  } = usePOS();

  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackupJSON(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800">Pengaturan Toko & Sistem Backup</h2>
        <p className="text-xs text-slate-500">
          Konfigurasi profil restoran, format cetak struk thermal, dan keamanan data berkala
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">Informasi Restoran</h3>
              </div>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle className="w-4 h-4" /> Perubahan Tersimpan!
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Toko / Restoran:</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Slogan / Tagline Struk:</label>
                <input
                  type="text"
                  value={formData.storeTagline}
                  onChange={(e) => setFormData({ ...formData, storeTagline: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Telepon:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarif Pajak PPN (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Toko:</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 resize-none"
                />
              </div>
            </div>

            {/* Receipt Preferences */}
            <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">Format Struk Otomatis</h3>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pesan Footer Struk:</label>
                <input
                  type="text"
                  value={formData.receiptFooterMessage}
                  onChange={(e) => setFormData({ ...formData, receiptFooterMessage: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="autoPrintCheck"
                  checked={formData.autoPrintReceipt}
                  onChange={(e) => setFormData({ ...formData, autoPrintReceipt: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="autoPrintCheck" className="font-bold text-slate-700 cursor-pointer">
                  Tampilkan Pop-up Struk Otomatis setelah Selesai Bayar
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Backup & Restore System */}
        <div className="space-y-6">
          {/* Automatic Backup Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-800">Sistem Backup Otomatis</h3>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Status: Aktif & Terlindungi</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Data inventaris stok, riwayat pesanan, dan akun pengguna otomatis di-cache dan disimpan aman secara real-time.
              </p>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Anda dapat mengunduh salinan berkas backup dalam format JSON kapan saja untuk disimpan di komputer atau dipindahkan ke perangkat lain.
            </p>

            <button
              onClick={exportBackupJSON}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Backup (.json)</span>
            </button>
          </div>

          {/* Restore Data Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">Pulihkan / Restore Data</h3>
            </div>

            <p className="text-xs text-slate-500">
              Pilih file cadangan JSON sebelumnya untuk mengembalikan riwayat transaksi dan stok barang.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih File Backup (.json)</span>
            </button>
          </div>

          {/* Reset System Card */}
          <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Zona Berbahaya</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mereset seluruh data produk, transaksi, dan akun ke setelan demo awal pabrik.
            </p>
            <button
              onClick={resetToDefaults}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors"
            >
              Reset Data ke Setelan Awal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
