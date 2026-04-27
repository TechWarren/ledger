'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [displayName, setDisplayName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setDisplayName((user?.user_metadata?.full_name as string) || '')
      setLoading(false)
    }
    load()
  }, [])

  async function saveName() {
    setSavingName(true)
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { full_name: displayName } })
    setSavingName(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  async function savePassword() {
    setPasswordMsg(null)
    if (!newPassword) { setPasswordMsg({ type: 'error', text: 'Enter a new password' }); return }
    if (newPassword.length < 6) { setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'error', text: 'Passwords do not match' }); return }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordMsg({ type: 'error', text: error.message })
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully' })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--muted)' }}>
        Loading profile...
      </div>
    )
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
  const cardStyle: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }
  const sectionTitleStyle: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }

  return (
    <div style={{ maxWidth: '580px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>Profile</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '6px' }}>Manage your account settings</p>
      </div>

      {/* ACCOUNT */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Account</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Email</label>
          <div style={{ ...inputStyle, color: 'var(--muted)', cursor: 'default' }}>{user?.email}</div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
          />
        </div>
        <button
          onClick={saveName}
          disabled={savingName}
          style={{ padding: '10px 24px', background: nameSaved ? '#4ade80' : savingName ? '#8a7048' : 'var(--accent)', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: savingName ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
        >
          {nameSaved ? 'Saved!' : savingName ? 'Saving...' : 'Save Name'}
        </button>
      </div>

      {/* CHANGE PASSWORD */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Change Password</h2>
        {passwordMsg && (
          <div style={{
            background: passwordMsg.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
            border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem',
            color: passwordMsg.type === 'success' ? '#4ade80' : '#f87171',
            marginBottom: '20px',
          }}>
            {passwordMsg.text}
          </div>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            onKeyDown={(e) => e.key === 'Enter' && savePassword()}
          />
        </div>
        <button
          onClick={savePassword}
          disabled={savingPassword}
          style={{ padding: '10px 24px', background: savingPassword ? '#8a7048' : 'var(--accent)', border: 'none', borderRadius: '10px', color: '#0a0a0f', fontWeight: 700, fontSize: '0.875rem', cursor: savingPassword ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          {savingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* ACCOUNT DETAILS */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <h2 style={sectionTitleStyle}>Account Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Member Since</p>
            <p style={{ fontSize: '0.875rem' }}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : '—'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>User ID</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted)', wordBreak: 'break-all' }}>{user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
