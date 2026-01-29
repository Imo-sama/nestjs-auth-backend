# CryptoHub - Next.js Cryptocurrency Tracker

A modern cryptocurrency tracking application built with Next.js 15, featuring real-time price updates, interactive charts, and a crypto converter.

## 🚀 Features

- ✅ **Real-time Price Updates** - Live cryptocurrency prices via Binance WebSocket
- ✅ **Market Overview** - Top 50 cryptocurrencies by market cap
- ✅ **Interactive Price Charts** - Historical price data with Chart.js
- ✅ **Crypto Converter** - Convert between cryptocurrencies and USD
- ✅ **Detailed Coin Pages** - Comprehensive coin information and statistics
- ✅ **Historical Price Data** - 24h range, all-time high/low, price changes
- ✅ **Market Statistics** - Global market cap, volume, BTC/ETH dominance
- ✅ **Top Gainers** - Track the best performing coins
- ✅ **Search Functionality** - Search for any cryptocurrency
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Modern UI** - Glassmorphism design with smooth animations

---

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)

---

## 🛠️ Installation

### Step 1: Open Terminal

In Cursor: Press `` Ctrl+` `` (backtick) to open terminal

### Step 2: Navigate to frontend folder

```powershell
cd "C:\Users\allen\Documents\login and signup\frontend-nextjs"
```

### Step 3: Install dependencies

```powershell
npm install
```

This will install all required packages including:
- Next.js 15
- React 18
- Tailwind CSS
- Chart.js
- react-chartjs-2

---

## ▶️ How to Start the App

### Open Terminal in Cursor (`` Ctrl+` ``)

```powershell
cd "C:\Users\allen\Documents\login and signup\frontend-nextjs"
npm run dev
```

**That's it!** App will start at:
- **Frontend:** http://localhost:3001
- **API Routes:** http://localhost:3001/api/*

Keep the terminal window open while using the app!

### 🌐 Access the App

Open your browser and navigate to:
```
http://localhost:3001
```

You'll be automatically redirected to the market page.

---

## 🛑 How to Stop the Server

In the terminal where the server is running, press: **`Ctrl + C`**

Or close the terminal window.

---

## 📱 Pages & Features

### 🏠 Market Page (`/market`)

The main homepage displaying:

#### Market Statistics
- **Global Market Cap** - Total cryptocurrency market value
- **24h Volume** - Total trading volume
- **BTC Dominance** - Bitcoin's market share percentage
- **ETH Dominance** - Ethereum's market share percentage

#### Top Gainers (24h)
- Displays top 5 best performing cryptocurrencies
- Shows current price and 24h percentage change
- Click to view detailed coin information

#### Live Price Table
- **Real-time updates** via Binance WebSocket
- Top 50 cryptocurrencies by market cap
- Columns: Rank, Name, Price, 24h %, 7d %, Market Cap, Volume
- **Search functionality** to filter coins
- Click any coin to view details

#### Features:
- 🟢 **Live indicator** shows WebSocket connection status
- **Auto-reconnect** if WebSocket disconnects
- **Updates every 2 seconds** for smooth performance
- **Lazy loading** for optimized image loading

---

### 💰 Coin Detail Page (`/coin/[id]`)

Detailed information for individual cryptocurrencies:

#### Header Section
- Coin logo and name
- Current price (large display)
- 24h price change with color coding (green/red)

#### Price Change Summary
- **24h, 7d, 30d, 1y** percentage changes
- Color-coded (green for gains, red for losses)

#### Interactive Price Chart
- **Time ranges:** 24h, 7d, 1m, 3m, 1y, max
- **Chart.js powered** smooth line chart
- **Hover tooltips** with exact prices
- **Auto-color** based on price trend (green/red)
- **Cached data** to reduce API calls

#### Crypto Converter
- Convert the current coin to USD or other cryptocurrencies
- Real-time conversion with live exchange rates
- Enter any amount to convert
- Shows current exchange rate
- Top 20 cryptocurrencies available for conversion

#### Historical Price Data
Four cards displaying:
1. **24 Hour Range**
   - Low and high prices
   - 24h change percentage

2. **All-Time High (ATH)**
   - Highest price ever reached
   - Date of ATH
   - Percentage change from ATH

3. **All-Time Low (ATL)**
   - Lowest price ever recorded
   - Date of ATL
   - Percentage gain from ATL

4. **Price Changes**
   - 7 days, 30 days, 1 year changes
   - Color-coded performance indicators

