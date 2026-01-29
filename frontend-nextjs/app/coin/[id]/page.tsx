'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

interface CoinDetail {
  id: string
  symbol: string
  name: string
  image: { large: string }
  market_data: {
    current_price: { usd: number }
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    price_change_percentage_1y: number
    market_cap: { usd: number }
    fully_diluted_valuation: { usd: number }
    total_volume: { usd: number }
    high_24h: { usd: number }
    low_24h: { usd: number }
    ath: { usd: number }
    ath_change_percentage: { usd: number }
    ath_date: { usd: string }
    atl: { usd: number }
    atl_change_percentage: { usd: number }
    atl_date: { usd: string }
    circulating_supply: number
    total_supply: number
    max_supply: number
  }
  description: { en: string }
  links: {
    homepage: string[]
    blockchain_site: string[]
    official_forum_url: string[]
    subreddit_url: string
    twitter_screen_name: string
  }
}

const formatNumber = (num: number) => {
  if (!num) return 'N/A'
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  return `$${num.toLocaleString()}`
}

const formatPrice = (price: number) => {
  if (!price) return '$0.00'
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(8)}`
}

const formatSupply = (num: number) => {
  if (!num) return 'N/A'
  return num.toLocaleString()
}

export default function CoinDetailPage() {
  const params = useParams()
  const coinId = params.id as string
  
  const [coin, setCoin] = useState<CoinDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'financials'>('about')
  const [chartData, setChartData] = useState<{ labels: string[]; prices: number[] }>({ labels: [], prices: [] })
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '1m' | '3m' | '1y' | 'max'>('7d')
  
  // Converter states
  const [otherCoins, setOtherCoins] = useState<Array<{id: string, symbol: string, name: string, current_price: number}>>([])
  const [toCoin, setToCoin] = useState('usd')
  const [amount, setAmount] = useState('1')
  const [convertedAmount, setConvertedAmount] = useState(0)

  useEffect(() => {
    const fetchCoinDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use Next.js API route to avoid CORS issues
        const response = await fetch(`/api/crypto/coin/${coinId}`, { 
          headers: { 
            'Accept': 'application/json',
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait 60 seconds and refresh the page.')
          }
          if (response.status === 401 || response.status === 403) {
            throw new Error('API access restricted. Please try again later.')
          }
          if (response.status === 404) {
            throw new Error('Coin not found.')
          }
          throw new Error(`Unable to load coin data (Error ${response.status})`)
        }
        
        const data = await response.json()
        
        if (!data || !data.id) {
          throw new Error('Invalid coin data received')
        }
        
        setCoin(data)
        setLoading(false)
      } catch (error: any) {
        console.error('Error fetching coin detail:', error)
        setError(error.message || 'Failed to fetch coin details. Please try again.')
        setLoading(false)
      }
    }

    if (coinId) {
      fetchCoinDetail()
    }
  }, [coinId])

  useEffect(() => {
    const fetchChartData = async () => {
      if (!coinId) return
      
      try {
        setChartLoading(true)
        setChartError(null)
        
        // Map time range to CoinGecko API days parameter
        const daysMap = {
          '24h': 1,
          '7d': 7,
          '1m': 30,
          '3m': 90,
          '1y': 365,
          'max': 'max'
        }
        
        const days = daysMap[timeRange]
        const interval = days === 1 ? 'hourly' : 'daily'
        
        // Use Next.js API route to avoid CORS issues
        const response = await fetch(
          `/api/crypto/chart/${coinId}?days=${days}&interval=${interval}`,
          { 
            headers: { 
              'Accept': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 429) {
            throw new Error('API rate limit exceeded. The chart will be available after waiting 60 seconds.')
          }
          if (response.status === 401 || response.status === 403) {
            throw new Error('API access restricted. Chart temporarily unavailable.')
          }
          throw new Error(`Unable to load chart (Error ${response.status})`)
        }
        
        const data = await response.json()
        
        if (!data || !data.prices || data.prices.length === 0) {
          throw new Error('No chart data available')
        }
        
        // Format data for chart
        const labels = data.prices.map((price: [number, number]) => {
          const date = new Date(price[0])
          if (days === 1) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        })
        
        const prices = data.prices.map((price: [number, number]) => price[1])
        
        setChartData({ labels, prices })
        setChartError(null)
        setChartLoading(false)
      } catch (error: any) {
        console.error('Error fetching chart data:', error)
        setChartError(error.message || 'Failed to load chart')
        setChartLoading(false)
      }
    }

    fetchChartData()
  }, [coinId, timeRange])

  // Fetch other coins for converter
  useEffect(() => {
    const fetchOtherCoins = async () => {
      try {
        // Use Next.js API route to avoid CORS issues
        const response = await fetch('/api/crypto/markets', {
          headers: { 'Accept': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          setOtherCoins(data.slice(0, 20))
        }
      } catch (error) {
        console.error('Error fetching other coins:', error)
      }
    }
    if (coinId) {
      fetchOtherCoins()
    }
  }, [coinId])

  // Convert currencies
  useEffect(() => {
    if (!coin) return
    
    const currentPrice = coin.market_data.current_price.usd
    const amountNum = parseFloat(amount) || 0
    
    if (toCoin === 'usd') {
      setConvertedAmount(currentPrice * amountNum)
    } else {
      const toCoinData = otherCoins.find(c => c.id === toCoin)
      if (toCoinData) {
        const usdValue = currentPrice * amountNum
        setConvertedAmount(usdValue / toCoinData.current_price)
      }
    }
  }, [coin, toCoin, amount, otherCoins])

  if (loading) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center">
        <div className="flex flex-col items-center max-w-md px-4">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
          </div>
          <div className="text-white text-xl font-medium animate-pulse mb-2">Loading coin data...</div>
          <div className="text-gray-400 text-sm text-center">Fetching from server...</div>
        </div>
      </div>
    )
  }

  if (error || !coin) {
    return (
      <div className="min-h-screen relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <div className="font-medium mb-1">Unable to Load Coin Details</div>
                <div className="text-sm mb-3">{error || 'Coin not found'}</div>
                {error && error.includes('rate limit') && (
                  <div className="text-xs text-yellow-400 mb-3">
                    💡 Tip: CoinGecko free API has limits. Wait 60 seconds before retrying.
                  </div>
                )}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded transition font-medium"
                  >
                    Retry
                  </button>
                  <Link href="/market">
                    <button className="text-sm bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded transition font-medium">
                      Back to Market
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-400">
          <Link href="/market" className="hover:text-white transition">Market</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{coin.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <img src={coin.image.large} alt={coin.name} className="w-16 h-16" />
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-white text-3xl font-bold">{coin.name}</h1>
              <span className="text-gray-400 text-xl">{coin.symbol.toUpperCase()}</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-white text-2xl font-bold">
                {formatPrice(coin.market_data.current_price.usd)}
              </div>
              <div className={`px-3 py-1 rounded ${
                coin.market_data.price_change_percentage_24h >= 0 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {coin.market_data.price_change_percentage_24h >= 0 ? '+' : ''}
                {coin.market_data.price_change_percentage_24h?.toFixed(1)}% (24h)
              </div>
            </div>
          </div>
        </div>

        {/* Price Changes */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-gray-400 text-sm mb-1">24h</div>
              <div className={`font-medium ${
                coin.market_data.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {coin.market_data.price_change_percentage_24h >= 0 ? '+' : ''}
                {coin.market_data.price_change_percentage_24h?.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">7d</div>
              <div className={`font-medium ${
                coin.market_data.price_change_percentage_7d >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {coin.market_data.price_change_percentage_7d >= 0 ? '+' : ''}
                {coin.market_data.price_change_percentage_7d?.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">30d</div>
              <div className={`font-medium ${
                coin.market_data.price_change_percentage_30d >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {coin.market_data.price_change_percentage_30d >= 0 ? '+' : ''}
                {coin.market_data.price_change_percentage_30d?.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">1y</div>
              <div className={`font-medium ${
                coin.market_data.price_change_percentage_1y >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {coin.market_data.price_change_percentage_1y >= 0 ? '+' : ''}
                {coin.market_data.price_change_percentage_1y?.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-bold">Price Chart</h2>
            <div className="flex space-x-2">
              {(['24h', '7d', '1m', '3m', '1y', 'max'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    timeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'bg-primary-700/50 text-gray-400 hover:text-white hover:bg-primary-700'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {chartLoading ? (
            <div className="h-64 flex flex-col items-center justify-center px-6">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <div className="text-gray-400 animate-pulse mb-2">Loading chart data...</div>
              <div className="text-gray-500 text-xs text-center">Fetching from server...</div>
            </div>
          ) : chartError ? (
            <div className="h-64 flex flex-col items-center justify-center px-6">
              <div className="text-yellow-400 mb-3 text-center text-lg">⚠️ {chartError}</div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-4 max-w-md">
                <div className="text-yellow-400 text-sm font-medium mb-2">💡 Rate Limit Tips:</div>
                <ul className="text-yellow-300 text-xs space-y-1 list-disc list-inside">
                  <li>Wait at least 60 seconds before retrying</li>
                  <li>Avoid rapidly switching time ranges</li>
                  <li>The chart auto-retries with increasing delays</li>
                  <li>All other coin data is still available below</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setChartError(null)
                  setChartLoading(true)
                  setTimeRange(timeRange === '7d' ? '24h' : '7d')
                  setTimeout(() => setTimeRange(timeRange), 100)
                }}
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition text-sm font-medium shadow-lg"
              >
                Try Loading Chart Again
              </button>
            </div>
          ) : chartData.prices.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No chart data available
            </div>
          ) : (
            <div className="h-64 md:h-80">
              <Line
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Price (USD)',
                      data: chartData.prices,
                      borderColor: coin.market_data.price_change_percentage_24h >= 0 ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)',
                      backgroundColor: coin.market_data.price_change_percentage_24h >= 0 
                        ? 'rgba(74, 222, 128, 0.1)' 
                        : 'rgba(248, 113, 113, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                      pointHoverRadius: 6,
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: 'rgba(15, 31, 58, 0.9)',
                      titleColor: 'rgb(156, 163, 175)',
                      bodyColor: 'rgb(255, 255, 255)',
                      borderColor: 'rgba(51, 150, 255, 0.2)',
                      borderWidth: 1,
                      padding: 12,
                      displayColors: false,
                      callbacks: {
                        label: function(context) {
                          return formatPrice(context.parsed.y)
                        }
                      }
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false,
                      },
                      ticks: {
                        color: 'rgb(156, 163, 175)',
                        maxTicksLimit: 8,
                      },
                    },
                    y: {
                      grid: {
                        color: 'rgba(75, 85, 99, 0.2)',
                        drawBorder: false,
                      },
                      ticks: {
                        color: 'rgb(156, 163, 175)',
                        callback: function(value) {
                          if (typeof value === 'number') {
                            if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
                            return `$${value.toFixed(0)}`
                          }
                          return value
                        },
                      },
                    },
                  },
                  interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false,
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Cryptocurrency Converter */}
        <div className="card p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <h2 className="text-white text-2xl font-bold">💱 {coin.name} Converter</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* From Currency (Current Coin) */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">From</label>
              <div className="w-full bg-primary-700/50 border border-primary-600/30 text-white rounded-lg px-4 py-3 flex items-center space-x-3">
                <img src={coin.image.large} alt={coin.name} className="w-6 h-6" />
                <span className="font-medium">{coin.symbol.toUpperCase()} - {coin.name}</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-primary-700/50 border border-primary-600/30 text-white rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Arrow Icon */}
            <div className="flex items-end justify-center pb-3">
              <div className="text-blue-400 p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* To Currency */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">To</label>
              <select
                value={toCoin}
                onChange={(e) => setToCoin(e.target.value)}
                className="w-full bg-primary-700/50 border border-primary-600/30 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="usd">USD - US Dollar</option>
                {otherCoins.filter(c => c.id !== coinId).slice(0, 20).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.symbol.toUpperCase()} - {c.name}
                  </option>
                ))}
              </select>
              <div className="w-full bg-primary-800/50 border border-primary-600/30 text-white rounded-lg px-4 py-3 mt-2 font-medium">
                {toCoin === 'usd' 
                  ? formatPrice(convertedAmount)
                  : convertedAmount.toFixed(8)
                }
              </div>
            </div>
          </div>
          
          {/* Conversion Rate */}
          <div className="mt-4 pt-4 border-t border-primary-600/30 text-center text-gray-400 text-sm">
            {toCoin === 'usd' ? (
              `1 ${coin.symbol.toUpperCase()} = ${formatPrice(coin.market_data.current_price.usd)}`
            ) : (
              (() => {
                const toCoinData = otherCoins.find(c => c.id === toCoin)
                if (toCoinData) {
                  const rate = coin.market_data.current_price.usd / toCoinData.current_price
                  return `1 ${coin.symbol.toUpperCase()} = ${rate.toFixed(8)} ${toCoinData.symbol.toUpperCase()}`
                }
                return ''
              })()
            )}
          </div>
        </div>

        {/* Historical Price Data */}
        <div className="card p-6 mb-8">
          <h2 className="text-white text-2xl font-bold mb-6">📊 Historical Price Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 24h Price Range */}
            <div className="border border-primary-600/30 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-3">24 Hour Range</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Low:</span>
                  <span className="text-white font-medium">{formatPrice(coin.market_data.low_24h.usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">High:</span>
                  <span className="text-white font-medium">{formatPrice(coin.market_data.high_24h.usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Change:</span>
                  <span className={coin.market_data.price_change_percentage_24h >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                    {coin.market_data.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.market_data.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* All-Time High */}
            <div className="border border-primary-600/30 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-3">All-Time High</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white font-medium">{formatPrice(coin.market_data.ath.usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white font-medium">{new Date(coin.market_data.ath_date.usd).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Change from ATH:</span>
                  <span className="text-red-400 font-medium">
                    {coin.market_data.ath_change_percentage.usd?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* All-Time Low */}
            <div className="border border-primary-600/30 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-3">All-Time Low</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white font-medium">{formatPrice(coin.market_data.atl.usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white font-medium">{new Date(coin.market_data.atl_date.usd).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Change from ATL:</span>
                  <span className="text-green-400 font-medium">
                    +{coin.market_data.atl_change_percentage.usd?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Price Changes */}
            <div className="border border-primary-600/30 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-3">Price Changes</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">7 Days:</span>
                  <span className={coin.market_data.price_change_percentage_7d >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                    {coin.market_data.price_change_percentage_7d >= 0 ? '+' : ''}
                    {coin.market_data.price_change_percentage_7d?.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">30 Days:</span>
                  <span className={coin.market_data.price_change_percentage_30d >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                    {coin.market_data.price_change_percentage_30d >= 0 ? '+' : ''}
                    {coin.market_data.price_change_percentage_30d?.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">1 Year:</span>
                  <span className={coin.market_data.price_change_percentage_1y >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                    {coin.market_data.price_change_percentage_1y >= 0 ? '+' : ''}
                    {coin.market_data.price_change_percentage_1y?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1">
            <div className="card p-6 mb-6">
              <h2 className="text-white text-lg font-bold mb-4">24h Range</h2>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{formatPrice(coin.market_data.low_24h.usd)}</span>
                <span className="text-gray-400">{formatPrice(coin.market_data.high_24h.usd)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span className="text-white font-medium">{formatNumber(coin.market_data.market_cap.usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fully Diluted Valuation</span>
                <span className="text-white font-medium">{formatNumber(coin.market_data.fully_diluted_valuation.usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h Trading Vol</span>
                <span className="text-white font-medium">{formatNumber(coin.market_data.total_volume.usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Circulating Supply</span>
                <span className="text-white font-medium">{formatSupply(coin.market_data.circulating_supply)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Supply</span>
                <span className="text-white font-medium">{formatSupply(coin.market_data.total_supply)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Supply</span>
                <span className="text-white font-medium">{formatSupply(coin.market_data.max_supply)}</span>
              </div>
            </div>

            <div className="card p-6 mt-6">
              <h3 className="text-white font-bold mb-3">All-Time High</h3>
              <div className="text-white text-xl font-bold mb-1">
                {formatPrice(coin.market_data.ath.usd)}
              </div>
              <div className="text-red-400 text-sm">
                {coin.market_data.ath_change_percentage.usd?.toFixed(1)}%
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {new Date(coin.market_data.ath_date.usd).toLocaleDateString()}
              </div>
              
              <h3 className="text-white font-bold mb-3 mt-6">All-Time Low</h3>
              <div className="text-white text-xl font-bold mb-1">
                {formatPrice(coin.market_data.atl.usd)}
              </div>
              <div className="text-green-400 text-sm">
                +{coin.market_data.atl_change_percentage.usd?.toFixed(1)}%
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {new Date(coin.market_data.atl_date.usd).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Right Column - About */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-primary-600/30">
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'about'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'financials'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Financials
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'about' && (
              <div className="card p-6">
                <h2 className="text-white text-2xl font-bold mb-4">About {coin.name} ({coin.symbol.toUpperCase()})</h2>
                <div 
                  className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: coin.description.en || 'No description available.' }}
                />
                
                {coin.links && (
                  <div className="mt-8 pt-6 border-t border-primary-600/30">
                    <h3 className="text-white font-bold mb-4">Links</h3>
                    <div className="space-y-2">
                      {coin.links.homepage[0] && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Website:</span>
                          <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-400 hover:text-blue-300 transition">
                            {coin.links.homepage[0]}
                          </a>
                        </div>
                      )}
                      {coin.links.twitter_screen_name && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Twitter:</span>
                          <a href={`https://twitter.com/${coin.links.twitter_screen_name}`} 
                             target="_blank" rel="noopener noreferrer"
                             className="text-blue-400 hover:text-blue-300 transition">
                            @{coin.links.twitter_screen_name}
                          </a>
                        </div>
                      )}
                      {coin.links.subreddit_url && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Reddit:</span>
                          <a href={coin.links.subreddit_url} target="_blank" rel="noopener noreferrer"
                             className="text-blue-400 hover:text-blue-300 transition">
                            {coin.links.subreddit_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="card p-6">
                <h2 className="text-white text-2xl font-bold mb-6">Financial Data</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-gray-400 mb-2">Current Price</div>
                    <div className="text-white text-xl font-bold">{formatPrice(coin.market_data.current_price.usd)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-2">Market Cap Rank</div>
                    <div className="text-white text-xl font-bold">#{coin.market_data.market_cap.usd ? '1' : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-2">Market Cap</div>
                    <div className="text-white text-xl font-bold">{formatNumber(coin.market_data.market_cap.usd)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-2">24h Volume</div>
                    <div className="text-white text-xl font-bold">{formatNumber(coin.market_data.total_volume.usd)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
