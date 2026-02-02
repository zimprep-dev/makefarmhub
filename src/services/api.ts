/**
 * API Service - Central API client for backend communication
 * Replace BASE_URL with your actual backend URL when deployed
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.makefarmhub.com';

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

// Request helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; role: string }) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),

  getProfile: () =>
    request<any>('/auth/profile'),

  updateProfile: (data: Partial<any>) =>
    request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// Listings API
export const listingsApi = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    request<{ listings: any[]; total: number; page: number }>(`/listings?${new URLSearchParams(params as any)}`),

  getById: (id: string) =>
    request<any>(`/listings/${id}`),

  create: (data: any) =>
    request<any>('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<any>) =>
    request<any>(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/listings/${id}`, { method: 'DELETE' }),

  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    const response = await fetch(`${BASE_URL}/listings/upload`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData,
    });
    
    return response.json();
  },
};

// Orders API
export const ordersApi = {
  getAll: (params?: { status?: string; page?: number }) =>
    request<{ orders: any[]; total: number }>(`/orders?${new URLSearchParams(params as any)}`),

  getById: (id: string) =>
    request<any>(`/orders/${id}`),

  create: (data: { listingId: string; quantity: number; paymentMethod: string }) =>
    request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request<any>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  cancel: (id: string, reason: string) =>
    request<any>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Messages API
export const messagesApi = {
  getConversations: () =>
    request<any[]>('/messages/conversations'),

  getMessages: (conversationId: string) =>
    request<any[]>(`/messages/${conversationId}`),

  send: (data: { recipientId: string; content: string; type?: string }) =>
    request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markAsRead: (conversationId: string) =>
    request<void>(`/messages/${conversationId}/read`, { method: 'POST' }),
};

// Payments API
export const paymentsApi = {
  getPaymentMethods: () =>
    request<any[]>('/payments/methods'),

  addPaymentMethod: (data: any) =>
    request<any>('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removePaymentMethod: (id: string) =>
    request<void>(`/payments/methods/${id}`, { method: 'DELETE' }),

  createPaymentIntent: (data: { amount: number; currency: string; orderId: string }) =>
    request<{ clientSecret: string }>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmPayment: (paymentIntentId: string) =>
    request<any>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    }),

  getTransactionHistory: (params?: { page?: number; limit?: number }) =>
    request<{ transactions: any[]; total: number }>(`/payments/history?${new URLSearchParams(params as any)}`),

  requestRefund: (transactionId: string, reason: string) =>
    request<any>(`/payments/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Wallet API
export const walletApi = {
  getBalance: () =>
    request<{ balance: number; pendingBalance: number }>('/wallet/balance'),

  deposit: (data: { amount: number; paymentMethodId: string }) =>
    request<any>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  withdraw: (data: { amount: number; bankAccountId: string }) =>
    request<any>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEscrowPayments: () =>
    request<any[]>('/wallet/escrow'),

  releaseEscrow: (escrowId: string) =>
    request<any>(`/wallet/escrow/${escrowId}/release`, { method: 'POST' }),

  raiseDispute: (escrowId: string, reason: string) =>
    request<any>(`/wallet/escrow/${escrowId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Reviews API
export const reviewsApi = {
  getForListing: (listingId: string) =>
    request<any[]>(`/reviews/listing/${listingId}`),

  getForSeller: (sellerId: string) =>
    request<{ reviews: any[]; averageRating: number }>(`/reviews/seller/${sellerId}`),

  create: (data: { listingId: string; rating: number; title: string; comment: string; photos?: string[] }) =>
    request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  vote: (reviewId: string, helpful: boolean) =>
    request<any>(`/reviews/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    }),

  addSellerResponse: (reviewId: string, response: string) =>
    request<any>(`/reviews/${reviewId}/response`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    }),
};

// Weather API
export const weatherApi = {
  getCurrent: (location: string) =>
    request<any>(`/weather/current?location=${encodeURIComponent(location)}`),

  getForecast: (location: string, days = 7) =>
    request<any>(`/weather/forecast?location=${encodeURIComponent(location)}&days=${days}`),

  getAlerts: (location: string) =>
    request<any[]>(`/weather/alerts?location=${encodeURIComponent(location)}`),
};

// Analytics API
export const analyticsApi = {
  getSellerStats: (period?: 'day' | 'week' | 'month' | 'year') =>
    request<any>(`/analytics/seller?period=${period || 'month'}`),

  getSalesReport: (startDate: string, endDate: string) =>
    request<any>(`/analytics/sales?start=${startDate}&end=${endDate}`),

  getTopProducts: (limit = 10) =>
    request<any[]>(`/analytics/top-products?limit=${limit}`),
};

// Notifications API
export const notificationsApi = {
  getAll: () =>
    request<any[]>('/notifications'),

  markAsRead: (id: string) =>
    request<void>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllAsRead: () =>
    request<void>('/notifications/read-all', { method: 'POST' }),

  updatePreferences: (preferences: any) =>
    request<any>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),
};

export default {
  auth: authApi,
  listings: listingsApi,
  orders: ordersApi,
  messages: messagesApi,
  payments: paymentsApi,
  wallet: walletApi,
  reviews: reviewsApi,
  weather: weatherApi,
  analytics: analyticsApi,
  notifications: notificationsApi,
};