#### Market Statistics Sidebar
- **24h Range** with visual progress bar
- **Market Cap** - Total market value
- **Fully Diluted Valuation** - Maximum theoretical value
- **24h Trading Volume**
- **Circulating Supply**
- **Total Supply**
- **Max Supply**

#### About & Links
- Detailed coin description
- Official website
- Twitter profile
- Reddit community
- Blockchain explorers

---

## 🔌 API Routes (Server-Side Proxies)

To avoid CORS issues and handle rate limits, all CoinGecko API calls are proxied through Next.js API routes:

### 1. Market Data
- **Route:** `GET /api/crypto/markets`
- **Source:** CoinGecko `/coins/markets`
- **Cache:** 60 seconds
- **Returns:** Top 50 cryptocurrencies with prices

### 2. Global Stats
- **Route:** `GET /api/crypto/global`
- **Source:** CoinGecko `/global`
- **Cache:** 60 seconds
- **Returns:** Global market statistics

### 3. Coin Details
- **Route:** `GET /api/crypto/coin/[id]`
- **Source:** CoinGecko `/coins/[id]`
- **Cache:** 60 seconds
- **Returns:** Detailed coin information

### 4. Chart Data
- **Route:** `GET /api/crypto/chart/[id]?days=7&interval=daily`
- **Source:** CoinGecko `/coins/[id]/market_chart`
- **Cache:** 5 minutes (300 seconds)
- **Returns:** Historical price data

**Benefits:**
- ✅ No CORS errors
- ✅ Built-in caching
- ✅ Rate limit management
- ✅ Server-side delays to prevent API abuse

---

## 🎨 Design & Styling

