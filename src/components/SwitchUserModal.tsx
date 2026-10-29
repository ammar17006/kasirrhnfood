import React, { useState } from 'react';
import { X, Lock, KeyRound, Check, ShieldAlert } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const SwitchUserModal: React.FC = () => {
  const {
    isSwitchUserModalOpen,
    closeSwitchUserModal,
    users,
    currentUser,
    setCurrentUser,
    switchUserWithPin,
  } = usePOS();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>(currentUser.id);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isSwitchUserModalOpen) return null;

  const handleKeyClick = (digit: string) => {
    if (enteredPin.length < 6) {
      setEnteredPin((prev) => prev + digit);
      setErrorMessage('');
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setEnteredPin('');
    setErrorMessage('');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetUser = users.find((u) => u.id === selectedUser);
    if (!targetUser) return;

    if (targetUser.pin === enteredPin) {
      setCurrentUser(targetUser);
      closeSwitchUserModal();
      setEnteredPin('');
      setErrorMessage('');
    } else {
      setErrorMessage('PIN Kasir salah! Silakan coba lagi.');
      setEnteredPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Autentikasi & Ganti Kasir</h3>
              <p className="text-[11px] text-slate-400">Pilih staf & masukkan PIN</p>
            </div>
          </div>
          <button
            onClick={closeSwitchUserModal}
            className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Selection List */}
        <div className="py-4">
          <label className="text-xs font-bold text-slate-600 mb-2 block">Pilih Akun Staf:</label>
          <div className="grid grid-cols-3 gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUser(u.id);
                  setEnteredPin('');
                  setErrorMessage('');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                  selectedUser === u.id
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-8 h-8 rounded-full object-cover mb-1 border border-white shadow-2xs"
                />
                <span className="text-[11px] font-bold truncate w-full">{u.name.split(' ')[0]}</span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PIN Display */}
        <div className="py-2 text-center">
          <div className="flex justify-center gap-3 my-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  enteredPin.length > idx ? 'bg-indigo-600 scale-110' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          {errorMessage && (
            <p className="text-xs text-red-500 font-semibold mt-1 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> {errorMessage}
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-1">
            Demo PIN: Admin <span className="font-mono font-bold text-slate-600">1234</span> • Kasir{' '}
            <span className="font-mono font-bold text-slate-600">0000</span>
          </p>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 py-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (k === 'C') handleClear();
                else if (k === '⌫') handleBackspace();
                else handleKeyClick(k);
              }}
              className="py-3 bg-slate-50 hover:bg-slate-100 active:bg-indigo-100 rounded-xl font-bold text-base text-slate-700 transition-colors shadow-2xs"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={() => handleLogin()}
          disabled={enteredPin.length === 0}
          className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 transition-all"
        >
          <KeyRound className="w-4 h-4" />
          <span>Verifikasi & Masuk</span>
        </button>
      </div>
    </div>
  );
};
