'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  market_cap: number
  total_volume: number
  market_cap_rank: number
  sparkline_in_7d: {
    price: number[]
  }
}

interface GlobalData {
  total_market_cap: { usd: number }
  total_volume: { usd: number }
  market_cap_percentage: { btc: number; eth: number }
}

const formatNumber = (num: number) => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  return `$${num.toLocaleString()}`
}

const formatPrice = (price: number) => {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(8)}`
}

// Memoized table row component to prevent unnecessary re-renders
const CoinRow = memo(({ coin }: { coin: Coin }) => (
  <tr className="hover:bg-primary-700/30 transition cursor-pointer" onClick={() => window.location.href = `/coin/${coin.id}`}>
    <td className="px-6 py-4 text-gray-400">{coin.market_cap_rank}</td>
    <td className="px-6 py-4">
      <div className="flex items-center space-x-3">
        <img src={coin.image} alt={coin.name} className="w-8 h-8" loading="lazy" />
        <div>
          <div className="text-white font-medium">{coin.name}</div>
          <div className="text-gray-400 text-sm">{coin.symbol.toUpperCase()}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-right text-white font-medium">
      {formatPrice(coin.current_price)}
    </td>
    <td className={`px-6 py-4 text-right font-medium ${
      coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
    }`}>
      {coin.price_change_percentage_24h >= 0 ? '+' : ''}
      {coin.price_change_percentage_24h?.toFixed(2)}%
    </td>
    <td className={`px-6 py-4 text-right font-medium ${
      coin.price_change_percentage_7d_in_currency >= 0 ? 'text-green-400' : 'text-red-400'
    }`}>
      {coin.price_change_percentage_7d_in_currency >= 0 ? '+' : ''}
      {coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
    </td>
    <td className="px-6 py-4 text-right text-gray-300">
      {formatNumber(coin.market_cap)}
    </td>
    <td className="px-6 py-4 text-right text-gray-300">
      {formatNumber(coin.total_volume)}
    </td>
  </tr>
))

CoinRow.displayName = 'CoinRow'

export default function MarketPage() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [globalData, setGlobalData] = useState<GlobalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [wsConnected, setWsConnected] = useState(false)
  const [retryTrigger, setRetryTrigger] = useState(0)

  useEffect(() => {
    let isMounted = true
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const fetchData = async () => {
      if (!isMounted) return
      
      try {
        setError(null)
        setLoading(true)
        
        // Use Next.js API route to avoid CORS issues
        const coinsRes = await fetch('/api/crypto/markets', {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
          },
        })
        
        if (!coinsRes.ok) {
          const errorData = await coinsRes.json().catch(() => ({}))
          if (coinsRes.status === 429 || coinsRes.status === 401) {
            throw new Error('API rate limit exceeded. Please wait 60 seconds and try again.')
          }
          throw new Error(errorData.error || `API error (Status: ${coinsRes.status}). Please try again.`)
        }
        
        const coinsData = await coinsRes.json()
        
        if (!Array.isArray(coinsData) || coinsData.length === 0) {
          throw new Error('No market data available')
        }
        
        if (isMounted) {
          setCoins(coinsData)
          setLoading(false)
        }
        
        // Fetch global data
        try {
          const globalRes = await fetch('/api/crypto/global', {
            headers: { 'Accept': 'application/json' },
          })
          
          if (globalRes.ok) {
            const globalDataRes = await globalRes.json()
            if (isMounted && globalDataRes?.data) {
              setGlobalData(globalDataRes.data)
            }
          }
        } catch (globalError) {
          console.warn('Could not fetch global data:', globalError)
        }
        
        // Start WebSocket after initial data load
        if (isMounted && coinsData.length > 0) {
          connectWebSocket(coinsData)
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error)
        if (isMounted) {
          setError(error.message || 'Failed to fetch cryptocurrency data. Please refresh the page.')
          setLoading(false)
        }
      }
    }

    const connectWebSocket = (initialCoins: Coin[]) => {
      if (!isMounted || ws) return

      // Batch updates to prevent lag
      let updateQueue: { [key: string]: { price: number; change: number } } = {}
      let updateTimer: NodeJS.Timeout | null = null

      const flushUpdates = () => {
        if (Object.keys(updateQueue).length === 0) return
        
        const updates = { ...updateQueue }
        updateQueue = {}
        
        setCoins(prevCoins => 
          prevCoins.map(coin => {
            const update = updates[coin.symbol.toLowerCase()]
            if (update) {
              return {
                ...coin,
                current_price: update.price,
                price_change_percentage_24h: update.change
              }
            }
            return coin
          })
        )
      }

      // Create WebSocket streams for top 15 coins only
      // Filter to only include coins with valid Binance USDT trading pairs
      const validSymbols = ['btc', 'eth', 'bnb', 'xrp', 'sol', 'doge', 'ada', 'trx', 'link', 'dot', 'matic', 'ltc', 'bch', 'avax', 'atom', 'etc', 'uni', 'xlm', 'vet', 'fil']
      
      const symbols = initialCoins
        .filter(coin => validSymbols.includes(coin.symbol.toLowerCase()))
        .slice(0, 15) // Only top 15 for optimal performance
        .map(coin => `${coin.symbol.toLowerCase()}usdt@ticker`)
        .join('/')

      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${symbols}`
      
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        if (isMounted) setWsConnected(true)
      }

      ws.onmessage = (event) => {
        if (!isMounted) return
        
        try {
          const data = JSON.parse(event.data)
          if (data.data) {
            const ticker = data.data
            const symbol = ticker.s.replace('USDT', '').toLowerCase()
            const price = parseFloat(ticker.c)
            const priceChange24h = parseFloat(ticker.P)

            // Add to queue instead of immediate update
            updateQueue[symbol] = { price, change: priceChange24h }

            // Batch updates every 2000ms (2 seconds) for smoother performance
            if (!updateTimer) {
              updateTimer = setTimeout(() => {
                flushUpdates()
                updateTimer = null
              }, 2000)
            }
          }
        } catch (err) {
          console.error('WebSocket message error:', err)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        if (isMounted) setWsConnected(false)
        if (updateTimer) clearTimeout(updateTimer)
        // Attempt to reconnect after 5 seconds
        if (isMounted) {
          reconnectTimeout = setTimeout(() => {
            if (isMounted) {
              console.log('Reconnecting WebSocket...')
              connectWebSocket(initialCoins)
            }
          }, 5000)
        }
      }
    }

    fetchData()

    // Cleanup function
    return () => {
      isMounted = false
      if (ws) {
        ws.close()
        ws = null
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [retryTrigger])

  const filteredCoins = useMemo(() => 
    coins.filter(coin => 
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ), [coins, searchTerm]
  )

  const topGainers = useMemo(() => 
    [...coins].sort((a, b) => 
      (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    ).slice(0, 5), [coins]
  )

  return (
    <div className="min-h-screen relative z-10">
      {/* Navigation */}
      <nav className="bg-primary-800/50 backdrop-blur-lg border-b border-primary-600/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10" />
                <span className="text-white font-bold text-xl">CryptoHub</span>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/market" className="text-blue-400 font-medium">Market</Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <button className="text-gray-300 hover:text-white transition px-4 py-2">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Indicator */}
        {wsConnected && (
          <div className="mb-4 flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 font-medium">Live prices updating</span>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <div className="font-medium mb-1">Unable to Load Market Data</div>
                <div className="text-sm mb-2">{error}</div>
                {error.includes('rate limit') && (
                  <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2 mb-3">
                    <div className="font-medium mb-1">💡 CoinGecko API Rate Limit Tips:</div>
                    <ul className="list-disc list-inside space-y-1 text-yellow-300">
                      <li>Wait at least 60 seconds before refreshing</li>
                      <li>Avoid frequent page navigation</li>
                      <li>The page auto-retries with delays</li>
                      <li>Free API has 10-50 calls/minute limit</li>
                    </ul>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setError(null)
                      setLoading(true)
                      setRetryTrigger(prev => prev + 1)
                    }}
                    className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded transition font-medium"
                  >
                    Try Again (Auto-retry)
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-sm bg-gray-500/20 hover:bg-gray-500/30 px-4 py-2 rounded transition font-medium"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-600 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : globalData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4">
              <div className="text-gray-400 text-sm mb-1">Market Cap</div>
              <div className="text-white text-xl font-bold">
                {formatNumber(globalData.total_market_cap.usd)}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-gray-400 text-sm mb-1">24h Volume</div>
              <div className="text-white text-xl font-bold">
                {formatNumber(globalData.total_volume.usd)}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-gray-400 text-sm mb-1">BTC Dominance</div>
              <div className="text-white text-xl font-bold">
                {globalData.market_cap_percentage.btc.toFixed(1)}%
              </div>
            </div>
            <div className="card p-4">
              <div className="text-gray-400 text-sm mb-1">ETH Dominance</div>
              <div className="text-white text-xl font-bold">
                {globalData.market_cap_percentage.eth.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Top Gainers */}
        {loading ? (
          <div className="mb-8">
            <div className="h-8 bg-gray-700 rounded w-56 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-gray-600 rounded w-24 mb-1"></div>
                  <div className="h-4 bg-green-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : topGainers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-4">🔥 Top Gainers (24h)</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topGainers.map(coin => (
                <div 
                  key={coin.id} 
                  className="card p-4 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.location.href = `/coin/${coin.id}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <img src={coin.image} alt={coin.name} className="w-6 h-6" loading="lazy" />
                    <span className="text-white font-medium">{coin.symbol.toUpperCase()}</span>
                  </div>
                  <div className="text-white text-lg font-bold mb-1">
                    {formatPrice(coin.current_price)}
                  </div>
                  <div className="text-green-400 text-sm font-medium">
                    +{coin.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search cryptocurrency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md input-field"
          />
        </div>

        {/* Cryptocurrency Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-700/50 border-b border-primary-600/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">#</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">24h %</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">7d %</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Market Cap</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-600/30">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative w-12 h-12 mb-4">
                          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/30 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                        <div className="text-gray-400 animate-pulse mb-1">Loading market data...</div>
                        <div className="text-gray-500 text-xs">Fetching from server...</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCoins.map((coin) => (
                    <CoinRow key={coin.id} coin={coin} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
