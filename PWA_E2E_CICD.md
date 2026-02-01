# MAKEFARMHUB - PWA, E2E Testing & CI/CD Documentation

## Overview
This document covers PWA support, Push Notifications, End-to-End Testing, and CI/CD Pipeline implementation.

---

## 1. PWA Support ✅

### Service Worker
**Location**: `public/sw.js`

**Features**:
- Offline caching strategy
- Background sync
- Push notification handling
- Cache management
- Network-first for HTML, cache-first for assets

### PWA Manifest
**Location**: `public/manifest.json`

**Features**:
- App icons (72x72 to 512x512)
- Standalone display mode
- Theme colors
- App shortcuts
- Screenshots for app stores

### PWA Service
**Location**: `src/services/pwa/PWAService.ts`

**Usage**:
```typescript
import { pwaService } from '@/services/pwa';

// Register service worker
await pwaService.registerServiceWorker();

// Show install prompt
const accepted = await pwaService.showInstallPrompt();

// Check if can install
if (pwaService.canInstall()) {
  // Show install button
}

// Check if installed
if (pwaService.isAppInstalled()) {
  // Hide install prompt
}

// Cache specific URLs
await pwaService.cacheUrls(['/marketplace', '/orders']);

// Clear all caches
await pwaService.clearCaches();

// Request background sync
await pwaService.requestBackgroundSync('sync-data');

// Web Share API
await pwaService.share({
  title: 'Check out this listing',
  text: 'Fresh Tomatoes for sale',
  url: '/listing/123',
});

// Network status
const isOnline = pwaService.isOnline();

// Setup network listeners
const cleanup = pwaService.setupNetworkListeners(
  () => console.log('Online'),
  () => console.log('Offline')
);
```

### usePWA Hooks
**Location**: `src/hooks/usePWA.ts`

**Usage**:
```typescript
import { usePWAInstall, useOnlineStatus, useWebShare } from '@/hooks/usePWA';

// Install prompt
function InstallButton() {
  const { canInstall, isInstalled, install } = usePWAInstall();

  if (isInstalled) return null;
  if (!canInstall) return null;

  return <button onClick={install}>Install App</button>;
}

// Online status
function NetworkStatus() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {isOnline ? '🟢 Online' : '🔴 Offline'}
    </div>
  );
}

// Web Share
function ShareButton({ listing }) {
  const { isSupported, share } = useWebShare();

  if (!isSupported) return null;

  const handleShare = () => {
    share({
      title: listing.title,
      text: listing.description,
      url: `/listing/${listing.id}`,
    });
  };

  return <button onClick={handleShare}>Share</button>;
}
```

---

## 2. Push Notifications ✅

### Push Notification Service
**Location**: `src/services/pwa/PushNotificationService.ts`

**Features**:
- Web Push API integration
- VAPID key support
- Subscription management
- Local notifications
- Permission handling

**Usage**:
```typescript
import { pushNotificationService } from '@/services/pwa';

// Initialize (after service worker registration)
await pushNotificationService.init(registration);

// Request permission
const permission = await pushNotificationService.requestPermission();

// Subscribe to push notifications
const subscription = await pushNotificationService.subscribe();

// Unsubscribe
await pushNotificationService.unsubscribe();

// Check if subscribed
if (pushNotificationService.isSubscribed()) {
  // Show unsubscribe button
}

// Send test notification
await pushNotificationService.sendTestNotification();

// Show local notification
await pushNotificationService.showNotification({
  title: 'New Order',
  body: 'You have a new order for Fresh Tomatoes',
  icon: '/icons/order.png',
  tag: 'order-123',
  data: { orderId: '123' },
  url: '/orders/123',
  actions: [
    { action: 'view', title: 'View Order' },
    { action: 'dismiss', title: 'Dismiss' },
  ],
});

// Check permission status
const status = pushNotificationService.getPermissionStatus();

// Check if supported
if (pushNotificationService.isSupported()) {
  // Show notification UI
}
```

### usePushNotifications Hook
**Location**: `src/hooks/usePWA.ts`

**Usage**:
```typescript
import { usePushNotifications } from '@/hooks/usePWA';

function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    sendTest,
  } = usePushNotifications();

  if (!isSupported) {
    return <div>Push notifications not supported</div>;
  }

  return (
    <div>
      <p>Status: {permission}</p>
      {isSubscribed ? (
        <button onClick={unsubscribe}>Disable Notifications</button>
      ) : (
        <button onClick={subscribe}>Enable Notifications</button>
      )}
      <button onClick={sendTest}>Send Test</button>
    </div>
  );
}
```

**Important Notes**:
- Replace VAPID keys in `PushNotificationService.ts` with your own
- Generate VAPID keys using: `npx web-push generate-vapid-keys`
- Backend integration required for sending push notifications
- Store subscriptions in your database

---

## 3. E2E Testing with Playwright ✅

### Configuration
**Location**: `playwright.config.ts`

**Features**:
- Multi-browser testing (Chromium, Firefox, WebKit)
- Mobile device testing (Pixel 5, iPhone 12)
- Automatic dev server startup
- Screenshots on failure
- Video recording
- HTML/JSON/JUnit reports

### Test Files
**Location**: `e2e/`

**Tests Created**:
1. **auth.spec.ts** - Authentication flow
   - Landing page display
   - Login navigation
   - Login with valid credentials
   - Signup navigation
   - Signup with valid data
   - Invalid OTP error
   - Logout

