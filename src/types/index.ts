export type Role = 'admin' | 'kasir' | 'manager_gudang';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  pin: string;
  avatar: string;
  email: string;
  phone: string;
  active: boolean;
}

export type Category = 'Semua' | 'Makanan Utama' | 'Minuman' | 'Camilan & Starters' | 'Dessert' | 'Paket Hemat';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Category;
  costPrice: number;    // Harga Modal / HPP
  price: number;        // Harga Jual
  stock: number;        // Stok saat ini
  minStockAlert: number;// Batas stok menipis
  unit: string;         // porsi, pcs, cup, piring
  image: string;
  isPopular?: boolean;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}

export type PaymentMethod = 'qris' | 'cash' | 'transfer_bca' | 'transfer_mandiri' | 'ewallet_gopay' | 'ewallet_ovo' | 'debit_kredit';

export interface PaymentDetails {
  method: PaymentMethod;
  amountPaid: number;
  change: number;
  referenceNumber?: string;
  status: 'paid' | 'pending' | 'failed';
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string; // e.g. "Meja 05", "Takeaway", "Delivery"
  customerName: string;
  cashierName: string;
  cashierId: string;
  items: CartItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number; // e.g. 0.10 for 10%
  taxAmount: number;
  total: number;
  payment: PaymentDetails;
  timestamp: string; // ISO
  notes?: string;
  status: 'completed' | 'draft' | 'cancelled';
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  activeOrderId?: string;
  customerName?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  address: string;
  phone: string;
  taxRate: number; // in percentage e.g. 10
  currency: string;
  receiptFooterMessage: string;
  autoPrintReceipt: boolean;
  lowStockThresholdDefault: number;
  lastBackupDate?: string;
}
