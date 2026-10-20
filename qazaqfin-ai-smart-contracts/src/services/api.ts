import { UserProfile, Contract, AssistantMode } from '../types';

const TOKEN_KEY = 'qazaqfin_jwt_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Кіру қатесі');
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async register(payload: { email: string; password: string; fullName: string; iin: string; phone: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Тіркелу қатесі');
    if (data.token) setAuthToken(data.token);
    return data;
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/user/profile', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Профиль алу қатесі');
    return data;
  },

  async updateProfile(payload: { fullName?: string; iin?: string; phone?: string }): Promise<UserProfile> {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Жаңарту қатесі');
    return data.user;
  },

  async topupBalance(amount: number): Promise<{ message: string; balance: number }> {
    const res = await fetch('/api/user/balance/topup', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Баланс толтыру қатесі');
    return data;
  },

  // AI Chat & Voice
  async sendChatMessage(
    prompt: string,
    history: Array<{ role: string; content: string }>,
    mode: AssistantMode,
    language: 'kk' | 'ru' = 'kk',
    image?: { data: string; mimeType: string }
  ): Promise<{ text: string; model: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, history, mode, language, image }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI жауап беру қатесі');
    return data;
  },

  async scanReceipt(image: { data: string; mimeType: string }): Promise<{
    productName: string;
    totalAmount: number;
    sellerName: string;
    description: string;
  }> {
    const res = await fetch('/api/deals/scan-receipt', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ image }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Чекті тану қатесі');
    return data;
  },

  async getVoiceAudio(text: string, voiceName: string = 'Kore'): Promise<{ audioBase64: string; mimeType: string }> {
    const res = await fetch('/api/ai/voice', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, voiceName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Дауыс алу қатесі');
    return data;
  },

  // Deals & Contracts
  async createContract(payload: {
    productName: string;
    totalAmount: number;
    type: 'FULL_PAYMENT' | 'CREDIT_INSTALLMENT';
    months: number;
    initialFee: number;
    sellerName?: string;
  }): Promise<{ message: string; contractId: string; contract: Contract; otpCode: string }> {
    const res = await fetch('/api/deals/create-contract', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Келісімшарт жасау қатесі');
    return data;
  },

  async signContract(contractId: string, otpCode: string): Promise<{ message: string; contract: Contract; certificate: string }> {
    const res = await fetch('/api/deals/sign-contract', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ contractId, otpCode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Қол қою қатесі');
    return data;
  },

  async getMyContracts(): Promise<Contract[]> {
    const res = await fetch('/api/deals/my-contracts', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Келісімшарттарды жүктеу қатесі');
    return data;
  },

  async analyzeDeal(payload: {
    productName: string;
    totalAmount: number;
    months: number;
    monthlyPayment: number;
  }): Promise<{ analysis: string }> {
    const res = await fetch('/api/deals/ai-analyze', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI сараптама қатесі');
    return data;
  },
};
