'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Other']
const COLORS: Record<string, string> = {
  Housing: '#c8a96e', Food: '#60a5fa', Transport: '#4ade80',
  Healthcare: '#f87171', Entertainment: '#a78bfa', Shopping: '#fb923c',
  Utilities: '#2dd4bf', Other: '#f472b6', Income: '#4ade80',
}

type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  is_recurring?: boolean
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

async function fetchTransactions() {
  const supabase = createClient()
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  return (data || []) as Transaction[]
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [generatingRecurring, setGeneratingRecurring] = useState(false)

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [isRecurring, setIsRecurring] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    async function load() {
      const data = await fetchTransactions()
      setTransactions(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    const matchCat  = filterCat  === 'all' || t.category === filterCat
    return matchSearch && matchType && matchCat
  })

  const currentMonth = new Date().toISOString().slice(0, 7)

  // Find recurring transactions not yet added for the current month
  const pendingRecurring = (() => {
    const templates = new Map<string, Transaction>()
    for (const t of [...transactions].reverse()) {
      if (t.is_recurring) {
        const key = `${t.type}:${t.category}:${t.description}`
        templates.set(key, t)
      }
    }
    const thisMonthRecurring = transactions.filter(t => t.date.startsWith(currentMonth) && t.is_recurring)
    return [...templates.values()].filter(t =>
      !thisMonthRecurring.some(ct =>
        ct.type === t.type && ct.category === t.category && ct.description === t.description
      )
    )
  })()

  function resetForm() {
    setEditingId(null)
    setType('expense')
    setAmount('')
    setCategory('Food')
    setDescription('')
    setDate(new Date().toISOString().slice(0, 10))
    setIsRecurring(false)
    setFormError('')
  }

  function openAdd() {
    resetForm()
    setShowModal(true)
  }

  function openEdit(t: Transaction) {
    setEditingId(t.id)
    setType(t.type)
    setAmount(String(t.amount))
    setCategory(t.category === 'Income' ? 'Food' : t.category)
    setDescription(t.description || '')
    setDate(t.date)
    setIsRecurring(!!t.is_recurring)
    setFormError('')
    setShowModal(true)
  }

  async function handleSave() {
    setFormError('')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError('Please enter a valid amount')
      return
    }
    if (!date) {
      setFormError('Please select a date')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const payload = {
      type,
      amount: Number(amount),
      category: type === 'income' ? 'Income' : category,
      description,
      date,
      is_recurring: isRecurring,
    }
    if (editingId) {
      const { error } = await supabase.from('transactions').update(payload).eq('id', editingId)
      if (error) { setFormError(error.message); setSaving(false); return }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('transactions').insert({ ...payload, user_id: user!.id })
      if (error) { setFormError(error.message); setSaving(false); return }
    }
    const data = await fetchTransactions()
    setTransactions(data)
    setShowModal(false)
    resetForm()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  async function generateRecurring() {
    setGeneratingRecurring(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().slice(0, 10)
    for (const t of pendingRecurring) {
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: today,
        is_recurring: true,
      })
    }
    const data = await fetchTransactions()
    setTransactions(data)
    setGeneratingRecurring(false)
  }

  function exportCSV() {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Recurring']
    const rows = filtered.map(t => [
      t.date,
      t.type,
      t.category,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.type === 'income' ? t.amount : -t.amount,
      t.is_recurring ? 'Yes' : 'No',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ledger-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--muted)' }}>
        Loading transactions...
      </div>
    )
  }

  const inputStyle = { padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>Transactions</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '6px' }}>{transactions.length} total transactions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportCSV}
            style={{ padding: '10px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Export CSV
          </button>
          <button
            onClick={openAdd}
            style={{ padding: '10px 20px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {pendingRecurring.length > 0 && (
        <div style={{ background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '0.875rem' }}>
              {pendingRecurring.length} recurring transaction{pendingRecurring.length !== 1 ? 's' : ''} due
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '8px' }}>
              for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button
            onClick={generateRecurring}
            disabled={generatingRecurring}
            style={{ padding: '7px 16px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.8rem', cursor: generatingRecurring ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
          >
            {generatingRecurring ? 'Adding...' : 'Add Now'}
          </button>
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💳</div>
            <p style={{ fontSize: '0.9rem' }}>{transactions.length === 0 ? 'No transactions yet — add your first one!' : 'No transactions match your filters'}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Date', 'Description', 'Category', 'Type', 'Amount', ''].map(h => (
                  <th key={h} style={{ padding: '13px 18px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => openEdit(t)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--row-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{t.date}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.875rem' }}>
                    {t.description || '—'}
                    {t.is_recurring && (
                      <span style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '999px', background: 'rgba(200,169,110,0.12)', color: 'var(--accent)' }}>↻</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: `${COLORS[t.category] || '#6b7280'}18`, color: COLORS[t.category] || '#6b7280' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS[t.category] || '#6b7280' }} />
                      {t.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: t.type === 'income' ? '#4ade80' : '#f87171', textTransform: 'capitalize' }}>{t.type}</td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.875rem', color: t.type === 'income' ? '#4ade80' : '#f87171' }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td style={{ padding: '14px 18px' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(t)}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', cursor: 'pointer', padding: '4px 10px', fontSize: '0.8rem', fontFamily: 'inherit' }}
                        onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.target as HTMLButtonElement).style.color = 'var(--accent)' }}
                        onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.target as HTMLButtonElement).style.color = 'var(--muted)' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        style={{ background: 'none', border: '1px solid transparent', borderRadius: '6px', color: 'var(--muted)', cursor: 'pointer', padding: '4px 10px', fontSize: '0.8rem', fontFamily: 'inherit' }}
                        onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#f87171'; (e.target as HTMLButtonElement).style.color = '#f87171' }}
                        onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'transparent'; (e.target as HTMLButtonElement).style.color = 'var(--muted)' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm() } }}
          style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '460px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '28px' }}>
              {editingId ? 'Edit Transaction' : 'Add Transaction'}
            </h2>

            {formError && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#f87171', marginBottom: '20px' }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {(['expense', 'income'] as const).map((t) => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: '11px', borderRadius: '10px', border: '1px solid',
                  borderColor: type === t ? (t === 'income' ? '#4ade80' : '#f87171') : 'var(--border)',
                  background: type === t ? (t === 'income' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : 'transparent',
                  color: type === t ? (t === 'income' ? '#4ade80' : '#f87171') : 'var(--muted)',
                  fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                }}>
                  {t === 'income' ? '+ Income' : '- Expense'}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" autoFocus
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            </div>

            {type === 'expense' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>Description (optional)</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Grocery run, Netflix, Salary..."
                style={{ width: '100%', padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="recurring-check"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              <label htmlFor="recurring-check" style={{ fontSize: '0.875rem', color: 'var(--muted)', cursor: 'pointer' }}>
                Recurring monthly
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowModal(false); resetForm() }}
                style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--muted)', fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer' }}>
                Cancel
              </button>
              {editingId && (
                <button onClick={() => { handleDelete(editingId); setShowModal(false); resetForm() }}
                  style={{ flex: 1, padding: '12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', color: '#f87171', fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
                  Delete
                </button>
              )}
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 2, padding: '12px', background: saving ? '#8a7048' : 'var(--accent)', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
