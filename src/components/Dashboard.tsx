import React, { useEffect, useState } from 'react';
import { Transaction } from '../types';
import {
  formatCurrency,
  getTotalIncome,
  getTotalExpense,
  getBalance,
  getTransactionsByCategory,
  formatDate,
  getCategoryColor,
  getTotalMonthlyDebtPayment,
  getTotalDebt,
  loadInstallments,
  loadLoans,
} from '../utils';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  CreditCard,
} from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  period: 'week' | 'month' | 'year' | 'all';
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, period }) => {
  const [monthlyDebt, setMonthlyDebt] = useState(0);
  const [totalDebtAmount, setTotalDebtAmount] = useState(0);

  useEffect(() => {
    const installments = loadInstallments();
    const loans = loadLoans();
    setMonthlyDebt(getTotalMonthlyDebtPayment(installments, loans));
    setTotalDebtAmount(getTotalDebt(installments, loans));
  }, []);

  const totalIncome = getTotalIncome(transactions);
  const totalExpense = getTotalExpense(transactions);
  const balance = getBalance(transactions);
  const expenseByCategory = getTransactionsByCategory(transactions, 'expense');
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const periodLabels = {
    week: 'Bu Hafta',
    month: 'Bu Ay',
    year: 'Bu Yıl',
    all: 'Tüm Zamanlar',
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-100">Toplam Bakiye</span>
            <Wallet size={20} className="text-blue-200" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
          <p className="text-xs text-blue-200 mt-2">{periodLabels[period]}</p>
        </div>

        {/* Income */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Gelir</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowUpRight size={12} />
            {transactions.filter(t => t.type === 'income').length} işlem
          </p>
        </div>

        {/* Expense */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Gider</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <TrendingDown size={16} className="text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            <ArrowDownRight size={12} />
            {transactions.filter(t => t.type === 'expense').length} işlem
          </p>
        </div>

        {/* Savings Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasarruf Oranı</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Target size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">%{savingsRate.toFixed(1)}</p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                savingsRate >= 20 ? 'bg-emerald-500' : savingsRate >= 0 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Monthly Debt */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Aylık Borç</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <CreditCard size={16} className="text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(monthlyDebt)}</p>
          <p className="text-xs text-gray-400 mt-2">
            Toplam: {formatCurrency(totalDebtAmount)}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Expenses */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Son İşlemler
            </h3>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-400 dark:text-gray-500">Henüz işlem yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      t.type === 'income'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-rose-100 dark:bg-rose-900/30'
                    }`}
                  >
                    {t.type === 'income' ? (
                      <ArrowUpRight size={16} className="text-emerald-600" />
                    ) : (
                      <ArrowDownRight size={16} className="text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {t.description || t.category}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                  </div>
                  <p className={`text-sm font-bold ${
                    t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Kategori Dağılımı</h3>
          {expenseByCategory.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-400 dark:text-gray-500">Henüz gider yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenseByCategory.slice(0, 6).map((item) => {
                const percentage = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.category}</span>
                      <span className="text-xs font-medium text-gray-800 dark:text-white">%{percentage.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getCategoryColor(item.category),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
