import {
  Customer,
  DailyCloseRecord,
  DebtTransaction,
  QuickSaleItem,
  SaleRecord,
  ShopSettings,
  CashFlowEntry,
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'dailybalance_settings',
  SALES: 'dailybalance_sales',
  CUSTOMERS: 'dailybalance_customers',
  DEBT_TRANSACTIONS: 'dailybalance_debt_transactions',
  CASH_FLOWS: 'dailybalance_cash_flows',
  DAILY_CLOSES: 'dailybalance_daily_closes',
  TODAY_STARTING_CASH: 'dailybalance_today_starting_cash',
  TODAY_STARTING_FLOAT: 'dailybalance_today_starting_float',
};

export const DEFAULT_QUICK_ITEMS: QuickSaleItem[] = [
  { id: 'item-1', name: 'Bread (Family Loaf)', price: 1200, category: 'Bakery' },
  { id: 'item-2', name: 'Peak Milk Tin', price: 650, category: 'Dairy' },
  { id: 'item-3', name: 'Eggs (Crate of 4)', price: 700, category: 'Provision' },
  { id: 'item-4', name: 'Coca-Cola / Malta (Pet)', price: 450, category: 'Drinks' },
  { id: 'item-5', name: 'Indomie Super Pack (x2)', price: 900, category: 'Provision' },
  { id: 'item-6', name: 'Sugar (St. Louis Cube)', price: 500, category: 'Provision' },
  { id: 'item-7', name: 'Detergent Omo / Ariel', price: 350, category: 'Household' },
  { id: 'item-8', name: 'POS Cashout (5k)', price: 5000, category: 'POS Agency' },
];

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Mama Chidi Provision & POS',
  ownerName: 'Mrs. Chidi',
  phone: '08031234567',
  currencyCode: 'NGN',
  defaultStartingShopCash: 15000,
  defaultStartingPosFloat: 50000,
  soundEnabled: true,
  quickItems: DEFAULT_QUICK_ITEMS,
};

// Seed initial customers
export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Baba Tunde (Carpenter)',
    phone: '08039988771',
    balance: 4500,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Shop down the street. Always pays on Friday.',
  },
  {
    id: 'cust-2',
    name: 'Sister Blessing (Hair Stylist)',
    phone: '08123456789',
    balance: 1800,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    notes: 'Salon next door. Reliable customer.',
  },
  {
    id: 'cust-3',
    name: 'Uncle Emeka (Building Site)',
    phone: '07055443322',
    balance: 8200,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Takes drinks and food for bricklayers.',
  },
  {
    id: 'cust-4',
    name: 'Mummy Daniel',
    phone: '09011223344',
    balance: 0,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    notes: 'Cleared all credit balance last week.',
  },
];

// Seed initial today's sales
export const SEED_SALES: SaleRecord[] = [
  {
    id: 'sale-1',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    amount: 2400,
    type: 'paid',
    paymentMethod: 'cash',
    description: 'Bread (Family Loaf) x2',
    items: [{ itemId: 'item-1', name: 'Bread (Family Loaf)', price: 1200, quantity: 2 }],
  },
  {
    id: 'sale-2',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    amount: 5000,
    type: 'paid',
    paymentMethod: 'pos',
    description: 'POS Cashout (5k)',
    items: [{ itemId: 'item-8', name: 'POS Cashout (5k)', price: 5000, quantity: 1 }],
  },
  {
    id: 'sale-3',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    amount: 1800,
    type: 'credit',
    customerId: 'cust-2',
    customerName: 'Sister Blessing (Hair Stylist)',
    customerPhone: '08123456789',
    description: 'Indomie Super Pack (x2) + Peak Milk Tin',
    items: [
      { itemId: 'item-5', name: 'Indomie Super Pack (x2)', price: 900, quantity: 1 },
      { itemId: 'item-2', name: 'Peak Milk Tin', price: 650, quantity: 1 },
      { itemId: 'custom', name: 'Matchbox & sweets', price: 250, quantity: 1 },
    ],
  },
  {
    id: 'sale-4',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    amount: 4350,
    type: 'paid',
    paymentMethod: 'cash',
    description: 'Provisions and soft drinks',
    items: [
      { itemId: 'item-4', name: 'Coca-Cola / Malta (Pet)', price: 450, quantity: 3 },
      { itemId: 'item-1', name: 'Bread (Family Loaf)', price: 1200, quantity: 1 },
      { itemId: 'item-6', name: 'Sugar (St. Louis Cube)', price: 500, quantity: 1 },
      { itemId: 'custom', name: 'Milk Powder sachet', price: 1300, quantity: 1 },
    ],
  },
  {
    id: 'sale-5',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    amount: 3200,
    type: 'paid',
    paymentMethod: 'transfer',
    description: 'Detergent Omo + Provisions',
  },
];

// Seed debt transaction history
export const SEED_DEBT_TRANSACTIONS: DebtTransaction[] = [
  {
    id: 'dt-1',
    customerId: 'cust-1',
    customerName: 'Baba Tunde (Carpenter)',
    type: 'credit_given',
    amount: 4500,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    note: 'Took 1 bag small rice + vegetable oil on credit',
    previousBalance: 0,
    newBalance: 4500,
  },
  {
    id: 'dt-2',
    customerId: 'cust-3',
    customerName: 'Uncle Emeka (Building Site)',
    type: 'credit_given',
    amount: 8200,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    note: 'Crate of soft drinks & biscuits for site workers',
    previousBalance: 0,
    newBalance: 8200,
  },
  {
    id: 'dt-3',
    customerId: 'cust-2',
    customerName: 'Sister Blessing (Hair Stylist)',
    type: 'credit_given',
    amount: 1800,
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    note: 'Indomie & Milk for salon lunch',
    previousBalance: 0,
    newBalance: 1800,
  },
];

