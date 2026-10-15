export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface CategoryBudget {
  category: string;
  limit: number;
}

export type ViewMode = 'dashboard' | 'transactions' | 'analytics' | 'debts' | 'ai';

// Kredi Kartı
export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  limit: number;
  color: string;
  lastFourDigits: string;
}

// Taksitli İşlem
export interface Installment {
  id: string;
  creditCardId: string;
  description: string;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  startDate: string; // İlk taksit tarihi
  paymentDay: number; // Ayın kaçıncı günü (1-31)
  category: string;
  paidInstallments: number; // Ödenen taksit sayısı
  isActive: boolean;
}

// Kredi Borcu
export interface Loan {
  id: string;
  type: 'konut' | 'ihtiyac' | 'tasit' | 'ogretim' | 'diger';
  bank: string;
  description: string;
  totalAmount: number; // Toplam kredi tutarı
  remainingAmount: number; // Kalan borç
  monthlyPayment: number; // Aylık taksit
  totalInstallments: number; // Toplam vade
  paidInstallments: number; // Ödenen taksit
  interestRate: number; // Faiz oranı
  startDate: string;
  paymentDay: number; // Ayın kaçıncı günü
  isActive: boolean;
}

export const LOAN_TYPES = [
  { value: 'konut', label: 'Konut Kredisi', icon: '🏠' },
  { value: 'ihtiyac', label: 'İhtiyaç Kredisi', icon: '💰' },
  { value: 'tasit', label: 'Taşıt Kredisi', icon: '🚗' },
  { value: 'ogretim', label: 'Öğretim Kredisi', icon: '🎓' },
  { value: 'diger', label: 'Diğer', icon: '📋' },
];

export const CREDIT_CARD_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export const INCOME_CATEGORIES = [
  'Maaş',
  'Serbest Çalışma',
  'Yatırım',
  'Kira Geliri',
  'Hediye',
  'Diğer Gelir',
];

export const EXPENSE_CATEGORIES = [
  'Kira',
  'Faturalar',
  'Market',
  'Ulaşım',
  'Sağlık',
  'Eğitim',
  'Eğlence',
  'Giyim',
  'Restoran',
  'Sigorta',
  'Bakım',
  'Diğer Gider',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Maaş': '#10B981',
  'Serbest Çalışma': '#3B82F6',
  'Yatırım': '#8B5CF6',
  'Kira Geliri': '#F59E0B',
  'Hediye': '#EC4899',
  'Diğer Gelir': '#6B7280',
  'Kira': '#EF4444',
  'Faturalar': '#F97316',
  'Market': '#14B8A6',
  'Ulaşım': '#6366F1',
  'Sağlık': '#EC4899',
  'Eğitim': '#8B5CF6',
  'Eğlence': '#F59E0B',
  'Giyim': '#06B6D4',
  'Restoran': '#84CC16',
  'Sigorta': '#A855F7',
  'Bakım': '#FB923C',
  'Diğer Gider': '#6B7280',
};
