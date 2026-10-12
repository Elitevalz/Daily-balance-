import { CurrencyCode, SUPPORTED_CURRENCIES } from '../types';

export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'NGN'): string {
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.NGN;
  
  // Format with integer decimals if 0, or up to 2
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const sign = amount < 0 ? '-' : '';
  return `${sign}${config.symbol}${formatted}`;
}

export function formatCompactNumber(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + 'M';
  }
  if (Math.abs(amount) >= 10_000) {
    return (amount / 1_000).toFixed(1) + 'k';
  }
  return amount.toLocaleString();
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)} · ${formatTime(isoString)}`;
}

export function cleanPhoneNumber(phone: string): string {
  // Remove spaces, hyphens, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, '');
  // If starts with 0 and has 11 digits (e.g. Nigerian 080... or similar), turn to international if needed
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  }
  // Strip leading + for wa.me
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function generateWhatsAppReminder(
  customerName: string,
  amount: number,
  currencyCode: CurrencyCode,
  shopName: string,
  templateType: 'friendly' | 'urgent' | 'detailed' = 'friendly',
  recentItems?: string
): string {
  const formattedAmount = formatCurrency(amount, currencyCode);

  switch (templateType) {
    case 'friendly':
      return `Hello ${customerName}, hope you're having a good day! 

Friendly reminder from *${shopName}*: your pending balance is *${formattedAmount}*. 

You can drop by to balance up whenever you're around. Thank you for your continued patronage! 🙏`;

    case 'urgent':
      return `Good day ${customerName}, this is a gentle follow-up from *${shopName}*.

Your outstanding balance of *${formattedAmount}* is due for balancing. Please arrange payment today via cash or bank transfer to help us replenish our stock. 

Thank you!`;

    case 'detailed':
      return `Notice of Balance — *${shopName}*
Customer: ${customerName}
Current Total Owed: *${formattedAmount}*
${recentItems ? `Items on credit: ${recentItems}\n` : ''}
Please let us know once you make payment or kindly stop by the shop. We truly appreciate your support!`;
  }
}

export function createWhatsAppUrl(phone: string, message: string): string {
  const cleanedPhone = cleanPhoneNumber(phone);
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}
