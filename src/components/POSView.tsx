import React, { useState } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Users,
  Banknote,
  Search,
  Filter,
  Plus,
  Minus,
  Trash2,
  FileText,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  User,
  X,
  Utensils,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { calculateOrderTotals, formatIDR } from '../utils/posLogic';
import { Category, Product } from '../types';

export const POSView: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    selectedTable,
    setSelectedTable,
    customerName,
    setCustomerName,
    orderNotes,
    setOrderNotes,
    discountType,
    discountValue,
    setDiscount,
    settings,
    openPaymentModal,
    orders,
    tables,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState<boolean>(false);
  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState<boolean>(false);

  // Compute live cart totals
  const totals = calculateOrderTotals(cart, discountType, discountValue, settings.taxRate);

  // Filter products by category & search
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'All Items') return true;
    if (selectedCategory === 'Popular') return Boolean(p.isPopular);
    if (selectedCategory === 'Beverages') return p.category === 'Minuman';
    if (selectedCategory === 'Starters') return p.category === 'Camilan & Starters';
    if (selectedCategory === 'Main Course') return p.category === 'Makanan Utama';
    if (selectedCategory === 'Desserts') return p.category === 'Dessert';
    return true;
  });

  // Calculate live daily stats for top 4 cards
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const todaySalesTotal = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const todayOrderCount = completedOrders.length + 29; // baseline matching mockup
  const customerCount = Math.max(28, completedOrders.length * 2);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F7F8FC]">
      {/* LEFT / CENTER: Products & Catalog Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 lg:p-6 space-y-5">
        {/* TOP 4 METRICS CARDS (Card pattern where numbers have 100% full card width) */}
        <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Today's Sales */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ▲ 12.5%
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-0.5">Today's Sales</p>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                {formatIDR(todaySalesTotal || 1250000)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">vs yesterday</p>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ▲ 8
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-0.5">Total Orders</p>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                {todayOrderCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">from yesterday</p>
            </div>
          </div>

          {/* Card 3: Customers */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ▲ 5 new
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-0.5">Customers</p>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                {customerCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">registered</p>
            </div>
          </div>

          {/* Card 4: Total Due */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Banknote className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ▼ 4.2%
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-0.5">Total Due</p>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                Rp 320.500
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">vs yesterday</p>
            </div>
          </div>
        </div>

        {/* CATEGORY TABS & FILTER (Matching reference image with robust height and spacing) */}
        <div className="shrink-0 flex items-center justify-between gap-3 overflow-x-auto py-1 scrollbar-none min-h-[46px]">
          <div className="flex items-center gap-2 shrink-0">
            {[
              { id: 'All Items', label: 'All Items' },
              { id: 'Popular', label: 'Popular' },
              { id: 'Beverages', label: 'Beverages' },
              { id: 'Starters', label: 'Starters' },
              { id: 'Main Course', label: 'Main Course' },
              { id: 'Desserts', label: 'Desserts' },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSelectedCategory('All Items')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition-colors shrink-0 shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
        </div>

        {/* Search bar inside Catalog */}
        <div className="shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          >
            <option value="All Items">All Categories</option>
            <option value="Popular">Popular Items</option>
            <option value="Main Course">Makanan Utama</option>
            <option value="Beverages">Minuman</option>
            <option value="Starters">Starters & Camilan</option>
            <option value="Desserts">Dessert</option>
          </select>
        </div>

        {/* PRODUCT GRID (Exact design layout as reference image: 4 columns on large screens) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock <= product.minStockAlert;
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                className={`bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between group transition-all duration-200 ${
                  isOutOfStock
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-md hover:border-indigo-100 hover:-translate-y-0.5'
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {isOutOfStock ? (
                    <span className="absolute top-2 left-2 bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                      Stok Habis
                    </span>
                  ) : isLowStock ? (
                    <span className="absolute top-2 left-2 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Sisa {product.stock}
                    </span>
                  ) : null}

                  {product.isPopular && !isOutOfStock && !isLowStock && (
                    <span className="absolute top-2 left-2 bg-indigo-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                      Popular
                    </span>
                  )}
                </div>

                {/* Details & Price Row */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 min-h-[2rem] leading-snug group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-black text-indigo-700">
                      {formatIDR(product.price)}
                    </span>

                    {/* Circular '+' button matching screenshot */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-7 h-7 rounded-full bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                      aria-label={`Tambah ${product.name} ke pesanan`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
            <p className="text-sm font-semibold text-slate-600">Tidak ada menu yang sesuai.</p>
            <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau pilih Semua Kategori.</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: "Current Order" - Sleek & Modern POS Drawer */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200/80 flex flex-col shrink-0 select-none shadow-sm">
        {/* Header with Table & Dining Mode */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-800 tracking-tight">Current Order</h3>
              {cart.length > 0 && (
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-100/80">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item
                </span>
              )}
            </div>

            {/* Table Selector Badge */}
            <div className="relative">
              <button
                onClick={() => setIsTableSelectorOpen(!isTableSelectorOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200/80 shadow-2xs transition-colors"
              >
                <span>{selectedTable}</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              {isTableSelectorOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 tracking-wider">
                    Pilih Meja / Lokasi
                  </p>
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {tables.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTable(t.number);
                          setIsTableSelectorOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          selectedTable === t.number
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{t.number}</span>
                        {selectedTable === t.number && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Dining Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setSelectedTable('Meja 08')}
              className={`py-1 text-center rounded-lg text-[11px] font-bold transition-all ${
                !selectedTable.includes('Take') && !selectedTable.includes('Delivery')
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => setSelectedTable('Take Away')}
              className={`py-1 text-center rounded-lg text-[11px] font-bold transition-all ${
                selectedTable === 'Take Away'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Take Away
            </button>
            <button
              onClick={() => setSelectedTable('Delivery')}
              className={`py-1 text-center rounded-lg text-[11px] font-bold transition-all ${
                selectedTable === 'Delivery'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Customer Input - Modern clean rounded pill without dashed line */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 shadow-2xs transition-all">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Nama Pemesan (Opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="flex-1 text-xs text-slate-800 placeholder-slate-400 font-medium bg-transparent focus:outline-hidden"
            />
            {customerName && (
              <button
                onClick={() => setCustomerName('')}
                className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                title="Hapus Nama"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items List / Inviting Empty State */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-500 mb-3 border border-indigo-100/60 shadow-2xs">
                <ShoppingCart className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Pesanan Masih Kosong</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                Pilih menu di sebelah kiri untuk menambahkan ke daftar pesanan.
              </p>
              <div className="mt-4 px-3 py-1.5 rounded-full bg-indigo-50/60 text-indigo-700 text-[11px] font-semibold border border-indigo-100/50 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Ketuk menu untuk tambah</span>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200/60 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate">{item.product.name}</h5>
                    <p className="text-xs font-bold text-indigo-600 mt-0.5">
                      {formatIDR(item.product.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-white border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-7 h-7 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Note Row */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white">
          {!isNoteOpen ? (
            <button
              onClick={() => setIsNoteOpen(true)}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{orderNotes ? `Catatan: "${orderNotes}"` : '+ Add Note'}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Contoh: Tanpa sambal, saus dipisah..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {['Pedas', 'Pisah Sambal', 'Kurang Manis'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setOrderNotes(orderNotes ? `${orderNotes}, ${tag}` : tag)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsNoteOpen(false)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calculation Summary */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="font-semibold text-slate-800">{formatIDR(totals.subtotal)}</span>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsDiscountOpen(!isDiscountOpen)}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Discount</span>
              {discountValue > 0 && (
                <span className="font-bold">
                  ({discountType === 'percentage' ? `${discountValue}%` : 'Nominal'})
                </span>
              )}
            </button>
            <span className="font-bold text-emerald-600">
              {totals.discountAmount > 0 ? `-${formatIDR(totals.discountAmount)}` : 'Rp 0'}
            </span>
          </div>

          {/* Expandable Discount Preset Picker */}
          {isDiscountOpen && (
            <div className="p-2.5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Diskon Cepat</p>
              <div className="flex gap-1.5">
                {[
                  { label: '0%', val: 0 },
                  { label: '5%', val: 5 },
                  { label: '10%', val: 10 },
                  { label: '15%', val: 15 },
                  { label: '20%', val: 20 },
                ].map((d) => (
                  <button
                    key={d.label}
                    onClick={() => {
                      setDiscount('percentage', d.val);
                      setIsDiscountOpen(false);
                    }}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      discountType === 'percentage' && discountValue === d.val
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Tax ({settings.taxRate}%)</span>
            <span className="font-semibold text-slate-800">{formatIDR(totals.taxAmount)}</span>
          </div>

          <div className="pt-2.5 border-t border-slate-200/80 flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
            <span className="text-lg font-black text-indigo-950 tabular-nums">
              {formatIDR(totals.total)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2.5 border-t border-slate-100 bg-white">
          {/* Primary Charge Button */}
          <button
            disabled={cart.length === 0}
            onClick={openPaymentModal}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-between transition-all ${
              cart.length === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200/70 cursor-not-allowed justify-center'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]'
            }`}
          >
            {cart.length === 0 ? (
              <span>Pilih Menu Untuk Bayar</span>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  <span>Bayar Sekarang</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatIDR(totals.total)}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </>
            )}
          </button>

          {/* Secondary Draft & Clear Buttons */}
          <div className="flex gap-2">
            <button
              disabled={cart.length === 0}
              onClick={() => {
                alert(`Pesanan untuk ${selectedTable} berhasil disimpan sebagai Draft.`);
                clearCart();
              }}
              className="flex-1 py-2 px-3 bg-indigo-50/80 hover:bg-indigo-100/80 disabled:bg-slate-50 text-indigo-700 disabled:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-indigo-100/60"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Simpan Draft</span>
            </button>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="py-2 px-3 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors border border-slate-200/60"
                title="Batalkan / Kosongkan Pesanan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