2. **marketplace.spec.ts** - Marketplace functionality
   - Display marketplace
   - Search listings
   - Filter by category
   - Sort listings
   - View listing details
   - Add to favorites
   - Pagination
   - Grid/list view toggle

3. **listing-creation.spec.ts** - Listing creation
   - Display create form
   - Create crop listing
   - Create livestock listing
   - Validation errors
   - Save as draft

### Running Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run in specific browser
npx playwright test --project=chromium

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# View report
npm run test:e2e:report
```

### Writing New Tests
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    await page.click('button');
    await expect(page.locator('h1')).toContainText('Success');
  });
});
```

---

## 4. CI/CD Pipeline ✅

### GitHub Actions Workflows
**Location**: `.github/workflows/`

### CI Pipeline (`ci.yml`)
**Triggers**: Push to main/develop, Pull requests

**Jobs**:
1. **Lint & Type Check**
   - TypeScript compilation
   - ESLint checks

2. **Unit Tests**
   - Vitest unit tests
   - Coverage report
   - Upload to Codecov

3. **E2E Tests**
   - Playwright tests
   - Multi-browser testing
   - Upload test artifacts

4. **Build**
   - Production build
   - Upload build artifacts

5. **Deploy Production**
   - Deploy to Vercel (main branch only)
   - Production environment

6. **Deploy Preview**
   - Deploy to Vercel (PRs only)
   - Comment PR with preview URL

7. **Lighthouse CI**
   - Performance audits
   - Accessibility checks
   - SEO analysis
   - PWA score

### Deploy Pipeline (`deploy.yml`)
**Triggers**: Manual dispatch, Release published

**Features**:
- Run tests before deploy
- Build application
- Deploy to Vercel production
- Create deployment summary

### Lighthouse Configuration
**Location**: `lighthouserc.json`

**Audits**:
- Performance (min 80%)
- Accessibility (min 90%)
- Best Practices (min 90%)
- SEO (min 90%)
- PWA (min 70%)

### Setting Up CI/CD

1. **Add GitHub Secrets**:
   ```
   VERCEL_TOKEN - Vercel API token
   VERCEL_ORG_ID - Vercel organization ID
   VERCEL_PROJECT_ID - Vercel project ID
   LHCI_GITHUB_APP_TOKEN - Lighthouse CI token (optional)
   ```

2. **Get Vercel Credentials**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Link project
   vercel link

   # Get org and project IDs from .vercel/project.json
   ```

3. **Add Secrets to GitHub**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add each secret

4. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline"
   git push
   ```

### Workflow Status Badges
Add to README.md:
```markdown
![CI](https://github.com/username/makefarmhub/workflows/CI%2FCD%20Pipeline/badge.svg)
![Deploy](https://github.com/username/makefarmhub/workflows/Deploy%20to%20Production/badge.svg)
```

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `@playwright/test` - E2E testing
- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - DOM matchers
- `vitest` - Unit testing
- `jsdom` - DOM environment

### 2. Install Playwright Browsers
```bash
npx playwright install
```

### 3. Register Service Worker
Add to `src/main.tsx` or `src/App.tsx`:
```typescript
import { pwaService, pushNotificationService } from './services/pwa';

// Register service worker
if ('serviceWorker' in navigator) {
  pwaService.registerServiceWorker().then(async (registration) => {
    if (registration) {
      // Initialize push notifications
      await pushNotificationService.init(registration);
    }
  });
}
```

### 4. Add Manifest Link
Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0a6b2b">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
```

---

## Testing Checklist

### Unit Tests
- [x] Component rendering
- [x] Form validation
- [x] Search functionality
- [x] LocalStorage operations

### E2E Tests
- [x] Authentication flow
- [x] Marketplace browsing
- [x] Listing creation
- [ ] Order placement
- [ ] Messaging
- [ ] Profile management

### PWA Tests
- [ ] Install prompt
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Background sync
- [ ] Cache management

---

## Deployment Checklist

- [x] PWA manifest configured
- [x] Service worker implemented
- [x] Push notifications setup
- [x] E2E tests created
- [x] CI/CD pipeline configured
- [ ] GitHub secrets added
- [ ] VAPID keys generated
- [ ] App icons created (all sizes)
- [ ] Screenshots added
- [ ] Lighthouse audit passed

---

## Next Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate App Icons**:
   - Create icons in all required sizes (72x72 to 512x512)
   - Place in `public/icons/` directory

3. **Generate VAPID Keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```
   - Update keys in `PushNotificationService.ts`

4. **Setup GitHub Secrets**:
   - Add Vercel credentials
   - Add Lighthouse CI token (optional)

5. **Test Locally**:
   ```bash
   # Unit tests
   npm test

   # E2E tests
   npm run test:e2e

   # Build
   npm run build

   # Preview
   npm run preview
   ```

6. **Push to GitHub**:
   - CI/CD will run automatically
   - Check Actions tab for results

---

## Troubleshooting

### Service Worker Not Updating
```typescript
// Force update
await pwaService.updateServiceWorker();
```

### Push Notifications Not Working
- Check browser support
- Verify VAPID keys
- Check permission status
- Test with local notifications first

### E2E Tests Failing
- Check if dev server is running
- Verify selectors match actual DOM
- Check for timing issues (add waitFor)
- Run in headed mode to debug

### CI/CD Pipeline Failing
- Check GitHub secrets are set
- Verify Vercel credentials
- Check build logs for errors
- Ensure all tests pass locally

---

## Resources

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Playwright Docs](https://playwright.dev/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

*MAKEFARMHUB - Complete PWA with E2E Testing & CI/CD*
