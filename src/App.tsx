import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { CustomerDebtBook } from './components/CustomerDebtBook';
import { CashFloatTracker } from './components/CashFloatTracker';
import { DailyCloseScreen } from './components/DailyCloseScreen';
import { NewSaleModal } from './components/NewSaleModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Customer, 
  DailyCloseRecord, 
  DebtTransaction, 
  SaleRecord, 
  ShopSettings, 
  CashFlowEntry, 
  PaymentMethod 
} from './types';
import { 
  getStoredSettings, 
  saveSettings, 
  getStoredSales, 
  saveSales, 
  getStoredCustomers, 
  saveCustomers, 
  getStoredDebtTransactions, 
  saveDebtTransactions, 
  getStoredCashFlows, 
  saveCashFlows, 
  getStoredDailyCloses, 
  saveDailyCloses, 
  getStartingShopCash, 
  setStartingShopCash, 
  getStartingPosFloat, 
  setStartingPosFloat, 
  resetAppToSampleData, 
  playSuccessChime 
} from './utils/storage';
import { formatCurrency } from './utils/formatters';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isNewSaleOpen, setIsNewSaleOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Core Data State
  const [settings, setSettings] = useState<ShopSettings>(() => getStoredSettings());
  const [sales, setSales] = useState<SaleRecord[]>(() => getStoredSales());
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredCustomers());
  const [debtTransactions, setDebtTransactions] = useState<DebtTransaction[]>(() => getStoredDebtTransactions());
  const [cashFlows, setCashFlows] = useState<CashFlowEntry[]>(() => getStoredCashFlows());
  const [dailyCloses, setDailyCloses] = useState<DailyCloseRecord[]>(() => getStoredDailyCloses());
  const [startingShopCash, setStartingCash] = useState<number>(() => getStartingShopCash());
  const [startingPosFloat, setStartingFloat] = useState<number>(() => getStartingPosFloat());

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSales(sales);
  }, [sales]);

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveDebtTransactions(debtTransactions);
  }, [debtTransactions]);

  useEffect(() => {
    saveCashFlows(cashFlows);
  }, [cashFlows]);

  useEffect(() => {
    saveDailyCloses(dailyCloses);
  }, [dailyCloses]);

  // Handler: Add New Sale
  const handleSaveSale = (saleData: Omit<SaleRecord, 'id' | 'timestamp'>) => {
    const saleId = `sale-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newSale: SaleRecord = {
      ...saleData,
      id: saleId,
      timestamp,
    };

    setSales((prev) => [newSale, ...prev]);

    // If paid via cash, automatically record into Shop Cash Drawer
    if (newSale.type === 'paid' && newSale.paymentMethod === 'cash') {
      const newCashFlow: CashFlowEntry = {
        id: `cf-${Date.now()}`,
        timestamp,
        account: 'shop_cash',
        direction: 'in',
        amount: newSale.amount,
        category: 'sale_cash',
        description: `Cash sale: ${newSale.description}`,
        relatedSaleId: saleId,
      };
      setCashFlows((prev) => [newCashFlow, ...prev]);
    }

    // If credit, add to customer debt balance and record debt transaction
    if (newSale.type === 'credit' && newSale.customerId) {
      const targetCustomer = customers.find((c) => c.id === newSale.customerId);
      const prevBal = targetCustomer ? targetCustomer.balance : 0;
      const newBal = prevBal + newSale.amount;

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === newSale.customerId
            ? { ...c, balance: newBal, lastActivityAt: timestamp }
            : c
        )
      );

      const debtTx: DebtTransaction = {
        id: `dt-${Date.now()}`,
        customerId: newSale.customerId,
        customerName: newSale.customerName || targetCustomer?.name || 'Customer',
        type: 'credit_given',
        amount: newSale.amount,
        timestamp,
        note: `Credit sale: ${newSale.description}`,
        saleId,
        previousBalance: prevBal,
        newBalance: newBal,
      };

      setDebtTransactions((prev) => [debtTx, ...prev]);
    }

    if (settings.soundEnabled) {
      playSuccessChime();
    }

    showToast(
      newSale.type === 'paid'
        ? `Sale of ${formatCurrency(newSale.amount, settings.currencyCode)} recorded (Paid)`
        : `Added ${formatCurrency(newSale.amount, settings.currencyCode)} to ${newSale.customerName}'s debt book`
    );
  };

  // Handler: Add New Customer
  const handleAddCustomer = (
    customerData: Omit<Customer, 'id' | 'createdAt' | 'lastActivityAt' | 'balance'>
  ): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      balance: 0,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Added customer: ${newCustomer.name}`);
    return newCustomer;
  };

  // Handler: Record Debt Repayment
  const handleRecordRepayment = (
    customerId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    note?: string
  ) => {
    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer) return;

    const timestamp = new Date().toISOString();
    const prevBal = targetCustomer.balance;
    const newBal = Math.max(0, prevBal - amount);

    // Update customer balance
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, balance: newBal, lastActivityAt: timestamp }
          : c
      )
    );

    // Create debt transaction record
    const debtTx: DebtTransaction = {
      id: `dt-${Date.now()}`,
      customerId,
      customerName: targetCustomer.name,
      type: 'repayment',
      amount,
      timestamp,
      paymentMethod,
      note: note || `Repayment via ${paymentMethod}`,
      previousBalance: prevBal,
      newBalance: newBal,
    };

    setDebtTransactions((prev) => [debtTx, ...prev]);

    // If paid via cash, record cash in to shop cash drawer!
    if (paymentMethod === 'cash') {
      const newCashFlow: CashFlowEntry = {
        id: `cf-${Date.now()}`,
        timestamp,
        account: 'shop_cash',
        direction: 'in',
        amount,
        category: 'debt_repayment_cash',
        description: `Debt repayment from ${targetCustomer.name}`,
        relatedDebtId: debtTx.id,
      };
      setCashFlows((prev) => [newCashFlow, ...prev]);
    }

    if (settings.soundEnabled) {
      playSuccessChime();
    }

    showToast(`Collected ${formatCurrency(amount, settings.currencyCode)} from ${targetCustomer.name}`);
  };

  // Handler: Add Cash Flow
  const handleAddCashFlow = (entry: Omit<CashFlowEntry, 'id' | 'timestamp'>) => {
    const newEntry: CashFlowEntry = {
      ...entry,
      id: `cf-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setCashFlows((prev) => [newEntry, ...prev]);
    showToast(
      `${entry.direction === 'in' ? 'Added' : 'Deducted'} ${formatCurrency(
        entry.amount,
        settings.currencyCode
      )} (${entry.category})`
    );
  };

  // Handler: Save Daily Close
  const handleSaveDailyClose = (record: DailyCloseRecord) => {
    setDailyCloses((prev) => [record, ...prev]);
    showToast(`Today's close record saved to archive!`);
  };

  // Handler: Delete/Void Sale
  const handleDeleteSale = (saleId: string) => {
    const saleToDelete = sales.find((s) => s.id === saleId);
    if (!saleToDelete) return;

    if (!confirm(`Void sale of ${formatCurrency(saleToDelete.amount, settings.currencyCode)}?`)) {
      return;
    }

    // If it was a credit sale, reverse debt
    if (saleToDelete.type === 'credit' && saleToDelete.customerId) {
      const cust = customers.find((c) => c.id === saleToDelete.customerId);
      if (cust) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === saleToDelete.customerId
              ? { ...c, balance: Math.max(0, c.balance - saleToDelete.amount) }
              : c
          )
        );
      }
      setDebtTransactions((prev) => prev.filter((dt) => dt.saleId !== saleId));
    }

    // If it was cash sale, reverse cash flow
    setCashFlows((prev) => prev.filter((cf) => cf.relatedSaleId !== saleId));

    // Remove sale
    setSales((prev) => prev.filter((s) => s.id !== saleId));
    showToast('Sale voided.');
  };

  // Handler: Reset to Sample Data
  const handleResetSampleData = () => {
    resetAppToSampleData();
    setSettings(getStoredSettings());
    setSales(getStoredSales());
    setCustomers(getStoredCustomers());
    setDebtTransactions(getStoredDebtTransactions());
    setCashFlows(getStoredCashFlows());
    setDailyCloses(getStoredDailyCloses());
    setStartingCash(getStartingShopCash());
    setStartingFloat(getStartingPosFloat());
    showToast('Store reset to initial demonstration state.');
  };

  // Count active debtors
  const debtorCount = customers.filter((c) => c.balance > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar & Mobile Bottom Tab */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openNewSaleModal={() => setIsNewSaleOpen(true)}
        openSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        debtorCount={debtorCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'home' && (
          <HomeScreen
            sales={sales}
            customers={customers}
            cashFlows={cashFlows}
            debtTransactions={debtTransactions}
            startingShopCash={startingShopCash}
            startingPosFloat={startingPosFloat}
            onOpenNewSale={() => setIsNewSaleOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onDeleteSale={handleDeleteSale}
            settings={settings}
          />
        )}

        {activeTab === 'debts' && (
          <CustomerDebtBook
            customers={customers}
            debtTransactions={debtTransactions}
            onAddCustomer={handleAddCustomer}
            onRecordRepayment={handleRecordRepayment}
            settings={settings}
          />
        )}

        {activeTab === 'cash-float' && (
          <CashFloatTracker
            cashFlows={cashFlows}
            startingShopCash={startingShopCash}
            startingPosFloat={startingPosFloat}
            onUpdateStartingCash={(amt) => {
              setStartingCash(amt);
              setStartingShopCash(amt);
            }}
            onUpdateStartingFloat={(amt) => {
              setStartingFloat(amt);
              setStartingPosFloat(amt);
            }}
            onAddCashFlow={handleAddCashFlow}
            settings={settings}
          />
        )}

        {activeTab === 'daily-close' && (
          <DailyCloseScreen
            sales={sales}
            debtTransactions={debtTransactions}
            cashFlows={cashFlows}
            startingShopCash={startingShopCash}
            startingPosFloat={startingPosFloat}
            dailyCloses={dailyCloses}
            onSaveDailyClose={handleSaveDailyClose}
            settings={settings}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* New Sale Modal (Universal Trigger) */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onSaveSale={handleSaveSale}
        customers={customers}
        onAddCustomer={handleAddCustomer}
        settings={settings}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
}
