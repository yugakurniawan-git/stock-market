'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, History, Radio, Settings } from 'lucide-react'

const nav = [
  { href: '/', label: 'Portfolio', icon: LayoutDashboard },
  { href: '/signals', label: 'Sinyal', icon: Radio },
  { href: '/chart', label: 'Grafik', icon: TrendingUp },
  { href: '/trades', label: 'Riwayat', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-gray-900 border-r border-gray-800 flex flex-col p-4">
      <div className="mb-8 mt-2">
        <h1 className="text-lg font-bold text-white">📈 Market</h1>
        <p className="text-xs text-gray-500">yugakurniawan.com</p>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
              ${path === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-gray-600 px-3">
        Paper Trading Mode
      </div>
    </aside>
  )
}
