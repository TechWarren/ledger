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
}

const fmt = (n: number) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

async function fetchTransactions() {
  const supabase = createClient()
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  return data || []
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
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
    const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    const matchCat = filterCat === 'all' || t.category === filterCat
    return matchSearch && matchType && matchCat
  })

  function resetForm() {
    setType('expense')
    setAmount('')
    setCategory('Food')
    setDescription('')
    setDate(new Date().toISOString().slice(0, 10))
    setFormError('')
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
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('transactions').insert({
      user_id: user!.id,
      type,
      amount: Number(amount),
      category: type === 'income' ? 'Income' : category,
      description,
      date,
    })
    if (error) {
      setFormError(error.message)
      setSaving(false)
      return
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6b7280' }}>
        Loading transactions...
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>Transactions</h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '6px' }}>{transactions.length} total transactions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          style={{ padding: '10px 20px', background: '#c8a96e', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + Add Transaction
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px', background: '#13161e', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '10px 14px', background: '#13161e', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{ padding: '10px 14px', background: '#13161e', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ background: '#13161e', border: '1px solid #1f2433', borderRadius: '16px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#374151' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💳</div>
            <p style={{ fontSize: '0.9rem' }}>{transactions.length === 0 ? 'No transactions yet — add your first one!' : 'No transactions match your filters'}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0a0a0f' }}>
                {['Date', 'Description', 'Category', 'Type', 'Amount', ''].map(h => (
                  <th key={h} style={{ padding: '13px 18px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', textAlign: 'left', borderBottom: '1px solid #1f2433' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #1f2433' }}>
                  <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#6b7280', fontFamily: 'monospace' }}>{t.date}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.875rem' }}>{t.description || '—'}</td>
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
                  <td style={{ padding: '14px 18px' }}>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{ background: 'none', border: '1px solid transparent', borderRadius: '6px', color: '#6b7280', cursor: 'pointer', padding: '4px 10px', fontSize: '0.8rem', fontFamily: 'inherit' }}
                      onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#f87171'; (e.target as HTMLButtonElement).style.color = '#f87171' }}
                      onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'transparent'; (e.target as HTMLButtonElement).style.color = '#6b7280' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm() } }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div style={{ width: '100%', maxWidth: '460px', background: '#13161e', border: '1px solid #1f2433', borderRadius: '20px', padding: '36px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '28px' }}>Add Transaction</h2>

            {formError && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#f87171', marginBottom: '20px' }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: '11px', borderRadius: '10px', border: '1px solid',
                    borderColor: type === t ? (t === 'income' ? '#4ade80' : '#f87171') : '#1f2433',
                    background: type === t ? (t === 'income' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : 'transparent',
                    color: type === t ? (t === 'income' ? '#4ade80' : '#f87171') : '#6b7280',
                    fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {t === 'income' ? '+ Income' : '- Expense'}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '7px' }}>Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '11px 14px', background: '#0a0a0f', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '7px' }}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: '#0a0a0f', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }}
                />
              </div>
            </div>

            {type === 'expense' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '7px' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', background: '#0a0a0f', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '7px' }}>Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery run, Netflix, Salary..."
                style={{ width: '100%', padding: '11px 14px', background: '#0a0a0f', border: '1px solid #1f2433', borderRadius: '10px', color: '#e8e4dc', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid #1f2433', borderRadius: '10px', color: '#6b7280', fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 2, padding: '12px', background: saving ? '#8a7048' : '#c8a96e', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {saving ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
