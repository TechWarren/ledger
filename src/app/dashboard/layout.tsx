'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: '💳' },
  { href: '/dashboard/budgets', label: 'Budgets', icon: '🎯' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc' }}>

      {/* SIDEBAR */}
      <aside style={{ width: '220px', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', background: '#13161e', borderRight: '1px solid #1f2433', display: 'flex', flexDirection: 'column', padding: '28px 16px' }}>

        <Link href="/" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#c8a96e', textDecoration: 'none', paddingLeft: '8px', marginBottom: '36px', display: 'block' }}>
          Ledger
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px',
                  fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                  background: active ? 'rgba(200,169,110,0.12)' : 'transparent',
                  color: active ? '#c8a96e' : '#6b7280',
                  transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ borderTop: '1px solid #1f2433', paddingTop: '16px' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '10px 12px', background: 'none', border: '1px solid #1f2433', borderRadius: '10px', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
          >
            Sign Out
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '36px 40px', minHeight: '100vh' }}>
        {children}
      </main>

    </div>
  )
}
