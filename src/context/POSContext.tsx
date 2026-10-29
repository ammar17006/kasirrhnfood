import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, User, Order, CartItem, Table, StoreSettings, PaymentDetails, Category } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_TABLES,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { calculateOrderTotals, deductStock, getLowStockProducts } from '../utils/posLogic';

interface POSContextType {
  // State
  currentUser: User;
  users: User[];
  products: Product[];
  orders: Order[];
  tables: Table[];
  settings: StoreSettings;
  cart: CartItem[];
  selectedTable: string;
  customerName: string;
  orderNotes: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  lowStockItems: Product[];
  activeTab: string; // 'pos' | 'overview' | 'orders' | 'tables' | 'menu' | 'reports' | 'staff' | 'settings' | 'customers' | 'expenses'
  lastCompletedOrder: Order | null;
  isReceiptModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isSwitchUserModalOpen: boolean;

  // Setters & Actions
  setActiveTab: (tab: string) => void;
  setCurrentUser: (user: User) => void;
  setSelectedTable: (table: string) => void;
  setCustomerName: (name: string) => void;
  setOrderNotes: (notes: string) => void;
  setDiscount: (type: 'percentage' | 'fixed', value: number) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  processPayment: (paymentDetails: PaymentDetails) => { success: boolean; order?: Order; error?: string };
  openReceiptModal: (order: Order) => void;
  closeReceiptModal: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  openSwitchUserModal: () => void;
  closeSwitchUserModal: () => void;

  // CRUD Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => boolean;
  restockProduct: (productId: string, addedStock: number) => void;

  // CRUD Users
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => boolean;
  switchUserWithPin: (pin: string) => boolean;

  // Settings & Tables
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateTableStatus: (tableId: string, status: Table['status'], customer?: string) => void;

