const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Güncel ücretsiz model adları (fallback sırasıyla)
const MODEL_NAMES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-3.8-flash',
];

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface FinancialContext {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseByCategory: { category: string; amount: number }[];
  incomeByCategory: { category: string; amount: number }[];
  recentTransactions: { type: string; category: string; amount: number; description: string; date: string }[];
  savingsRate: number;
  period: string;
}

const buildFinancialPrompt = (context: FinancialContext): string => {
  return `
Sen bir finansal danışmansın. Kullanıcının finansal verilerini analiz et ve Türkçe olarak profesyonel, pratik öneriler sun.

Kullanıcının Finansal Özeti (${context.period}):
- Toplam Gelir: ₺${context.totalIncome.toLocaleString('tr-TR')}
- Toplam Gider: ₺${context.totalExpense.toLocaleString('tr-TR')}
- Net Bakiye: ₺${context.balance.toLocaleString('tr-TR')}
- Tasarruf Oranı: %${context.savingsRate.toFixed(1)}

Gelir Dağılımı:
${context.incomeByCategory.map(c => `- ${c.category}: ₺${c.amount.toLocaleString('tr-TR')}`).join('\n') || '- Veri yok'}

Gider Dağılımı:
${context.expenseByCategory.map(c => `- ${c.category}: ₺${c.amount.toLocaleString('tr-TR')}`).join('\n') || '- Veri yok'}

Son İşlemler:
${context.recentTransactions.slice(0, 10).map(t => `- ${t.date}: ${t.type === 'income' ? 'Gelir' : 'Gider'} - ${t.category} - ₺${t.amount.toLocaleString('tr-TR')} ${t.description ? `(${t.description})` : ''}`).join('\n') || '- Veri yok'}

Lütfen aşağıdaki konularda kısa ve öz analiz yap:
1. Genel finansal durum değerlendirmesi
2. Gider optimizasyonu önerileri
3. Tasarruf potansiyeli
4. Pratik finansal tavsiyeler

Yanıtını Türkçe, samimi ama profesyonel bir dille yaz. Emoji kullan. Maksimum 400 kelime olsun.
`;
};

const buildQuickAnalysisPrompt = (context: FinancialContext): string => {
  return `
Sen bir finansal asistansın. Kullanıcının finansal verilerine bakarak kısa ve öz bir analiz yap.

Finansal Veriler (${context.period}):
- Gelir: ₺${context.totalIncome.toLocaleString('tr-TR')}
- Gider: ₺${context.totalExpense.toLocaleString('tr-TR')}
- Bakiye: ₺${context.balance.toLocaleString('tr-TR')}
- Tasarruf Oranı: %${context.savingsRate.toFixed(1)}

En büyük gider kategorileri: ${context.expenseByCategory.slice(0, 3).map(c => `${c.category} (₺${c.amount.toLocaleString('tr-TR')})`).join(', ') || 'Veri yok'}

3-4 cümle ile kısa bir durum analizi ve en önemli 2 tavsiyeni yaz. Türkçe yanıt ver. Emoji kullan.
`;
};

// API'ye istek at - birden fazla model dener
const callGeminiAPI = async (
  apiKey: string,
  prompt: string,
  maxTokens: number = 1024,
  temperature: number = 0.7
): Promise<string> => {
  const errors: string[] = [];

  for (const model of MODEL_NAMES) {
    try {
      const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
          // Model çalıştı ama yanıt üretemedi, bir sonrakini dene
          continue;
        }

        return data.candidates[0].content.parts[0].text;
      }

      // Hata durumunu kaydet
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
      errors.push(`${model}: ${errorMsg}`);

      // 404 = model bulunamadı, bir sonrakini dene
      if (response.status === 404) {
        continue;
      }

      // 400/401/403 = API key sorunu, daha fazla deneme yapma
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new Error(parseAPIError(response.status, errorMsg));
      }

      // 429 = rate limit
      if (response.status === 429) {
        throw new Error('Çok fazla istek gönderildi. Lütfen 30 saniye bekleyip tekrar deneyin.');
      }

    } catch (err: any) {
      if (err.message.includes('Çok fazla') || err.message.includes('API anahtarı')) {
        throw err;
      }
      errors.push(`${model}: ${err.message}`);
      continue;
    }
  }

  // Tüm modeller başarısız oldu
  if (errors.length > 0) {
    // API key hatası varsa onu göster
    const keyError = errors.find(e => e.includes('API_KEY') || e.includes('api key') || e.includes('401') || e.includes('403') || e.includes('unauthorized'));
    if (keyError) {
      throw new Error('API anahtarı geçersiz veya yetkisiz. Lütfen Google AI Studio\'dan yeni bir anahtar oluşturun.');
    }
    throw new Error(`Tüm modeller başarısız oldu. Detaylar: ${errors[errors.length - 1]}`);
  }

  throw new Error('AI yanıt üretemedi. Lütfen tekrar deneyin.');
};

