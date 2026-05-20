import { api, Account, Position } from '@/lib/api'
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'

function StatCard({ label, value, sub, positive }: { label: string, value: string, sub?: string, positive?: boolean }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className={`text-sm mt-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>{sub}</p>}
    </div>
  )
}

export default async function PortfolioPage() {
  let account: Account
  let positions: Position[] = []

  try {
    [account, positions] = await Promise.all([api.account(), api.positions()])
  } catch {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">Tidak bisa terhubung ke backend</p>
          <p className="text-gray-500 text-sm mt-1">Pastikan API server berjalan di VPS</p>
        </div>
      </div>
    )
  }

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Portfolio</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Nilai Portfolio" value={`$${account.portfolio_value.toLocaleString('en', { minimumFractionDigits: 2 })}`} />
        <StatCard label="Buying Power" value={`$${account.buying_power.toLocaleString('en', { minimumFractionDigits: 2 })}`} />
        <StatCard label="Cash" value={`$${account.cash.toLocaleString('en', { minimumFractionDigits: 2 })}`} />
        <StatCard
          label="Unrealized P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
          positive={totalPnl >= 0}
        />
      </div>

      <h3 className="text-lg font-semibold mb-4">Posisi Terbuka</h3>
      {positions.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
          Belum ada posisi terbuka
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400">
                <th className="text-left px-4 py-3">Saham</th>
                <th className="text-right px-4 py-3">Qty</th>
                <th className="text-right px-4 py-3">Avg Beli</th>
                <th className="text-right px-4 py-3">Harga Skrg</th>
                <th className="text-right px-4 py-3">P&L</th>
                <th className="text-right px-4 py-3">%</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.symbol} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-semibold text-white">{p.symbol}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{p.qty}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${p.avg_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${p.current_price.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${p.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.pnl_pct >= 0 ? '+' : ''}{p.pnl_pct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