  // Backup & Restore
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  PRODUCTS: 'restodash_products_v1',
  USERS: 'restodash_users_v1',
  ORDERS: 'restodash_orders_v1',
  TABLES: 'restodash_tables_v1',
  SETTINGS: 'restodash_settings_v1',
  CURRENT_USER: 'restodash_current_user_v1',
};

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USERS[0];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      return saved ? JSON.parse(saved) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('Meja 05');
  const [customerName, setCustomerName] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('pos');

  // Modals
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState<boolean>(false);

  // Auto-backup to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...settings, lastBackupDate: new Date().toISOString() }));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [products, users, orders, tables, settings, currentUser]);

  const lowStockItems = getLowStockProducts(products);

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    // Check stock limit
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    
    if (currentQtyInCart + quantity > product.stock) {
      alert(`Stok produk "${product.name}" tersisa ${product.stock} ${product.unit}. Tidak dapat menambahkan lebih banyak.`);
      return;
    }

    setCart((prev) => {
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const targetProduct = products.find((p) => p.id === productId);
    if (targetProduct && quantity > targetProduct.stock) {
      alert(`Stok hanya tersedia ${targetProduct.stock} ${targetProduct.unit}.`);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setOrderNotes('');
    setDiscountValue(0);
  };

  const setDiscount = (type: 'percentage' | 'fixed', value: number) => {
    setDiscountType(type);
    setDiscountValue(value);
  };

  // Payment Processing
  const processPayment = (paymentDetails: PaymentDetails): { success: boolean; order?: Order; error?: string } => {
    if (cart.length === 0) {
      return { success: false, error: 'Keranjang pesanan masih kosong.' };
    }

    const totals = calculateOrderTotals(cart, discountType, discountValue, settings.taxRate);
    const dateNow = new Date();
    const dateCode = dateNow.toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const orderNumber = `ORD-${dateCode}-${randNum}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableNumber: selectedTable,
      customerName: customerName.trim() || 'Pelanggan Umum',
      cashierName: currentUser.name,
      cashierId: currentUser.id,
      items: [...cart],
      subtotal: totals.subtotal,
      discountType,
      discountValue,
      discountAmount: totals.discountAmount,
      taxRate: settings.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      payment: paymentDetails,
      timestamp: dateNow.toISOString(),
      notes: orderNotes.trim() || undefined,
      status: 'completed',
    };

    // Deduct stock in real time!
    setProducts((prev) => deductStock(prev, cart));

    // Save completed order
    setOrders((prev) => [newOrder, ...prev]);

    // Update table status if occupied
    setTables((prev) =>
      prev.map((t) => (t.number === selectedTable ? { ...t, status: 'occupied', customerName: newOrder.customerName } : t))
    );

    // Save as last completed order & clear cart
    setLastCompletedOrder(newOrder);
    clearCart();

    // Open receipt modal automatically if configured
    if (settings.autoPrintReceipt) {
      setIsReceiptModalOpen(true);
    }

    return { success: true, order: newOrder };
  };

  const openReceiptModal = (order: Order) => {
    setLastCompletedOrder(order);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
  };

  const openPaymentModal = () => {
    if (cart.length === 0) {
      alert('Tambahkan minimal 1 item ke pesanan untuk melakukan pembayaran.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const openSwitchUserModal = () => setIsSwitchUserModalOpen(true);
  const closeSwitchUserModal = () => setIsSwitchUserModalOpen(false);

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (productId: string): boolean => {
    if (currentUser.role !== 'admin') {
      alert('Hanya akun Admin yang memiliki akses menghapus produk dari inventaris.');
      return false;
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    return true;
  };

  const restockProduct = (productId: string, addedStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + addedStock } : p))
    );
  };

  // User CRUD
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const deleteUser = (userId: string): boolean => {
    if (currentUser.role !== 'admin') {
      alert('Hanya Admin yang dapat menghapus staf.');
      return false;
    }
    if (users.length <= 1) {
      alert('Sistem harus memiliki minimal satu akun pengguna.');
      return false;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return true;
  };

  const switchUserWithPin = (pin: string): boolean => {
    const found = users.find((u) => u.pin === pin && u.active);
    if (found) {
      setCurrentUser(found);
      setIsSwitchUserModalOpen(false);
      return true;
    }
    return false;
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateTableStatus = (tableId: string, status: Table['status'], customer?: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status, customerName: customer } : t))
    );
  };

  // Backup & Restore
  const exportBackupJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeName: settings.storeName,
      products,
      users,
      orders,
      tables,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restoren-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.products || !data.users || !data.orders) {
        throw new Error('Format data backup tidak valid.');
      }
      setProducts(data.products);
      setUsers(data.users);
      setOrders(data.orders);
      if (data.tables) setTables(data.tables);
      if (data.settings) setSettings(data.settings);
      if (data.users.length > 0) setCurrentUser(data.users[0]);
      alert('Pemulihan data backup berhasil!');
      return true;
    } catch (e: any) {
      alert(`Gagal memulihkan backup: ${e.message || 'File tidak valid'}`);
      return false;
    }
  };

  const resetToDefaults = () => {
    if (confirm('Apakah Anda yakin ingin mereset semua data toko ke konfigurasi awal? Semua transaksi tambahan akan dihapus.')) {
      setProducts(INITIAL_PRODUCTS);
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);
      setOrders(INITIAL_ORDERS);
      setTables(INITIAL_TABLES);
      setSettings(INITIAL_SETTINGS);
      setCart([]);
      localStorage.clear();
      alert('Data sistem telah direset ke setelan awal.');
    }
  };

  return (
    <POSContext.Provider
      value={{
        currentUser,
        users,
        products,
        orders,
        tables,
        settings,
        cart,
        selectedTable,
        customerName,
        orderNotes,
        discountType,
        discountValue,
        lowStockItems,
        activeTab,
        lastCompletedOrder,
        isReceiptModalOpen,
        isPaymentModalOpen,
        isSwitchUserModalOpen,
        setActiveTab,
        setCurrentUser,
        setSelectedTable,
        setCustomerName,
        setOrderNotes,
        setDiscount,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        processPayment,
        openReceiptModal,
        closeReceiptModal,
        openPaymentModal,
        closePaymentModal,
        openSwitchUserModal,
        closeSwitchUserModal,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        addUser,
        updateUser,
        deleteUser,
        switchUserWithPin,
        updateSettings,
        updateTableStatus,
        exportBackupJSON,
        importBackupJSON,
        resetToDefaults,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
