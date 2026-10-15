import React, { useState, useEffect } from 'react';
import { Transaction, ViewMode } from './types';
import {
  loadTransactions,
  saveTransactions,
  getTransactionsForPeriod,
  formatCurrency,
  getBalance,
  getTotalIncome,
  getTotalExpense,
} from './utils';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import AIAdvisor from './components/AIAdvisor';
import {
  LayoutDashboard,
  List,
  BarChart3,
  Plus,
  Moon,
  Sun,
  Wallet,
  Calendar,
  Bot,
} from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const handleAddTransaction = (transaction: Transaction) => {
    const updated = [...transactions, transaction];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const filteredTransactions = getTransactionsForPeriod(transactions, period);
  const balance = getBalance(filteredTransactions);
  const totalIncome = getTotalIncome(filteredTransactions);
  const totalExpense = getTotalExpense(filteredTransactions);

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Özet', icon: LayoutDashboard },
    { id: 'transactions' as ViewMode, label: 'İşlemler', icon: List },
    { id: 'analytics' as ViewMode, label: 'Analiz', icon: BarChart3 },
    { id: 'ai' as ViewMode, label: 'AI Danışman', icon: Bot },
  ];

  const periodOptions = [
    { id: 'week' as const, label: 'Hafta' },
    { id: 'month' as const, label: 'Ay' },
    { id: 'year' as const, label: 'Yıl' },
    { id: 'all' as const, label: 'Tümü' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Wallet size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800 dark:text-white">FinansYönetim</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Kişisel Bütçe Takibi</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bakiye</p>
                  <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gelir</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gider</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalExpense)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? (
                    <Sun size={20} className="text-amber-400" />
                  ) : (
                    <Moon size={20} className="text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Yeni İşlem</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation & Period Selector */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Nav Tabs */}
            <nav className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    view === item.id
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Period Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
              <Calendar size={16} className="text-gray-400 ml-2" />
              {periodOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    period === opt.id
                      ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {view === 'dashboard' && (
            <Dashboard transactions={filteredTransactions} period={period} />
          )}
          {view === 'transactions' && (
            <TransactionList
              transactions={filteredTransactions}
              onDelete={handleDeleteTransaction}
            />
          )}
          {view === 'analytics' && (
            <Charts transactions={filteredTransactions} />
          )}
          {view === 'ai' && (
            <AIAdvisor
              transactions={filteredTransactions}
              period={period === 'week' ? 'Bu Hafta' : period === 'month' ? 'Bu Ay' : period === 'year' ? 'Bu Yıl' : 'Tüm Zamanlar'}
            />
          )}
        </main>

        {/* Transaction Form Modal */}
        {showForm && (
          <TransactionForm
            onAdd={handleAddTransaction}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 sm:hidden z-40">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  view === item.id
                    ? 'text-blue-500'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowForm(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-blue-500"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Plus size={18} className="text-white" />
              </div>
              <span className="text-xs font-medium">Ekle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
