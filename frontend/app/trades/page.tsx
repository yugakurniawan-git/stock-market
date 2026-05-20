import { api, Trade } from '@/lib/api'

export default async function TradesPage() {
  let trades: Trade[] = []

  try {
    trades = await api.trades(100)
  } catch {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">Tidak bisa terhubung ke backend</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Riwayat Transaksi</h2>

      {trades.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
          Belum ada transaksi
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400">
                <th className="text-left px-4 py-3">Waktu</th>
                <th className="text-left px-4 py-3">Saham</th>
                <th className="text-left px-4 py-3">Aksi</th>
                <th className="text-right px-4 py-3">Qty</th>
                <th className="text-right px-4 py-3">Harga</th>
                <th className="text-right px-4 py-3">Stop Loss</th>
                <th className="text-right px-4 py-3">Take Profit</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(t.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{t.symbol}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${t.side === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {t.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">{t.qty}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${t.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-red-400">{t.stop_loss ? `$${t.stop_loss.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-right text-green-400">{t.take_profit ? `$${t.take_profit.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${t.status === 'open' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {t.status}
                    </span>
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
