const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetcher(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  account: () => fetcher('/account'),
  signals: () => fetcher('/signals'),
  trades: (limit = 50) => fetcher(`/trades?limit=${limit}`),
  positions: () => fetcher('/positions'),
  chart: (symbol: string, days = 30) => fetcher(`/chart/${symbol}?days=${days}`),
}

export type Signal = {
  symbol: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  price: number
  ma5: number | null
  ma20: number | null
  rsi: number | null
  macd: number | null
  error?: string
}

export type Trade = {
  id: number
  symbol: string
  side: 'BUY' | 'SELL'
  qty: number
  price: number
  stop_loss: number | null
  take_profit: number | null
  status: string
  created_at: string
}

export type Position = {
  symbol: string
  qty: string
  avg_price: number
  current_price: number
  pnl: number
  pnl_pct: number
}

export type Account = {
  portfolio_value: number
  buying_power: number
  cash: number
  status: string
}
