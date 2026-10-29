import React, { useRef } from 'react';
import { Printer, Download, CheckCircle, X, Store, Share2 } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatIDR } from '../utils/posLogic';

export const ReceiptModal: React.FC = () => {
  const { isReceiptModalOpen, closeReceiptModal, lastCompletedOrder, settings } = usePOS();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isReceiptModalOpen || !lastCompletedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const o = lastCompletedOrder;
    const lines = [
      '========================================',
      `       ${settings.storeName.toUpperCase()}`,
      `   ${settings.storeTagline}`,
      `   ${settings.address}`,
      `   Telp: ${settings.phone}`,
      '========================================',
      `No. Pesanan : ${o.orderNumber}`,
      `Waktu       : ${new Date(o.timestamp).toLocaleString('id-ID')}`,
      `Kasir       : ${o.cashierName}`,
      `Meja/Tipe   : ${o.tableNumber}`,
      `Pelanggan   : ${o.customerName}`,
      '----------------------------------------',
      ...o.items.map(
        (it) =>
          `${it.product.name}\n  ${it.quantity} x ${formatIDR(it.product.price)} = ${formatIDR(it.product.price * it.quantity)}`
      ),
      '----------------------------------------',
      `Subtotal    : ${formatIDR(o.subtotal)}`,
      o.discountAmount > 0 ? `Diskon      : -${formatIDR(o.discountAmount)}` : '',
      `PPN (${o.taxRate}%)   : ${formatIDR(o.taxAmount)}`,
      '========================================',
      `TOTAL       : ${formatIDR(o.total)}`,
      `Metode      : ${o.payment.method.toUpperCase()}`,
      `Dibayar     : ${formatIDR(o.payment.amountPaid)}`,
      `Kembalian   : ${formatIDR(o.payment.change)}`,
      '========================================',
      `   ${settings.receiptFooterMessage}`,
      '========================================',
    ].filter(Boolean);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `struk-${o.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const orderDate = new Date(lastCompletedOrder.timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const orderTime = new Date(lastCompletedOrder.timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">Pembayaran Berhasil!</h3>
              <p className="text-xs text-indigo-100">Struk otomatis siap dicetak</p>
            </div>
          </div>
          <button
            onClick={closeReceiptModal}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70 flex justify-center">
          <div
            id="printable-receipt"
            ref={receiptRef}
            className="w-full max-w-[340px] bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-slate-800 font-mono text-xs leading-relaxed"
          >
            {/* Store Branding */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-black tracking-wider text-slate-900">{settings.storeName}</h2>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">{settings.storeTagline}</p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">{settings.address}</p>
              <p className="text-[10px] text-slate-500 font-sans">Telp: {settings.phone}</p>
            </div>

            {/* Order Info */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Order</span>
                <span className="font-bold text-slate-800">{lastCompletedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu</span>
                <span>{orderDate}, {orderTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir</span>
                <span className="font-semibold">{lastCompletedOrder.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Meja / Tipe</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-1 rounded">{lastCompletedOrder.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan</span>
                <span>{lastCompletedOrder.customerName}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              {lastCompletedOrder.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                    <span className="line-clamp-1">{item.product.name}</span>
                    <span>{formatIDR(item.product.price * item.quantity)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                    <span>
                      {item.quantity} {item.product.unit} x {formatIDR(item.product.price)}
                    </span>
                    {item.note && <span className="italic text-amber-600 text-[9px] font-mono">({item.note})</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatIDR(lastCompletedOrder.subtotal)}</span>
              </div>
              {lastCompletedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon</span>
                  <span>-{formatIDR(lastCompletedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>PPN ({lastCompletedOrder.taxRate}%)</span>
                <span>{formatIDR(lastCompletedOrder.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>TOTAL AKHIR</span>
                <span className="text-indigo-600">{formatIDR(lastCompletedOrder.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar</span>
                <span className="font-bold uppercase text-slate-800">{lastCompletedOrder.payment.method.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Diterima</span>
                <span>{formatIDR(lastCompletedOrder.payment.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Kembalian</span>
                <span className="text-emerald-600">{formatIDR(lastCompletedOrder.payment.change)}</span>
              </div>
            </div>

            {/* Simulated Barcode & QR Code */}
            <div className="pt-3 text-center space-y-2">
              {/* Barcode Strip */}
              <div className="flex justify-center items-center gap-[2px] h-8 px-4 opacity-75">
                {[...Array(38)].map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-slate-900"
                    style={{
                      width: i % 4 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '1px',
                      opacity: i % 5 === 0 ? 0.3 : 1,
                    }}
                  />
                ))}
              </div>
              <p className="text-[9px] tracking-widest text-slate-400">*{lastCompletedOrder.orderNumber}*</p>
              <p className="text-[10px] text-slate-500 font-sans italic pt-1">
                {settings.receiptFooterMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk (Print)</span>
          </button>

          <button
            onClick={handleDownloadText}
            title="Unduh Teks Struk"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={closeReceiptModal}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs transition-colors whitespace-nowrap"
          >
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};
