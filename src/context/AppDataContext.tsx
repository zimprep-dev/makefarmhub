import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { 
  mockOrders, 
  mockConversations, 
  mockMessages, 
  mockNotifications,
  mockListings,
  mockTransportRequests,
  mockVehicles,
} from '../data/mockData';
import type { Order, Conversation, Message, Notification, Listing, TransportRequest, Vehicle } from '../types';
import type { Address } from '../components/Address/AddressBook';

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'escrow';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Review {
  id: string;
  targetId: string;
  targetType: 'seller' | 'listing';
  rating: number;
  title: string;
  comment: string;
  authorName: string;
  date: string;
}

interface SellerStats {
  totalSales: number;
  commissionPaid: boolean;
  lastCommissionDate?: string;
}

interface AppDataContextType {
  // Orders
  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Seller Commission
  sellerStats: Record<string, SellerStats>;
  getSellerStats: (sellerId: string) => SellerStats;
  payCommission: (sellerId: string, amount: number) => void;
  canSellerList: (sellerId: string) => boolean;
  
  // Messages
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, content: string) => void;
  
  // Notifications
  notifications: Notification[];
  createNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Wallet
  walletBalance: number;
  escrowBalance: number;
  walletTransactions: WalletTransaction[];
  addFunds: (amount: number, method: string) => void;
  withdrawFunds: (amount: number, method: string) => void;
  releaseEscrow: (orderId: string) => void;
  raiseDispute: (orderId: string, reason: string) => void;
  
  // Listings
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id'>) => void;
  deleteListing: (id: string) => void;
  updateListingStatus: (id: string, status: string) => void;
  moderateListing: (id: string, action: 'approve' | 'reject' | 'flag', reason?: string) => void;
  
  // Transport
  transportRequests: TransportRequest[];
  vehicles: Vehicle[];
  bookTransport: (request: Omit<TransportRequest, 'id'>) => void;
  updateTransportStatus: (id: string, status: TransportRequest['status']) => void;
  
  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  
  // Addresses
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Orders state
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  
  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  // Wallet state
  const [walletBalance, setWalletBalance] = useState(2450.00);
  const [escrowBalance] = useState(850.00);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([
    { id: '1', type: 'deposit', amount: 1000, description: 'EcoCash Deposit', date: '2024-01-15', status: 'completed' },
    { id: '2', type: 'payment', amount: -250, description: 'Order #ORD-001 Payment', date: '2024-01-14', status: 'completed' },
    { id: '3', type: 'escrow', amount: -850, description: 'Escrow for Order #ORD-002', date: '2024-01-13', status: 'pending' },
    { id: '4', type: 'deposit', amount: 2000, description: 'Bank Transfer', date: '2024-01-12', status: 'completed' },
    { id: '5', type: 'refund', amount: 550, description: 'Refund for cancelled order', date: '2024-01-10', status: 'completed' },
  ]);
  
  // Listings state
  const [listings, setListings] = useState<Listing[]>(mockListings);
  
  // Transport state
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>(mockTransportRequests);
  const [vehicles] = useState<Vehicle[]>(mockVehicles);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Favorites state (persisted to localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('makefarmhub_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Addresses state (persisted to localStorage)
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('makefarmhub_addresses');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Seller stats state (persisted to localStorage)
  const [sellerStats, setSellerStats] = useState<Record<string, SellerStats>>(() => {
    const saved = localStorage.getItem('makefarmhub_seller_stats');
    return saved ? JSON.parse(saved) : {};
  });

  // Order functions
  const createOrder = useCallback((order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrderId = `order-${Date.now()}`;
    const newOrder: Order = {
      ...order,
      id: newOrderId,
      createdAt: new Date().toISOString(),
    } as Order;
    setOrders(prev => [newOrder, ...prev]);
    
    // Update seller stats when order is completed
    if (newOrder.status === 'completed' && newOrder.sellerId) {
      setSellerStats(prev => {
        const current = prev[newOrder.sellerId] || { totalSales: 0, commissionPaid: false };
        const updated = {
          ...current,
          totalSales: current.totalSales + (newOrder.totalPrice || 0),
        };
        const newStats = { ...prev, [newOrder.sellerId]: updated };
        localStorage.setItem('makefarmhub_seller_stats', JSON.stringify(newStats));
        return newStats;
      });
    }
    
    return newOrderId;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  }, []);

  // Message functions
  const sendMessage = useCallback((conversationId: string, content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
      read: true,
    };
    
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));
    
    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, lastMessage: content, lastMessageTime: 'Just now', unreadCount: 0 }
        : conv
    ));
  }, []);

  // Notification functions
  const createNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Wallet functions
  const addFunds = useCallback((amount: number, method: string) => {
    setWalletBalance(prev => prev + amount);
    setWalletTransactions(prev => [{
      id: `txn-${Date.now()}`,
      type: 'deposit',
      amount,
      description: `${method} Deposit`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    }, ...prev]);
  }, []);

  const withdrawFunds = useCallback((amount: number, method: string) => {
    if (amount <= walletBalance) {
      setWalletBalance(prev => prev - amount);
      setWalletTransactions(prev => [{
        id: `txn-${Date.now()}`,
        type: 'withdrawal',
        amount: -amount,
        description: `Withdrawal to ${method}`,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
      }, ...prev]);
    }
  }, [walletBalance]);

  const releaseEscrow = useCallback((orderId: string) => {
    // Update order status to completed
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'completed' } : order
    ));
    
    // Create notification
    createNotification({
      type: 'success',
      title: 'Payment Released',
      message: `Escrow payment for order #${orderId} has been released to the seller`,
      actionUrl: `/orders/${orderId}`,
    });
  }, [createNotification]);

  const raiseDispute = useCallback((orderId: string, reason: string) => {
    // Update order status to disputed
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'disputed' } : order
    ));
    
    // Create notification
    createNotification({
      type: 'warning',
      title: 'Dispute Raised',
      message: `A dispute has been raised for order #${orderId}. Our team will review it.`,
      actionUrl: `/orders/${orderId}`,
    });
  }, [createNotification]);

  // Listing functions
  const addListing = useCallback((listing: Omit<Listing, 'id'>) => {
    const newListing: Listing = {
      ...listing,
      id: `listing-${Date.now()}`,
    } as Listing;
    setListings(prev => [newListing, ...prev]);
  }, []);

  const deleteListing = useCallback((id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateListingStatus = useCallback((id: string, status: string) => {
    setListings(prev => prev.map(listing => 
      listing.id === id ? { ...listing, status: status as Listing['status'] } : listing
    ));
  }, []);

  const moderateListing = useCallback((id: string, action: 'approve' | 'reject' | 'flag', reason?: string) => {
    setListings(prev => prev.map(listing => {
      if (listing.id === id) {
        const updated = { ...listing } as any;
        if (action === 'approve') {
          updated.moderationStatus = 'approved';
          updated.status = 'active';
          delete updated.flaggedReason;
        } else if (action === 'reject') {
          updated.moderationStatus = 'rejected';
          updated.status = 'inactive';
        } else if (action === 'flag') {
          updated.moderationStatus = 'flagged';
          updated.flaggedReason = reason || 'Flagged for review';
        }
        return updated;
      }
      return listing;
    }));
  }, []);

  // Transport functions
  const bookTransport = useCallback((request: Omit<TransportRequest, 'id'>) => {
    const newRequest: TransportRequest = {
      ...request,
      id: `req-${Date.now()}`,
    } as TransportRequest;
    setTransportRequests(prev => [newRequest, ...prev]);
  }, []);

  const updateTransportStatus = useCallback((id: string, status: TransportRequest['status']) => {
    setTransportRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  }, []);

  // Review functions
  const addReview = useCallback((review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews(prev => [newReview, ...prev]);
  }, []);
  
  // Favorites functions
  const toggleFavorite = useCallback((listingId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId];
      localStorage.setItem('makefarmhub_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);
  
  const isFavorite = useCallback((listingId: string) => {
    return favorites.includes(listingId);
  }, [favorites]);

  // Address functions
  const addAddress = useCallback((address: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    setAddresses(prev => {
      const updated = [...prev, newAddress];
      localStorage.setItem('makefarmhub_addresses', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateAddress = useCallback((id: string, address: Partial<Address>) => {
    setAddresses(prev => {
      const updated = prev.map(addr => addr.id === id ? { ...addr, ...address } : addr);
      localStorage.setItem('makefarmhub_addresses', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses(prev => {
      const updated = prev.filter(addr => addr.id !== id);
      localStorage.setItem('makefarmhub_addresses', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses(prev => {
      const updated = prev.map(addr => ({ ...addr, isDefault: addr.id === id }));
      localStorage.setItem('makefarmhub_addresses', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Seller commission functions
  const getSellerStats = useCallback((sellerId: string): SellerStats => {
    return sellerStats[sellerId] || { totalSales: 0, commissionPaid: false };
  }, [sellerStats]);
  
  const payCommission = useCallback((sellerId: string, amount: number) => {
    setSellerStats(prev => {
      const updated = {
        ...prev,
        [sellerId]: {
          totalSales: prev[sellerId]?.totalSales || 0,
          commissionPaid: true,
          lastCommissionDate: new Date().toISOString(),
        },
      };
      localStorage.setItem('makefarmhub_seller_stats', JSON.stringify(updated));
      return updated;
    });
    
    // Deduct from wallet
    setWalletBalance(prev => prev - amount);
    setWalletTransactions(prev => [{
      id: `txn-${Date.now()}`,
      type: 'payment',
      amount: -amount,
      description: 'Service Contribution - Platform Fee',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    }, ...prev]);
    
    createNotification({
      type: 'success',
      title: 'Service Contribution Paid',
      message: `You can now continue listing and selling products. Thank you for supporting MakeFarmHub!`,
    });
  }, [sellerStats, createNotification]);
  
  const canSellerList = useCallback((sellerId: string): boolean => {
    const stats = sellerStats[sellerId];
    if (!stats) return true; // New sellers can list
    if (stats.totalSales < 100) return true; // Under $100, can list freely
    return stats.commissionPaid; // Over $100, must have paid commission
  }, [sellerStats]);

  const contextValue: AppDataContextType = {
    orders,
    createOrder,
    updateOrderStatus,
    conversations,
    messages,
    sendMessage,
    notifications,
    createNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    walletBalance,
    escrowBalance,
    walletTransactions,
    addFunds,
    withdrawFunds,
    releaseEscrow,
    raiseDispute,
    listings,
    addListing,
    deleteListing,
    updateListingStatus,
    moderateListing,
    transportRequests,
    vehicles,
    bookTransport,
    updateTransportStatus,
    reviews,
    addReview,
    favorites,
    toggleFavorite,
    isFavorite,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    sellerStats,
    getSellerStats,
    payCommission,
    canSellerList,
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
