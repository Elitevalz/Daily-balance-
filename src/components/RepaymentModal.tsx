import React, { useState } from 'react';
import { X, Check, Banknote, ArrowDownCircle } from 'lucide-react';
import { Customer, PaymentMethod, ShopSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onRecordRepayment: (
    customerId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    note?: string
  ) => void;
  settings: ShopSettings;
}

export const RepaymentModal: React.FC<RepaymentModalProps> = ({
  isOpen,
  onClose,
  customer,
  onRecordRepayment,
  settings,
}) => {
  if (!isOpen || !customer) return null;

  const [amount, setAmount] = useState<string>(String(customer.balance));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState<string>('');

  const numericAmount = parseFloat(amount) || 0;
  const remainingBalance = Math.max(0, customer.balance - numericAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    onRecordRepayment(
      customer.id,
      numericAmount,
      paymentMethod,
      note.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Record Debt Repayment</h2>
              <p className="text-xs text-slate-500">Collect money owed by {customer.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Customer Debt Stat */}
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-800 font-medium">Current Debt Owed</div>
              <div className="text-xl font-bold font-mono-numbers text-amber-900 mt-0.5">
                {formatCurrency(customer.balance, settings.currencyCode)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAmount(String(customer.balance))}
              className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors"
            >
              Pay Full
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Repayment Amount ({settings.currencyCode}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                {formatCurrency(0, settings.currencyCode).slice(0, 1)}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                max={customer.balance * 2}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-lg font-bold font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            {/* Quick partial buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[500, 1000, 2000, 5000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setAmount(String(quick))}
                  className="px-2 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono-numbers"
                >
                  {formatCurrency(quick, settings.currencyCode)}
                </button>
              ))}
            </div>
          </div>

          {/* Balance Preview */}
          <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600">Remaining Balance After Payment:</span>
            <span className="font-bold font-mono-numbers text-slate-900">
              {formatCurrency(remainingBalance, settings.currencyCode)}
            </span>
          </div>

          {/* Channel: Cash vs Bank Transfer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Method Received
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">Cash (Drawer)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Adds to Shop Cash</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">Bank Transfer</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Sent directly to bank</p>
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cleared 50% of outstanding balance"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={numericAmount <= 0}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-[0.98] ${
                numericAmount <= 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              Record Repayment of {formatCurrency(numericAmount, settings.currencyCode)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
