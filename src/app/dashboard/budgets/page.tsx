'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Other']
const COLORS: Record<string, string> = {
  Housing: '#c8a96e', Food: '#60a5fa', Transport: '#4ade80',
  Healthcare: '#f87171', Entertainment: '#a78bfa', Shopping: '#fb923c',
  Utilities: '#2dd4bf', Other: '#f472b6',
}

type Budget = {
  id: string
  category: string
  monthly_limit: number
}

type Transaction = {
  type: string
  amount: number
  category: string
  date: string
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newCategory, setNewCategory] = useState('Food')
  const [newLimit, setNewLimit] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const [{ data: budgetData }, { data: txData }] = await Promise.all([
      supabase.from('budgets').select('*').order('category'),
      supabase.from('transactions').select('type, amount, category, date').eq('type', 'expense'),
    ])
    setBudgets(budgetData || [])
    setTransactions(txData || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Get this month's spending per category
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  function getSpent(category: string) {
    return transactions
      .filter(t => t.category === category && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + Number(t.amount), 0)
  }

  async function handleUpdateLimit(budget: Budget) {
    const val = Number(editValue)
    if (isNaN(val) || val <= 0) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('budgets').update({ monthly_limit: val }).eq('id', budget.id)
    await load()
    setEditingId(null)
    setSaving(false)
  }

  async function handleAddBudget() {
    const val = Number(newLimit)
    if (isNaN(val) || val <= 0) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('budgets').upsert({
      user_id: user!.id,
      category: newCategory,
      monthly_limit: val,
    }, { onConflict: 'user_id,category' })
    await load()
    setShowAdd(false)
    setNewLimit('')
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  const availableCategories = CATEGORIES.filter(c => !budgets.find(b => b.category === c))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6b7280' }}>
        Loading budgets...
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>Budgets</h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '6px' }}>
            Monthly limits for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        {availableCategories.length > 0 && (
          <button
            onClick={() => { setNewCategory(availableCategories[0]); setShowAdd(true) }}
            style={{ padding: '10px 20px', background: '#c8a96e', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Add Budget
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {budgets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#374151' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
          <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>No budgets set yet. Add a category limit to start tracking.</p>
          {availableCategories.length > 0 && (
            <button
              onClick={() => { setNewCategory(availableCategories[0]); setShowAdd(true) }}
              style={{ padding: '12px 24px', background: '#c8a96e', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Set Your First Budget
            </button>
          )}
        </div>
      )}

      {/* BUDGET CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {budgets.map((budget) => {
          const spent = getSpent(budget.category)
          const pct = Math.min((spent / budget.monthly_limit) * 100, 100)
          const remaining = budget.monthly_limit - spent
          const over = spent > budget.monthly_limit
          const color = COLORS[budget.category] || '#6b7280'
          const barColor = pct >= 100 ? '#f87171' : pct >= 80 ? '#fb923c' : color

          return (
            <div key={budget.id} style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: barColor }} />

              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{budget.category}</span>
                </div>
                <button
                  onClick={() => handleDelete(budget.id)}
                  style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', padding: '2px 6px' }}
                  onMouseEnter={e => (e.target as HTMLButtonElement).style.color = '#f87171'}
                  onMouseLeave={e => (e.target as HTMLButtonElement).style.color = '#374151'}
                >
                  Remove
                </button>
              </div>

              {/* Amounts */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 700, color: over ? '#f87171' : '#e8e4dc' }}>
                  {fmt(spent)}
                </span>
                {editingId === budget.id ? (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      style={{ width: '90px', padding: '4px 8px', background: '#0a0a0f', border: '1px solid #c8a96e', borderRadius: '7px', color: '#e8e4dc', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', textAlign: 'right' }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateLimit(budget); if (e.key === 'Escape') setEditingId(null) }}
                    />
                    <button onClick={() => handleUpdateLimit(budget)} disabled={saving} style={{ background: '#c8a96e', border: 'none', borderRadius: '6px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: '4px 8px', fontFamily: 'inherit' }}>
                      {saving ? '...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'none', border: '1px solid #1f2433', borderRadius: '6px', color: '#6b7280', fontSize: '0.75rem', cursor: 'pointer', padding: '4px 8px', fontFamily: 'inherit' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingId(budget.id); setEditValue(String(budget.monthly_limit)) }}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline dotted' }}
                  >
                    of {fmt(budget.monthly_limit)}
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: '#1f2433', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ width: pct + '%', height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.4s ease' }} />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280' }}>
                <span>{pct.toFixed(0)}% used</span>
                <span style={{ color: over ? '#f87171' : remaining < budget.monthly_limit * 0.2 ? '#fb923c' : '#4ade80' }}>
                  {over ? fmt(Math.abs(remaining)) + ' over' : fmt(remaining) + ' left'}
                </span>
              </div>

            </div>
          )
        })}
      </div>

      {/* ADD BUDGET MODAL */}
      {showAdd && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div style={{ width: '100%', maxWidth: '400px', background: '#13161e', border: '1px solid #1f2433', borderRadius: '20px', padding: '36px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '28px' }}>Set Budget Limit</h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '7px' }}>Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', background: '#0a0a0f', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '7px' }}>Monthly Limit</label>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="500.00"
                autoFocus
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '11px 14px', background: '#0a0a0f', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBudget()}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAdd(false)}
                style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid #1f2433', borderRadius: '10px', color: '#6b7280', fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddBudget}
                disabled={saving}
                style={{ flex: 2, padding: '12px', background: saving ? '#8a7048' : '#c8a96e', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {saving ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
