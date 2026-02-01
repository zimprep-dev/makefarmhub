import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Eye, 
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import './SellerAnalytics.css';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
}

interface SellerAnalyticsProps {
  sellerId: string;
}

export default function SellerAnalytics({ sellerId }: SellerAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data - would come from API
  const stats = {
    totalRevenue: 2450.00,
    revenueChange: 12.5,
    totalOrders: 48,
    ordersChange: 8.3,
    totalViews: 1250,
    viewsChange: -2.1,
    averageRating: 4.7,
    ratingChange: 0.2,
  };

  const salesData: SalesData[] = useMemo(() => {
    // Generate mock sales data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.random() * 200 + 50,
      orders: Math.floor(Math.random() * 5) + 1,
    }));
  }, [timeRange]);

  const topProducts: ProductPerformance[] = [
    { id: '1', name: 'Organic Tomatoes', sales: 156, revenue: 780, views: 450, conversionRate: 34.7 },
    { id: '2', name: 'Fresh Maize', sales: 98, revenue: 490, views: 320, conversionRate: 30.6 },
    { id: '3', name: 'Free-range Eggs', sales: 87, revenue: 435, views: 280, conversionRate: 31.1 },
    { id: '4', name: 'Broiler Chickens', sales: 45, revenue: 675, views: 180, conversionRate: 25.0 },
    { id: '5', name: 'Cabbage', sales: 34, revenue: 102, views: 150, conversionRate: 22.7 },
  ];

  const peakHours = [
    { hour: '8AM', orders: 12 },
    { hour: '10AM', orders: 25 },
    { hour: '12PM', orders: 38 },
    { hour: '2PM', orders: 32 },
    { hour: '4PM', orders: 28 },
    { hour: '6PM', orders: 45 },
    { hour: '8PM', orders: 22 },
  ];

  const maxRevenue = Math.max(...salesData.map(d => d.revenue));
  const maxOrders = Math.max(...peakHours.map(h => h.orders));

  return (
    <div className="seller-analytics">
      <div className="analytics-header">
        <h2>
          <BarChart3 size={24} />
          Sales Analytics
        </h2>
        <div className="time-range-selector">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              className={timeRange === range ? 'active' : ''}
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">${stats.totalRevenue.toLocaleString()}</span>
            <span className={`stat-change ${stats.revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {stats.revenueChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(stats.revenueChange)}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
            <span className={`stat-change ${stats.ordersChange >= 0 ? 'positive' : 'negative'}`}>
              {stats.ordersChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(stats.ordersChange)}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon views">
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Views</span>
            <span className="stat-value">{stats.totalViews.toLocaleString()}</span>
            <span className={`stat-change ${stats.viewsChange >= 0 ? 'positive' : 'negative'}`}>
              {stats.viewsChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(stats.viewsChange)}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rating">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Average Rating</span>
            <span className="stat-value">{stats.averageRating}</span>
            <span className={`stat-change ${stats.ratingChange >= 0 ? 'positive' : 'negative'}`}>
              {stats.ratingChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(stats.ratingChange)}
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
        <h3>Revenue Over Time</h3>
        <div className="revenue-chart">
          <div className="chart-bars">
            {salesData.slice(-14).map((day, index) => (
              <div key={index} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  title={`$${day.revenue.toFixed(2)}`}
                />
                <span className="chart-label">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="chart-section">
        <h3>Top Performing Products</h3>
        <div className="products-table">
          <div className="table-header">
            <span>Product</span>
            <span>Sales</span>
            <span>Revenue</span>
            <span>Views</span>
            <span>Conversion</span>
          </div>
          {topProducts.map((product) => (
            <div key={product.id} className="table-row">
              <span className="product-name">{product.name}</span>
              <span>{product.sales}</span>
              <span>${product.revenue}</span>
              <span>{product.views}</span>
              <span className="conversion-rate">
                {product.conversionRate}%
                {product.conversionRate > 30 ? (
                  <TrendingUp size={14} className="trend-up" />
                ) : (
                  <TrendingDown size={14} className="trend-down" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours */}
      <div className="chart-section">
        <h3>Peak Sales Hours</h3>
        <div className="peak-hours-chart">
          {peakHours.map((hour, index) => (
            <div key={index} className="hour-bar-container">
              <div
                className="hour-bar"
                style={{ height: `${(hour.orders / maxOrders) * 100}%` }}
              />
              <span className="hour-label">{hour.hour}</span>
              <span className="hour-value">{hour.orders}</span>
            </div>
          ))}
        </div>
        <p className="chart-insight">
          💡 Your peak sales time is <strong>6PM</strong>. Consider scheduling promotions around this time.
        </p>
      </div>
    </div>
  );
}
