'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'

const navItems = [
  { href: '/dashboard',              label: 'Overview',      icon: '📊' },
  { href: '/dashboard/transactions', label: 'Transactions',  icon: '💳' },
  { href: '/dashboard/budgets',      label: 'Budgets',       icon: '🎯' },
  { href: '/dashboard/reports',      label: 'Reports',       icon: '📈' },
  { href: '/dashboard/profile',      label: 'Profile',       icon: '👤' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const sidebarStyle = {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    height: '100vh',
    padding: '28px 16px',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
  }

  const navContent = (
    <>
      <Link href="/" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', paddingLeft: '8px', marginBottom: '36px', display: 'block' }}>
        Ledger
      </Link>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                background: active ? 'rgba(200,169,110,0.12)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={toggle}
          style={{ width: '100%', padding: '9px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--muted)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>{theme === 'dark' ? '☀' : '☾'}</span>
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: '9px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
        >
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* DESKTOP SIDEBAR */}
      <aside className="desktop-sidebar" style={{ ...sidebarStyle, width: '220px', flexShrink: 0, position: 'fixed', top: 0, left: 0, zIndex: 20 }}>
        {navContent}
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>Ledger</Link>
        <button
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer', padding: '6px 12px', fontSize: '1rem', lineHeight: 1 }}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="mobile-overlay"
          onClick={() => setOpen(false)}
          style={{ display: 'none', position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 28, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        className="mobile-sidebar"
        style={{ ...sidebarStyle, display: 'none', position: 'fixed', top: 0, left: 0, width: '240px', zIndex: 29, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease' }}
      >
        {navContent}
      </aside>

      {/* MAIN */}
      <main className="main-content" style={{ marginLeft: '220px', flex: 1, padding: '36px 40px', minHeight: '100vh' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar   { display: flex !important; }
          .mobile-sidebar  { display: flex !important; }
          .mobile-overlay  { display: block !important; }
          .main-content    { margin-left: 0 !important; padding: 80px 20px 32px !important; }
        }
      `}</style>

    </div>
  )
}
