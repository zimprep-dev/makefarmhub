# MAKEFARMHUB

**Digital Agriculture Marketplace** — Connecting farmers, buyers, and transporters across Zimbabwe.

Live: [makefarmhub.vercel.app](https://makefarmhub.vercel.app)

## Features

- **Marketplace** — Browse and list crops, livestock, and farm equipment with advanced search, location filtering, price ranges, and saved searches
- **Multi-role Dashboards** — Tailored views for farmers, buyers, transporters, and admins
- **Payments** — Stripe card payments + Mobile Money (EcoCash, OneMoney, InnBucks, Telecash)
- **Real-time Messaging** — WebSocket-powered chat with typing indicators, image sharing, and location sharing
- **Multi-language** — English, Shona, and Ndebele with currency switching (USD/ZWL)
- **Transport Booking** — Book and track deliveries with vehicle management
- **Email Notifications** — Transactional emails for orders, payments, delivery updates, and messages
- **Analytics Dashboard** — Charts, stats, and reports for admin users
- **PWA** — Installable, offline-capable progressive web app with push notifications
- **Dark Mode** — Full dark theme support across all components
- **Accessibility** — Keyboard navigation, screen reader support, accessibility panel

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | CSS custom properties, responsive design |
| Icons | Lucide React |
| Routing | React Router v7 |
| Backend | Vercel Serverless Functions |
| Payments | Stripe, Mobile Money APIs |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/zimprep-dev/makefarmhub.git
cd makefarmhub
npm install
```

### Environment Variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GA_ID` | No | Google Analytics Measurement ID |
| `VITE_WEATHER_API_KEY` | No | OpenWeatherMap API key for weather widget |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (enables real payments) |
| `VITE_WS_URL` | No | WebSocket URL for real-time messaging |
| `VITE_API_URL` | No | API URL override (auto-configured on Vercel) |

**Server-only variables** (set in Vercel dashboard, never in frontend):

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SENDGRID_API_KEY` | SendGrid API key for email notifications |
| `ECOCASH_API_KEY` | EcoCash mobile money API key |
| `ONEMONEY_API_KEY` | OneMoney API key |
| `INNBUCKS_API_KEY` | InnBucks API key |
| `TELECASH_API_KEY` | Telecash API key |

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build

```bash
npm run build
npm run preview   # preview production build locally
```

## API Endpoints

All endpoints are Vercel serverless functions under `/api/`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-payment-intent` | Create a Stripe payment intent |
| POST | `/api/confirm-payment` | Confirm a Stripe payment |
| POST | `/api/create-refund` | Process a Stripe refund |
| POST | `/api/webhook` | Stripe webhook handler |
| POST | `/api/mobile-money-payment` | Initiate mobile money payment |
| POST | `/api/mobile-money-verify` | Verify mobile money payment status |
| POST | `/api/send-email` | Send transactional email notifications |

## Project Structure

```
MAKEFARMHUB/
├── api/                    # Vercel serverless functions
├── public/                 # Static assets, manifest, service worker, icons
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Analytics/      # Chart components (Bar, Line, Donut, StatCard)
│   │   ├── Chat/           # Live chat widget
│   │   ├── Language/       # Language switcher
│   │   ├── Layout/         # Navbar, Footer, DashboardLayout
│   │   ├── Marketplace/    # Product cards, quick view, filters
│   │   ├── Mobile/         # Bottom nav, pull-to-refresh, swipeable cards
│   │   ├── Payment/        # Stripe + Mobile Money payment forms
│   │   ├── PWA/            # Install prompt, offline indicator
│   │   ├── Search/         # Advanced filters
│   │   └── UI/             # Toast, Modal, Skeleton, ErrorBoundary
│   ├── context/            # React contexts (Auth, Theme, Language, AppData)
│   ├── data/               # Mock data for demo
│   ├── hooks/              # Custom hooks (realtime, scroll, safe state)
│   ├── locales/            # Translation strings (EN, SN, ND)
│   ├── pages/              # Route pages (Dashboard, Marketplace, Admin, etc.)
│   ├── services/           # API services (email, realtime, payments)
│   ├── styles/             # Global CSS (variables, dark mode, animations)
│   └── types/              # TypeScript type definitions
├── e2e/                    # Playwright end-to-end tests
├── .env.example            # Environment variable template
├── package.json
└── vite.config.ts          # Vite build configuration
```

## Demo Accounts

The app includes demo authentication. Use any of these roles to explore:

| Role | Features |
|------|----------|
| Farmer | Dashboard, create listings, manage orders, wallet |
| Buyer | Browse marketplace, place orders, track deliveries |
| Transporter | Manage vehicles, accept bookings, track routes |
| Admin | Full analytics, user management, disputes, settings |

## Deployment

The app auto-deploys to Vercel on push to `main`. For manual deployment:

```bash
npx vercel --prod
```

## License

UNLICENSED — All rights reserved.
