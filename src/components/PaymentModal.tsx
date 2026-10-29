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
  Sparkles,
  Zap,
  RotateCcw,
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
    selectedTable,
    customerName,
  } = usePOS();

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('qris');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [copiedVA, setCopiedVA] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [qrisScanSimulated, setQrisScanSimulated] = useState<boolean>(false);

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

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setCashAmount(0);
    } else if (val === '000') {
      setCashAmount((prev) => (prev ? prev * 1000 : 0));
    } else if (val === '⌫') {
      setCashAmount((prev) => Math.floor(prev / 10));
    } else {
      const num = parseInt(val, 10);
      setCashAmount((prev) => (prev ? prev * 10 + num : num));
    }
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
          ? `QRIS-REN-${Date.now().toString().slice(-6)}`
          : activeMethod.startsWith('transfer')
          ? `VA-REN-${Date.now().toString().slice(-7)}`
          : activeMethod.startsWith('ewallet')
          ? `EW-REN-${Date.now().toString().slice(-6)}`
          : `EDC-${Date.now().toString().slice(-6)}`,
      status: 'paid',
    };

    setTimeout(() => {
      setIsProcessing(false);
      closePaymentModal();
      processPayment(paymentDetails);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[94vh] border border-slate-100">
        {/* Modern Sleek Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white tracking-tight">Kasir Pembayaran</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
                  {selectedTable}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {customerName ? `Pelanggan: ${customerName}` : 'RestoRen POS Smart Settle'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total Tagihan</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {formatIDR(totals.total)}
              </div>
            </div>

            <button
              onClick={closePaymentModal}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split Methods & Interactive Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-5 bg-slate-50/60">
          {/* Methods Selector Tabs */}
          <div className="w-full md:w-56 space-y-2 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Metode Pembayaran
            </p>

            <button
              onClick={() => setActiveMethod('qris')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                activeMethod === 'qris'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  activeMethod === 'qris' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'
                }`}
              >
                <QrCode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight">QRIS Dinamis</div>
                <div className={`text-[10px] ${activeMethod === 'qris' ? 'text-indigo-100' : 'text-slate-400'} truncate`}>
                  Scan BCA, GoPay, DANA
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveMethod('cash');
                if (cashAmount === 0) setCashAmount(totals.total);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                activeMethod === 'cash'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  activeMethod === 'cash' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <Banknote className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight">Uang Tunai (Cash)</div>
                <div className={`text-[10px] ${activeMethod === 'cash' ? 'text-emerald-100' : 'text-slate-400'} truncate`}>
                  Hitung kembalian cepat
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveMethod('transfer_bca')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                activeMethod === 'transfer_bca'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  activeMethod === 'transfer_bca' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight">Transfer & VA</div>
                <div className={`text-[10px] ${activeMethod === 'transfer_bca' ? 'text-blue-100' : 'text-slate-400'} truncate`}>
                  BCA, Mandiri, BRI
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveMethod('ewallet_gopay')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                activeMethod === 'ewallet_gopay'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  activeMethod === 'ewallet_gopay' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight">E-Wallet</div>
                <div className={`text-[10px] ${activeMethod === 'ewallet_gopay' ? 'text-purple-100' : 'text-slate-400'} truncate`}>
                  GoPay, OVO, ShopeePay
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveMethod('debit_kredit')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                activeMethod === 'debit_kredit'
                  ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md ring-2 ring-slate-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  activeMethod === 'debit_kredit' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight">Mesin EDC / Kartu</div>
                <div className={`text-[10px] ${activeMethod === 'debit_kredit' ? 'text-slate-300' : 'text-slate-400'} truncate`}>
                  Debit & Kredit Card
                </div>
              </div>
            </button>
          </div>

          {/* Right Interactive Payment Details Area */}
          <div className="flex-1 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            {/* 1. QRIS METHOD */}
            {activeMethod === 'qris' && (
              <div className="flex flex-col items-center justify-center text-center py-2 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>QRIS Nasional RestoRen</span>
                </div>

                {/* Animated QR Code Container */}
                <div className="relative w-52 h-52 bg-white p-3 rounded-3xl border-2 border-indigo-200 shadow-lg flex flex-col items-center justify-between overflow-hidden">
                  {/* Laser scan line effect */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-scan-laser pointer-events-none z-20" />

                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    NMID: ID10200839210
                  </div>

                  <div className="w-36 h-36 bg-slate-900 rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:8px_8px] opacity-80" />
                    <div className="absolute top-2 left-2 w-7 h-7 border-4 border-white bg-slate-900 rounded" />
                    <div className="absolute top-2 right-2 w-7 h-7 border-4 border-white bg-slate-900 rounded" />
                    <div className="absolute bottom-2 left-2 w-7 h-7 border-4 border-white bg-slate-900 rounded" />
                    <div className="z-10 bg-white p-1 rounded-lg shadow-sm">
                      <QrCode className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>

                  <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <span>RestoRen Cafe & Bistro</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 max-w-xs">
                  Scan kode QR di atas menggunakan aplikasi m-Banking (BCA, Mandiri, BRI) atau e-Wallet (GoPay, OVO, DANA).
                </div>

                <button
                  onClick={() => {
                    setQrisScanSimulated(true);
                    setTimeout(() => handleConfirmPayment(), 300);
                  }}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{qrisScanSimulated ? 'Terverifikasi!' : 'Simulasi Pembayaran Pelanggan Berhasil'}</span>
                </button>
              </div>
            )}

            {/* 2. CASH / UANG TUNAI METHOD */}
            {activeMethod === 'cash' && (
              <div className="space-y-4">
                {/* Nominal Input & Change Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Uang Tunai Diterima:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        value={cashAmount || ''}
                        onChange={(e) => setCashAmount(Number(e.target.value))}
                        className="w-full text-lg font-black text-slate-900 bg-transparent focus:outline-hidden"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-2xl border transition-all ${
                      changeInfo.isSufficient
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                        : 'bg-red-50/90 border-red-200 text-red-900'
                    }`}
                  >
                    <span className="text-[11px] font-bold block mb-0.5">
                      {changeInfo.isSufficient ? 'Uang Kembalian:' : 'Uang Masih Kurang:'}
                    </span>
                    <div className="text-lg font-black">
                      {changeInfo.isSufficient
                        ? formatIDR(changeInfo.change)
                        : formatIDR(totals.total - cashAmount)}
                    </div>
                  </div>
                </div>

                {/* Quick Presets Buttons */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Nominal Cepat:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {quickCashPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashAmount(preset.amount)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                          cashAmount === preset.amount
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Touchscreen Numeric Keypad */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {['1', '2', '3', '000', '4', '5', '6', 'C', '7', '8', '9', '⌫', '0'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeypadPress(k)}
                      className={`py-2.5 rounded-xl text-sm font-black transition-all ${
                        k === 'C'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 col-span-1'
                          : k === '⌫'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : k === '0'
                          ? 'col-span-2 bg-slate-100 text-slate-800 hover:bg-slate-200'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. VIRTUAL ACCOUNT / TRANSFER */}
            {activeMethod === 'transfer_bca' && (
              <div className="space-y-3 py-1">
                <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200/70 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-900">BCA Virtual Account</span>
                    <button
                      onClick={() => handleCopy('82710892019283')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200"
                    >
                      {copiedVA === '82710892019283' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedVA === '82710892019283' ? 'Tersalin' : 'Salin Nomor'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-lg font-black text-slate-900 tracking-wider">
                    8271 0892 0192 83
                  </div>
                  <div className="text-[11px] text-slate-500">Atas Nama: RestoRen Sentral</div>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/70 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-900">Mandiri Virtual Account</span>
                    <button
                      onClick={() => handleCopy('8890123901923')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200"
                    >
                      {copiedVA === '8890123901923' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedVA === '8890123901923' ? 'Tersalin' : 'Salin Nomor'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-lg font-black text-slate-900 tracking-wider">
                    8890 1239 0192 3
                  </div>
                  <div className="text-[11px] text-slate-500">Atas Nama: RestoRen Sentral</div>
                </div>
              </div>
            )}

            {/* 4. E-WALLET */}
            {activeMethod === 'ewallet_gopay' && (
              <div className="space-y-4 py-2 text-center">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col items-center">
                    <span className="font-black text-emerald-700 text-sm">GoPay</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Auto Notify</span>
                  </div>
                  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl flex flex-col items-center">
                    <span className="font-black text-purple-700 text-sm">OVO</span>
                    <span className="text-[10px] text-purple-600 font-semibold mt-0.5">Push Notif</span>
                  </div>
                  <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-2xl flex flex-col items-center">
                    <span className="font-black text-orange-700 text-sm">ShopeePay</span>
                    <span className="text-[10px] text-orange-600 font-semibold mt-0.5">Barcode Scan</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Ponsel Pelanggan:
                  </label>
                  <input
                    type="text"
                    placeholder="0812-XXXX-XXXX"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Permintaan pembayaran akan dikirim langsung ke aplikasi e-Wallet pelanggan.
                  </p>
                </div>
              </div>
            )}

            {/* 5. EDC / KARTU */}
            {activeMethod === 'debit_kredit' && (
              <div className="text-center space-y-3 py-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-800">Mesin EDC Siap Transaksi</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Silakan gesek atau masukkan kartu debit/kredit pelanggan pada terminal EDC kasir Anda.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={closePaymentModal}
            className="px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
          >
            Batal
          </button>

          <button
            disabled={isProcessing || (activeMethod === 'cash' && !changeInfo.isSufficient)}
            onClick={handleConfirmPayment}
            className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memproses Pembayaran...</span>
              </span>
            ) : (
              <>
                <span>Selesaikan Transaksi ({formatIDR(totals.total)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
