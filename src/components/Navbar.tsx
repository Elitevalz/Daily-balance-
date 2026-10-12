import React from 'react';
import { 
  Home, 
  PlusCircle, 
  BookUser, 
  Wallet, 
  CheckCircle2, 
  Settings, 
  Store
} from 'lucide-react';
import { ShopSettings } from '../types';

export type ActiveTab = 'home' | 'new-sale' | 'debts' | 'cash-float' | 'daily-close';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openNewSaleModal: () => void;
  openSettings: () => void;
  settings: ShopSettings;
  debtorCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openNewSaleModal,
  openSettings,
  settings,
  debtorCount,
}) => {
  return (
    <>
      {/* Desktop / Tablet Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors block leading-none">
                  DailyBalance
                </span>
                <span className="text-xs text-slate-500 font-medium truncate max-w-[140px] sm:max-w-[180px] block mt-0.5">
                  {settings.shopName}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean text hover) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'home'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('debts')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 relative ${
                activeTab === 'debts'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Debt Book
              {debtorCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[11px] font-mono-numbers font-semibold bg-amber-100 text-amber-800 rounded">
                  {debtorCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cash-float')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'cash-float'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Cash & Float
            </button>
            <button
              onClick={() => setActiveTab('daily-close')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'daily-close'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Daily Close
            </button>
          </nav>

          {/* Zone 3: Primary Action & Settings */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={openSettings}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Shop Settings & Currency"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={openNewSaleModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Sale</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Natural Thumb Zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'home' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-medium tracking-tight mt-1">Today</span>
          </button>

          <button
            onClick={() => setActiveTab('debts')}
            className={`flex flex-col items-center justify-center h-full relative transition-colors ${
              activeTab === 'debts' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <BookUser className="w-5 h-5" />
              {debtorCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {debtorCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-1">Debts</span>
          </button>

          {/* Prominent Center "New Sale" Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={openNewSaleModal}
              className="w-12 h-12 -mt-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
              aria-label="New Sale"
            >
              <PlusCircle className="w-7 h-7" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab('cash-float')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'cash-float' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[11px] font-medium tracking-tight mt-1">Float/Cash</span>
          </button>

          <button
            onClick={() => setActiveTab('daily-close')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'daily-close' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[11px] font-medium tracking-tight mt-1">Close Day</span>
          </button>
        </div>
      </div>
    </>
  );
};
