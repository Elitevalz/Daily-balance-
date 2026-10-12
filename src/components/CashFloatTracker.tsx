import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  Wallet, 
  Smartphone, 
  TrendingUp, 
  TrendingDown, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { 
  CashAccountType, 
  CashFlowDirection, 
  CashFlowEntry, 
  ShopSettings 
} from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface CashFloatTrackerProps {
  cashFlows: CashFlowEntry[];
  startingShopCash: number;
  startingPosFloat: number;
  onUpdateStartingCash: (amount: number) => void;
  onUpdateStartingFloat: (amount: number) => void;
  onAddCashFlow: (entry: Omit<CashFlowEntry, 'id' | 'timestamp'>) => void;
  settings: ShopSettings;
}

export const CashFloatTracker: React.FC<CashFloatTrackerProps> = ({
  cashFlows,
  startingShopCash,
  startingPosFloat,
  onUpdateStartingCash,
  onUpdateStartingFloat,
  onAddCashFlow,
  settings,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'shop_cash' | 'pos_float'>('all');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  
  // Log Modal state
  const [logAccount, setLogAccount] = useState<CashAccountType>('shop_cash');
  const [logDirection, setLogDirection] = useState<CashFlowDirection>('out');
  const [logAmount, setLogAmount] = useState<string>('');
  const [logCategory, setLogCategory] = useState<string>('supplier_stock');
  const [logDesc, setLogDesc] = useState<string>('');

  // Editing starting floats
  const [editingStarting, setEditingStarting] = useState<'shop' | 'pos' | null>(null);
  const [tempStartingVal, setTempStartingVal] = useState<string>('');

  // Shop Cash calculations
  const shopCashIn = cashFlows
    .filter((cf) => cf.account === 'shop_cash' && cf.direction === 'in')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const shopCashOut = cashFlows
    .filter((cf) => cf.account === 'shop_cash' && cf.direction === 'out')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const currentShopCash = startingShopCash + shopCashIn - shopCashOut;

  // POS Float calculations
  const posFloatIn = cashFlows
    .filter((cf) => cf.account === 'pos_float' && cf.direction === 'in')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const posFloatOut = cashFlows
    .filter((cf) => cf.account === 'pos_float' && cf.direction === 'out')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const currentPosFloat = startingPosFloat + posFloatIn - posFloatOut;

  // Filtered entries
  const filteredFlows = cashFlows
    .filter((cf) => selectedFilter === 'all' || cf.account === selectedFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleOpenAddModal = (account?: CashAccountType, direction?: CashFlowDirection) => {
    if (account) setLogAccount(account);
    if (direction) setLogDirection(direction);
    setLogAmount('');
    setLogDesc('');
    setShowLogModal(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(logAmount) || 0;
    if (amountNum <= 0) return;

    let defaultCategoryName = logCategory;
    if (logAccount === 'shop_cash') {
      if (logDirection === 'out') {
        if (logCategory === 'supplier_stock') defaultCategoryName = 'Supplier / Stock restock';
        if (logCategory === 'store_expense') defaultCategoryName = 'Shop Expense (Fuel/Bill/Nylon)';
        if (logCategory === 'owner_drawing') defaultCategoryName = 'Owner Personal Chop Money';
        if (logCategory === 'other_out') defaultCategoryName = 'Other Cash Out';
      } else {
        if (logCategory === 'sale_cash') defaultCategoryName = 'Direct Cash In';
        if (logCategory === 'capital') defaultCategoryName = 'Capital / Drawer top-up';
        if (logCategory === 'other_in') defaultCategoryName = 'Other Cash In';
      }
    } else {
      if (logDirection === 'out') {
        if (logCategory === 'pos_cashout') defaultCategoryName = 'POS Customer Cash-out';
        if (logCategory === 'pos_bank_deposit') defaultCategoryName = 'Cash deposited to bank';
        if (logCategory === 'other_out') defaultCategoryName = 'Other Float Out';
      } else {
        if (logCategory === 'float_bank_withdrawal') defaultCategoryName = 'Bank withdrawal for float';
        if (logCategory === 'pos_charge') defaultCategoryName = 'POS Fee / Commission profit';
        if (logCategory === 'other_in') defaultCategoryName = 'Other Float In';
      }
    }

    onAddCashFlow({
      account: logAccount,
      direction: logDirection,
      amount: amountNum,
      category: defaultCategoryName,
      description: logDesc.trim() || defaultCategoryName,
    });

    setShowLogModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Cash & Float Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Never mix physical store cash with POS agency float. Track each drawer independently.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal('shop_cash', 'out')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Cash In / Out</span>
        </button>
      </div>

      {/* Dual Account Cards (Shop Drawer vs POS Float) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Shop Cash (Physical Till) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Shop Cash Drawer</h2>
                <span className="text-[11px] text-slate-500">Physical drawer from retail goods sales</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Expected in Drawer</span>
              <span className="text-2xl font-extrabold font-mono-numbers text-emerald-700">
                {formatCurrency(currentShopCash, settings.currencyCode)}
              </span>
            </div>
          </div>

          {/* Breakdown pill grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Starting Cash</span>
              {editingStarting === 'shop' ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number"
                    value={tempStartingVal}
                    onChange={(e) => setTempStartingVal(e.target.value)}
                    className="w-16 px-1 py-0.5 text-xs border rounded font-mono-numbers"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onUpdateStartingCash(parseFloat(tempStartingVal) || 0);
                      setEditingStarting(null);
                    }}
                    className="text-[10px] text-emerald-600 font-bold"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempStartingVal(String(startingShopCash));
                    setEditingStarting('shop');
                  }}
                  className="font-bold font-mono-numbers text-slate-700 hover:text-emerald-700 text-left block w-full mt-0.5"
                  title="Click to edit starting cash"
                >
                  {formatCurrency(startingShopCash, settings.currencyCode)}
                </button>
              )}
            </div>

            <div className="bg-emerald-50/60 p-2 rounded-lg">
              <span className="text-emerald-700 text-[10px] block flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" /> Cash In
              </span>
              <span className="font-bold font-mono-numbers text-emerald-800 block mt-0.5">
                +{formatCurrency(shopCashIn, settings.currencyCode)}
              </span>
            </div>

            <div className="bg-rose-50/60 p-2 rounded-lg">
              <span className="text-rose-700 text-[10px] block flex items-center gap-1">
                <TrendingDown className="w-2.5 h-2.5" /> Cash Out
              </span>
              <span className="font-bold font-mono-numbers text-rose-800 block mt-0.5">
                -{formatCurrency(shopCashOut, settings.currencyCode)}
              </span>
            </div>
          </div>

          {/* Quick Buttons for Shop Cash */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleOpenAddModal('shop_cash', 'in')}
              className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>+ Cash In</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('shop_cash', 'out')}
              className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>- Spent (Stock/Exp)</span>
            </button>
          </div>
        </div>

        {/* Card 2: POS / Agency Float */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">POS & Transfer Float</h2>
                <span className="text-[11px] text-slate-500">Cash-out reserve for withdrawals / transfers</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Available Float</span>
              <span className="text-2xl font-extrabold font-mono-numbers text-blue-700">
                {formatCurrency(currentPosFloat, settings.currencyCode)}
              </span>
            </div>
          </div>

          {/* Breakdown pill grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Starting Float</span>
              {editingStarting === 'pos' ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number"
                    value={tempStartingVal}
                    onChange={(e) => setTempStartingVal(e.target.value)}
                    className="w-16 px-1 py-0.5 text-xs border rounded font-mono-numbers"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onUpdateStartingFloat(parseFloat(tempStartingVal) || 0);
                      setEditingStarting(null);
                    }}
                    className="text-[10px] text-blue-600 font-bold"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempStartingVal(String(startingPosFloat));
                    setEditingStarting('pos');
                  }}
                  className="font-bold font-mono-numbers text-slate-700 hover:text-blue-700 text-left block w-full mt-0.5"
                  title="Click to edit starting POS float"
                >
                  {formatCurrency(startingPosFloat, settings.currencyCode)}
                </button>
              )}
            </div>

            <div className="bg-blue-50/60 p-2 rounded-lg">
              <span className="text-blue-700 text-[10px] block flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" /> Refilled / In
              </span>
              <span className="font-bold font-mono-numbers text-blue-800 block mt-0.5">
                +{formatCurrency(posFloatIn, settings.currencyCode)}
              </span>
            </div>

            <div className="bg-orange-50/60 p-2 rounded-lg">
              <span className="text-orange-700 text-[10px] block flex items-center gap-1">
                <TrendingDown className="w-2.5 h-2.5" /> Dispensed Out
              </span>
              <span className="font-bold font-mono-numbers text-orange-800 block mt-0.5">
                -{formatCurrency(posFloatOut, settings.currencyCode)}
              </span>
            </div>
          </div>

          {/* Quick Buttons for POS Float */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleOpenAddModal('pos_float', 'in')}
              className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>+ Refill Float</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('pos_float', 'out')}
              className="flex-1 py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>- Customer Cash-out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Ledger Header & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900">Today's Cash Ledger</h3>
            <span className="text-xs text-slate-400">({filteredFlows.length} entries)</span>
          </div>

          {/* Segmented filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Ledgers
            </button>
            <button
              onClick={() => setSelectedFilter('shop_cash')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedFilter === 'shop_cash'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shop Drawer Only
            </button>
            <button
              onClick={() => setSelectedFilter('pos_float')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedFilter === 'pos_float'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              POS Float Only
            </button>
          </div>
        </div>

        {/* Ledger List */}
        <div className="divide-y divide-slate-100">
          {filteredFlows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No cash transactions recorded for this filter today.
            </div>
          ) : (
            filteredFlows.map((cf) => {
              const isShop = cf.account === 'shop_cash';
              const isIn = cf.direction === 'in';

              return (
                <div
                  key={cf.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isIn
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIn ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {cf.description}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-slate-400 text-[11px] mt-0.5">
                        <span
                          className={`font-semibold ${
                            isShop ? 'text-emerald-700' : 'text-blue-700'
                          }`}
                        >
                          {isShop ? 'Shop Drawer' : 'POS Float'}
                        </span>
                        <span>·</span>
                        <span>{cf.category}</span>
                        <span>·</span>
                        <span>{formatDateTime(cf.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-extrabold font-mono-numbers block ${
                        isIn ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIn ? '+' : '-'}
                      {formatCurrency(cf.amount, settings.currencyCode)}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {isIn ? 'Cash In' : 'Cash Out'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Log Cash Flow Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Log Money In / Out</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-5 space-y-4">
              {/* Account Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Account
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogAccount('shop_cash')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      logAccount === 'shop_cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Shop Cash Drawer</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Physical goods sales & expenses</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogAccount('pos_float')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      logAccount === 'pos_float'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">POS / Transfer Float</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Cash-out reserve for withdrawals</p>
                  </button>
                </div>
              </div>

              {/* Direction: In vs Out */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Money Movement Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogDirection('in')}
                    className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                      logDirection === 'in'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    + Money IN (Received)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogDirection('out')}
                    className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                      logDirection === 'out'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    - Money OUT (Paid / Dispensed)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ({settings.currencyCode}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={logAmount}
                  onChange={(e) => setLogAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-base font-bold font-mono-numbers border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category / Reason
                </label>
                <select
                  value={logCategory}
                  onChange={(e) => setLogCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {logAccount === 'shop_cash' && logDirection === 'out' && (
                    <>
                      <option value="supplier_stock">Supplier Delivery / Stock Restock</option>
                      <option value="store_expense">Shop Expenses (Fuel, Nylon, Generator)</option>
                      <option value="owner_drawing">Personal / Chop Money (Owner Withdrawal)</option>
                      <option value="other_out">Other Cash Spent</option>
                    </>
                  )}
                  {logAccount === 'shop_cash' && logDirection === 'in' && (
                    <>
                      <option value="capital">Cash Added to Drawer (Owner Capital)</option>
                      <option value="sale_cash">Offline Direct Cash In</option>
                      <option value="other_in">Other Cash Received</option>
                    </>
                  )}
                  {logAccount === 'pos_float' && logDirection === 'out' && (
                    <>
                      <option value="pos_cashout">Customer Cash Withdrawal (Cash-out)</option>
                      <option value="pos_bank_deposit">Physical Cash Deposited to Bank</option>
                      <option value="other_out">Other Float Deducted</option>
                    </>
                  )}
                  {logAccount === 'pos_float' && logDirection === 'in' && (
                    <>
                      <option value="float_bank_withdrawal">Bank Cash Withdrawn to Refill Float</option>
                      <option value="pos_charge">POS Fee / Commission profit</option>
                      <option value="other_in">Other Float Received</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Description / Note (Optional)
                </label>
                <input
                  type="text"
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  placeholder="e.g. Paid egg supplier ₦4,000 or Bought fuel"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