### Theme
- **Dark mode** with deep blue/purple gradient background
- **Glassmorphism** cards with blur effects
- **Smooth animations** and transitions
- **Modern color scheme:**
  - Primary: Blue (#3B82F6)
  - Secondary: Purple (#A855F7)
  - Success: Green (#4ADE80)
  - Danger: Red (#F87171)

### Components
- **Cards** with backdrop blur and semi-transparent backgrounds
- **Buttons** with gradient backgrounds and hover effects
- **Tables** with alternating row colors
- **Charts** with responsive sizing
- **Loading animations** with dual spinners
- **Error states** with helpful messages

---

## 🌐 Real-Time Features

### Binance WebSocket Integration

The market page uses Binance WebSocket for real-time price updates:

- **Connection:** `wss://stream.binance.com:9443/stream`
- **Streams:** Top 15 coins by market cap
- **Update frequency:** Every 2 seconds (batched)
- **Auto-reconnect:** Reconnects after 5 seconds if disconnected
- **Status indicator:** Green dot shows live connection

**Performance optimizations:**
- Batched updates to prevent UI lag
- Limited to 15 most important coins
- Memoized components to reduce re-renders
- Lazy loading for images

---

## 📊 Data Sources

### CoinGecko API (Free Tier)
- **Market data** - Coin prices, market cap, volume
- **Global statistics** - Total market data
- **Coin details** - Comprehensive coin information
- **Historical charts** - Price history data

**Rate Limits:**
- Free tier: ~10-50 calls per minute
- Caching implemented to reduce API calls
- Server-side delays to prevent rate limiting

### Binance WebSocket
- **Real-time prices** for live updates
- **24h price changes** in real-time
- **No rate limits** for WebSocket connections
- **Reliable and fast** updates

---

## 🐛 Troubleshooting

### Port 3001 already in use

```powershell
# Stop the process using port 3001:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### API Rate Limit Errors

**Problem:** "API rate limit exceeded" error messages

**Solutions:**
1. **Wait 60 seconds** before refreshing the page
2. Avoid rapidly switching between pages
3. Don't refresh too frequently
4. The app automatically retries with delays

**Why it happens:**
- CoinGecko's free API has strict rate limits (10-50 calls/minute)
- Opening multiple coin pages quickly can exceed limits
- The app has built-in caching and delays to minimize this

### Charts not loading

**Problem:** Chart shows "Loading..." forever

**Solutions:**
1. Wait for the automatic retry (happens after delays)
2. Click "Try Loading Chart Again" if shown
3. Check browser console for specific errors
4. Verify API routes are working: `http://localhost:3001/api/crypto/markets`

### WebSocket not connecting

**Problem:** No green "Live prices updating" indicator

**Solutions:**
1. Check your internet connection
2. The app auto-reconnects after 5 seconds
3. Refresh the page
4. Check browser console for WebSocket errors

### Development server not starting

```powershell
# 1. Delete .next folder and restart
Remove-Item -Recurse -Force .next
npm run dev

# 2. Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

---

## 📁 Project Structure

```
frontend-nextjs/
├── app/
│   ├── api/                    # API routes (server-side)
│   │   └── crypto/
│   │       ├── markets/        # Market data proxy
│   │       ├── global/         # Global stats proxy
│   │       ├── coin/[id]/      # Coin details proxy
│   │       └── chart/[id]/     # Chart data proxy
│   ├── coin/
│   │   └── [id]/
│   │       ├── page.tsx        # Coin detail page
│   │       └── loading.tsx     # Loading UI
│   ├── market/
│   │   ├── page.tsx            # Market homepage
│   │   └── loading.tsx         # Loading UI
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── signup/
│   │   └── page.tsx            # Signup page
│   ├── globals.css             # Global styles & animations
│   ├── layout.tsx              # Root layout
│   ├── loading.tsx             # Global loading
│   └── page.tsx                # Root redirect
├── public/
│   └── logo.png                # App logo
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── README.md                   # This file
```

---

## 🔧 Configuration

### Next.js Config (`next.config.js`)

```javascript
module.exports = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['axios']
  }
}
```

### Tailwind Config

Custom colors defined:
- `primary-900` to `primary-600` - Deep blue shades
- Custom gradients and animations
- Glassmorphism utilities

---

## 📚 Technologies Used

### Core
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 3** - Utility-first CSS

### Data & Charts
- **Chart.js** - Charting library
- **react-chartjs-2** - React wrapper for Chart.js
- **WebSocket API** - Real-time data

### APIs
- **CoinGecko API** - Cryptocurrency data
- **Binance WebSocket** - Live price updates

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## 🎯 Features Summary

| Feature | Status | Page |
|---------|--------|------|
| Real-time prices | ✅ | Market |
| Market statistics | ✅ | Market |
| Top gainers | ✅ | Market |
| Crypto search | ✅ | Market |
| Price charts | ✅ | Coin Detail |
| Crypto converter | ✅ | Coin Detail |
| Historical data | ✅ | Coin Detail |
| All-time high/low | ✅ | Coin Detail |
| Coin description | ✅ | Coin Detail |
| Social links | ✅ | Coin Detail |
| WebSocket live updates | ✅ | Market |
| Server-side caching | ✅ | All pages |
| CORS proxy | ✅ | API routes |
| Rate limit handling | ✅ | All pages |
| Loading animations | ✅ | All pages |
| Error handling | ✅ | All pages |
| Responsive design | ✅ | All pages |

---

## 🚀 Performance Optimizations

1. **Server-side API proxies** - Avoid CORS and cache responses
2. **WebSocket batching** - Group updates to reduce renders
3. **Memoization** - `useMemo` and `memo` for expensive computations
4. **Lazy loading** - Images load only when needed
5. **Limited streams** - Only 15 WebSocket connections
6. **Caching** - 60s for data, 5min for charts
7. **Code splitting** - Dynamic imports for heavy components

---

## 💡 Tips & Best Practices

### Using the App
- 🕐 **Wait 60 seconds** between page refreshes to avoid rate limits
- 🔍 Use the **search bar** to quickly find coins
- 📊 **Click time range buttons** on charts to see different periods
- 💱 Use the **converter** to calculate crypto values
- 🟢 Look for the **green live indicator** to confirm real-time updates

### Development
- ⚡ **Use API routes** instead of direct CoinGecko calls
- 📦 **Memoize expensive computations** with `useMemo`
- 🎨 **Follow Tailwind conventions** for consistent styling
- 🔒 **Add error boundaries** for production builds
- 📝 **Keep rate limits in mind** when adding features

---

## 📞 Support

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Verify the server is running (`npm run dev`)
3. Check browser console for errors
4. Wait 60 seconds if you see rate limit errors
5. Try the "Try Again" button on error messages

---

## 🎉 Quick Start

Run this to get started immediately:

```powershell
# Navigate to project
cd "C:\Users\allen\Documents\login and signup\frontend-nextjs"

# Install dependencies (first time only)
npm install

# Start the app
npm run dev

# Open in browser
# http://localhost:3001
```

---

## 📝 License

This project is for educational and personal use.

**Note:** CoinGecko API has rate limits on the free tier. Consider upgrading to their Pro API for production use.

---

## 🔗 Useful Links

- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [Next.js Documentation](https://nextjs.org/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Binance WebSocket Docs](https://binance-docs.github.io/apidocs/spot/en/)

---

**Built with ❤️ using Next.js 15 and React 18**
