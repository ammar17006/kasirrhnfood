import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  PackagePlus,
  ArrowUpDown,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Product, Category } from '../types';
import { formatIDR, generateInventoryCSV } from '../utils/posLogic';

export const InventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    currentUser,
  } = usePOS();

  const [search, setSearch] = useState<string>('');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Makanan Utama' as Category,
    costPrice: 0,
    price: 0,
    stock: 10,
    minStockAlert: 5,
    unit: 'porsi',
    image: '',
    description: '',
    isPopular: false,
  });

  const handleOpenAdd = () => {
    setFormData({
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Makanan Utama',
      costPrice: 15000,
      price: 30000,
      stock: 20,
      minStockAlert: 5,
      unit: 'porsi',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=360&q=80',
      description: '',
      isPopular: false,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      costPrice: product.costPrice,
      price: product.price,
      stock: product.stock,
      minStockAlert: product.minStockAlert,
      unit: product.unit,
      image: product.image,
      description: product.description || '',
      isPopular: Boolean(product.isPopular),
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama produk tidak boleh kosong.');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...formData,
      });
      setEditingProduct(null);
    } else {
      addProduct(formData);
      setIsAddModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = generateInventoryCSV(products);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-stok-restodash-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (selectedCategory !== 'Semua' && p.category !== selectedCategory) return false;

    if (filterStockStatus === 'low') return p.stock <= p.minStockAlert && p.stock > 0;
    if (filterStockStatus === 'out') return p.stock === 0;

    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#F7F8FC]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Manajemen Inventaris Stok</h2>
          <p className="text-xs text-slate-500">
            Kelola data menu, batas minimum stok gudang, dan pembaruan stok real-time
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.csv)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari SKU atau nama menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Makanan Utama">Makanan Utama</option>
            <option value="Minuman">Minuman</option>
            <option value="Camilan & Starters">Camilan & Starters</option>
            <option value="Dessert">Dessert</option>
          </select>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterStockStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStockStatus === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            onClick={() => setFilterStockStatus('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterStockStatus === 'low'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stok Menipis ({products.filter((p) => p.stock <= p.minStockAlert && p.stock > 0).length})</span>
          </button>
          <button
            onClick={() => setFilterStockStatus('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStockStatus === 'out'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            Habis ({products.filter((p) => p.stock === 0).length})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Produk</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Harga Modal (HPP)</th>
                <th className="p-3.5">Harga Jual</th>
                <th className="p-3.5">Stok Saat Ini</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStockAlert;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-800 line-clamp-1">{p.name}</div>
                        <div className="text-[11px] text-slate-400">{p.unit}</div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 font-semibold">{p.sku}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{formatIDR(p.costPrice)}</td>
                    <td className="p-3.5 font-bold text-slate-800">{formatIDR(p.price)}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">
                        {p.stock} <span className="text-[10px] text-slate-400 font-normal">/ min {p.minStockAlert}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                          Habis
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                          <AlertTriangle className="w-3 h-3" /> Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3" /> Aman
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      {/* Restock Button */}
                      <button
                        onClick={() => {
                          setRestockingProduct(p);
                          setRestockAmount(10);
                        }}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                        title="Tambah Stok Masuk"
                      >
                        <PackagePlus className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button (admin check) */}
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus menu "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK RESTOCK MODAL */}
      {restockingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-800">Tambah Stok Masuk</h3>
              <button onClick={() => setRestockingProduct(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <img
                src={restockingProduct.image}
                alt={restockingProduct.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-bold text-xs text-slate-800">{restockingProduct.name}</p>
                <p className="text-[11px] text-slate-500">
                  Stok saat ini: <span className="font-bold">{restockingProduct.stock}</span> {restockingProduct.unit}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah Tambahan Stok:</label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-800"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockingProduct(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  restockProduct(restockingProduct.id, restockAmount);
                  setRestockingProduct(null);
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200"
              >
                Konfirmasi Masuk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">
                {editingProduct ? 'Edit Data Menu' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SKU / Kode Produk:</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Makanan Utama">Makanan Utama</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Camilan & Starters">Camilan & Starters</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Menu / Produk:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Grilled Chicken Special"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Modal (HPP):</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Jual Konsumen:</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stok:</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Min. Alert:</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan:</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Gambar Foto:</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popCheck"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="popCheck" className="font-bold text-slate-700 cursor-pointer">
                  Tandai sebagai Menu Populer
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
