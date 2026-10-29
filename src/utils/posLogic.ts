import { CartItem, Product, Order, StoreSettings } from '../types';

export function calculateOrderTotals(
  items: CartItem[],
  discountType: 'percentage' | 'fixed' = 'fixed',
  discountValue: number = 0,
  taxRatePercent: number = 10
) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100);
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * (taxRatePercent / 100)));
  const total = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
}

export function calculateChange(total: number, amountPaid: number): { change: number; isSufficient: boolean } {
  const change = amountPaid - total;
  return {
    change: Math.max(0, change),
    isSufficient: amountPaid >= total,
  };
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.stock <= p.minStockAlert);
}

export function deductStock(products: Product[], cartItems: CartItem[]): Product[] {
  const itemMap = new Map<string, number>();
  cartItems.forEach((item) => {
    itemMap.set(item.product.id, (itemMap.get(item.product.id) || 0) + item.quantity);
  });

  return products.map((product) => {
    const qtyToDeduct = itemMap.get(product.id) || 0;
    if (qtyToDeduct > 0) {
      return {
        ...product,
        stock: Math.max(0, product.stock - qtyToDeduct),
      };
    }
    return product;
  });
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface AnalyticsSummary {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalGrossProfit: number;
  avgOrderValue: number;
  hourlySales: { hour: string; sales: number; count: number }[];
  categorySales: { category: string; sales: number; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number; image: string }[];
  paymentDistribution: { method: string; label: string; count: number; total: number }[];
}

export function calculateAnalytics(orders: Order[], products: Product[]): AnalyticsSummary {
  const completedOrders = orders.filter((o) => o.status === 'completed');
  
  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = completedOrders.length;
  const totalCustomers = new Set(completedOrders.map((o) => o.customerName || o.orderNumber)).size;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // Calculate gross profit (Revenue - HPP)
  const productCostMap = new Map<string, number>();
  products.forEach((p) => productCostMap.set(p.id, p.costPrice));

  let totalCost = 0;
  completedOrders.forEach((o) => {
    o.items.forEach((item) => {
      const cost = productCostMap.get(item.product.id) ?? (item.product.costPrice || item.product.price * 0.5);
      totalCost += cost * item.quantity;
    });
  });
  const totalGrossProfit = Math.max(0, totalSales - totalCost);

  // Hourly sales (standard business hours 08:00 to 22:00 plus any active order hours)
  const hourBuckets: { [hour: string]: { sales: number; count: number } } = {};
  for (let h = 8; h <= 22; h++) {
    const key = `${h.toString().padStart(2, '0')}:00`;
    hourBuckets[key] = { sales: 0, count: 0 };
  }

  completedOrders.forEach((order) => {
    try {
      const date = new Date(order.timestamp);
      const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
      if (!hourBuckets[hour]) {
        hourBuckets[hour] = { sales: 0, count: 0 };
      }
      hourBuckets[hour].sales += order.total;
      hourBuckets[hour].count += 1;
    } catch {
      // fallback
    }
  });

  const hourlySales = Object.entries(hourBuckets)
    .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
    .map(([hour, data]) => ({
      hour,
      sales: data.sales,
      count: data.count,
    }));

  // Category sales & Top products
  const categoryMap: { [cat: string]: { sales: number; count: number } } = {};
  const productQtyMap: { [id: string]: { name: string; quantity: number; revenue: number; image: string } } = {};

  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const cat = item.product.category;
      if (!categoryMap[cat]) categoryMap[cat] = { sales: 0, count: 0 };
      categoryMap[cat].sales += item.product.price * item.quantity;
      categoryMap[cat].count += item.quantity;

      const pid = item.product.id;
      if (!productQtyMap[pid]) {
        productQtyMap[pid] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
          image: item.product.image,
        };
      }
      productQtyMap[pid].quantity += item.quantity;
      productQtyMap[pid].revenue += item.product.price * item.quantity;
    });
  });

  const categorySales = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    sales: data.sales,
    count: data.count,
  })).sort((a, b) => b.sales - a.sales);

  const topProducts = Object.values(productQtyMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Payment distribution
  const paymentLabels: Record<string, string> = {
    qris: 'QRIS',
    cash: 'Tunai',
    transfer_bca: 'Transfer BCA',
    transfer_mandiri: 'Transfer Mandiri',
    ewallet_gopay: 'GoPay',
    ewallet_ovo: 'OVO',
    debit_kredit: 'Kartu Debit/Kredit',
  };

  const paymentMethodMap: Record<string, { count: number; total: number }> = {};
  completedOrders.forEach((o) => {
    const method = o.payment.method;
    if (!paymentMethodMap[method]) {
      paymentMethodMap[method] = { count: 0, total: 0 };
    }
    paymentMethodMap[method].count += 1;
    paymentMethodMap[method].total += o.total;
  });

  const paymentDistribution = Object.entries(paymentMethodMap).map(([method, data]) => ({
    method,
    label: paymentLabels[method] || method,
    count: data.count,
    total: data.total,
  })).sort((a, b) => b.total - a.total);

  return {
    totalSales,
    totalOrders,
    totalCustomers,
    totalGrossProfit,
    avgOrderValue,
    hourlySales,
    categorySales,
    topProducts,
    paymentDistribution,
  };
}

export function generateSalesCSV(orders: Order[]): string {
  const headers = [
    'No Pesanan',
    'Tanggal & Waktu',
    'Kasir',
    'Pelanggan / Meja',
    'Metode Pembayaran',
    'Subtotal',
    'Diskon',
    'Pajak',
    'Total',
    'Status',
    'Detail Item'
  ];

  const rows = orders.map((o) => {
    const itemsSummary = o.items.map((i) => `${i.product.name} (${i.quantity}x)`).join('; ');
    return [
      `"${o.orderNumber}"`,
      `"${new Date(o.timestamp).toLocaleString('id-ID')}"`,
      `"${o.cashierName}"`,
      `"${o.tableNumber} - ${o.customerName || 'Umum'}"`,
      `"${o.payment.method}"`,
      o.subtotal,
      o.discountAmount,
      o.taxAmount,
      o.total,
      `"${o.status}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function generateInventoryCSV(products: Product[]): string {
  const headers = [
    'SKU',
    'Nama Produk',
    'Kategori',
    'Harga Modal (HPP)',
    'Harga Jual',
    'Stok Saat Ini',
    'Batas Min. Stok',
    'Satuan',
    'Status Stok'
  ];

  const rows = products.map((p) => {
    const status = p.stock === 0 ? 'Habis' : p.stock <= p.minStockAlert ? 'Menipis' : 'Aman';
    return [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.costPrice,
      p.price,
      p.stock,
      p.minStockAlert,
      `"${p.unit}"`,
      `"${status}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
