import { Transaction } from './types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: tr });
};

export const formatShortDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'dd MMM', { locale: tr });
};

export const getTransactionsForPeriod = (
  transactions: Transaction[],
  period: 'week' | 'month' | 'year' | 'all'
): Transaction[] => {
  const now = new Date();
  
  if (period === 'all') return transactions;
  
  let start: Date;
  let end: Date;
  
  switch (period) {
    case 'week':
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      return transactions;
  }
  
  return transactions.filter((t) => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start, end });
  });
};

export const getTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getTotalExpense = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getBalance = (transactions: Transaction[]): number => {
  return getTotalIncome(transactions) - getTotalExpense(transactions);
};

export const getTransactionsByCategory = (
  transactions: Transaction[],
  type: 'income' | 'expense'
): { category: string; amount: number; color: string }[] => {
  const filtered = transactions.filter((t) => t.type === type);
  const grouped: Record<string, number> = {};
  
  filtered.forEach((t) => {
    grouped[t.category] = (grouped[t.category] || 0) + t.amount;
  });
  
  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
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
  return colors[category] || '#6B7280';
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem('finance_transactions');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem('finance_transactions', JSON.stringify(transactions));
};

export const getMonthlyData = (transactions: Transaction[]): { month: string; income: number; expense: number }[] => {
  const months: Record<string, { income: number; expense: number }> = {};
  
  transactions.forEach((t) => {
    const date = parseISO(t.date);
    const key = format(date, 'MMM yyyy', { locale: tr });
    
    if (!months[key]) {
      months[key] = { income: 0, expense: 0 };
    }
    
    if (t.type === 'income') {
      months[key].income += t.amount;
    } else {
      months[key].expense += t.amount;
    }
  });
  
  return Object.entries(months)
    .map(([month, data]) => ({ month, ...data }))
    .reverse()
    .slice(0, 6);
};
