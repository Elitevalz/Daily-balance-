import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Share2, 
  Copy, 
  Printer, 
  Calendar, 
  Clock, 
  Calculator, 
  X,
  FileCheck,
  History
} from 'lucide-react';
import { 
  CashFlowEntry, 
  DailyCloseRecord, 
  DebtTransaction, 
  SaleRecord, 
  ShopSettings 
} from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime 
} from '../utils/formatters';

interface DailyCloseScreenProps {
  sales: SaleRecord[];
  debtTransactions: DebtTransaction[];
  cashFlows: CashFlowEntry[];
  startingShopCash: number;
  startingPosFloat: number;
  dailyCloses: DailyCloseRecord[];
  onSaveDailyClose: (record: DailyCloseRecord) => void;
  settings: ShopSettings;
}

export const DailyCloseScreen: React.FC<DailyCloseScreenProps> = ({
  sales,
  debtTransactions,
  cashFlows,
  startingShopCash,
  startingPosFloat,
  dailyCloses,
  onSaveDailyClose,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  
  // Count inputs
  const [countedShopCash, setCountedShopCash] = useState<string>('');
  const [countedPosFloat, setCountedPosFloat] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState<string>('');
  
  // Denomination calculator modal
  const [showDenomCalc, setShowDenomCalc] = useState<boolean>(false);
  const [denoms, setDenoms] = useState<{ [key: number]: number }>({
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Today calculations
  const totalSales = sales.reduce((acc, s) => acc + s.amount, 0);
  const cashSales = sales
    .filter((s) => s.type === 'paid' && s.paymentMethod === 'cash')
    .reduce((acc, s) => acc + s.amount, 0);
  const transferSales = sales
    .filter((s) => s.type === 'paid' && (s.paymentMethod === 'transfer' || s.paymentMethod === 'pos'))
    .reduce((acc, s) => acc + s.amount, 0);
  const creditSales = sales
    .filter((s) => s.type === 'credit')
    .reduce((acc, s) => acc + s.amount, 0);

  // Debts collected today
  const debtsCollectedCash = debtTransactions
    .filter((dt) => dt.type === 'repayment' && dt.paymentMethod === 'cash')
    .reduce((acc, dt) => acc + dt.amount, 0);
  const debtsCollectedTransfer = debtTransactions
    .filter((dt) => dt.type === 'repayment' && dt.paymentMethod === 'transfer')
    .reduce((acc, dt) => acc + dt.amount, 0);

  // Cash Flows
  const cashOutShop = cashFlows
    .filter((cf) => cf.account === 'shop_cash' && cf.direction === 'out')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const posFloatIn = cashFlows
    .filter((cf) => cf.account === 'pos_float' && cf.direction === 'in')
    .reduce((acc, cf) => acc + cf.amount, 0);

  const posFloatOut = cashFlows
    .filter((cf) => cf.account === 'pos_float' && cf.direction === 'out')
    .reduce((acc, cf) => acc + cf.amount, 0);

  // Expected balances
  const expectedShopCash = startingShopCash + cashSales + debtsCollectedCash - cashOutShop;
  const expectedPosFloat = startingPosFloat + posFloatIn - posFloatOut;

  // Actual parsed numbers
  const actualShop = countedShopCash !== '' ? parseFloat(countedShopCash) || 0 : expectedShopCash;
  const actualFloat = countedPosFloat !== '' ? parseFloat(countedPosFloat) || 0 : expectedPosFloat;

  const shopDiscrepancy = actualShop - expectedShopCash;
  const floatDiscrepancy = actualFloat - expectedPosFloat;

  // Denomination total
  const denomTotal = Object.entries(denoms).reduce((sum, [val, count]) => sum + Number(val) * count, 0);

  const applyDenomTotal = () => {
    setCountedShopCash(String(denomTotal));
    setShowDenomCalc(false);
  };

  // Generate Report Text
  const generateReportText = (): string => {
    const todayStr = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return `*DAILYBALANCE CLOSING REPORT* 📊
*Shop:* ${settings.shopName}
*Date:* ${todayStr}
--------------------------------------
💰 *TOTAL SALES:* ${formatCurrency(totalSales, settings.currencyCode)}
  • Cash Sales: ${formatCurrency(cashSales, settings.currencyCode)}
  • Bank/POS Sales: ${formatCurrency(transferSales, settings.currencyCode)}
  • Credit Given (Debts): ${formatCurrency(creditSales, settings.currencyCode)}

📥 *Debts Collected Today:* ${formatCurrency(debtsCollectedCash + debtsCollectedTransfer, settings.currencyCode)}
💸 *Cash Spent (Stock/Expenses):* ${formatCurrency(cashOutShop, settings.currencyCode)}
--------------------------------------
💵 *SHOP CASH DRAWER RECONCILIATION:*
  • Starting Cash: ${formatCurrency(startingShopCash, settings.currencyCode)}
  • Expected in Drawer: ${formatCurrency(expectedShopCash, settings.currencyCode)}
  • Actual Counted: ${formatCurrency(actualShop, settings.currencyCode)}
  • Status: ${
    shopDiscrepancy === 0
      ? '✅ BALANCED (0 discrepancy)'
      : shopDiscrepancy < 0
      ? `🚨 SHORTAGE of ${formatCurrency(Math.abs(shopDiscrepancy), settings.currencyCode)}`
      : `⚠️ SURPLUS of +${formatCurrency(shopDiscrepancy, settings.currencyCode)}`
  }

📱 *POS & FLOAT RECONCILIATION:*
  • Expected Remaining Float: ${formatCurrency(expectedPosFloat, settings.currencyCode)}
  • Counted Float: ${formatCurrency(actualFloat, settings.currencyCode)}
  • Status: ${
    floatDiscrepancy === 0
      ? '✅ MATCHED'
      : floatDiscrepancy < 0
      ? `🚨 Float Shortage: ${formatCurrency(Math.abs(floatDiscrepancy), settings.currencyCode)}`
      : `⚠️ Float Surplus: +${formatCurrency(floatDiscrepancy, settings.currencyCode)}`
  }
--------------------------------------
${closeNotes ? `📝 *Notes:* ${closeNotes}\n--------------------------------------\n` : ''}Generated via DailyBalance`;
  };

  const handleShareWhatsApp = () => {
    const text = generateReportText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveCloseRecord = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: DailyCloseRecord = {
      id: `close-${Date.now()}`,
      date: todayStr,
      closedAt: new Date().toISOString(),
      startingShopCash,
      startingPosFloat,
      totalSales,
      cashSales,
      transferSales,
      creditSales,
      debtsCollectedCash,
      debtsCollectedTransfer,
      cashOutShop,
      posFloatIn,
      posFloatOut,
      expectedShopCash,
      actualCountedShopCash: actualShop,
      shopCashDiscrepancy: shopDiscrepancy,
      expectedPosFloat,
      actualCountedPosFloat: actualFloat,
      posFloatDiscrepancy: floatDiscrepancy,
      notes: closeNotes.trim() || undefined,
    };

    onSaveDailyClose(newRecord);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Top Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            End-of-Day Summary & Reconciliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Reconcile physical counted cash vs recorded sales. Catch shortages immediately.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'today'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Close
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Daily Closes ({dailyCloses.length})
          </button>
        </div>
      </div>

      {activeTab === 'today' ? (
        <div className="space-y-6">
          {/* Section 1: Today's Financial Overview Strip */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Today's Performance Breakdown
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Sales */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-500">Total Sales</span>
                <span className="text-xl font-extrabold font-mono-numbers text-slate-900 block mt-0.5">
                  {formatCurrency(totalSales, settings.currencyCode)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Cash: {formatCurrency(cashSales, settings.currencyCode)} · Bank: {formatCurrency(transferSales, settings.currencyCode)}
                </span>
              </div>

              {/* Credit Given */}
              <div className="p-3 bg-amber-50/70 rounded-xl">
                <span className="text-xs text-amber-800">New Credit Given</span>
                <span className="text-xl font-extrabold font-mono-numbers text-amber-900 block mt-0.5">
                  {formatCurrency(creditSales, settings.currencyCode)}
                </span>
                <span className="text-[10px] text-amber-700/80 block mt-1">
                  Uncollected customer debt
                </span>
              </div>

              {/* Debt Collected */}
              <div className="p-3 bg-emerald-50/70 rounded-xl">
                <span className="text-xs text-emerald-800">Debts Collected</span>
                <span className="text-xl font-extrabold font-mono-numbers text-emerald-900 block mt-0.5">
                  {formatCurrency(debtsCollectedCash + debtsCollectedTransfer, settings.currencyCode)}
                </span>
                <span className="text-[10px] text-emerald-700/80 block mt-1">
                  Cash: {formatCurrency(debtsCollectedCash, settings.currencyCode)}
                </span>
              </div>

              {/* Expenses / Stock out */}
              <div className="p-3 bg-rose-50/70 rounded-xl">
                <span className="text-xs text-rose-800">Cash Spent</span>
                <span className="text-xl font-extrabold font-mono-numbers text-rose-900 block mt-0.5">
                  {formatCurrency(cashOutShop, settings.currencyCode)}
                </span>
                <span className="text-[10px] text-rose-700/80 block mt-1">
                  Stock deliveries & shop bills
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Cash Reconciliation (Expected vs Physical Count) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  2. Shop Drawer Reconciliation
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Count physical cash in your drawer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDenomCalc(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-slate-500" />
                <span>Denomination Counter</span>
              </button>
            </div>

            {/* Reconciliation Math Flow */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Starting Drawer Cash:</span>
                  <span className="font-mono-numbers font-medium">
                    +{formatCurrency(startingShopCash, settings.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>(+) Today's Cash Sales:</span>
                  <span className="font-mono-numbers font-bold">
                    +{formatCurrency(cashSales, settings.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>(+) Debt Collected in Cash:</span>
                  <span className="font-mono-numbers font-bold">
                    +{formatCurrency(debtsCollectedCash, settings.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>(-) Cash Spent (Stock/Expenses):</span>
                  <span className="font-mono-numbers font-bold">
                    -{formatCurrency(cashOutShop, settings.currencyCode)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Expected Physical Cash in Drawer:</span>
                  <span className="text-base font-extrabold font-mono-numbers text-emerald-700">
                    {formatCurrency(expectedShopCash, settings.currencyCode)}
                  </span>
                </div>
              </div>
            </div>

            {/* Input Counted Drawer Cash */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Actual Physical Cash Counted in Drawer ({settings.currencyCode})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                    {formatCurrency(0, settings.currencyCode).slice(0, 1)}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={countedShopCash}
                    onChange={(e) => setCountedShopCash(e.target.value)}
                    placeholder={String(expectedShopCash)}
                    className="w-full pl-9 pr-3 py-2.5 text-lg font-bold font-mono-numbers bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank or type exact counted notes. Default uses expected.
                </p>
              </div>

              {/* Result Flag Badge Card */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  shopDiscrepancy === 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : shopDiscrepancy < 0
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {shopDiscrepancy === 0 ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle
                    className={`w-8 h-8 shrink-0 ${
                      shopDiscrepancy < 0 ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {shopDiscrepancy === 0
                      ? 'Drawer Is Balanced'
                      : shopDiscrepancy < 0
                      ? 'Cash Shortage Flagged!'
                      : 'Cash Surplus Flagged'}
                  </div>
                  <div className="text-xs mt-0.5 font-mono-numbers">
                    {shopDiscrepancy === 0 ? (
                      'Counted money exactly matches drawer calculations.'
                    ) : shopDiscrepancy < 0 ? (
                      <>
                        Missing:{' '}
                        <span className="font-extrabold text-rose-700">
                          {formatCurrency(Math.abs(shopDiscrepancy), settings.currencyCode)}
                        </span>{' '}
                        short in till.
                      </>
                    ) : (
                      <>
                        Extra:{' '}
                        <span className="font-extrabold text-amber-800">
                          +{formatCurrency(shopDiscrepancy, settings.currencyCode)}
                        </span>{' '}
                        over expected.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-section: POS Float Check */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                3. POS & Transfer Float Check
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs space-y-1">
                  <div className="text-slate-600">
                    Starting Float: <span className="font-mono-numbers font-semibold">{formatCurrency(startingPosFloat, settings.currencyCode)}</span>
                  </div>
                  <div className="text-slate-800 font-bold">
                    Expected Remaining Float:{' '}
                    <span className="text-blue-700 font-mono-numbers font-extrabold">
                      {formatCurrency(expectedPosFloat, settings.currencyCode)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Actual Remaining Float Counted
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={countedPosFloat}
                    onChange={(e) => setCountedPosFloat(e.target.value)}
                    placeholder={String(expectedPosFloat)}
                    className="w-full px-3 py-2 text-sm font-bold font-mono-numbers bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {floatDiscrepancy !== 0 && (
                    <span
                      className={`text-[11px] font-bold block mt-1 font-mono-numbers ${
                        floatDiscrepancy < 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      Float discrepancy: {floatDiscrepancy < 0 ? '-' : '+'}
                      {formatCurrency(Math.abs(floatDiscrepancy), settings.currencyCode)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Closing Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Day Close Notes / Shop Remarks (Optional)
              </label>
              <textarea
                rows={2}
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="e.g. Bread supplier delivered at 4pm. Shop closed at 9:30pm. Discrepancy explained by..."
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied Report!' : 'Copy Summary'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveCloseRecord}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savedSuccess ? 'Saved to Archive!' : 'Finalize & Save Today'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* History of Past Daily Closes */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900">Past Daily Summaries Archive</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {dailyCloses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No past daily closes saved yet.
              </div>
            ) : (
              dailyCloses
                .sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
                .map((record) => (
                  <div key={record.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-sm text-slate-900">
                          {formatDate(record.closedAt)}
                        </span>
                        <span className="text-xs text-slate-400">
                          closed at {formatDateTime(record.closedAt).split('·')[1]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {record.shopCashDiscrepancy === 0 ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                          </span>
                        ) : record.shopCashDiscrepancy < 0 ? (
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Shortage (
                            {formatCurrency(Math.abs(record.shopCashDiscrepancy), settings.currencyCode)})
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                            Surplus (+{formatCurrency(record.shopCashDiscrepancy, settings.currencyCode)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs font-mono-numbers">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Sales</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(record.totalSales, settings.currencyCode)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Credit Given</span>
                        <span className="font-bold text-amber-800">
                          {formatCurrency(record.creditSales, settings.currencyCode)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Expected Cash</span>
                        <span className="font-bold text-slate-700">
                          {formatCurrency(record.expectedShopCash, settings.currencyCode)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Counted Cash</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(record.actualCountedShopCash, settings.currencyCode)}
                        </span>
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2 rounded">
                        Note: {record.notes}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Denomination Counter Modal */}
      {showDenomCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Banknote & Coin Counter</h3>
              </div>
              <button
                onClick={() => setShowDenomCalc(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500">
                Count notes in your physical cash box:
              </p>

              <div className="space-y-2">
                {[1000, 500, 200, 100, 50, 20].map((denom) => (
                  <div key={denom} className="flex items-center justify-between gap-3 text-xs">
                    <span className="w-24 font-bold font-mono-numbers text-slate-800">
                      {formatCurrency(denom, settings.currencyCode)} notes
                    </span>
                    <span className="text-slate-400">×</span>
                    <input
                      type="number"
                      min="0"
                      value={denoms[denom] || ''}
                      onChange={(e) =>
                        setDenoms({ ...denoms, [denom]: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      placeholder="0"
                      className="w-20 px-2 py-1 text-center font-bold font-mono-numbers border border-slate-300 rounded-lg"
                    />
                    <span className="w-24 text-right font-bold font-mono-numbers text-slate-900">
                      ={formatCurrency((denoms[denom] || 0) * denom, settings.currencyCode)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Calculated Cash Total:</span>
                <span className="text-lg font-extrabold font-mono-numbers text-emerald-700">
                  {formatCurrency(denomTotal, settings.currencyCode)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDenomCalc(false)}
                className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyDenomTotal}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Apply Total ({formatCurrency(denomTotal, settings.currencyCode)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
