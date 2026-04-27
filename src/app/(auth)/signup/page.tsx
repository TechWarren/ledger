'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📬</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>Check your email</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: "24px" }}>
            We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" style={{ padding: "12px 24px", borderRadius: "12px", background: "var(--accent)", color: "#0a0a0f", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            Back to Sign In
          </Link>
        </div>
      </main>
    )
  }

  const inputStyle = { width: "100%", padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text)", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }
  const labelStyle = { display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: "8px" }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      <Link href="/" style={{ position: "fixed", top: "24px", left: "32px", fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>
        Back to home
      </Link>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)", marginBottom: "8px" }}>Ledger</div>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Create your free account</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "40px" }}>
          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.85rem", color: "#f87171", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inputStyle} />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" style={inputStyle}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()} />
          </div>

          <button onClick={handleSignup} disabled={loading}
            style={{ width: "100%", padding: "13px", background: loading ? "#8a7048" : "var(--accent)", border: "none", borderRadius: "10px", color: "#0a0a0f", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div style={{ textAlign: "center", margin: "24px 0 0", fontSize: "0.8rem", color: "var(--muted2)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
