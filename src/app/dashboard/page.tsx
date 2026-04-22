'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Other']

const COLORS = ['#c8a96e', '#60a5fa', '#4ade80', '#f87171', '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6']

type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

const RANGES = ['1M', '3M', '6M', '1Y', 'All']

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [range, setRange] = useState('1M')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
      setTransactions(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Filter by range
  const filtered = transactions.filter((t) => {
    if (range === 'All') return true
    const now = new Date()
    const date = new Date(t.date)
    const months = range === '1M' ? 1 : range === '3M' ? 3 : range === '6M' ? 6 : 12
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
    return date >= cutoff
  })

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const savings      = totalIncome - totalExpense

  // Bar chart — group by month
  const barData = (() => {
    const map: Record<string, { month: string, income: number, expenses: number }> = {}
    filtered.forEach((t) => {
      const key = t.date.slice(0, 7)
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 }
      if (t.type === 'income') map[key].income += Number(t.amount)
      else map[key].expenses += Number(t.amount)
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-12)
  })()

  // Pie chart — expenses by category
  const pieData = CATEGORIES.map((cat, i) => ({
    name: cat,
    value: filtered.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + Number(t.amount), 0),
    color: COLORS[i],
  })).filter(d => d.value > 0)

  // Top spending categories
  const topSpending = [...pieData].sort((a, b) => b.value - a.value).slice(0, 5)

  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6b7280' }}>
        Loading your data...
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>Overview</h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '6px' }}>Your financial snapshot</p>
        </div>
        {/* RANGE TABS */}
        <div style={{ display: 'flex', gap: '4px', background: '#13161e', padding: '4px', borderRadius: '10px', border: '1px solid #1f2433' }}>
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', background: range === r ? '#c8a96e' : 'transparent', color: range === r ? '#0a0a0f' : '#6b7280', transition: 'all 0.15s' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Income',   value: fmt(totalIncome),  color: '#4ade80', accent: 'rgba(74,222,128,0.08)'  },
          { label: 'Total Expenses', value: fmt(totalExpense), color: '#f87171', accent: 'rgba(248,113,113,0.08)' },
          { label: 'Net Savings',    value: fmt(savings),      color: savings >= 0 ? '#c8a96e' : '#f87171', accent: 'rgba(200,169,110,0.08)' },
        ].map((card) => (
          <div key={card.label} style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: card.color }} />
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '10px' }}>{card.label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: card.color, fontFamily: 'monospace' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* BAR CHART */}
        <div style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '16px', padding: '28px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '20px' }}>Income vs Expenses</p>
          {barData.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: '0.875rem' }}>
              No data yet — add some transactions
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => '$' + v.toLocaleString()} />
                <Tooltip
                  contentStyle={{ background: '#1f2433', border: 'none', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.85rem' }}
                  formatter={(v) => fmt(Number(v))}
                />
                <Bar dataKey="income"   name="Income"   fill="#4ade80" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* PIE CHART */}
        <div style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '16px', padding: '28px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '20px' }}>Spending by Category</p>
          {pieData.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: '0.875rem', textAlign: 'center' }}>
              No expenses yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f2433', border: 'none', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.85rem' }}
                  formatter={(v) => fmt(Number(v))}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* TOP SPENDING */}
      <div style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '16px', padding: '28px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '20px' }}>Top Spending Categories</p>
        {topSpending.length === 0 ? (
          <p style={{ color: '#374151', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>No expenses yet</p>
        ) : (
          <div>
            {topSpending.map((cat, i) => {
              const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0
              return (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: i < topSpending.length - 1 ? '1px solid #1f2433' : 'none' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', width: '20px', fontFamily: 'monospace' }}>#{i + 1}</span>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.875rem' }}>{cat.name}</span>
                  <div style={{ width: '120px', height: '4px', background: '#1f2433', borderRadius: '2px' }}>
                    <div style={{ width: pct + '%', height: '100%', background: cat.color, borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', minWidth: '80px', textAlign: 'right' }}>{fmt(cat.value)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', minWidth: '40px', textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
