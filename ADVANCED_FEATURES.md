# MAKEFARMHUB - Advanced Features Documentation

## Overview
This document covers the advanced features implemented for MAKEFARMHUB including state management, data persistence, real-time features, advanced search, testing infrastructure, performance monitoring, and SEO optimization.

---

## 1. State Management & API Layer ✅

### API Client
**Location**: `src/services/api/ApiClient.ts`

**Features**:
- HTTP client with retry logic
- Request caching with TTL
- Request deduplication
- Automatic error handling
- Configurable timeouts

**Usage**:
```typescript
import { api } from '@/services/api';

// GET request with caching
const response = await api.get('/listings', { category: 'crops' });

// POST request
const newListing = await api.post('/listings', listingData);

// Clear cache
import { clearCache } from '@/services/api';
clearCache('listings');
```

### Mock API Service
**Location**: `src/services/api/MockApiService.ts`

Provides simulated API responses for all endpoints:
- `listingsApi` - Listings CRUD operations
- `ordersApi` - Order management
- `usersApi` - User operations
- `messagesApi` - Chat functionality
- `transportApi` - Transport management
- `notificationsApi` - Notifications
- `transactionsApi` - Transaction history
- `walletApi` - Wallet operations

### useApi Hook
**Location**: `src/hooks/useApi.ts`

**Hooks Available**:
- `useApi` - Generic API hook with loading/error states
- `useLazyApi` - Manual trigger API calls
- `useApiOnMount` - Auto-fetch on component mount
- `usePaginatedApi` - Paginated data fetching
- `useOptimisticUpdate` - Optimistic UI updates

**Usage**:
```typescript
import { useApi, usePaginatedApi } from '@/hooks/useApi';

// Basic usage
const { data, loading, error, execute } = useApi(fetchListings);

// Paginated
const { items, loadMore, hasMore } = usePaginatedApi(fetchPaginatedListings);

// Optimistic update
const { executeOptimistic } = useOptimisticUpdate(updateListing, {
  optimisticUpdate: (args) => ({ ...currentData, ...args[0] }),
});
```

---

## 2. Data Persistence ✅

### LocalStorage Service
**Location**: `src/services/storage/LocalStorage.ts`

**Features**:
- Type-safe storage operations
- TTL (Time To Live) support
- Automatic expiration handling
- Prefixed keys to avoid conflicts

**Usage**:
```typescript
import { storage, STORAGE_KEYS } from '@/services/storage';

// Store with expiration (1 hour)
storage.set('user', userData, 60 * 60 * 1000);

// Retrieve
const user = storage.get<User>('user');

// Check existence
if (storage.has('user')) { ... }

// Remove
storage.remove('user');

// Clear all app data
storage.clear();
```

**Predefined Keys**:
- `USER` - Current user data
- `AUTH_TOKEN` - Authentication token
- `THEME` - Theme preference
- `SEARCH_HISTORY` - Search history
- `SAVED_SEARCHES` - Saved search filters
- `FAVORITES` - Favorite listings
- `CART` - Shopping cart
- `PREFERENCES` - User preferences

### IndexedDB Service
**Location**: `src/services/storage/IndexedDB.ts`

**Features**:
- Large data storage
- Offline support
- Indexed queries
- Cache management
- Sync queue for offline operations

**Stores**:
- `listings` - Cached listings
- `orders` - Order history
- `messages` - Chat messages
- `notifications` - Notifications
- `cache` - General cache
- `sync_queue` - Pending sync operations

**Usage**:
```typescript
import { indexedDB, STORES } from '@/services/storage';

// Initialize
await indexedDB.init();

// Store data
await indexedDB.put(STORES.LISTINGS, listing);

// Retrieve
const listing = await indexedDB.get(STORES.LISTINGS, 'listing-1');

// Query by index
const cropListings = await indexedDB.getByIndex(STORES.LISTINGS, 'category', 'crops');

// Cache with expiration
await indexedDB.cache.set('featured', featuredListings, 5 * 60 * 1000);
const cached = await indexedDB.cache.get('featured');

// Sync queue for offline
await indexedDB.sync.add('create', 'listings', newListing);
const pending = await indexedDB.sync.getQueue();
```

---

## 3. Real-time Features ✅

### Event Emitter
**Location**: `src/services/realtime/EventEmitter.ts`

Simple pub/sub system for real-time events.

**Usage**:
```typescript
import { eventEmitter, EVENTS } from '@/services/realtime';

// Subscribe
const subscription = eventEmitter.on(EVENTS.NOTIFICATION_NEW, (notification) => {
  console.log('New notification:', notification);
});

// Emit
eventEmitter.emit(EVENTS.ORDER_UPDATED, { orderId: '123', status: 'shipped' });

// Unsubscribe
subscription.unsubscribe();
```

