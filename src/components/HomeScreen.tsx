import React, { useState } from 'react';
import { 
  PlusCircle, 
  BookUser, 
  Wallet, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Clock, 
  Banknote, 
  CreditCard,
  Building2,
  Sparkles
} from 'lucide-react';
import { 
  Customer, 
  SaleRecord, 
  ShopSettings, 
  CashFlowEntry, 
  DebtTransaction 
} from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface HomeScreenProps {
  sales: SaleRecord[];
  customers: Customer[];
  cashFlows: CashFlowEntry[];
  debtTransactions: DebtTransaction[];
  startingShopCash: number;
  startingPosFloat: number;
  onOpenNewSale: () => void;
  onNavigateToTab: (tab: 'debts' | 'cash-float' | 'daily-close') => void;
  onDeleteSale: (saleId: string) => void;
  settings: ShopSettings;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  sales,
  customers,
  cashFlows,
  debtTransactions,
  startingShopCash,
  startingPosFloat,
  onOpenNewSale,
  onNavigateToTab,
  onDeleteSale,
  settings,
}) => {
  const [activityFilter, setActivityFilter] = useState<'all' | 'sales' | 'credit' | 'expenses'>('all');

  // Calculations
  const totalSalesToday = sales.reduce((acc, s) => acc + s.amount, 0);
  const paidSalesToday = sales.filter((s) => s.type === 'paid').reduce((acc, s) => acc + s.amount, 0);
  const creditSalesToday = sales.filter((s) => s.type === 'credit').reduce((acc, s) => acc + s.amount, 0);

  // Shop Cash Expected Drawer
  const cashSales = sales
    .filter((s) => s.type === 'paid' && s.paymentMethod === 'cash')
    .reduce((acc, s) => acc + s.amount, 0);
  
  const debtsCollectedCash = debtTransactions
    .filter((dt) => dt.type === 'repayment' && dt.paymentMethod === 'cash')
    .reduce((acc, dt) => acc + dt.amount, 0);

  const cashOutShop = cashFlows
    .filter((cf) => cf.account === 'shop_cash' && cf.direction === 'out')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const expectedShopCash = startingShopCash + cashSales + debtsCollectedCash - cashOutShop;

  // POS Float
  const posFloatIn = cashFlows
    .filter((cf) => cf.account === 'pos_float' && cf.direction === 'in')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const posFloatOut = cashFlows
    .filter((cf) => cf.account === 'pos_float' && cf.direction === 'out')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const currentPosFloat = startingPosFloat + posFloatIn - posFloatOut;

  // Outstanding Debt
  const totalOutstandingDebt = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);
  const activeDebtorsCount = customers.filter((c) => c.balance > 0).length;

  // Filtered Activity List
  const filteredSales = sales.filter((s) => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'sales') return s.type === 'paid';
    if (activityFilter === 'credit') return s.type === 'credit';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Shop Welcome Banner & Primary Callout */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">
                {settings.shopName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                Today's Overview
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Big Prominent New Sale CTA */}
            <button
              onClick={onOpenNewSale}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all shrink-0"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              <span>Tap to Record Sale</span>
            </button>
          </div>

          {/* 4 Core Vital Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
            {/* 1. Today's Total Sales */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 sm:p-4 border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium block">Today's Sales</span>
              <span className="text-xl sm:text-2xl font-black font-mono-numbers text-white block mt-1">
                {formatCurrency(totalSalesToday, settings.currencyCode)}
              </span>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                {sales.length} transactions logged
              </span>
            </div>

            {/* 2. Shop Cash in Drawer */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 sm:p-4 border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium block">Cash in Drawer</span>
              <span className="text-xl sm:text-2xl font-black font-mono-numbers text-emerald-400 block mt-1">
                {formatCurrency(expectedShopCash, settings.currencyCode)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Physical drawer balance
              </span>
            </div>

            {/* 3. Outstanding Customer Debts */}
            <div 
              onClick={() => onNavigateToTab('debts')}
              className="bg-slate-800/80 rounded-2xl p-3.5 sm:p-4 border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs text-slate-400 font-medium block flex items-center justify-between">
                <span>Customer Debt</span>
                {activeDebtorsCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-400">
                    {activeDebtorsCount} people
                  </span>
                )}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono-numbers text-amber-400 block mt-1">
                {formatCurrency(totalOutstandingDebt, settings.currencyCode)}
              </span>
              <span className="text-[11px] text-amber-300/80 mt-1 block">
                Tap to view debt book →
              </span>
            </div>

            {/* 4. POS Float Reserve */}
            <div 
              onClick={() => onNavigateToTab('cash-float')}
              className="bg-slate-800/80 rounded-2xl p-3.5 sm:p-4 border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs text-slate-400 font-medium block">POS / Transfer Float</span>
              <span className="text-xl sm:text-2xl font-black font-mono-numbers text-blue-400 block mt-1">
                {formatCurrency(currentPosFloat, settings.currencyCode)}
              </span>
              <span className="text-[11px] text-blue-300/80 mt-1 block">
                Agency cash-out float
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Action 1: Customer Debt Book & WhatsApp */}
        <button
          onClick={() => onNavigateToTab('debts')}
          className="p-4 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-sm transition-all text-left flex items-start gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <BookUser className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-900">
              Customer Debt Book
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Send 1-tap WhatsApp debt reminders & collect balances
            </p>
          </div>
        </button>

        {/* Action 2: Cash & Float Tracker */}
        <button
          onClick={() => onNavigateToTab('cash-float')}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm transition-all text-left flex items-start gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-900">
              Cash & Float Tracker
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Log stock purchases, expenses, and POS cashouts
            </p>
          </div>
        </button>

        {/* Action 3: Daily Close */}
        <button
          onClick={() => onNavigateToTab('daily-close')}
          className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm transition-all text-left flex items-start gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-900">
              End-of-Day Close
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconcile counted cash with sales and flag shortages
            </p>
          </div>
        </button>
      </div>

      {/* Today's Transactions Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">Today's Transactions</h2>
            <span className="text-xs text-slate-400 font-mono-numbers">({filteredSales.length})</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActivityFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sales
            </button>
            <button
              onClick={() => setActivityFilter('sales')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activityFilter === 'sales'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid Only
            </button>
            <button
              onClick={() => setActivityFilter('credit')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activityFilter === 'credit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Credit (Debt)
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="divide-y divide-slate-100">
          {filteredSales.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No sales logged yet today. Tap "Tap to Record Sale" above to log your first sale!
            </div>
          ) : (
            filteredSales
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((sale) => {
                const isPaid = sale.type === 'paid';
                return (
                  <div
                    key={sale.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isPaid ? (
                          sale.paymentMethod === 'cash' ? (
                            <Banknote className="w-5 h-5" />
                          ) : (
                            <CreditCard className="w-5 h-5" />
                          )
                        ) : (
                          <BookUser className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">
                          {sale.description}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-slate-400 text-[11px] mt-0.5">
                          {isPaid ? (
                            <span className="font-semibold text-emerald-700 capitalize">
                              Paid via {sale.paymentMethod || 'cash'}
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-800">
                              Credit: {sale.customerName || 'Customer'}
                            </span>
                          )}
                          <span>·</span>
                          <span>{formatDateTime(sale.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-sm sm:text-base font-extrabold font-mono-numbers block ${
                            isPaid ? 'text-slate-900' : 'text-amber-800'
                          }`}
                        >
                          {formatCurrency(sale.amount, settings.currencyCode)}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {sale.type}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteSale(sale.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Void / Delete sale"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
