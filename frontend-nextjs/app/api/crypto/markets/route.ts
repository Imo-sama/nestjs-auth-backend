import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // No delay - Next.js cache handles rate limiting automatically
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=7d',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 } // Cache for 30 seconds for faster updates
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
