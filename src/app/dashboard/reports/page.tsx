'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Other']
const COLORS: Record<string, string> = {
  Housing: '#c8a96e', Food: '#60a5fa', Transport: '#4ade80',
  Healthcare: '#f87171', Entertainment: '#a78bfa', Shopping: '#fb923c',
  Utilities: '#2dd4bf', Other: '#f472b6',
}

type Transaction = {
  type: string
  amount: number
  category: string
  date: string
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function getLastNMonths(n: number): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

function monthLabel(m: string) {
  const [year, mon] = m.split('-')
  return new Date(Number(year), Number(mon) - 1).toLocaleString('default', { month: 'short', year: '2-digit' })
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [numMonths, setNumMonths] = useState(6)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('transactions')
        .select('type, amount, category, date')
        .order('date', { ascending: false })
      setTransactions(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const months = getLastNMonths(numMonths)

  function getMonthStats(month: string) {
    const txs = transactions.filter(t => t.date.startsWith(month))
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return { income, expenses, net: income - expenses }
  }

  function getCategorySpend(month: string, category: string) {
    return transactions
      .filter(t => t.date.startsWith(month) && t.type === 'expense' && t.category === category)
      .reduce((s, t) => s + Number(t.amount), 0)
  }

  const chartData = months.map(m => {
    const { income, expenses } = getMonthStats(m)
    return { month: m, income, expenses }
  })

  const thStyle = { padding: '12px 16px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: 'var(--muted)', textAlign: 'right' as const, borderBottom: '1px solid var(--border)' }
  const tdStyle = { padding: '13px 16px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'right' as const }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--muted)' }}>
        Loading reports...
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>Reports</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '6px' }}>Month-by-month breakdown</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          {[3, 6, 12].map(n => (
            <button key={n} onClick={() => setNumMonths(n)}
              style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', background: numMonths === n ? 'var(--accent)' : 'transparent', color: numMonths === n ? '#0a0a0f' : 'var(--muted)', transition: 'all 0.15s' }}>
              {n}M
            </button>
          ))}
        </div>
      </div>

      {/* BAR CHART */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '20px' }}>Income vs Expenses</p>
        {chartData.every(d => d.income === 0 && d.expenses === 0) ? (
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted2)', fontSize: '0.875rem' }}>
            No data yet — add some transactions
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + Number(v).toLocaleString()} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.85rem' }}
                formatter={(v) => fmt(Number(v))}
                labelFormatter={m => monthLabel(String(m))}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: '#9ca3af' }} />
              <Bar dataKey="income" name="Income" fill="#4ade80" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* MONTHLY SUMMARY TABLE */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--muted)' }}>Monthly Summary</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{ ...thStyle, textAlign: 'left', padding: '12px 20px' }}>Metric</th>
                {months.map(m => <th key={m} style={thStyle}>{monthLabel(m)}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'income',   label: 'Income',      color: '#4ade80' },
                { key: 'expenses', label: 'Expenses',    color: '#f87171' },
                { key: 'net',      label: 'Net Savings', color: 'var(--accent)' },
              ].map(row => (
                <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '13px 20px', fontSize: '0.85rem', fontWeight: 600, color: row.color }}>{row.label}</td>
                  {months.map(m => {
                    const stats = getMonthStats(m)
                    const val = row.key === 'income' ? stats.income : row.key === 'expenses' ? stats.expenses : stats.net
                    const color = row.key === 'net' ? (val >= 0 ? 'var(--accent)' : '#f87171') : row.color
                    return (
                      <td key={m} style={{ ...tdStyle, color: val === 0 ? 'var(--muted)' : color }}>
                        {val === 0 ? '—' : fmt(Math.abs(val))}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--muted)' }}>Spending by Category</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{ ...thStyle, textAlign: 'left', padding: '12px 20px' }}>Category</th>
                {months.map(m => <th key={m} style={thStyle}>{monthLabel(m)}</th>)}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(cat => {
                const hasData = months.some(m => getCategorySpend(m, cat) > 0)
                if (!hasData) return null
                return (
                  <tr key={cat} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[cat], flexShrink: 0 }} />
                        <span style={{ fontSize: '0.875rem' }}>{cat}</span>
                      </div>
                    </td>
                    {months.map(m => {
                      const val = getCategorySpend(m, cat)
                      return (
                        <td key={m} style={{ ...tdStyle, color: val === 0 ? 'var(--muted)' : COLORS[cat] }}>
                          {val === 0 ? '—' : fmt(val)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
