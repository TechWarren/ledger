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

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📬</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>Check your email</h2>
          <p style={{ color: "#9ca3af", lineHeight: 1.6, marginBottom: "24px" }}>
            We sent a confirmation link to <strong style={{ color: "#e8e4dc" }}>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" style={{ padding: "12px 24px", borderRadius: "12px", background: "#c8a96e", color: "#0a0a0f", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            Back to Sign In
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      <Link href="/" style={{ position: "fixed", top: "24px", left: "32px", fontSize: "0.85rem", color: "#6b7280", textDecoration: "none" }}>
        Back to home
      </Link>

      <div style={{ width: "100%", maxWidth: "400px" }}>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#c8a96e", marginBottom: "8px" }}>Ledger</div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Create your free account</p>
        </div>

        <div style={{ background: "#13161e", border: "1px solid #1f2433", borderRadius: "20px", padding: "40px" }}>

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.85rem", color: "#f87171", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "8px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1f2433", borderRadius: "10px", color: "#e8e4dc", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "8px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1f2433", borderRadius: "10px", color: "#e8e4dc", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "8px" }}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1f2433", borderRadius: "10px", color: "#e8e4dc", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{ width: "100%", padding: "13px", background: loading ? "#8a7048" : "#c8a96e", border: "none", borderRadius: "10px", color: "#0a0a0f", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div style={{ textAlign: "center", margin: "24px 0 0", fontSize: "0.8rem", color: "#374151" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#c8a96e", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
          </div>

        </div>
      </div>
    </main>
  )
}
