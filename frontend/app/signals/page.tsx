import { api, Signal } from '@/lib/api'

const signalColor = {
  BUY: 'bg-green-500/20 text-green-400 border-green-500/30',
  SELL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HOLD: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const signalEmoji = { BUY: '🟢', SELL: '🔴', HOLD: '⚪' }

export default async function SignalsPage() {
  let signals: Signal[] = []

  try {
    signals = await api.signals()
  } catch {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">Tidak bisa terhubung ke backend</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Sinyal Hari Ini</h2>
      <p className="text-gray-500 text-sm mb-6">Berdasarkan MA5, MA20, RSI, dan MACD</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signals.map((s) => (
          <div key={s.symbol} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {s.error ? (
              <div>
                <p className="font-bold text-white">{s.symbol}</p>
                <p className="text-red-400 text-sm mt-1">{s.error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-white text-lg">{s.symbol}</p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${signalColor[s.signal]}`}>
                    {signalEmoji[s.signal]} {s.signal}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-4">${s.price.toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-gray-500 text-xs">MA5</p>
                    <p className="text-white font-medium">{s.ma5 ?? '—'}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-gray-500 text-xs">MA20</p>
                    <p className="text-white font-medium">{s.ma20 ?? '—'}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-gray-500 text-xs">RSI</p>
                    <p className={`font-medium ${s.rsi && s.rsi < 30 ? 'text-green-400' : s.rsi && s.rsi > 70 ? 'text-red-400' : 'text-white'}`}>
                      {s.rsi ?? '—'}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-gray-500 text-xs">MACD</p>
                    <p className={`font-medium ${s.macd && s.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {s.macd ?? '—'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
