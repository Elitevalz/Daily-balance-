import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Phone, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { Customer, ShopSettings } from '../types';
import { 
  createWhatsAppUrl, 
  formatCurrency, 
  generateWhatsAppReminder, 
  cleanPhoneNumber 
} from '../utils/formatters';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  settings: ShopSettings;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  customer,
  settings,
}) => {
  if (!isOpen || !customer) return null;

  const [templateType, setTemplateType] = useState<'friendly' | 'urgent' | 'detailed'>('friendly');
  const [customPhone, setCustomPhone] = useState<string>(customer.phone || '');
  const [customMessage, setCustomMessage] = useState<string>(() =>
    generateWhatsAppReminder(customer.name, customer.balance, settings.currencyCode, settings.shopName, 'friendly')
  );
  const [copied, setCopied] = useState<boolean>(false);

  const handleTemplateChange = (type: 'friendly' | 'urgent' | 'detailed') => {
    setTemplateType(type);
    setCustomMessage(
      generateWhatsAppReminder(customer.name, customer.balance, settings.currencyCode, settings.shopName, type)
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cleanedPhone = cleanPhoneNumber(customPhone);
  const waUrl = createWhatsAppUrl(cleanedPhone, customMessage);
  const smsUrl = `sms:${cleanedPhone}?body=${encodeURIComponent(customMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">One-Tap WhatsApp Reminder</h2>
              <p className="text-xs text-slate-500">Send friendly debt reminder directly to customer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Customer Summary Card */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-900">{customer.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{customer.phone || 'No phone set'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Outstanding Balance</div>
              <div className="text-base font-extrabold font-mono-numbers text-rose-600">
                {formatCurrency(customer.balance, settings.currencyCode)}
              </div>
            </div>
          </div>

          {/* Phone verification input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp / Phone Number
            </label>
            <input
              type="text"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="e.g. 08031234567 or +234..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-numbers"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              WhatsApp link will target: +{cleanedPhone}
            </p>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateChange('friendly')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                  templateType === 'friendly'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Friendly & Polite
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('urgent')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                  templateType === 'urgent'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Firm / Due Date
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('detailed')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                  templateType === 'detailed'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Detailed Notice
              </button>
            </div>
          </div>

          {/* Editable Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Message Content
              </label>
              <span className="text-[11px] text-slate-400">Editable</span>
            </div>
            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs leading-relaxed bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans text-slate-800"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <a
              href={smsUrl}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-sm"
            >
              SMS
            </a>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Open in WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};
