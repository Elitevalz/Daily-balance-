import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  MessageSquare, 
  ArrowDownCircle, 
  History, 
  Phone, 
  AlertTriangle, 
  CheckCircle,
  X,
  CreditCard
} from 'lucide-react';
import { Customer, DebtTransaction, ShopSettings, PaymentMethod } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';
import { RepaymentModal } from './RepaymentModal';

interface CustomerDebtBookProps {
  customers: Customer[];
  debtTransactions: DebtTransaction[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'lastActivityAt' | 'balance'>) => Customer;
  onRecordRepayment: (
    customerId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    note?: string
  ) => void;
  settings: ShopSettings;
}

export const CustomerDebtBook: React.FC<CustomerDebtBookProps> = ({
  customers,
  debtTransactions,
  onAddCustomer,
  onRecordRepayment,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'debtors' | 'cleared'>('debtors');
  
  // Modals state
  const [reminderCustomer, setReminderCustomer] = useState<Customer | null>(null);
  const [repaymentCustomer, setRepaymentCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  
  // Add Customer modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Calculations
  const totalDebt = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);
  const debtorsList = customers.filter((c) => c.balance > 0);
  const clearedList = customers.filter((c) => c.balance === 0);

  // Filtered customers: when searching, search across all customers by name or phone
  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // If searching actively, show matching customers regardless of tab, or respect tab if no search
    if (query !== '') {
      if (filterMode === 'debtors') return c.balance > 0;
      if (filterMode === 'cleared') return c.balance === 0;
      return true;
    }

    if (filterMode === 'debtors') return c.balance > 0;
    if (filterMode === 'cleared') return c.balance === 0;
    return true;
  });

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddCustomer({
      name: newName.trim(),
      phone: newPhone.trim() || '08000000000',
      notes: newNotes.trim() || undefined,
    });

    setNewName('');
    setNewPhone('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Top Banner KPI Summary */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-amber-200 text-xs font-semibold uppercase tracking-wider">
              Customer Debt Ledger
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono-numbers mt-1">
              {formatCurrency(totalDebt, settings.currencyCode)}
            </div>
            <p className="text-xs text-amber-100/90 mt-1.5 flex items-center gap-2">
              <span>{debtorsList.length} customers currently owe money</span>
              <span>·</span>
              <span>{clearedList.length} cleared</span>
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all shrink-0 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Filter Tabs */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Enhanced Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name (e.g. Tunde, Blessing) or phone..."
              className="w-full pl-9 pr-16 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono hidden sm:inline">
                Find
              </span>
            )}
          </div>

          {/* Filter Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('debtors')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'debtors'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Owes Money ({debtorsList.length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Customers ({customers.length})
            </button>
            <button
              onClick={() => setFilterMode('cleared')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterMode === 'cleared'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cleared ({clearedList.length})
            </button>
          </div>
        </div>

        {/* Quick Customer Name Filter Chips for fast 1-tap thumb access */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-400 shrink-0">Quick jump:</span>
          {customers.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchQuery(c.name);
                // Also optionally direct open if clicked again
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 ${
                searchQuery.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {c.name.split(' ')[0]} {c.balance > 0 ? `(${formatCurrency(c.balance, settings.currencyCode)})` : ''}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-rose-600 hover:underline px-1 shrink-0 font-medium"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No Customers Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different name or phone.`
                : 'No customers in this filter.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const hasDebt = customer.balance > 0;
            const custTxCount = debtTransactions.filter((dt) => dt.customerId === customer.id).length;

            return (
              <div
                key={customer.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Customer Info (Clickable for quick history access) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHistoryCustomer(customer)}
                      className="text-base font-bold text-slate-900 hover:text-emerald-700 truncate text-left transition-colors flex items-center gap-1.5 group"
                      title="Click to view full debt history"
                    >
                      <span>{customer.name}</span>
                      <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </button>
                    {hasDebt ? (
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Owes
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        Balanced
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono-numbers">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {customer.phone || 'No phone'}
                    </span>
                    <span>·</span>
                    <span>Last active {formatDateTime(customer.lastActivityAt)}</span>
                  </div>

                  {customer.notes && (
                    <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 px-2 py-1 rounded inline-block">
                      Note: {customer.notes}
                    </p>
                  )}
                </div>

                {/* Right: Balance & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="sm:text-right">
                    <div className="text-[11px] text-slate-400 font-medium">Balance</div>
                    <div
                      className={`text-xl font-extrabold font-mono-numbers ${
                        hasDebt ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(customer.balance, settings.currencyCode)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Explicit Fast Debt History Access */}
                    <button
                      type="button"
                      onClick={() => setHistoryCustomer(customer)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      title="View individual debt history statement"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>History ({custTxCount})</span>
                    </button>

                    {hasDebt ? (
                      <>
                        {/* One-tap WhatsApp Reminder Button */}
                        <button
                          onClick={() => setReminderCustomer(customer)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/90 rounded-xl transition-colors"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Record Repayment Button */}
                        <button
                          onClick={() => setRepaymentCustomer(customer)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm active:scale-95"
                          title="Record Repayment"
                        >
                          <ArrowDownCircle className="w-3.5 h-3.5" />
                          <span>Collect</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Ledger History Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Debt Statement · {historyCustomer.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono-numbers">
                  Phone: {historyCustomer.phone} · Current Balance:{' '}
                  <span className="font-bold text-rose-600">
                    {formatCurrency(historyCustomer.balance, settings.currencyCode)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {debtTransactions.filter((dt) => dt.customerId === historyCustomer.id).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No debt transactions logged for this customer yet.
                </div>
              ) : (
                debtTransactions
                  .filter((dt) => dt.customerId === historyCustomer.id)
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((dt) => {
                    const isCredit = dt.type === 'credit_given';
                    return (
                      <div
                        key={dt.id}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                          isCredit
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-emerald-50/50 border-emerald-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {isCredit ? (
                              <CreditCard className="w-4 h-4 text-amber-600" />
                            ) : (
                              <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                            )}
                            <span className="text-xs font-bold text-slate-900">
                              {isCredit ? 'Credit Given' : 'Debt Repayment'}
                            </span>
                            {dt.paymentMethod && (
                              <span className="text-[10px] text-slate-500">
                                ({dt.paymentMethod.toUpperCase()})
                              </span>
                            )}
                          </div>
                          {dt.note && (
                            <p className="text-xs text-slate-600">{dt.note}</p>
                          )}
                          <div className="text-[11px] text-slate-400">
                            {formatDateTime(dt.timestamp)}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-sm font-extrabold font-mono-numbers ${
                              isCredit ? 'text-amber-800' : 'text-emerald-700'
                            }`}
                          >
                            {isCredit ? '+' : '-'}
                            {formatCurrency(dt.amount, settings.currencyCode)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono-numbers mt-0.5">
                            Bal: {formatCurrency(dt.newBalance, settings.currencyCode)}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {historyCustomer.balance > 0 && (
                <button
                  onClick={() => {
                    const c = historyCustomer;
                    setHistoryCustomer(null);
                    setReminderCustomer(c);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Send WhatsApp Reminder
                </button>
              )}
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Customer to Debt Book</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Papa Jude or Nurse Mary"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (For WhatsApp Reminders) *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 08012345678 or +234..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Lives in flat 4, pays monthly salary day..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Reminder Modal */}
      <WhatsAppReminderModal
        isOpen={Boolean(reminderCustomer)}
        onClose={() => setReminderCustomer(null)}
        customer={reminderCustomer}
        settings={settings}
      />

      {/* Repayment Modal */}
      <RepaymentModal
        isOpen={Boolean(repaymentCustomer)}
        onClose={() => setRepaymentCustomer(null)}
        customer={repaymentCustomer}
        onRecordRepayment={onRecordRepayment}
        settings={settings}
      />
    </div>
  );
};
