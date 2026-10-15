import React, { useState, useEffect } from 'react';
import { CreditCard, Installment, Loan, LOAN_TYPES, CREDIT_CARD_COLORS } from '../types';
import {
  generateId,
  formatCurrency,
  formatDate,
  loadCreditCards,
  saveCreditCards,
  loadInstallments,
  saveInstallments,
  loadLoans,
  saveLoans,
  getCardTotalDebt,
  getCardRemainingLimit,
  getThisMonthInstallments,
  getThisMonthLoans,
  getTotalMonthlyDebtPayment,
  getTotalDebt,
  getInstallmentProgress,
  getLoanProgress,
  getRemainingInstallments,
  getRemainingLoanMonths,
} from '../utils';
import {
  CreditCard as CreditCardIcon,
  Receipt,
  Building2,
  Calendar,
  Plus,
  X,
  Check,
  AlertTriangle,
  TrendingDown,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  CreditCard as CardIcon,
  PiggyBank,
  ArrowRight,
  Shield,
} from 'lucide-react';

type TabType = 'overview' | 'cards' | 'installments' | 'loans' | 'calendar';

const DebtManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showInstallmentForm, setShowInstallmentForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    setCreditCards(loadCreditCards());
    setInstallments(loadInstallments());
    setLoans(loadLoans());
  }, []);

  // Credit Card CRUD
  const addCreditCard = (card: CreditCard) => {
    const updated = [...creditCards, card];
    setCreditCards(updated);
    saveCreditCards(updated);
  };

  const deleteCreditCard = (id: string) => {
    if (!confirm('Bu kredi kartını silmek istediğinize emin misiniz? İlişkili taksitler silinmeyecektir.')) return;
    const updated = creditCards.filter((c) => c.id !== id);
    setCreditCards(updated);
    saveCreditCards(updated);
  };

  // Installment CRUD
  const addInstallment = (installment: Installment) => {
    const updated = [...installments, installment];
    setInstallments(updated);
    saveInstallments(updated);
  };

  const deleteInstallment = (id: string) => {
    if (!confirm('Bu taksitli işlemi silmek istediğinize emin misiniz?')) return;
    const updated = installments.filter((i) => i.id !== id);
    setInstallments(updated);
    saveInstallments(updated);
  };

  const payInstallment = (id: string) => {
    const updated = installments.map((i) => {
      if (i.id === id && i.paidInstallments < i.installmentCount) {
        return { ...i, paidInstallments: i.paidInstallments + 1 };
      }
      return i;
    });
    setInstallments(updated);
    saveInstallments(updated);
  };

  // Loan CRUD
  const addLoan = (loan: Loan) => {
    const updated = [...loans, loan];
    setLoans(updated);
    saveLoans(updated);
  };

  const deleteLoan = (id: string) => {
    if (!confirm('Bu krediyi silmek istediğinize emin misiniz?')) return;
    const updated = loans.filter((l) => l.id !== id);
    setLoans(updated);
    saveLoans(updated);
  };

  const payLoan = (id: string) => {
    const updated = loans.map((l) => {
      if (l.id === id && l.paidInstallments < l.totalInstallments) {
        const newPaid = l.paidInstallments + 1;
        const newRemaining = l.remainingAmount - l.monthlyPayment;
        return {
          ...l,
          paidInstallments: newPaid,
          remainingAmount: Math.max(0, newRemaining),
          isActive: newPaid < l.totalInstallments,
        };
      }
      return l;
    });
    setLoans(updated);
    saveLoans(updated);
  };

  const totalDebt = getTotalDebt(installments, loans);
  const monthlyPayment = getTotalMonthlyDebtPayment(installments, loans);
  const thisMonthInstallments = getThisMonthInstallments(installments);
  const thisMonthLoans = getThisMonthLoans(loans);
  const activeInstallments = installments.filter((i) => i.isActive && i.paidInstallments < i.installmentCount);
  const activeLoans = loans.filter((l) => l.isActive);

  const tabs = [
    { id: 'overview' as TabType, label: 'Özet', icon: PiggyBank },
    { id: 'cards' as TabType, label: 'Kredi Kartları', icon: CreditCardIcon },
    { id: 'installments' as TabType, label: 'Taksitler', icon: Receipt },
    { id: 'loans' as TabType, label: 'Krediler', icon: Building2 },
    { id: 'calendar' as TabType, label: 'Takvim', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg shadow-rose-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-rose-100">Toplam Borç</span>
            <TrendingDown size={18} className="text-rose-200" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
          <p className="text-xs text-rose-200 mt-1">{activeInstallments.length} taksit + {activeLoans.length} kredi aktif</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bu Ay Ödeme</span>
            <Calendar size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(monthlyPayment)}</p>
          <p className="text-xs text-gray-400 mt-1">{thisMonthInstallments.length + thisMonthLoans.length} ödeme</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Aktif Taksit</span>
            <Receipt size={18} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeInstallments.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {creditCards.length} kart, toplam {installments.filter(i => i.isActive).length} işlem
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Aktif Kredi</span>
            <Building2 size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeLoans.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {loans.length > 0 ? `${formatCurrency(loans.reduce((s, l) => s + l.monthlyPayment, 0))}/ay` : 'Kredi yok'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'overview' && (
            <OverviewTab
              creditCards={creditCards}
              installments={installments}
              loans={loans}
              thisMonthInstallments={thisMonthInstallments}
              thisMonthLoans={thisMonthLoans}
            />
          )}
          {activeTab === 'cards' && (
            <CardsTab
              creditCards={creditCards}
              installments={installments}
              onAdd={() => setShowCardForm(true)}
              onDelete={deleteCreditCard}
              expandedCard={expandedCard}
              setExpandedCard={setExpandedCard}
            />
          )}
          {activeTab === 'installments' && (
            <InstallmentsTab
              installments={installments}
              creditCards={creditCards}
              onAdd={() => setShowInstallmentForm(true)}
              onDelete={deleteInstallment}
              onPay={payInstallment}
            />
          )}
          {activeTab === 'loans' && (
            <LoansTab
              loans={loans}
              onAdd={() => setShowLoanForm(true)}
              onDelete={deleteLoan}
              onPay={payLoan}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarTab
              installments={installments}
              loans={loans}
              creditCards={creditCards}
            />
          )}
        </div>
      </div>

      {/* Forms */}
      {showCardForm && (
        <CreditCardForm onClose={() => setShowCardForm(false)} onAdd={addCreditCard} />
      )}
      {showInstallmentForm && (
        <InstallmentForm
          onClose={() => setShowInstallmentForm(false)}
          onAdd={addInstallment}
          creditCards={creditCards}
        />
      )}
      {showLoanForm && (
        <LoanForm onClose={() => setShowLoanForm(false)} onAdd={addLoan} />
      )}
    </div>
  );
};

