'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const WATCHLIST = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'META']

export default function ChartPage() {
  const [symbol, setSymbol] = useState('AAPL')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.chart(symbol).then(setData).catch(() => setError('Tidak bisa terhubung ke backend')).finally(() => setLoading(false))
  }, [symbol])

  const closes = data.map(d => d.close).filter(Boolean)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min || 1

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Grafik</h2>
        <div className="flex gap-2">
          {WATCHLIST.map(s => (
            <button key={s} onClick={() => setSymbol(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${symbol === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {loading && <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>}

      {!loading && !error && data.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-yellow-400 inline-block"/>MA5</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-400 inline-block"/>MA20</span>
            <span className="flex items-center gap-1"><span className="text-green-400">▲</span> BUY</span>
            <span className="flex items-center gap-1"><span className="text-red-400">▼</span> SELL</span>
          </div>

          <div className="relative h-64 w-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${data.length * 12} 200`} preserveAspectRatio="none">
              {/* Area */}
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <polygon
                fill="url(#grad)"
                points={[
                  ...data.map((d, i) => `${i * 12 + 6},${200 - ((d.close - min) / range) * 180}`),
                  `${(data.length - 1) * 12 + 6},200`,
                  `6,200`
                ].join(' ')}
              />
              {/* Price line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                points={data.map((d, i) => `${i * 12 + 6},${200 - ((d.close - min) / range) * 180}`).join(' ')}
              />
              {/* MA5 */}
              <polyline
                fill="none"
                stroke="#facc15"
                strokeWidth="1"
                strokeDasharray="3,2"
                points={data.filter(d => d.ma5).map((d, i) => `${i * 12 + 6},${200 - ((d.ma5 - min) / range) * 180}`).join(' ')}
              />
              {/* MA20 */}
              <polyline
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1"
                strokeDasharray="3,2"
                points={data.filter(d => d.ma20).map((d, i) => `${i * 12 + 6},${200 - ((d.ma20 - min) / range) * 180}`).join(' ')}
              />
              {/* BUY/SELL signals */}
              {data.map((d, i) => {
                if (d.signal === 'BUY') return (
                  <text key={i} x={i * 12 + 6} y={200 - ((d.close - min) / range) * 180 + 12}
                    textAnchor="middle" fontSize="8" fill="#4ade80">▲</text>
                )
                if (d.signal === 'SELL') return (
                  <text key={i} x={i * 12 + 6} y={200 - ((d.close - min) / range) * 180 - 4}
                    textAnchor="middle" fontSize="8" fill="#f87171">▼</text>
                )
                return null
              })}
            </svg>
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{data[0]?.date?.toString().slice(0, 10)}</span>
            <span>{data[data.length - 1]?.date?.toString().slice(0, 10)}</span>
          </div>
        </div>
      )}

      {/* RSI Panel */}
      {!loading && !error && data.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mt-4">
          <p className="text-sm text-gray-400 mb-3">RSI (14)</p>
          <div className="relative h-16 w-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${data.length * 12} 60`} preserveAspectRatio="none">
              <line x1="0" y1="18" x2={data.length * 12} y2="18" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
              <line x1="0" y1="42" x2={data.length * 12} y2="42" stroke="#4ade80" strokeWidth="0.5" strokeDasharray="2,2"/>
              <polyline
                fill="none"
                stroke="#a78bfa"
                strokeWidth="1.5"
                points={data.filter(d => d.rsi).map((d, i) => `${i * 12 + 6},${60 - (d.rsi / 100) * 60}`).join(' ')}
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Overbought 70</span>
            <span>Oversold 30</span>
          </div>
        </div>
      )}
    </div>
  )
}
