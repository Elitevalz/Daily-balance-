import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Coins, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  Download,
  Save
} from 'lucide-react';
import { 
  CurrencyCode, 
  QuickSaleItem, 
  ShopSettings, 
  SUPPORTED_CURRENCIES 
} from '../types';
import { formatCurrency } from '../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => void;
  onResetSampleData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetSampleData,
}) => {
  if (!isOpen) return null;

  const [shopName, setShopName] = useState(settings.shopName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [phone, setPhone] = useState(settings.phone);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(settings.currencyCode);
  const [defaultStartingShopCash, setDefaultStartingShopCash] = useState(String(settings.defaultStartingShopCash));
  const [defaultStartingPosFloat, setDefaultStartingPosFloat] = useState(String(settings.defaultStartingPosFloat));
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [quickItems, setQuickItems] = useState<QuickSaleItem[]>(settings.quickItems);

  // New quick item
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const handleAddQuickItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newItemPrice) || 0;
    if (!newItemName.trim() || priceNum <= 0) return;

    const newItem: QuickSaleItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      price: priceNum,
      category: 'General',
    };

    setQuickItems([...quickItems, newItem]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleRemoveQuickItem = (id: string) => {
    setQuickItems(quickItems.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    onSaveSettings({
      shopName: shopName.trim() || 'My Provision Store',
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      currencyCode,
      defaultStartingShopCash: parseFloat(defaultStartingShopCash) || 0,
      defaultStartingPosFloat: parseFloat(defaultStartingPosFloat) || 0,
      soundEnabled,
      quickItems,
    });
    onClose();
  };

  const handleExportData = () => {
    const data = {
      settings,
      sales: localStorage.getItem('dailybalance_sales'),
      customers: localStorage.getItem('dailybalance_customers'),
      debtTransactions: localStorage.getItem('dailybalance_debt_transactions'),
      cashFlows: localStorage.getItem('dailybalance_cash_flows'),
      dailyCloses: localStorage.getItem('dailybalance_daily_closes'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dailybalance-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Shop Settings & Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Shop details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Store Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Shop / Kiosk Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              Currency & Region
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => setCurrencyCode(curr.code)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    currencyCode === curr.code
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-base font-bold font-mono-numbers">{curr.symbol}</div>
                  <div className="text-[11px] text-slate-500 truncate">{curr.code}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Starting float defaults */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Default Daily Starting Money</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Default Shop Cash Drawer ({currencyCode})
                </label>
                <input
                  type="number"
                  value={defaultStartingShopCash}
                  onChange={(e) => setDefaultStartingShopCash(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Default POS Float Reserve ({currencyCode})
                </label>
                <input
                  type="number"
                  value={defaultStartingPosFloat}
                  onChange={(e) => setDefaultStartingPosFloat(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Item Presets Manager */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">
              Quick Preset Items for 1-Tap Sale Entry ({quickItems.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Customize the fast buttons that appear on the New Sale screen.
            </p>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {quickItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-slate-800 truncate">{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold font-mono-numbers text-emerald-700">
                      {formatCurrency(item.price, currencyCode)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuickItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new quick preset */}
            <form onSubmit={handleAddQuickItem} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Item name (e.g. Soda)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs"
              />
              <input
                type="number"
                placeholder="Price"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-24 px-2.5 py-1.5 border rounded-lg font-mono-numbers text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          </div>

          {/* Audio Chime toggle */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Sound Effects</span>
              <span className="text-[11px] text-slate-500">
                Play pleasant cash register chime when recording sales
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Backup & Reset */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              <Download className="w-3.5 h-3.5" /> Backup Data (JSON)
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset store data back to initial sample store demonstration?')) {
                  onResetSampleData();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-800"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Demo Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
