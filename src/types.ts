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

export type ViewMode = 'dashboard' | 'transactions' | 'analytics' | 'ai';

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
