/**
 * Analytics & Reporting Service
 * Track user engagement, sales metrics, and generate reports
 */

export interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UserEngagement {
  userId: string;
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  lastActive: Date;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: { id: string; name: string; sales: number; revenue: number }[];
  topCategories: { category: string; sales: number; revenue: number }[];
  salesByPeriod: { period: string; revenue: number; orders: number }[];
}

export interface BuyerInsights {
  userId: string;
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  purchaseFrequency: number;
  lastPurchase: Date;
  lifetimeValue: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionStart: number = Date.now();

  /**
   * Track custom event
   */
  trackEvent(
    event: string,
    category: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      label,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.events.push(analyticsEvent);
    this.saveToStorage();

    // In production, send to analytics backend
    this.sendToBackend(analyticsEvent);
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, path: string): void {
    this.trackEvent('page_view', 'navigation', pageName, undefined, { path });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string, value?: number): void {
    this.trackEvent('interaction', 'engagement', `${element}_${action}`, value);
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent('search', 'discovery', query, resultsCount);
  }

  /**
   * Track product view
   */
  trackProductView(productId: string, productName: string, price: number): void {
    this.trackEvent('product_view', 'products', productName, price, { productId });
  }

  /**
   * Track add to cart (or save listing)
   */
  trackAddToCart(productId: string, productName: string, price: number): void {
    this.trackEvent('add_to_cart', 'conversion', productName, price, { productId });
  }

  /**
   * Track purchase
   */
  trackPurchase(orderId: string, revenue: number, items: any[]): void {
    this.trackEvent('purchase', 'conversion', orderId, revenue, { items });
  }

  /**
   * Track listing creation
   */
  trackListingCreated(listingId: string, category: string, price: number): void {
    this.trackEvent('listing_created', 'seller_activity', category, price, { listingId });
  }

  /**
   * Track message sent
   */
  trackMessageSent(conversationId: string): void {
    this.trackEvent('message_sent', 'communication', conversationId);
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagement(userId: string): UserEngagement {
    const userEvents = this.events.filter(e => e.userId === userId);
    const pageViews = userEvents.filter(e => e.event === 'page_view').length;
    const interactions = userEvents.filter(e => e.event === 'interaction').length;

    return {
      userId,
      sessionDuration: this.getSessionDuration(),
      pageViews,
      interactions,
      lastActive: new Date(),
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
    };
  }

  /**
   * Generate sales report
   */
  generateSalesReport(orders: any[], period: 'day' | 'week' | 'month' | 'year'): SalesMetrics {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate conversion rate (purchases / product views)
    const productViews = this.events.filter(e => e.event === 'product_view').length;
    const purchases = this.events.filter(e => e.event === 'purchase').length;
    const conversionRate = productViews > 0 ? (purchases / productViews) * 100 : 0;

    // Top products
    const productSales = new Map<string, { name: string; sales: number; revenue: number }>();
    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        const existing = productSales.get(item.id) || { name: item.name, sales: 0, revenue: 0 };
        existing.sales += item.quantity || 1;
        existing.revenue += item.price * (item.quantity || 1);
        productSales.set(item.id, existing);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top categories
    const categorySales = new Map<string, { sales: number; revenue: number }>();
    orders.forEach(order => {
      const category = order.category || 'Other';
      const existing = categorySales.get(category) || { sales: 0, revenue: 0 };
      existing.sales += 1;
      existing.revenue += order.total;
      categorySales.set(category, existing);
    });

    const topCategories = Array.from(categorySales.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Sales by period (simplified)
    const salesByPeriod = this.groupSalesByPeriod(orders, period);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      topProducts,
      topCategories,
      salesByPeriod,
    };
  }

  /**
   * Generate buyer insights
   */
  generateBuyerInsights(userId: string, orders: any[]): BuyerInsights {
    const userOrders = orders.filter(o => o.buyerId === userId);
    const totalPurchases = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    // Favorite categories
    const categoryCount = new Map<string, number>();
    userOrders.forEach(order => {
      const category = order.category || 'Other';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    const favoriteCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    // Purchase frequency (orders per month)
    const firstOrder = userOrders[0]?.createdAt;
    const monthsSinceFirst = firstOrder
      ? (Date.now() - new Date(firstOrder).getTime()) / (1000 * 60 * 60 * 24 * 30)
      : 1;
    const purchaseFrequency = totalPurchases / monthsSinceFirst;

    const lastPurchase = userOrders.length > 0
      ? new Date(userOrders[userOrders.length - 1].createdAt)
      : new Date();

    return {
      userId,
      totalPurchases,
      totalSpent,
      averageOrderValue,
      favoriteCategories,
      purchaseFrequency,
      lastPurchase,
      lifetimeValue: totalSpent,
    };
  }

  /**
   * Group sales by period
   */
  private groupSalesByPeriod(
    orders: any[],
    period: 'day' | 'week' | 'month' | 'year'
  ): { period: string; revenue: number; orders: number }[] {
    const grouped = new Map<string, { revenue: number; orders: number }>();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekNum = this.getWeekNumber(date);
          key = `${date.getFullYear()}-W${weekNum}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
      }

      const existing = grouped.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      grouped.set(key, existing);
    });

    return Array.from(grouped.entries())
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get browser
   */
  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  /**
   * Save events to storage
   */
  private saveToStorage(): void {
    try {
      // Keep only last 1000 events
      const recentEvents = this.events.slice(-1000);
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to save analytics to storage');
    }
  }

  /**
   * Load events from storage
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics from storage');
    }
  }

  /**
   * Send to backend (placeholder)
   */
  private sendToBackend(event: AnalyticsEvent): void {
    // In production, send to your analytics backend
    if (import.meta.env.PROD) {
      // Example:
      // fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    }
  }

  /**
   * Export analytics data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.events, null, 2);
    } else {
      // Simple CSV export
      const headers = ['timestamp', 'event', 'category', 'label', 'value'];
      const rows = this.events.map(e => [
        new Date(e.timestamp).toISOString(),
        e.event,
        e.category,
        e.label || '',
        e.value || '',
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }
}

export const analyticsService = new AnalyticsService();

// Auto-load from storage
if (typeof window !== 'undefined') {
  analyticsService.loadFromStorage();
}

export default analyticsService;