**Available Events**:
- `NOTIFICATION_NEW/READ/CLEAR`
- `ORDER_CREATED/UPDATED/STATUS_CHANGED`
- `MESSAGE_NEW/READ`
- `LISTING_CREATED/UPDATED/DELETED`
- `TRANSPORT_REQUEST/ACCEPTED/LOCATION_UPDATE`
- `USER_ONLINE/OFFLINE`
- `CONNECTION_STATUS`

### Realtime Service
**Location**: `src/services/realtime/RealtimeService.ts`

Simulates WebSocket connections for real-time updates.

**Usage**:
```typescript
import { realtimeService } from '@/services/realtime';

// Connect
realtimeService.connect(userId);

// Send message
realtimeService.sendMessage(conversationId, 'Hello!');

// Track transport
const untrack = realtimeService.trackTransport(requestId);

// Disconnect
realtimeService.disconnect();
```

### Notification Service
**Location**: `src/services/realtime/NotificationService.ts`

**Features**:
- Browser notification support
- Permission management
- Notification history
- Read/unread tracking

**Usage**:
```typescript
import { notificationService } from '@/services/realtime';

// Request permission
await notificationService.checkPermission();

// Get notifications
const all = notificationService.getAll();
const unread = notificationService.getUnread();
const count = notificationService.getUnreadCount();

// Mark as read
notificationService.markAsRead(notificationId);
notificationService.markAllAsRead();
```

---

## 4. Advanced Search ✅

### Search Service
**Location**: `src/services/search/SearchService.ts`

**Features**:
- Fuzzy text matching (Levenshtein distance)
- Multi-field search (title, description, category, location)
- Advanced filtering
- Sorting options
- Pagination
- Search suggestions
- Search history
- Saved searches
- Faceted search results

**Usage**:
```typescript
import { searchService } from '@/services/search';

// Search with filters
const result = searchService.search(listings, {
  query: 'tomatoes',
  category: 'crops',
  minPrice: 10,
  maxPrice: 100,
  location: 'Harare',
  sortBy: 'price-asc',
  page: 1,
  limit: 12,
});

// Result includes:
// - items: Listing[]
// - total: number
// - page: number
// - totalPages: number
// - suggestions: string[]
// - facets: { categories, locations, priceRanges }

// Get suggestions
const suggestions = searchService.getSuggestions('tom', listings);

// Search history
const history = searchService.getHistory();
searchService.clearHistory();

// Saved searches
const saved = searchService.saveSearch('My Crops', { category: 'crops' }, true);
const savedSearches = searchService.getSavedSearches();
searchService.deleteSavedSearch(saved.id);
```

### useSearch Hook
**Location**: `src/hooks/useSearch.ts`

**Usage**:
```typescript
import { useSearch } from '@/hooks/useSearch';

function Marketplace() {
  const {
    items,
    total,
    page,
    totalPages,
    facets,
    suggestions,
    isSearching,
    setQuery,
    setFilter,
    updateFilters,
    clearFilters,
    goToPage,
    saveSearch,
    hasMore,
  } = useSearch(listings, { debounceMs: 300 });

  return (
    <div>
      <input onChange={(e) => setQuery(e.target.value)} />
      <select onChange={(e) => setFilter('category', e.target.value)}>
        {facets?.categories.map(c => (
          <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
        ))}
      </select>
      {items.map(item => <ListingCard key={item.id} listing={item} />)}
    </div>
  );
}
```

---

## 5. Testing Infrastructure ✅

### Setup
**Config**: `vitest.config.ts`
**Setup**: `src/test/setup.ts`
**Utilities**: `src/test/utils.tsx`

### Running Tests
```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Utilities
```typescript
import { render, screen, fireEvent, waitFor, mockUser, mockListing } from '@/test/utils';

// Render with all providers
render(<MyComponent />);

// Use mock data
const user = mockUser;
const listing = mockListing;
```

### Example Tests
**Location**: `src/test/components/` and `src/test/services/`

Tests included for:
- Skeleton components
- FormInput validation
- SearchService
- LocalStorage

---

## 6. Performance Monitoring ✅

### Analytics Service
**Location**: `src/services/analytics/AnalyticsService.ts`

**Features**:
- Event tracking
- Page view tracking
- Error tracking (global error handlers)
- Performance metrics (Web Vitals)
- User session management
- Automatic device/browser detection

**Usage**:
```typescript
import { analytics } from '@/services/analytics';

// Initialize
analytics.init(userId);

// Set user
analytics.setUser(userId, { role: 'farmer', location: 'Harare' });

// Track events
analytics.track('listing_view', 'Listing View', { listingId: '123' });
analytics.trackPageView('/marketplace');
analytics.trackSearch('tomatoes', 25, { category: 'crops' });
analytics.trackListingView('123', 'Fresh Tomatoes', 'crops');
analytics.trackConversion('order_complete', 150);
analytics.trackClick('buy-button', 'button', { listingId: '123' });

