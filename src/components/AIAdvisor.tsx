import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import {
  getTotalIncome,
  getTotalExpense,
  getBalance,
  getTransactionsByCategory,
} from '../utils';
import {
  sendToGemini,
  getQuickAnalysis,
  validateApiKey,
  AIMessage,
  FinancialContext,
} from '../services/gemini';
import {
  Bot,
  Send,
  Key,
  Sparkles,
  AlertCircle,
  Loader2,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  PiggyBank,
  ExternalLink,
  X,
  Trash2,
} from 'lucide-react';

interface AIAdvisorProps {
  transactions: Transaction[];
  period: string;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, period }) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  const [tempKey, setTempKey] = useState(apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    const saved = localStorage.getItem('ai_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuickAnalysis, setShowQuickAnalysis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ai_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = (): FinancialContext => {
    const totalIncome = getTotalIncome(transactions);
    const totalExpense = getTotalExpense(transactions);
    const balance = getBalance(transactions);
    const expenseByCategory = getTransactionsByCategory(transactions, 'expense').map(
      (c) => ({ category: c.category, amount: c.amount })
    );
    const incomeByCategory = getTransactionsByCategory(transactions, 'income').map(
      (c) => ({ category: c.category, amount: c.amount })
    );
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15)
      .map((t) => ({
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        date: t.date,
      }));

    return {
      totalIncome,
      totalExpense,
      balance,
      expenseByCategory,
      incomeByCategory,
      recentTransactions,
      savingsRate,
      period,
    };
  };

  const handleSaveKey = async () => {
    if (!tempKey.trim()) return;
    setIsValidating(true);
    setError('');

    const result = await validateApiKey(tempKey.trim());
    setIsValidating(false);

    if (result.valid) {
      setApiKey(tempKey.trim());
      localStorage.setItem('gemini_api_key', tempKey.trim());
      setKeyValid(true);
      setShowKeyInput(false);
      setTimeout(() => setKeyValid(null), 3000);
    } else {
      setKeyValid(false);
      setError(result.error || 'API anahtarı geçersiz. Lütfen kontrol edin.');
      setTimeout(() => setKeyValid(null), 5000);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    const userMessage: AIMessage = {
      role: 'user',
      content: userInput.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError('');

    try {
      const context = buildContext();
      const response = await sendToGemini(apiKey, context, userInput.trim());

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAnalysis = async () => {
    if (isLoading || !apiKey) return;
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    setIsLoading(true);
    setError('');
    setShowQuickAnalysis(true);

    try {
      const context = buildContext();
      const response = await getQuickAnalysis(apiKey, context);

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullAnalysis = async () => {
    if (isLoading || !apiKey) return;
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    setIsLoading(true);
    setError('');

    const userMessage: AIMessage = {
      role: 'user',
      content: '📊 Detaylı finansal analiz ve öneriler istiyorum.',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const context = buildContext();
      const response = await sendToGemini(apiKey, context);

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('ai_messages');
  };

  const removeApiKey = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
    setShowKeyInput(true);
    setTempKey('');
  };

  const quickQuestions = [
    { icon: PiggyBank, text: 'Nasıl daha fazla tasarruf edebilirim?', q: 'Mevcut harcamalarıma bakarak nasıl daha fazla tasarruf edebilirim?' },
    { icon: TrendingUp, text: 'Hangi giderlerimi azaltmalıyım?', q: 'Hangi gider kategorilerimi azaltmam gerekiyor? En büyük gider kalemlerim neler?' },
    { icon: Lightbulb, text: 'Bütçe önerisi yap', q: 'Gelir ve giderlerime göre ideal bir bütçe dağılımı önerir misin?' },
  ];

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Emoji handling (already in text)
        return (
          <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      });
  };

  return (
    <div className="space-y-4">
      {/* API Key Section */}
      {showKeyInput && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0">
              <Key size={22} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Google Gemini API Anahtarı
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                AI finansal danışman özelliğini kullanmak için ücretsiz bir Gemini API anahtarı gereklidir.
              </p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="API anahtarınızı buraya yapıştırın..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                  />
                  <button
                    onClick={handleSaveKey}
                    disabled={isValidating || !tempKey.trim()}
                    className="px-5 py-3 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {isValidating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {isValidating ? 'Doğrulanıyor...' : 'Kaydet'}
                  </button>
                </div>

                {keyValid === true && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    ✅ API anahtarı doğrulandı!
                  </p>
                )}
                {keyValid === false && (
                  <p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    ❌ {error || 'API anahtarı geçersiz.'}
                  </p>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
                    📌 Ücretsiz API anahtarı nasıl alınır:
                  </p>
                  <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1.5 list-decimal list-inside">
                    <li>
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-900 dark:hover:text-blue-200 inline-flex items-center gap-1"
                      >
                        Google AI Studio'ya gidin <ExternalLink size={12} />
                      </a>
                    </li>
                    <li>Google hesabınızla giriş yapın</li>
                    <li>"Create API Key" butonuna tıklayın</li>
                    <li>Oluşturulan anahtarı <strong>tamamen</strong> kopyalayın (başında/sonunda boşluk olmadığından emin olun)</li>
                    <li>Yukarıdaki kutuya yapıştırın ve "Kaydet"e tıklayın</li>
                  </ol>
                  <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      ⚠️ <strong>İpucu:</strong> Anahtarınız "AIza" ile başlar ve 39 karakter uzunluğundadır. 
                      Eğer hata alırsanız, yeni bir anahtar oluşturmayı deneyin.
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                    💡 Ücretsiz plan: Dakikada 15 istek, günde 1500 istek limiti
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Status Bar */}
      {apiKey && !showKeyInput && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">AI Finansal Danışman Aktif</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Google Gemini 2.0 Flash</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeyInput(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Anahtarı Değiştir
              </button>
              <button
                onClick={removeApiKey}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Kaldır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {apiKey && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleFullAnalysis}
            disabled={isLoading || transactions.length === 0}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
          >
            <Sparkles size={20} />
            <div className="text-left">
              <p className="text-sm font-semibold">Detaylı Analiz</p>
              <p className="text-xs opacity-80">Kapsamlı rapor al</p>
            </div>
          </button>

          <button
            onClick={handleQuickAnalysis}
            disabled={isLoading || transactions.length === 0}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <MessageSquare size={20} className="text-blue-500" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Hızlı Analiz</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Özet değerlendirme</p>
            </div>
          </button>

          <button
            onClick={clearChat}
            disabled={messages.length === 0}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 size={20} className="text-gray-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Sohbeti Temizle</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Geçmişi sil</p>
            </div>
          </button>
        </div>
      )}

      {/* Quick Questions */}
      {apiKey && messages.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            Hızlı Sorular
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setUserInput(q.q);
                }}
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
              >
                <q.icon size={16} className="text-blue-500 flex-shrink-0" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{q.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {formatMessageContent(msg.content)}
                  </div>
                  <p className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Analiz ediliyor...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 mt-1"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Chat Input */}
      {apiKey && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Finansal bir soru sorun... (örn: 'Hangi harcamalarımı azaltmalıyım?')"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            💡 AI, finansal verilerinizi analiz ederek kişiselleştirilmiş öneriler sunar. Verileriniz yalnızca API isteğinde kullanılır.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!apiKey && !showKeyInput && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
            <Bot size={36} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">AI Finansal Danışman</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
            Google Gemini AI ile finansal durumunuzu analiz ettirin, kişiselleştirilmiş tasarruf önerileri alın.
          </p>
          <button
            onClick={() => setShowKeyInput(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/20"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={18} />
              AI Danışmanı Etkinleştir
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
