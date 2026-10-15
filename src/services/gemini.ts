const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error('API anahtarı geçersiz. Lütfen kontrol edin.');
    }
    if (response.status === 403) {
      throw new Error('API anahtarı yetkisiz. Lütfen Gemini API\'nin etkin olduğundan emin olun.');
    }
    if (response.status === 429) {
      throw new Error('Çok fazla istek gönderildi. Lütfen birkaç saniye bekleyin.');
    }
    throw new Error(error?.error?.message || 'API hatası oluştu.');
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('AI yanıt üretemedi. Lütfen tekrar deneyin.');
  }

  return data.candidates[0].content.parts[0].text;
};

export const getQuickAnalysis = async (
  apiKey: string,
  context: FinancialContext
): Promise<string> => {
  const prompt = buildQuickAnalysisPrompt(context);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
        temperature: 0.5,
        maxOutputTokens: 300,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || 'API hatası oluştu.');
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('AI yanıt üretemedi.');
  }

  return data.candidates[0].content.parts[0].text;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Merhaba, sadece "ok" yaz.' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
        },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
};