// ===== OVERVIEW TAB =====
const OverviewTab: React.FC<{
  creditCards: CreditCard[];
  installments: Installment[];
  loans: Loan[];
  thisMonthInstallments: { installment: Installment; dueDate: Date }[];
  thisMonthLoans: { loan: Loan; dueDate: Date }[];
}> = ({ creditCards, installments, loans, thisMonthInstallments, thisMonthLoans }) => {
  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Upcoming Payments */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <Clock size={18} className="text-amber-500" />
          Bu Ay Yaklaşan Ödemeler
        </h3>
        {(thisMonthInstallments.length === 0 && thisMonthLoans.length === 0) ? (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Bu ay için yaklaşan ödeme yok 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...thisMonthInstallments.map(i => ({
              type: 'installment' as const,
              description: i.installment.description,
              amount: i.installment.installmentAmount,
              date: i.dueDate,
              detail: `${getRemainingInstallments(i.installment)} taksit kaldı`,
            })),
            ...thisMonthLoans.map(l => ({
              type: 'loan' as const,
              description: l.loan.description || LOAN_TYPES.find(t => t.value === l.loan.type)?.label || 'Kredi',
              amount: l.loan.monthlyPayment,
              date: l.dueDate,
              detail: `${getRemainingLoanMonths(l.loan)} ay kaldı`,
            }))]
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((payment, idx) => {
                const isOverdue = payment.date < now;
                const isToday = payment.date.toDateString() === now.toDateString();
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                      isOverdue
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                        : isToday
                        ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                        : 'bg-white dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {payment.type === 'installment' ? (
                        <Receipt size={18} className={isOverdue ? 'text-red-600' : 'text-blue-600'} />
                      ) : (
                        <Building2 size={18} className={isOverdue ? 'text-red-600' : 'text-blue-600'} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{payment.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isOverdue ? '⚠️ Gecikmiş!' : isToday ? '🔔 Bugün!' : formatDate(payment.date.toISOString().split('T')[0])}
                        {' • '}{payment.detail}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Card Usage */}
      {creditCards.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <CreditCardIcon size={18} className="text-blue-500" />
            Kredi Kartı Kullanımı
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {creditCards.map((card) => {
              const debt = getCardTotalDebt(card.id, installments);
              const usagePercent = card.limit > 0 ? (debt / card.limit) * 100 : 0;
              return (
                <div key={card.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '20' }}>
                        <CreditCardIcon size={14} style={{ color: card.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{card.name}</p>
                        <p className="text-xs text-gray-500">****{card.lastFourDigits}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      usagePercent > 80 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      usagePercent > 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      %{usagePercent.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(usagePercent, 100)}%`,
                        backgroundColor: card.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">Borç: {formatCurrency(debt)}</span>
                    <span className="text-xs text-gray-500">Limit: {formatCurrency(card.limit)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== CARDS TAB =====
const CardsTab: React.FC<{
  creditCards: CreditCard[];
  installments: Installment[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  expandedCard: string | null;
  setExpandedCard: (id: string | null) => void;
}> = ({ creditCards, installments, onAdd, onDelete, expandedCard, setExpandedCard }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{creditCards.length} kredi kartı kayıtlı</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Kart Ekle
        </button>
      </div>

      {creditCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <CreditCardIcon size={28} className="text-blue-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz kredi kartı eklenmemiş</p>
          <button onClick={onAdd} className="text-blue-500 text-sm font-medium hover:underline">
            İlk kartınızı ekleyin →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {creditCards.map((card) => {
            const debt = getCardTotalDebt(card.id, installments);
            const remaining = getCardRemainingLimit(card, installments);
            const cardInstallments = installments.filter((i) => i.creditCardId === card.id && i.isActive);
            const isExpanded = expandedCard === card.id;

            return (
              <div key={card.id} className="rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden">
                {/* Card Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)` }}
                    >
                      {card.bank.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{card.name}</p>
                      <p className="text-xs text-gray-500">****{card.lastFourDigits} • {card.bank}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{formatCurrency(debt)}</p>
                      <p className="text-xs text-gray-500">/ {formatCurrency(card.limit)}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/30">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Kullanılan</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{formatCurrency(debt)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Kalan Limit</p>
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(remaining)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Aktif Taksit</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{cardInstallments.length}</p>
                      </div>
                    </div>

                    {cardInstallments.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Aktif Taksitler:</p>
                        {cardInstallments.slice(0, 3).map((inst) => (
                          <div key={inst.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-xs text-gray-700 dark:text-gray-300">{inst.description}</span>
                            <span className="text-xs font-medium text-gray-800 dark:text-white">
                              {inst.installmentCount - inst.paidInstallments}x {formatCurrency(inst.installmentAmount)}
                            </span>
                          </div>
                        ))}
                        {cardInstallments.length > 3 && (
                          <p className="text-xs text-gray-400 text-center">+{cardInstallments.length - 3} taksit daha</p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Kartı Sil
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===== INSTALLMENTS TAB =====
const InstallmentsTab: React.FC<{
  installments: Installment[];
  creditCards: CreditCard[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onPay: (id: string) => void;
}> = ({ installments, creditCards, onAdd, onDelete, onPay }) => {
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  const filtered = installments.filter((i) => {
    if (filter === 'active') return i.isActive && i.paidInstallments < i.installmentCount;
    if (filter === 'completed') return i.paidInstallments >= i.installmentCount;
    return true;
  });

  const getCardName = (cardId: string) => {
    const card = creditCards.find((c) => c.id === cardId);
    return card ? `${card.name} (****${card.lastFourDigits})` : 'Bilinmeyen Kart';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2">
          {(['active', 'completed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'active' ? 'Aktif' : f === 'completed' ? 'Tamamlanan' : 'Tümü'}
            </button>
          ))}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Taksit Ekle
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Receipt size={28} className="text-purple-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {filter === 'active' ? 'Aktif taksit yok' : filter === 'completed' ? 'Tamamlanan taksit yok' : 'Henüz taksit eklenmemiş'}
          </p>
          {filter === 'active' && (
            <button onClick={onAdd} className="text-blue-500 text-sm font-medium hover:underline">
              Taksitli işlem ekleyin →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inst) => {
            const progress = getInstallmentProgress(inst);
            const remaining = getRemainingInstallments(inst);
            const isCompleted = remaining === 0;

            return (
              <div key={inst.id} className={`p-4 rounded-xl border transition-colors ${
                isCompleted
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    {isCompleted ? (
                      <Check size={18} className="text-emerald-600" />
                    ) : (
                      <Receipt size={18} className="text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{inst.description}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                        {inst.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {getCardName(inst.creditCardId)} • Ayın {inst.paymentDay}'i
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {inst.paidInstallments}/{inst.installmentCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatCurrency(inst.installmentAmount)} x {remaining} taksit kaldı
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        Toplam: {formatCurrency(inst.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!isCompleted && (
                      <button
                        onClick={() => onPay(inst.id)}
                        className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                        title="Taksiti Öde"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(inst.id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===== LOANS TAB =====
const LoansTab: React.FC<{
  loans: Loan[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onPay: (id: string) => void;
}> = ({ loans, onAdd, onDelete, onPay }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{loans.length} kredi kayıtlı</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Kredi Ekle
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Building2 size={28} className="text-amber-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz kredi eklenmemiş</p>
          <button onClick={onAdd} className="text-blue-500 text-sm font-medium hover:underline">
            Kredi bilgilerinizi ekleyin →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const progress = getLoanProgress(loan);
            const remaining = getRemainingLoanMonths(loan);
            const loanType = LOAN_TYPES.find((t) => t.value === loan.type);
            const isCompleted = remaining === 0;

            return (
              <div key={loan.id} className={`p-4 rounded-xl border transition-colors ${
                isCompleted
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    <span className="text-lg">{loanType?.icon || '📋'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {loan.description || loanType?.label || 'Kredi'}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        {loan.bank}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      %{loan.interestRate} faiz • Ayın {loan.paymentDay}'i • {loan.totalInstallments} ay vade
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-amber-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {loan.paidInstallments}/{loan.totalInstallments} ay
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-500">Aylık</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{formatCurrency(loan.monthlyPayment)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-500">Kalan</p>
                        <p className="text-sm font-bold text-rose-600">{formatCurrency(loan.remainingAmount)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-500">Süre</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{remaining} ay</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!isCompleted && (
                      <button
                        onClick={() => onPay(loan.id)}
                        className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                        title="Taksiti Öde"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(loan.id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===== CALENDAR TAB =====
const CalendarTab: React.FC<{
  installments: Installment[];
  loans: Loan[];
  creditCards: CreditCard[];
}> = ({ installments, loans, creditCards }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const now = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  // Bu ayın ödemelerini hesapla
  const getPaymentsForMonth = (targetYear: number, targetMonth: number) => {
    const payments: { day: number; description: string; amount: number; type: 'installment' | 'loan' }[] = [];

    installments
      .filter((i) => i.isActive && i.paidInstallments < i.installmentCount)
      .forEach((inst) => {
        const startDate = new Date(inst.startDate);
        const monthsDiff = (targetYear - startDate.getFullYear()) * 12 + (targetMonth - startDate.getMonth());
        const currentInstallment = monthsDiff;

        if (currentInstallment >= 0 && currentInstallment < inst.installmentCount) {
          payments.push({
            day: inst.paymentDay,
            description: inst.description,
            amount: inst.installmentAmount,
            type: 'installment',
          });
        }
      });

    loans
      .filter((l) => l.isActive && l.paidInstallments < l.totalInstallments)
      .forEach((loan) => {
        const startDate = new Date(loan.startDate);
        const monthsDiff = (targetYear - startDate.getFullYear()) * 12 + (targetMonth - startDate.getMonth());

        if (monthsDiff >= 0 && monthsDiff < loan.totalInstallments) {
          payments.push({
            day: loan.paymentDay,
            description: loan.description || LOAN_TYPES.find(t => t.value === loan.type)?.label || 'Kredi',
            amount: loan.monthlyPayment,
            type: 'loan',
          });
        }
      });

    return payments.sort((a, b) => a.day - b.day);
  };

  const payments = getPaymentsForMonth(year, month);
  const totalMonthPayment = payments.reduce((sum, p) => sum + p.amount, 0);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronUp size={20} className="text-gray-600 dark:text-gray-400 -rotate-90" />
        </button>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {monthNames[month]} {year}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Toplam: <span className="font-semibold text-rose-600">{formatCurrency(totalMonthPayment)}</span>
          </p>
        </div>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronDown size={20} className="text-gray-600 dark:text-gray-400 -rotate-90" />
        </button>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Calendar size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Bu ay için planlanmış ödeme yok</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment, idx) => {
            const paymentDate = new Date(year, month, payment.day);
            const isPast = paymentDate < now && (paymentDate.getMonth() !== now.getMonth() || paymentDate.getDate() < now.getDate());
            const isToday = paymentDate.toDateString() === now.toDateString();

            return (
              <div
                key={idx}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  isToday
                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                    : isPast
                    ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-600 opacity-60'
                    : 'bg-white dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                  isToday ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-white'
                }`}>
                  <span className="text-sm font-bold">{payment.day}</span>
                  <span className={`text-[10px] ${isToday ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'][paymentDate.getDay() === 0 ? 6 : paymentDate.getDay() - 1]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{payment.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {payment.type === 'installment' ? '💳 Kredi Kartı Taksiti' : '🏦 Kredi Ödemesi'}
                    {isToday && ' • 🔔 Bugün!'}
                    {isPast && ' • ✅ Geçti'}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly Summary */}
      {payments.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Aylık Özet</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Kredi Kartı Taksitleri</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                {formatCurrency(payments.filter(p => p.type === 'installment').reduce((s, p) => s + p.amount, 0))}
              </p>
              <p className="text-xs text-gray-500">{payments.filter(p => p.type === 'installment').length} taksit</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Kredi Ödemeleri</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                {formatCurrency(payments.filter(p => p.type === 'loan').reduce((s, p) => s + p.amount, 0))}
              </p>
              <p className="text-xs text-gray-500">{payments.filter(p => p.type === 'loan').length} ödeme</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== FORMS =====

const CreditCardForm: React.FC<{ onClose: () => void; onAdd: (card: CreditCard) => void }> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [limit, setLimit] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [color, setColor] = useState(CREDIT_CARD_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bank || !limit || !lastFour) return;

    onAdd({
      id: generateId(),
      name,
      bank,
      limit: parseFloat(limit),
      lastFourDigits: lastFour,
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Kredi Kartı Ekle</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kart Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="örn: Ana Kartım"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banka</label>
            <input
              type="text"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="örn: Garanti, İş Bankası..."
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limit (₺)</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="50000"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Son 4 Hane</label>
              <input
                type="text"
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                maxLength={4}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kart Rengi</label>
            <div className="flex gap-2 flex-wrap">
              {CREDIT_CARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Kartı Ekle
          </button>
        </form>
      </div>
    </div>
  );
};

const InstallmentForm: React.FC<{
  onClose: () => void;
  onAdd: (installment: Installment) => void;
  creditCards: CreditCard[];
}> = ({ onClose, onAdd, creditCards }) => {
  const [creditCardId, setCreditCardId] = useState(creditCards[0]?.id || '');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentCount, setInstallmentCount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentDay, setPaymentDay] = useState('5');
  const [category, setCategory] = useState('');

  const categories = ['Elektronik', 'Mobilya', 'Beyaz Eşya', 'Kuyum', 'Sağlık', 'Eğitim', 'Seyahat', 'Diğer'];

  const installmentAmount = totalAmount && installmentCount
    ? parseFloat(totalAmount) / parseInt(installmentCount)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditCardId || !description || !totalAmount || !installmentCount || !category) return;

    onAdd({
      id: generateId(),
      creditCardId,
      description,
      totalAmount: parseFloat(totalAmount),
      installmentCount: parseInt(installmentCount),
      installmentAmount: Math.round((parseFloat(totalAmount) / parseInt(installmentCount)) * 100) / 100,
      startDate,
      paymentDay: parseInt(paymentDay),
      category,
      paidInstallments: 0,
      isActive: true,
    });
    onClose();
  };

  if (creditCards.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Önce Kredi Kartı Ekleyin</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Taksitli işlem eklemek için en az bir kredi kartı kaydı gerekli.</p>
          <button onClick={onClose} className="px-6 py-2 bg-blue-500 text-white rounded-xl font-medium">
            Tamam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Taksitli İşlem Ekle</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kredi Kartı</label>
            <select
              value={creditCardId}
              onChange={(e) => setCreditCardId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} (****{card.lastFourDigits})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="örn: iPhone 15 Pro"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toplam Tutar (₺)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="12000"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taksit Sayısı</label>
              <select
                value={installmentCount}
                onChange={(e) => setInstallmentCount(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Seçin</option>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 36, 48].map((n) => (
                  <option key={n} value={n}>{n} taksit</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          {installmentAmount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 Aylık ödeme: <strong>{formatCurrency(installmentAmount)}</strong> x {installmentCount} taksit
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ödeme Günü</label>
              <select
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>Ayın {day}'i</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Seçin</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all"
          >
            Taksitli İşlemi Ekle
          </button>
        </form>
      </div>
    </div>
  );
};

const LoanForm: React.FC<{ onClose: () => void; onAdd: (loan: Loan) => void }> = ({ onClose, onAdd }) => {
  const [type, setType] = useState<Loan['type']>('ihtiyac');
  const [bank, setBank] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentDay, setPaymentDay] = useState('1');
  const [paidInstallments, setPaidInstallments] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank || !totalAmount || !monthlyPayment || !totalInstallments) return;

    const total = parseFloat(totalAmount);
    const monthly = parseFloat(monthlyPayment);
    const paid = parseInt(paidInstallments);

    onAdd({
      id: generateId(),
      type,
      bank,
      description,
      totalAmount: total,
      remainingAmount: total - (monthly * paid),
      monthlyPayment: monthly,
      totalInstallments: parseInt(totalInstallments),
      paidInstallments: paid,
      interestRate: parseFloat(interestRate) || 0,
      startDate,
      paymentDay: parseInt(paymentDay),
      isActive: paid < parseInt(totalInstallments),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Kredi Ekle</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kredi Türü</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Loan['type'])}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {LOAN_TYPES.map((lt) => (
                <option key={lt.value} value={lt.value}>{lt.icon} {lt.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banka</label>
              <input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="örn: Ziraat"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="örn: Ev kredisi"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toplam Tutar (₺)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="100000"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aylık Taksit (₺)</label>
              <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="5000"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toplam Vade (Ay)</label>
              <input
                type="number"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                placeholder="36"
                min="1"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faiz Oranı (%)</label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="2.5"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlangıç</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ödeme Günü</label>
              <select
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                required
                className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>{day}'i</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ödenen Ay</label>
              <input
                type="number"
                value={paidInstallments}
                onChange={(e) => setPaidInstallments(e.target.value)}
                min="0"
                placeholder="0"
                className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            Krediyi Ekle
          </button>
        </form>
      </div>
    </div>
  );
};

export default DebtManager;