// Track errors manually
analytics.trackError({
  message: 'API Error',
  type: 'api',
  timestamp: Date.now(),
});

// Track performance
analytics.trackMetric('api_response_time', 250, 'ms');

// Flush events
await analytics.flush();
```

**Auto-tracked Metrics**:
- Page load time
- DOM interactive time
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

---

## 7. SEO Optimization ✅

### SEO Service
**Location**: `src/services/seo/SEOService.ts`

**Features**:
- Dynamic meta tags
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- JSON-LD structured data
- Sitemap generation

**Usage**:
```typescript
import { seoService } from '@/services/seo';

// Update meta tags
seoService.updateMeta({
  title: 'Fresh Tomatoes',
  description: 'Buy fresh organic tomatoes from local farmers',
  image: '/images/tomatoes.jpg',
  type: 'product',
});

// Add product schema
seoService.addProductSchema({
  name: 'Fresh Tomatoes',
  description: 'Organic tomatoes',
  image: ['/images/tomatoes.jpg'],
  price: 50,
  currency: 'USD',
  availability: 'InStock',
  seller: { name: 'John Moyo' },
  rating: { value: 4.5, count: 25 },
});

// Add breadcrumbs
seoService.addBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Marketplace', url: '/marketplace' },
  { name: 'Crops', url: '/marketplace?category=crops' },
]);

// Add organization schema
seoService.addOrganizationSchema({
  name: 'MAKEFARMHUB',
  url: 'https://makefarmhub.vercel.app',
  logo: '/logo.png',
  description: 'Digital agriculture marketplace',
});

// Add FAQ schema
seoService.addFAQSchema([
  { question: 'How do I sell?', answer: 'Create an account...' },
]);

// Reset to defaults
seoService.resetMeta();
```

### useSEO Hook
**Location**: `src/hooks/useSEO.ts`

**Usage**:
```typescript
import { useSEO, useProductSEO, useBreadcrumbs, usePageTitle } from '@/hooks/useSEO';

// Basic meta
useSEO({
  title: 'Marketplace',
  description: 'Browse fresh produce',
});

// Product page
useProductSEO(product, [product?.id]);

// Breadcrumbs
useBreadcrumbs([
  { name: 'Home', url: '/' },
  { name: 'Products', url: '/marketplace' },
], []);

// Just title
usePageTitle('My Orders');
```

---

## File Structure

```
src/
├── services/
│   ├── api/
│   │   ├── ApiClient.ts
│   │   ├── MockApiService.ts
│   │   └── index.ts
│   ├── storage/
│   │   ├── LocalStorage.ts
│   │   ├── IndexedDB.ts
│   │   └── index.ts
│   ├── realtime/
│   │   ├── EventEmitter.ts
│   │   ├── RealtimeService.ts
│   │   ├── NotificationService.ts
│   │   └── index.ts
│   ├── search/
│   │   ├── SearchService.ts
│   │   └── index.ts
│   ├── analytics/
│   │   ├── AnalyticsService.ts
│   │   └── index.ts
│   ├── seo/
│   │   ├── SEOService.ts
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useApi.ts
│   ├── useDebounce.ts
│   ├── useIntersectionObserver.ts
│   ├── useMediaQuery.ts
│   ├── useScrollPosition.ts
│   ├── useSearch.ts
│   ├── useSEO.ts
│   └── index.ts
├── test/
│   ├── setup.ts
│   ├── utils.tsx
│   ├── components/
│   │   ├── Skeleton.test.tsx
│   │   └── FormInput.test.tsx
│   └── services/
│       ├── SearchService.test.ts
│       └── LocalStorage.test.ts
└── ...
```

---

## Quick Import Guide

```typescript
// Services
import { api, mockApi } from '@/services/api';
import { storage, indexedDB } from '@/services/storage';
import { eventEmitter, realtimeService, notificationService } from '@/services/realtime';
import { searchService } from '@/services/search';
import { analytics } from '@/services/analytics';
import { seoService } from '@/services/seo';

// Hooks
import { useApi, usePaginatedApi } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/hooks/useSearch';
import { useSEO, usePageTitle } from '@/hooks/useSEO';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';
```

---

## Summary

| Feature | Status | Files |
|---------|--------|-------|
| API Client | ✅ | 3 |
| Data Persistence | ✅ | 3 |
| Real-time Features | ✅ | 4 |
| Advanced Search | ✅ | 3 |
| Testing Infrastructure | ✅ | 6 |
| Performance Monitoring | ✅ | 2 |
| SEO Optimization | ✅ | 3 |

**Total New Files**: 24+
**Total Lines of Code**: 3,500+

---

*MAKEFARMHUB - Zimbabwe's Premier Digital Agriculture Marketplace*
