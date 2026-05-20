export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Settings</h2>
      <div className="max-w-lg space-y-4">

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Bot Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Trading Bot</p>
              <p className="text-xs text-gray-500">Aktif saat market US buka (21:30 - 04:00 WIB)</p>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-white rounded-full ml-auto"/>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Risk Management</h3>
          {[
            { label: 'Stop Loss', value: '3%', desc: 'Jual otomatis kalau rugi 3%' },
            { label: 'Take Profit', value: '8%', desc: 'Jual otomatis kalau untung 8%' },
            { label: 'Max per Trade', value: '$50', desc: 'Maksimal modal per 1 order' },
          ].map(({ label, value, desc }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg font-mono">{value}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Watchlist</h3>
          <div className="flex flex-wrap gap-2">
            {['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'META'].map(s => (
              <span key={s} className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-2">Mode</h3>
          <div className="flex gap-3">
            <button className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-semibold">
              Paper Trading ✓
            </button>
            <button className="flex-1 py-2 bg-gray-800 text-gray-500 rounded-lg text-sm" disabled>
              Live Trading
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">Live trading aktif setelah modal cukup & bot terbukti profit</p>
        </div>

      </div>
    </div>
  )
}
