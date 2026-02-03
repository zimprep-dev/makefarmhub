# API Setup Guide for MAKEFARMHUB

This guide explains how to set up the external APIs used in MAKEFARMHUB.

---

## ✅ ALREADY CONFIGURED

### Google Analytics (GA4)
**Status:** ✅ Active  
**Measurement ID:** `G-1GJZELW2D6`  
**Setup:** Complete - tracking pageviews, events, and e-commerce

---

## 🌤️ OpenWeatherMap API (Weather Widget)

### What it does:
- Shows real-time weather for farmers
- 7-day forecast
- Farming alerts (frost, heat, drought)
- Farming tips based on conditions

### Setup Steps:
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Subscribe to "Current Weather Data" and "5 Day / 3 Hour Forecast" (both free)
4. Get your API key from https://home.openweathermap.org/api_keys
5. Add to `.env`:
   ```
   VITE_WEATHER_API_KEY=your_api_key_here
   ```
6. Add to Vercel Environment Variables:
   - Name: `VITE_WEATHER_API_KEY`
   - Value: `your_api_key_here`
   - Environments: Production, Preview, Development

### Free Tier Limits:
- 60 calls/minute
- 1,000,000 calls/month
- More than enough for MAKEFARMHUB

### Fallback:
If no API key is provided, the widget automatically uses mock data with no errors.

---

## 💳 Stripe Payment Processing

### Current Status:
⚠️ **Using mock payments** - No real charges are made

### What it does:
- Processes card payments
- Handles escrow (holds payment until delivery confirmed)
- Supports refunds and disputes

### For REAL Stripe Integration (Requires Backend):

#### Frontend Setup:
1. Go to https://dashboard.stripe.com/register
2. Complete account verification (required for live mode)
3. Get your publishable key from https://dashboard.stripe.com/apikeys
4. Add to `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```
5. Install Stripe SDK:
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

#### Backend Setup (REQUIRED):
Stripe **MUST** have a backend to work securely. You need:

1. **Create backend server** (Node.js/Express, Python/Django, etc.)
2. **Install Stripe SDK** on backend:
   ```bash
   npm install stripe  # Node.js
   # or
   pip install stripe  # Python
   ```
3. **Add secret key** to backend environment (NEVER expose this):
   ```
   STRIPE_SECRET_KEY=sk_test_xxxxx
   ```
4. **Create endpoints**:
   - `POST /api/create-payment-intent` - Creates payment intent
   - `POST /api/confirm-payment` - Confirms payment
   - `POST /api/create-refund` - Handles refunds
   - Webhook handler for payment status updates

5. **Update frontend** to call your backend endpoints instead of mock

#### Backend Example (Node.js/Express):
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency, orderId } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Stripe uses cents
    currency: currency.toLowerCase(),
    metadata: { orderId }
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

### Why Backend is Required:
- **Security**: Secret keys cannot be exposed in frontend
- **Webhooks**: Stripe sends payment confirmations to backend
- **Server-side validation**: Prevents tampering with payment amounts

---

## 📱 Mobile Money (EcoCash, OneMoney)

### Current Status:
⚠️ **Using mock payments** - No real charges are made

### For Real Integration:
Mobile Money in Zimbabwe requires:
1. Business registration with payment providers
2. API contracts with EcoCash/OneMoney
3. Backend server for API calls
4. Compliance with financial regulations

**Recommended:** Start with Stripe first, add Mobile Money later when you have:
- Registered business entity
- Higher transaction volume
- Dedicated backend infrastructure

---

## 🔄 Progressive Web App (PWA)

**Status:** ✅ Active  
- Install prompt working
- Offline indicator working
- Service worker caching assets
- No additional setup required

---

## 📊 SEO Enhancements

**Status:** ✅ Active  
- `sitemap.xml` - Helps search engines index pages
- `robots.txt` - Controls crawler access
- Meta tags - Rich previews on social media
- Structured data - Google Rich Results
- No additional setup required

---

## 🚀 Next Steps Priority:

1. **Get OpenWeatherMap API key** (5 minutes, free, instant benefit)
2. **Test Google Analytics** (already configured)
3. **Plan backend infrastructure** (if you want real payments)
4. **Get Stripe test account** (when backend is ready)
5. **Consider Mobile Money** (after Stripe is working)

---

## 💡 Tips:

- **Start with free APIs** (Weather, Analytics) - easy wins
- **Use test mode** for Stripe development
- **Never commit API keys** to Git (they're in .gitignore)
- **Add keys to Vercel** for production deployment
- **Monitor API usage** to stay within free tiers

---

## 📞 Support:

If you need help with API setup:
- Email: missal@makefarmhub.com
- Phone: +263 78 291 9633
