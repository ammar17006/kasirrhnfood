import React, { useState } from 'react';
import {
  X,
  QrCode,
  Banknote,
  Building2,
  Smartphone,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { calculateOrderTotals, calculateChange, formatIDR } from '../utils/posLogic';
import { PaymentMethod, PaymentDetails } from '../types';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    cart,
    discountType,
    discountValue,
    settings,
    processPayment,
  } = usePOS();

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('qris');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [copiedVA, setCopiedVA] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isPaymentModalOpen) return null;

  const totals = calculateOrderTotals(cart, discountType, discountValue, settings.taxRate);
  const changeInfo = calculateChange(totals.total, cashAmount);

  // Quick cash amount presets
  const quickCashPresets = [
    { label: 'Uang Pas', amount: totals.total },
    { label: 'Rp 50.000', amount: 50000 },
    { label: 'Rp 100.000', amount: 100000 },
    { label: 'Rp 200.000', amount: 200000 },
    { label: 'Rp 500.000', amount: 500000 },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVA(text);
    setTimeout(() => setCopiedVA(null), 2000);
  };

  const handleConfirmPayment = () => {
    if (activeMethod === 'cash' && cashAmount < totals.total) {
      alert('Nominal uang tunai yang diterima kurang dari total tagihan.');
      return;
    }

    setIsProcessing(true);

    const paymentDetails: PaymentDetails = {
      method: activeMethod,
      amountPaid: activeMethod === 'cash' ? cashAmount : totals.total,
      change: activeMethod === 'cash' ? changeInfo.change : 0,
      referenceNumber:
        activeMethod === 'qris'
          ? `QRIS-${Date.now().toString().slice(-6)}`
          : activeMethod.startsWith('transfer')
          ? `VA-${Date.now().toString().slice(-7)}`
          : activeMethod.startsWith('ewallet')
          ? `EW-${Date.now().toString().slice(-6)}`
          : undefined,
      status: 'paid',
    };

    setTimeout(() => {
      setIsProcessing(false);
      closePaymentModal();
      processPayment(paymentDetails);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Pilih Metode Pembayaran</h3>
            <p className="text-xs text-slate-500">Mendukung QRIS, Tunai, Transfer Bank, dan E-Wallet</p>
          </div>
          <button
            onClick={closePaymentModal}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Amount Banner */}
        <div className="bg-indigo-50/70 border-b border-indigo-100/60 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Total Tagihan</span>
            <div className="text-2xl font-black text-indigo-900">{formatIDR(totals.total)}</div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Subtotal: {formatIDR(totals.subtotal)}</div>
            {totals.discountAmount > 0 && <div className="text-emerald-600 font-semibold">Diskon: -{formatIDR(totals.discountAmount)}</div>}
            <div>PPN ({settings.taxRate}%): {formatIDR(totals.taxAmount)}</div>
          </div>
        </div>

        {/* Content Body: Tabs & Forms */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* Methods Selector Tabs */}
          <div className="w-full md:w-52 space-y-1.5 shrink-0">
            <button
              onClick={() => setActiveMethod('qris')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                activeMethod === 'qris'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <div>
                <div>QRIS Dinamis</div>
                <div className={`text-[10px] font-normal ${activeMethod === 'qris' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  BCA, Gopay, OVO, Dana
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveMethod('cash');
                if (cashAmount === 0) setCashAmount(totals.total);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                activeMethod === 'cash'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Banknote className="w-4 h-4 shrink-0" />
              <div>
                <div>Uang Tunai (Cash)</div>
                <div className={`text-[10px] font-normal ${activeMethod === 'cash' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  Hitung kembalian otomatis
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveMethod('transfer_bca')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                activeMethod === 'transfer_bca'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <div>
                <div>Virtual Account</div>
                <div className={`text-[10px] font-normal ${activeMethod === 'transfer_bca' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  BCA, Mandiri, BRI
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveMethod('ewallet_gopay')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                activeMethod === 'ewallet_gopay'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <div>
                <div>E-Wallet</div>
                <div className={`text-[10px] font-normal ${activeMethod === 'ewallet_gopay' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  GoPay, OVO, ShopeePay
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveMethod('debit_kredit')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all ${
                activeMethod === 'debit_kredit'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <div>
                <div>Kartu Debit / EDC</div>
                <div className={`text-[10px] font-normal ${activeMethod === 'debit_kredit' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  Swipe / Dip EDC
                </div>
              </div>
            </button>
          </div>

          {/* Right Active Method Content */}
          <div className="flex-1 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 flex flex-col justify-center">
            {/* QRIS METHOD */}
            {activeMethod === 'qris' && (
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/80 text-red-700 text-xs font-bold">
                  <span>QRIS Standar Pembayaran Nasional</span>
                </div>
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-indigo-300 shadow-md flex flex-col items-center justify-between relative group">
                  <div className="text-[10px] font-bold tracking-widest text-slate-600">NMID: ID10200839210</div>
                  {/* Visual QR Code Pattern */}
                  <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-wrap gap-1 items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:8px_8px] opacity-80" />
                    <div className="absolute top-2 left-2 w-7 h-7 border-4 border-white bg-slate-900 rounded" />
                    <div className="absolute top-2 right-2 w-7 h-7 border-4 border-white bg-slate-900 rounded" />
                    <div className="absolute bottom-2 left-2 w-7 h-7 border-4 border-white bg-slate-900 rounded" />
                    <div className="z-10 bg-white p-1 rounded-md shadow-xs">
                      <QrCode className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">Scan via BCA, GoPay, OVO, DANA</div>
                </div>
                <p className="text-xs text-slate-600">
                  Pelanggan scan barcode di atas, transaksi otomatis terverifikasi secara instan.
                </p>
              </div>
            )}

            {/* CASH METHOD */}
            {activeMethod === 'cash' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nominal Uang Tunai Diterima:
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={cashAmount || ''}
                      onChange={(e) => setCashAmount(Number(e.target.value))}
                      placeholder="Masukkan jumlah uang"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {quickCashPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCashAmount(preset.amount)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        cashAmount === preset.amount
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Change display */}
                <div className={`p-4 rounded-xl border ${changeInfo.isSufficient ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Kembalian:</span>
                    <span className={`text-lg font-black ${changeInfo.isSufficient ? 'text-emerald-700' : 'text-red-600'}`}>
                      {changeInfo.isSufficient ? formatIDR(changeInfo.change) : 'Uang Kurang!'}
                    </span>
                  </div>
                  {!changeInfo.isSufficient && (
                    <p className="text-[11px] text-red-600 mt-1">
                      Kurang {formatIDR(totals.total - cashAmount)} untuk menyelesaikan pembayaran.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* VIRTUAL ACCOUNT / TRANSFER */}
            {activeMethod === 'transfer_bca' && (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-800">BCA Virtual Account</span>
                    <button
                      onClick={() => handleCopy('82710892019283')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                    >
                      {copiedVA === '82710892019283' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedVA === '82710892019283' ? 'Tersalin' : 'Salin VA'}
                    </button>
                  </div>
                  <div className="font-mono text-base font-bold text-slate-800">8271 0892 0192 83</div>
                  <div className="text-[11px] text-slate-400">Atas Nama: RestoDash Cafe</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-yellow-800">Mandiri VA</span>
                    <button
                      onClick={() => handleCopy('8890123901923')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                    >
                      {copiedVA === '8890123901923' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedVA === '8890123901923' ? 'Tersalin' : 'Salin VA'}
                    </button>
                  </div>
                  <div className="font-mono text-base font-bold text-slate-800">8890 1239 0192 3</div>
                </div>
              </div>
            )}

            {/* E-WALLET */}
            {activeMethod === 'ewallet_gopay' && (
              <div className="space-y-3 text-center">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-emerald-600 flex flex-col items-center gap-1">
                    <span className="text-sm">GoPay</span>
                    <span className="text-[9px] text-slate-400">Tersedia</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-purple-600 flex flex-col items-center gap-1">
                    <span className="text-sm">OVO</span>
                    <span className="text-[9px] text-slate-400">Tersedia</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-orange-600 flex flex-col items-center gap-1">
                    <span className="text-sm">ShopeePay</span>
                    <span className="text-[9px] text-slate-400">Tersedia</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Kirim permintaan pembayaran ke nomor ponsel pelanggan atau buka barcode dompet digital mereka.
                </p>
              </div>
            )}

            {/* EDC */}
            {activeMethod === 'debit_kredit' && (
              <div className="text-center space-y-2 py-4">
                <CreditCard className="w-12 h-12 text-indigo-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">Mesin EDC Siap</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Silakan gesek atau masukkan kartu debit/kredit pelanggan pada mesin EDC kasir.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={closePaymentModal}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
          >
            Batal
          </button>

          <button
            disabled={isProcessing || (activeMethod === 'cash' && !changeInfo.isSufficient)}
            onClick={handleConfirmPayment}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isProcessing ? (
              <span>Memproses Pembayaran...</span>
            ) : (
              <>
                <span>Selesaikan Pembayaran ({formatIDR(totals.total)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