// Seed cash flow entries
export const SEED_CASH_FLOWS: CashFlowEntry[] = [
  {
    id: 'cf-1',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    account: 'shop_cash',
    direction: 'in',
    amount: 2400,
    category: 'sale_cash',
    description: 'Cash sale: Bread (Family Loaf) x2',
    relatedSaleId: 'sale-1',
  },
  {
    id: 'cf-2',
    timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
    account: 'shop_cash',
    direction: 'out',
    amount: 4000,
    category: 'supplier_stock',
    description: 'Bread distributor delivery (10 loaves cash payment)',
  },
  {
    id: 'cf-3',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    account: 'pos_float',
    direction: 'out',
    amount: 5000,
    category: 'pos_cashout',
    description: 'POS Cash given to customer (received in bank + ₦200 fee)',
    relatedSaleId: 'sale-2',
  },
  {
    id: 'cf-4',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    account: 'shop_cash',
    direction: 'in',
    amount: 4350,
    category: 'sale_cash',
    description: 'Cash sale: Provisions and soft drinks',
    relatedSaleId: 'sale-4',
  },
  {
    id: 'cf-5',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    account: 'shop_cash',
    direction: 'out',
    amount: 1500,
    category: 'store_expense',
    description: 'Generator fuel (1.5 litres for shop freezer)',
  },
];

// Seed a previous day closed record for history
export const SEED_DAILY_CLOSES: DailyCloseRecord[] = [
  {
    id: 'close-yesterday',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    closedAt: new Date(Date.now() - 86400000 + 72000000).toISOString(),
    startingShopCash: 12000,
    startingPosFloat: 50000,
    totalSales: 34200,
    cashSales: 19500,
    transferSales: 10200,
    creditSales: 4500,
    debtsCollectedCash: 3000,
    debtsCollectedTransfer: 0,
    cashOutShop: 5500,
    posFloatIn: 0,
    posFloatOut: 15000,
    expectedShopCash: 29000,
    actualCountedShopCash: 29000,
    shopCashDiscrepancy: 0,
    expectedPosFloat: 35000,
    actualCountedPosFloat: 35000,
    posFloatDiscrepancy: 0,
    notes: 'Smooth sales day. All counted cash matched drawer records perfectly.',
  },
];

export function getStoredSettings(): ShopSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ShopSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getStoredSales(): SaleRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  if (!data) {
    saveSales(SEED_SALES);
    return SEED_SALES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveSales(sales: SaleRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
}

export function getStoredCustomers(): Customer[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  if (!data) {
    saveCustomers(SEED_CUSTOMERS);
    return SEED_CUSTOMERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

export function getStoredDebtTransactions(): DebtTransaction[] {
  const data = localStorage.getItem(STORAGE_KEYS.DEBT_TRANSACTIONS);
  if (!data) {
    saveDebtTransactions(SEED_DEBT_TRANSACTIONS);
    return SEED_DEBT_TRANSACTIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveDebtTransactions(transactions: DebtTransaction[]): void {
  localStorage.setItem(STORAGE_KEYS.DEBT_TRANSACTIONS, JSON.stringify(transactions));
}

export function getStoredCashFlows(): CashFlowEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.CASH_FLOWS);
  if (!data) {
    saveCashFlows(SEED_CASH_FLOWS);
    return SEED_CASH_FLOWS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveCashFlows(flows: CashFlowEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.CASH_FLOWS, JSON.stringify(flows));
}

export function getStoredDailyCloses(): DailyCloseRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_CLOSES);
  if (!data) {
    saveDailyCloses(SEED_DAILY_CLOSES);
    return SEED_DAILY_CLOSES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveDailyCloses(closes: DailyCloseRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.DAILY_CLOSES, JSON.stringify(closes));
}

export function getStartingShopCash(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.TODAY_STARTING_CASH);
  if (stored !== null) return Number(stored);
  const settings = getStoredSettings();
  return settings.defaultStartingShopCash;
}

export function setStartingShopCash(amount: number): void {
  localStorage.setItem(STORAGE_KEYS.TODAY_STARTING_CASH, String(amount));
}

export function getStartingPosFloat(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.TODAY_STARTING_FLOAT);
  if (stored !== null) return Number(stored);
  const settings = getStoredSettings();
  return settings.defaultStartingPosFloat;
}

export function setStartingPosFloat(amount: number): void {
  localStorage.setItem(STORAGE_KEYS.TODAY_STARTING_FLOAT, String(amount));
}

// Reset data back to default sample state
export function resetAppToSampleData(): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(SEED_SALES));
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
  localStorage.setItem(STORAGE_KEYS.DEBT_TRANSACTIONS, JSON.stringify(SEED_DEBT_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.CASH_FLOWS, JSON.stringify(SEED_CASH_FLOWS));
  localStorage.setItem(STORAGE_KEYS.DAILY_CLOSES, JSON.stringify(SEED_DAILY_CLOSES));
  localStorage.removeItem(STORAGE_KEYS.TODAY_STARTING_CASH);
  localStorage.removeItem(STORAGE_KEYS.TODAY_STARTING_FLOAT);
}

// Play a subtle positive audio tone using Web Audio API
export function playSuccessChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.18);

    // Second note (harmonic fifth)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio autoplay restrictions or unsupported
  }
}
