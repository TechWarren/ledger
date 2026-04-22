'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS: Record<string, string> = {
  Housing: '#c8a96e', Food: '#60a5fa', Transport: '#4ade80',
  Healthcare: '#f87171', Entertainment: '#a78bfa', Shopping: '#fb923c',
  Utilities: '#2dd4bf', Other: '#f472b6', Income: '#4ade80',
}

const SAMPLE_TRANSACTIONS = [
  // January
  { id: '1',  type: 'income',  amount: 4500, category: 'Income',        description: 'Monthly Salary',     date: '2026-01-01' },
  { id: '2',  type: 'expense', amount: 1200, category: 'Housing',       description: 'Rent',               date: '2026-01-02' },
  { id: '3',  type: 'expense', amount: 320,  category: 'Food',          description: 'Groceries',          date: '2026-01-05' },
  { id: '4',  type: 'expense', amount: 85,   category: 'Transport',     description: 'Gas',                date: '2026-01-07' },
  { id: '5',  type: 'expense', amount: 45,   category: 'Entertainment', description: 'Netflix + Spotify',  date: '2026-01-10' },
  { id: '6',  type: 'expense', amount: 210,  category: 'Shopping',      description: 'Clothing',           date: '2026-01-14' },
  { id: '7',  type: 'expense', amount: 95,   category: 'Utilities',     description: 'Electric Bill',      date: '2026-01-15' },
  { id: '8',  type: 'income',  amount: 650,  category: 'Income',        description: 'Freelance Project',  date: '2026-01-18' },
  { id: '9',  type: 'expense', amount: 150,  category: 'Healthcare',    description: 'Dentist',            date: '2026-01-20' },
  { id: '10', type: 'expense', amount: 75,   category: 'Food',          description: 'Restaurants',        date: '2026-01-25' },
  // February
  { id: '11', type: 'income',  amount: 4500, category: 'Income',        description: 'Monthly Salary',     date: '2026-02-01' },
  { id: '12', type: 'expense', amount: 1200, category: 'Housing',       description: 'Rent',               date: '2026-02-02' },
  { id: '13', type: 'expense', amount: 290,  category: 'Food',          description: 'Groceries',          date: '2026-02-06' },
  { id: '14', type: 'expense', amount: 110,  category: 'Transport',     description: 'Gas + Parking',      date: '2026-02-09' },
  { id: '15', type: 'expense', amount: 45,   category: 'Entertainment', description: 'Streaming Services', date: '2026-02-10' },
  { id: '16', type: 'expense', amount: 88,   category: 'Utilities',     description: 'Internet Bill',      date: '2026-02-14' },
  { id: '17', type: 'expense', amount: 340,  category: 'Shopping',      description: 'Electronics',        date: '2026-02-16' },
  { id: '18', type: 'income',  amount: 800,  category: 'Income',        description: 'Freelance Project',  date: '2026-02-20' },
  { id: '19', type: 'expense', amount: 60,   category: 'Food',          description: 'Date Night',         date: '2026-02-22' },
  // March
  { id: '20', type: 'income',  amount: 4500, category: 'Income',        description: 'Monthly Salary',     date: '2026-03-01' },
  { id: '21', type: 'expense', amount: 1200, category: 'Housing',       description: 'Rent',               date: '2026-03-02' },
  { id: '22', type: 'expense', amount: 310,  category: 'Food',          description: 'Groceries',          date: '2026-03-05' },
  { id: '23', type: 'expense', amount: 95,   category: 'Transport',     description: 'Gas',                date: '2026-03-08' },
  { id: '24', type: 'expense', amount: 200,  category: 'Healthcare',    description: 'Doctor Visit',       date: '2026-03-11' },
  { id: '25', type: 'expense', amount: 45,   category: 'Entertainment', description: 'Streaming Services', date: '2026-03-10' },
  { id: '26', type: 'expense', amount: 92,   category: 'Utilities',     description: 'Electric + Water',   date: '2026-03-15' },
  { id: '27', type: 'income',  amount: 500,  category: 'Income',        description: 'Side Project',       date: '2026-03-18' },
  { id: '28', type: 'expense', amount: 180,  category: 'Shopping',      description: 'Home Supplies',      date: '2026-03-22' },
  { id: '29', type: 'expense', amount: 55,   category: 'Food',          description: 'Work Lunches',       date: '2026-03-26' },
  // April
  { id: '30', type: 'income',  amount: 4500, category: 'Income',        description: 'Monthly Salary',     date: '2026-04-01' },
  { id: '31', type: 'expense', amount: 1200, category: 'Housing',       description: 'Rent',               date: '2026-04-02' },
  { id: '32', type: 'expense', amount: 275,  category: 'Food',          description: 'Groceries',          date: '2026-04-04' },
  { id: '33', type: 'expense', amount: 90,   category: 'Transport',     description: 'Gas',                date: '2026-04-07' },
  { id: '34', type: 'expense', amount: 45,   category: 'Entertainment', description: 'Streaming Services', date: '2026-04-10' },
  { id: '35', type: 'expense', amount: 420,  category: 'Shopping',      description: 'Spring Wardrobe',    date: '2026-04-13' },
  { id: '36', type: 'expense', amount: 85,   category: 'Utilities',     description: 'Electric Bill',      date: '2026-04-15' },
  { id: '37', type: 'income',  amount: 950,  category: 'Income',        description: 'Freelance Project',  date: '2026-04-19' },
  { id: '38', type: 'expense', amount: 130,  category: 'Food',          description: 'Restaurants',        date: '2026-04-21' },
  { id: '39', type: 'expense', amount: 75,   category: 'Other',         description: 'Miscellaneous',      date: '2026-04-25' },
]