const parseAPIError = (status: number, message: string): string => {
  if (status === 400) {
    if (message.includes('API_KEY') || message.includes('api key')) {
      return 'API anahtarı geçersiz. Lütfen Google AI Studio\'dan (aistudio.google.com/apikey) yeni bir anahtar oluşturun.';
    }
    return `İstek reddedildi: ${message}`;
  }
  if (status === 401) {
    return 'API anahtarı geçersiz veya süresi dolmuş. Lütfen yeni bir anahtar oluşturun.';
  }
  if (status === 403) {
    if (message.includes('restricted') || message.includes('permission')) {
      return 'API anahtarı kısıtlı. Google AI Studio\'da anahtar ayarlarından "Gemini API" erişiminin etkin olduğundan emin olun.';
    }
    return 'API anahtarı yetkisiz. Lütfen anahtarınızı kontrol edin.';
  }
  return `Bilinmeyen hata (${status}): ${message}`;
};

export const sendToGemini = async (
  apiKey: string,
  context: FinancialContext,
  userMessage?: string
): Promise<string> => {
  let prompt: string;

  if (userMessage) {
    prompt = `
Sen bir finansal danışmansın. Kullanıcının finansal verilerine erişimin var ve sorularını bu verilere göre yanıtlıyorsun.

Kullanıcının Finansal Verileri (${context.period}):
- Toplam Gelir: ₺${context.totalIncome.toLocaleString('tr-TR')}
- Toplam Gider: ₺${context.totalExpense.toLocaleString('tr-TR')}
- Net Bakiye: ₺${context.balance.toLocaleString('tr-TR')}
- Tasarruf Oranı: %${context.savingsRate.toFixed(1)}

Gelir Kategorileri: ${context.incomeByCategory.map(c => `${c.category}: ₺${c.amount.toLocaleString('tr-TR')}`).join(', ') || 'Veri yok'}
Gider Kategorileri: ${context.expenseByCategory.map(c => `${c.category}: ₺${c.amount.toLocaleString('tr-TR')}`).join(', ') || 'Veri yok'}

Kullanıcının Sorusu: ${userMessage}

Türkçe, samimi ve profesyonel bir dille yanıt ver. Finansal verilerle destekle. Emoji kullan.
`;
  } else {
    prompt = buildFinancialPrompt(context);
  }

  return callGeminiAPI(apiKey.trim(), prompt, 1024, 0.7);
};

export const getQuickAnalysis = async (
  apiKey: string,
  context: FinancialContext
): Promise<string> => {
  const prompt = buildQuickAnalysisPrompt(context);
  return callGeminiAPI(apiKey.trim(), prompt, 300, 0.5);
};

export const validateApiKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  const trimmedKey = apiKey.trim();
  
  if (!trimmedKey) {
    return { valid: false, error: 'API anahtarı boş.' };
  }

  // Basit bir test isteği gönder
  for (const model of MODEL_NAMES) {
    try {
      const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(trimmedKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: 'Sadece "ok" yaz.' }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      });

      if (response.ok) {
        return { valid: true };
      }

      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;

      // 404 = model bulunamadı, bir sonrakini dene
      if (response.status === 404) {
        continue;
      }

      // Diğer hatalar
      return { valid: false, error: parseAPIError(response.status, errorMsg) };

    } catch (err: any) {
      // Network hatası
      if (err.message === 'Failed to fetch') {
        return { valid: false, error: 'API\'ye bağlanılamadı. İnternet bağlantınızı kontrol edin.' };
      }
      continue;
    }
  }

  return { valid: false, error: 'Hiçbir modele bağlanılamadı. Lütfen tekrar deneyin.' };
};
