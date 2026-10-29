import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotals,
  calculateChange,
  getLowStockProducts,
  deductStock,
  formatIDR,
  calculateAnalytics
} from './posLogic';
import { Product, CartItem, Order } from '../types';

const dummyProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'FOD-001',
    name: 'Grilled Chicken',
    category: 'Makanan Utama',
    costPrice: 25000,
    price: 45000,
    stock: 12,
    minStockAlert: 5,
    unit: 'porsi',
    image: '',
  },
  {
    id: 'prod-2',
    sku: 'FOD-002',
    name: 'French Fries',
    category: 'Camilan & Starters',
    costPrice: 8000,
    price: 18000,
    stock: 3, // Low stock (< 5)
    minStockAlert: 5,
    unit: 'porsi',
    image: '',
  },
];

test('calculateOrderTotals correctly computes subtotal, tax, and discount', () => {
  const items: CartItem[] = [
    { product: dummyProducts[0], quantity: 2 }, // 2 x 45,000 = 90,000
    { product: dummyProducts[1], quantity: 1 }, // 1 x 18,000 = 18,000
  ];
  // Subtotal: 108,000
  // Discount: 10% = 10,800
  // Taxable: 97,200
  // Tax 10%: 9,720
  // Total: 106,920
  const totals = calculateOrderTotals(items, 'percentage', 10, 10);
  assert.equal(totals.subtotal, 108000);
  assert.equal(totals.discountAmount, 10800);
  assert.equal(totals.taxAmount, 9720);
  assert.equal(totals.total, 106920);
});

test('calculateChange handles sufficient and insufficient cash payments', () => {
  const res1 = calculateChange(50000, 100000);
  assert.equal(res1.isSufficient, true);
  assert.equal(res1.change, 50000);

  const res2 = calculateChange(50000, 30000);
  assert.equal(res2.isSufficient, false);
  assert.equal(res2.change, 0);
});

test('getLowStockProducts returns items at or below alert threshold', () => {
  const lowItems = getLowStockProducts(dummyProducts);
  assert.equal(lowItems.length, 1);
  assert.equal(lowItems[0].id, 'prod-2');
});

test('deductStock accurately decreases product stock', () => {
  const items: CartItem[] = [
    { product: dummyProducts[0], quantity: 2 },
  ];
  const updated = deductStock(dummyProducts, items);
  const chicken = updated.find((p) => p.id === 'prod-1');
  assert.equal(chicken?.stock, 10); // 12 - 2 = 10
});

test('formatIDR formats currency numbers cleanly', () => {
  const formatted = formatIDR(50000);
  assert.match(formatted, /Rp/);
  assert.match(formatted, /50\.000/);
});

test('calculateAnalytics calculates totals and profit correctly', () => {
  const orders: Order[] = [
    {
      id: 'ord-1',
      orderNumber: 'ORD-101',
      tableNumber: 'Meja 01',
      customerName: 'Budi',
      cashierName: 'Admin',
      cashierId: 'user-1',
      items: [{ product: dummyProducts[0], quantity: 2 }], // 90,000 revenue, 50,000 cost
      subtotal: 90000,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxRate: 10,
      taxAmount: 9000,
      total: 99000,
      payment: { method: 'qris', amountPaid: 99000, change: 0, status: 'paid' },
      timestamp: '2026-10-28T12:00:00Z',
      status: 'completed',
    },
  ];

  const analytics = calculateAnalytics(orders, dummyProducts);
  assert.equal(analytics.totalSales, 99000);
  assert.equal(analytics.totalOrders, 1);
  assert.equal(analytics.totalGrossProfit, 49000); // 99000 - 50000 cost = 49000
});