const SAMPLE_BUDGETS = [
  { category: 'Housing',       monthly_limit: 1300 },
  { category: 'Food',          monthly_limit: 400  },
  { category: 'Transport',     monthly_limit: 150  },
  { category: 'Entertainment', monthly_limit: 60   },
  { category: 'Shopping',      monthly_limit: 300  },
  { category: 'Utilities',     monthly_limit: 120  },
  { category: 'Healthcare',    monthly_limit: 200  },
]

const RANGES = ['1M', '3M', '6M', 'All']
const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function DemoPage() {
  const [range, setRange] = useState('All')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets'>('overview')

  const filtered = useMemo(() => {
    return SAMPLE_TRANSACTIONS.filter((t) => {
      if (range !== 'All') {
        const now = new Date()
        const months = range === '1M' ? 1 : range === '3M' ? 3 : 6
        const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
        if (new Date(t.date) < cutoff) return false
      }
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || t.type === filterType
      const matchCat = filterCat === 'all' || t.category === filterCat
      return matchSearch && matchType && matchCat
    })
  }, [range, search, filterType, filterCat])

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savings      = totalIncome - totalExpense

  const barData = useMemo(() => {
    const map: Record<string, { month: string, income: number, expenses: number }> = {}
    filtered.forEach((t) => {
      const key = t.date.slice(0, 7)
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 }
      if (t.type === 'income') map[key].income += t.amount
      else map[key].expenses += t.amount
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
  }, [filtered])

  const pieData = useMemo(() => {
    const cats = ['Housing', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Other']
    return cats.map(cat => ({
      name: cat,
      value: filtered.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0),
      color: COLORS[cat],
    })).filter(d => d.value > 0)
  }, [filtered])

  const topSpending = [...pieData].sort((a, b) => b.value - a.value).slice(0, 5)

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  function getSpent(category: string) {
    return SAMPLE_TRANSACTIONS
      .filter(t => t.category === category && t.type === 'expense' && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc' }}>

      {/* TOP BAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid #1f2433', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c8a96e', textDecoration: 'none' }}>Ledger</Link>
          <span style={{ padding: '3px 10px', background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: '#c8a96e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Demo Mode
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/login" style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'none' }}>Sign In</Link>
          <Link href="/signup" style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px', background: '#c8a96e', color: '#0a0a0f', fontWeight: 700, textDecoration: 'none' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* DEMO BANNER */}
      <div style={{ marginTop: '57px', padding: '12px 32px', background: 'rgba(200,169,110,0.06)', borderBottom: '1px solid rgba(200,169,110,0.1)', textAlign: 'center', fontSize: '0.82rem', color: '#9ca3af' }}>
        You are viewing a demo with sample data.{' '}
        <Link href="/signup" style={{ color: '#c8a96e', textDecoration: 'none', fontWeight: 600 }}>Create a free account</Link>
        {' '}to track your own finances.
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 97px)' }}>

        {/* SIDEBAR */}
        <aside style={{ width: '200px', flexShrink: 0, borderRight: '1px solid #1f2433', padding: '24px 12px', background: '#13161e' }}>
          {[
            { key: 'overview',      label: 'Overview',      icon: '📊' },
            { key: 'transactions',  label: 'Transactions',  icon: '💳' },
            { key: 'budgets',       label: 'Budgets',       icon: '🎯' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as typeof activeTab)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '4px', background: activeTab === item.key ? 'rgba(200,169,110,0.12)' : 'transparent', color: activeTab === item.key ? '#c8a96e' : '#6b7280', textAlign: 'left' }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* CONTENT */}
        <main style={{ flex: 1, padding: '32px 36px', overflowX: 'hidden' }}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                  <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>Overview</h1>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px' }}>Sample financial snapshot</p>
                </div>
                <div style={{ display: 'flex', gap: '4px', background: '#13161e', padding: '4px', borderRadius: '10px', border: '1px solid #1f2433' }}>
                  {RANGES.map((r) => (
                    <button key={r} onClick={() => setRange(r)} style={{ padding: '6px 13px', borderRadius: '7px', border: 'none', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', background: range === r ? '#c8a96e' : 'transparent', color: range === r ? '#0a0a0f' : '#6b7280' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* STAT CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Income',   value: fmt(totalIncome),  color: '#4ade80' },
                  { label: 'Total Expenses', value: fmt(totalExpense), color: '#f87171' },
                  { label: 'Net Savings',    value: fmt(savings),      color: savings >= 0 ? '#c8a96e' : '#f87171' },
                ].map((card) => (
                  <div key={card.label} style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '14px', padding: '22px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: card.color }} />
                    <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>{card.label}</p>
                    <p style={{ fontSize: '1.7rem', fontWeight: 700, color: card.color, fontFamily: 'monospace' }}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* CHARTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '14px', padding: '24px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '16px' }}>Income vs Expenses</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={barData} barGap={4}>
                      <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => '$' + v.toLocaleString()} />
                      <Tooltip contentStyle={{ background: '#1f2433', border: 'none', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.82rem' }} formatter={(v) => fmt(Number(v))} />
                      <Bar dataKey="income"   name="Income"   fill="#4ade80" radius={[4,4,0,0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '14px', padding: '24px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '16px' }}>By Category</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="42%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1f2433', border: 'none', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.82rem' }} formatter={(v) => fmt(Number(v))} />
                      <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '0.72rem', color: '#9ca3af' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TOP SPENDING */}
              <div style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '14px', padding: '24px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '16px' }}>Top Spending Categories</p>
                {topSpending.map((cat, i) => {
                  const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0
                  return (
                    <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: i < topSpending.length - 1 ? '1px solid #1f2433' : 'none' }}>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280', width: '18px', fontFamily: 'monospace' }}>#{i+1}</span>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '0.875rem' }}>{cat.name}</span>
                      <div style={{ width: '100px', height: '4px', background: '#1f2433', borderRadius: '2px' }}>
                        <div style={{ width: pct + '%', height: '100%', background: cat.color, borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', minWidth: '75px', textAlign: 'right' }}>{fmt(cat.value)}</span>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280', minWidth: '36px', textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === 'transactions' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>Transactions</h1>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px' }}>{SAMPLE_TRANSACTIONS.length} sample transactions</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, minWidth: '180px', padding: '9px 13px', background: '#13161e', border: '1px solid #1f2433', borderRadius: '9px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                  style={{ padding: '9px 13px', background: '#13161e', border: '1px solid #1f2433', borderRadius: '9px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
                  style={{ padding: '9px 13px', background: '#13161e', border: '1px solid #1f2433', borderRadius: '9px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="all">All Categories</option>
                  {['Housing','Food','Transport','Healthcare','Entertainment','Shopping','Utilities','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '14px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0a0a0f' }}>
                      {['Date','Description','Category','Type','Amount'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', textAlign: 'left', borderBottom: '1px solid #1f2433' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #1f2433' }}>
                        <td style={{ padding: '13px 16px', fontSize: '0.78rem', color: '#6b7280', fontFamily: 'monospace' }}>{t.date}</td>
                        <td style={{ padding: '13px 16px', fontSize: '0.875rem' }}>{t.description}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 9px', borderRadius: '999px', fontSize: '0.73rem', fontWeight: 500, background: `${COLORS[t.category]}18`, color: COLORS[t.category] }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: COLORS[t.category] }} />
                            {t.category}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '0.78rem', color: t.type === 'income' ? '#4ade80' : '#f87171', textTransform: 'capitalize' }}>{t.type}</td>
                        <td style={{ padding: '13px 16px', fontFamily: 'monospace', fontSize: '0.875rem', color: t.type === 'income' ? '#4ade80' : '#f87171' }}>
                          {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── BUDGETS TAB ── */}
          {activeTab === 'budgets' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>Budgets</h1>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px' }}>Monthly limits — sample data</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '14px' }}>
                {SAMPLE_BUDGETS.map((budget) => {
                  const spent    = getSpent(budget.category)
                  const pct      = Math.min((spent / budget.monthly_limit) * 100, 100)
                  const remaining = budget.monthly_limit - spent
                  const over     = spent > budget.monthly_limit
                  const color    = COLORS[budget.category] || '#6b7280'
                  const barColor = pct >= 100 ? '#f87171' : pct >= 80 ? '#fb923c' : color
                  return (
                    <div key={budget.category} style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '14px', padding: '22px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: barColor }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{budget.category}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 700, color: over ? '#f87171' : '#e8e4dc' }}>{fmt(spent)}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#6b7280' }}>of {fmt(budget.monthly_limit)}</span>
                      </div>
                      <div style={{ height: '6px', background: '#1f2433', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{ width: pct + '%', height: '100%', background: barColor, borderRadius: '3px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#6b7280' }}>
                        <span>{pct.toFixed(0)}% used</span>
                        <span style={{ color: over ? '#f87171' : remaining < budget.monthly_limit * 0.2 ? '#fb923c' : '#4ade80' }}>
                          {over ? fmt(Math.abs(remaining)) + ' over' : fmt(remaining) + ' left'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
