import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  Check, 
  CreditCard, 
  Banknote, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { 
  Customer, 
  PaymentMethod, 
  QuickSaleItem, 
  SaleRecord, 
  SaleType, 
  ShopSettings, 
  BasketItem 
} from '../types';
import { formatCurrency } from '../utils/formatters';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSale: (sale: Omit<SaleRecord, 'id' | 'timestamp'>) => void;
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'lastActivityAt' | 'balance'>) => Customer;
  settings: ShopSettings;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSaveSale,
  customers,
  onAddCustomer,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'keypad'>('presets');
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customItemName, setCustomItemName] = useState<string>('');
  
  // Sale Type: 'paid' | 'credit'
  const [saleType, setSaleType] = useState<SaleType>('paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  
  // Customer selection for credit
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showAddCustomer, setShowAddCustomer] = useState<boolean>(false);
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [saleNote, setSaleNote] = useState<string>('');

  if (!isOpen) return null;

  // Calculate total amount
  const basketTotal = basket.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const keypadAmount = parseFloat(customAmount) || 0;
  const totalAmount = basketTotal + keypadAmount;

  // Add preset item to basket
  const handleAddItem = (item: QuickSaleItem) => {
    setBasket((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) => (i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setBasket((prev) =>
      prev
        .map((item) => {
          if (item.itemId === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as BasketItem[]
    );
  };

  const handleClearAll = () => {
    setBasket([]);
    setCustomAmount('');
    setCustomItemName('');
  };

  const handleQuickAddKeypad = (increment: number) => {
    const current = parseFloat(customAmount) || 0;
    setCustomAmount(String(current + increment));
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const created = onAddCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || '08000000000',
      notes: 'Added during quick sale',
    });

    setSelectedCustomerId(created.id);
    setShowAddCustomer(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
  };

  const handleSubmitSale = () => {
    if (totalAmount <= 0) return;

    if (saleType === 'credit' && !selectedCustomerId) {
      alert('Please select or add a customer for a credit sale');
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

    // Build description
    let desc = '';
    if (basket.length > 0) {
      desc = basket.map((i) => `${i.name} (x${i.quantity})`).join(', ');
      if (keypadAmount > 0) {
        desc += ` + Custom (${formatCurrency(keypadAmount, settings.currencyCode)})`;
      }
    } else if (customItemName.trim()) {
      desc = customItemName.trim();
    } else {
      desc = `Sale: ${formatCurrency(totalAmount, settings.currencyCode)}`;
    }

    if (saleNote.trim()) {
      desc += ` · Note: ${saleNote.trim()}`;
    }

    onSaveSale({
      amount: totalAmount,
      type: saleType,
      paymentMethod: saleType === 'paid' ? paymentMethod : undefined,
      customerId: saleType === 'credit' ? selectedCustomerId : undefined,
      customerName: saleType === 'credit' ? selectedCustomer?.name : undefined,
      customerPhone: saleType === 'credit' ? selectedCustomer?.phone : undefined,
      description: desc,
      items: basket.length > 0 ? basket : undefined,
    });

    handleClearAll();
    onClose();
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Record New Sale</h2>
            <p className="text-xs text-slate-500">Tap items or type an amount · Mark as Paid or Credit</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Mode Switcher: Presets vs Custom Keypad */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'presets'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quick Preset Items
            </button>
            <button
              onClick={() => setActiveTab('keypad')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'keypad'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manual Amount / Keypad
            </button>
          </div>

          {/* Quick Preset Grid */}
          {activeTab === 'presets' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Tap to add items</span>
                {basket.length > 0 && (
                  <button
                    onClick={() => setBasket([])}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Clear Basket
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {settings.quickItems.map((item) => {
                  const inBasket = basket.find((i) => i.itemId === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className={`p-2.5 rounded-xl text-left border transition-all relative flex flex-col justify-between min-h-[78px] ${
                        inBasket
                          ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-full">
                        <div className="text-xs font-medium text-slate-800 line-clamp-2 leading-tight">
                          {item.name}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                        <span className="text-xs font-bold font-mono-numbers text-emerald-700">
                          {formatCurrency(item.price, settings.currencyCode)}
                        </span>
                        {inBasket && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-full">
                            x{inBasket.quantity}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Keypad / Custom Amount */}
          {activeTab === 'keypad' && (
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Sale Amount ({settings.currencyCode})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    {formatCurrency(0, settings.currencyCode).slice(0, 1)}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-lg font-bold font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick increment buttons */}
              <div className="flex flex-wrap gap-2">
                {[100, 200, 500, 1000, 2000, 5000].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleQuickAddKeypad(inc)}
                    className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono-numbers shadow-sm active:scale-95 transition-all"
                  >
                    +{formatCurrency(inc, settings.currencyCode)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCustomAmount('')}
                  className="px-2.5 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100"
                >
                  Clear
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Item Description (Optional)
                </label>
                <input
                  type="text"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="e.g. 5kg Garri, Recharge Card, Detergent"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Current Basket Summary */}
          {basket.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  Selected Items ({basket.reduce((a, b) => a + b.quantity, 0)})
                </span>
                <span className="font-mono-numbers text-emerald-700 font-bold">
                  {formatCurrency(basketTotal, settings.currencyCode)}
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {basket.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between py-1 px-2 bg-white rounded-lg border border-slate-200/80 text-xs"
                  >
                    <div className="truncate pr-2">
                      <span className="font-medium text-slate-800">{item.name}</span>
                      <span className="text-slate-400 ml-1 font-mono-numbers">
                        @{formatCurrency(item.price, settings.currencyCode)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.itemId, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold font-mono-numbers text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.itemId, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="w-16 text-right font-bold font-mono-numbers text-slate-900">
                        {formatCurrency(item.price * item.quantity, settings.currencyCode)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Type: PAID vs CREDIT (The Heart of the MVP) */}
          <div className="space-y-3 pt-1 border-t border-slate-200">
            <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Payment Settlement
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSaleType('paid')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  saleType === 'paid'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">Paid Now</span>
                  </div>
                  {saleType === 'paid' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">Customer paid in full</p>
              </button>

              <button
                type="button"
                onClick={() => setSaleType('credit')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  saleType === 'credit'
                    ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-sm text-slate-900">Credit (Debt)</span>
                  </div>
                  {saleType === 'credit' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">Record to customer debt book</p>
              </button>
            </div>

            {/* Sub-choice for PAID: Cash Drawer vs Bank Transfer */}
            {saleType === 'paid' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Payment Channel:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    💵 Cash (To Drawer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      paymentMethod === 'transfer'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🏦 Bank Transfer / POS
                  </button>
                </div>
              </div>
            )}

            {/* Sub-choice for CREDIT: Select Customer */}
            {saleType === 'credit' && (
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Select Customer for Credit
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(!showAddCustomer)}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {showAddCustomer ? 'Cancel' : '+ New Customer'}
                  </button>
                </div>

                {showAddCustomer ? (
                  <form onSubmit={handleCreateCustomer} className="space-y-2 bg-white p-3 rounded-lg border border-amber-200">
                    <div className="text-xs font-semibold text-slate-800">Add New Customer to Debt Book</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Customer Full Name *"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <input
                        type="tel"
                        placeholder="WhatsApp / Phone (e.g. 08012345678)"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCustomer(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                      >
                        Save & Select
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Choose Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Current debt: {formatCurrency(c.balance, settings.currencyCode)})
                        </option>
                      ))}
                    </select>

                    {selectedCustomerObj && (
                      <div className="mt-2 text-xs flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-amber-200">
                        <span className="text-slate-600">
                          Current Debt: <strong className="text-rose-600 font-mono-numbers">{formatCurrency(selectedCustomerObj.balance, settings.currencyCode)}</strong>
                        </span>
                        <span className="text-slate-600">
                          New Debt Balance: <strong className="text-amber-800 font-mono-numbers">{formatCurrency(selectedCustomerObj.balance + totalAmount, settings.currencyCode)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Note input */}
            <div>
              <input
                type="text"
                placeholder="Add quick sale note (optional)..."
                value={saleNote}
                onChange={(e) => setSaleNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Footer / Total & CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Amount</div>
            <div className="text-2xl font-extrabold font-mono-numbers text-slate-900 leading-none mt-0.5">
              {formatCurrency(totalAmount, settings.currencyCode)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              disabled={totalAmount <= 0}
              onClick={handleSubmitSale}
              className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-[0.98] ${
                totalAmount <= 0
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : saleType === 'paid'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              {saleType === 'paid'
                ? `Confirm Paid Sale · ${formatCurrency(totalAmount, settings.currencyCode)}`
                : `Save to Debt Book · ${formatCurrency(totalAmount, settings.currencyCode)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
