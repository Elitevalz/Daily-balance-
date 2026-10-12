export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'KES' | 'GHS' | 'XOF' | 'ZAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)', locale: 'en-NG' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)', locale: 'en-US' },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi (GH₵)', locale: 'en-GH' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)', locale: 'en-KE' },
  XOF: { code: 'XOF', symbol: 'CFA', name: 'West African CFA (CFA)', locale: 'fr-SN' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)', locale: 'en-ZA' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)', locale: 'en-GB' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)', locale: 'de-DE' },
};

export type SaleType = 'paid' | 'credit';
export type PaymentMethod = 'cash' | 'transfer' | 'pos';

export interface QuickSaleItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  icon?: string;
}

export interface BasketItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface SaleRecord {
  id: string;
  timestamp: string; // ISO string
  amount: number;
  type: SaleType;
  paymentMethod?: PaymentMethod;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  description: string;
  items?: BasketItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number; // positive means they owe the store
  createdAt: string;
  lastActivityAt: string;
  notes?: string;
}

export interface DebtTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'credit_given' | 'repayment';
  amount: number;
  timestamp: string;
  paymentMethod?: PaymentMethod; // for repayments (cash vs transfer)
  note?: string;
  saleId?: string;
  previousBalance: number;
  newBalance: number;
}

export type CashAccountType = 'shop_cash' | 'pos_float';
export type CashFlowDirection = 'in' | 'out';

export interface CashFlowEntry {
  id: string;
  timestamp: string;
  account: CashAccountType;
  direction: CashFlowDirection;
  amount: number;
  category: string;
  description: string;
  relatedSaleId?: string;
  relatedDebtId?: string;
}

export interface DailyCloseRecord {
  id: string;
  date: string; // YYYY-MM-DD
  closedAt: string;
  startingShopCash: number;
  startingPosFloat: number;
  totalSales: number;
  cashSales: number;
  transferSales: number;
  creditSales: number;
  debtsCollectedCash: number;
  debtsCollectedTransfer: number;
  cashOutShop: number;
  posFloatIn: number;
  posFloatOut: number;
  expectedShopCash: number;
  actualCountedShopCash: number;
  shopCashDiscrepancy: number; // actual - expected
  expectedPosFloat: number;
  actualCountedPosFloat: number;
  posFloatDiscrepancy: number; // actual - expected
  notes?: string;
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  currencyCode: CurrencyCode;
  defaultStartingShopCash: number;
  defaultStartingPosFloat: number;
  soundEnabled: boolean;
  quickItems: QuickSaleItem[];
}
