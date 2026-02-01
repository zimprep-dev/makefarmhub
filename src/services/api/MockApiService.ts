/**
 * Mock API Service - Simulates backend API responses
 * Replace with real API calls when backend is ready
 */

import { mockListings, mockOrders, mockUsers, mockConversations, mockMessages, mockVehicles, mockTransportRequests, mockNotifications, mockTransactions, mockDisputes } from '../../data/mockData';
import type { Listing, Order, User, Conversation, Message, Vehicle, TransportRequest, Notification, Transaction, Dispute, WalletTransaction } from '../../types';

// Simulate network delay
const simulateDelay = (min = 200, max = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate random failure (for testing error handling)
const shouldFail = (failureRate = 0): boolean => {
  return Math.random() < failureRate;
};

/**
 * Listings API
 */
export const listingsApi = {
  async getAll(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ listings: Listing[]; total: number; page: number; totalPages: number }> {
    await simulateDelay();
    
    let filtered = [...mockListings];
    
    if (filters?.category) {
      filtered = filtered.filter(l => l.category === filters.category);
    }
    if (filters?.minPrice) {
      filtered = filtered.filter(l => l.price >= filters.minPrice!);
    }
    if (filters?.maxPrice) {
      filtered = filtered.filter(l => l.price <= filters.maxPrice!);
    }
    if (filters?.location) {
      filtered = filtered.filter(l => 
        l.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchLower) ||
        l.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'rating':
          filtered.sort((a, b) => b.sellerRating - a.sellerRating);
          break;
      }
    }
    
    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const start = (page - 1) * limit;
    const paginatedListings = filtered.slice(start, start + limit);
    
    return {
      listings: paginatedListings,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  },
  
  async getById(id: string): Promise<Listing | null> {
    await simulateDelay();
    return mockListings.find(l => l.id === id) || null;
  },
  
  async getBySeller(sellerId: string): Promise<Listing[]> {
    await simulateDelay();
    return mockListings.filter(l => l.sellerId === sellerId);
  },
  
  async create(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<Listing> {
    await simulateDelay();
    const newListing: Listing = {
      ...listing,
      id: `listing-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as Listing;
    mockListings.push(newListing);
    return newListing;
  },
  
  async update(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    await simulateDelay();
    const index = mockListings.findIndex(l => l.id === id);
    if (index === -1) return null;
    mockListings[index] = { ...mockListings[index], ...updates };
    return mockListings[index];
  },
  
  async delete(id: string): Promise<boolean> {
    await simulateDelay();
    const index = mockListings.findIndex(l => l.id === id);
    if (index === -1) return false;
    mockListings.splice(index, 1);
    return true;
  },
  
  async getFeatured(): Promise<Listing[]> {
    await simulateDelay();
    return mockListings.filter(l => l.featured).slice(0, 6);
  },
  
  async getCategories(): Promise<{ name: string; count: number }[]> {
    await simulateDelay();
    const categories = new Map<string, number>();
    mockListings.forEach(l => {
      categories.set(l.category, (categories.get(l.category) || 0) + 1);
    });
    return Array.from(categories.entries()).map(([name, count]) => ({ name, count }));
  },
};

/**
 * Orders API
 */
export const ordersApi = {
  async getAll(userId: string, role: string): Promise<Order[]> {
    await simulateDelay();
    if (role === 'buyer') {
      return mockOrders.filter(o => o.buyerId === userId);
    }
    if (role === 'farmer') {
      return mockOrders.filter(o => o.sellerId === userId);
    }
    return mockOrders;
  },
  
  async getById(id: string): Promise<Order | null> {
    await simulateDelay();
    return mockOrders.find(o => o.id === id) || null;
  },
  
  async create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    await simulateDelay();
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as Order;
    mockOrders.push(newOrder);
    return newOrder;
  },
  
  async updateStatus(id: string, status: Order['status']): Promise<Order | null> {
    await simulateDelay();
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) return null;
    mockOrders[index].status = status;
    return mockOrders[index];
  },
};

/**
 * Users API
 */
export const usersApi = {
  async getById(id: string): Promise<User | null> {
    await simulateDelay();
    return mockUsers.find(u => u.id === id) || null;
  },
  
  async getByPhone(phone: string): Promise<User | null> {
    await simulateDelay();
    return mockUsers.find(u => u.phone === phone) || null;
  },
  
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    await simulateDelay();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return null;
    mockUsers[index] = { ...mockUsers[index], ...updates };
    return mockUsers[index];
  },
  
  async getAll(): Promise<User[]> {
    await simulateDelay();
    return mockUsers;
  },
};

/**
 * Messages API
 */
export const messagesApi = {
  async getConversations(userId: string): Promise<Conversation[]> {
    await simulateDelay();
    return mockConversations.filter(c => 
      c.participants.some(p => p.id === userId)
    );
  },
  
  async getMessages(conversationId: string): Promise<Message[]> {
    await simulateDelay();
    // Messages are stored per conversation in mock data
    return (mockMessages as Record<string, Message[]>)[conversationId] || [];
  },
  
  async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    await simulateDelay();
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    return newMessage;
  },
  
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await simulateDelay();
    // Mark messages as read
  },
};

/**
 * Transport API
 */
export const transportApi = {
  async getVehicles(transporterId?: string): Promise<Vehicle[]> {
    await simulateDelay();
    if (transporterId) {
      return mockVehicles.filter(v => v.ownerId === transporterId);
    }
    return mockVehicles;
  },
  
  async getAvailableVehicles(location?: string): Promise<Vehicle[]> {
    await simulateDelay();
    let vehicles = mockVehicles.filter(v => v.available);
    if (location) {
      vehicles = vehicles.filter(v => 
        v.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    return vehicles;
  },
  
  async getRequests(userId: string, role: string): Promise<TransportRequest[]> {
    await simulateDelay();
    // Return all transport requests for now
    return mockTransportRequests;
  },
  
  async createRequest(request: Omit<TransportRequest, 'id'>): Promise<TransportRequest> {
    await simulateDelay();
    const newRequest: TransportRequest = {
      ...request,
      id: `transport-${Date.now()}`,
    };
    mockTransportRequests.push(newRequest);
    return newRequest;
  },
};

/**
 * Notifications API
 */
export const notificationsApi = {
  async getAll(userId: string): Promise<Notification[]> {
    await simulateDelay();
    return mockNotifications.filter(n => n.userId === userId);
  },
  
  async markAsRead(id: string): Promise<void> {
    await simulateDelay();
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  },
  
  async markAllAsRead(userId: string): Promise<void> {
    await simulateDelay();
    mockNotifications
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
  },
  
  async getUnreadCount(userId: string): Promise<number> {
    await simulateDelay(50, 100);
    return mockNotifications.filter(n => n.userId === userId && !n.read).length;
  },
};

/**
 * Transactions API
 */
export const transactionsApi = {
  async getAll(userId?: string): Promise<Transaction[]> {
    await simulateDelay();
    if (userId) {
      return mockTransactions.filter(t => 
        t.fromUser.id === userId || t.toUser.id === userId
      );
    }
    return mockTransactions;
  },
  
  async getById(id: string): Promise<Transaction | null> {
    await simulateDelay();
    return mockTransactions.find(t => t.id === id) || null;
  },
};

/**
 * Disputes API
 */
export const disputesApi = {
  async getAll(): Promise<Dispute[]> {
    await simulateDelay();
    return mockDisputes;
  },
  
  async getById(id: string): Promise<Dispute | null> {
    await simulateDelay();
    return mockDisputes.find(d => d.id === id) || null;
  },
  
  async create(dispute: Omit<Dispute, 'id' | 'createdAt'>): Promise<Dispute> {
    await simulateDelay();
    const newDispute: Dispute = {
      ...dispute,
      id: `dispute-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as Dispute;
    mockDisputes.push(newDispute);
    return newDispute;
  },
  
  async updateStatus(id: string, status: Dispute['status'], resolution?: string): Promise<Dispute | null> {
    await simulateDelay();
    const index = mockDisputes.findIndex(d => d.id === id);
    if (index === -1) return null;
    mockDisputes[index].status = status;
    if (resolution) {
      mockDisputes[index].resolution = resolution;
    }
    return mockDisputes[index];
  },
};

/**
 * Wallet API
 */
export const walletApi = {
  async getBalance(userId: string): Promise<{ available: number; pending: number; escrow: number }> {
    await simulateDelay();
    // Simulated balance
    return {
      available: 15000,
      pending: 2500,
      escrow: 5000,
    };
  },
  
  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    await simulateDelay();
    // Return mock wallet transactions
    return [
      {
        id: 'wtxn-1',
        walletId: userId,
        type: 'deposit',
        amount: 5000,
        fee: 0,
        status: 'completed',
        description: 'Deposit via EcoCash',
        reference: 'ECO123456',
        createdAt: new Date().toISOString(),
      },
    ];
  },
  
  async deposit(userId: string, amount: number, method: string): Promise<WalletTransaction> {
    await simulateDelay();
    const transaction: WalletTransaction = {
      id: `wtxn-${Date.now()}`,
      walletId: userId,
      type: 'deposit',
      amount,
      fee: 0,
      status: 'completed',
      description: `Deposit via ${method}`,
      reference: `DEP${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    return transaction;
  },
  
  async withdraw(userId: string, amount: number, method: string): Promise<WalletTransaction> {
    await simulateDelay();
    const transaction: WalletTransaction = {
      id: `wtxn-${Date.now()}`,
      walletId: userId,
      type: 'withdrawal',
      amount: -amount,
      fee: 5,
      status: 'pending',
      description: `Withdrawal to ${method}`,
      reference: `WTH${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    return transaction;
  },
};

// Export all APIs
export const mockApi = {
  listings: listingsApi,
  orders: ordersApi,
  users: usersApi,
  messages: messagesApi,
  transport: transportApi,
  notifications: notificationsApi,
  transactions: transactionsApi,
  disputes: disputesApi,
  wallet: walletApi,
};

export default mockApi;
