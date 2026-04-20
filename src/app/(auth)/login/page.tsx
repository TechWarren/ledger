'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      {/* Back to home */}
      <Link href="/" style={{ position: "fixed", top: "24px", left: "32px", fontSize: "0.85rem", color: "#6b7280", textDecoration: "none" }}>
        Back to home
      </Link>

      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#c8a96e", marginBottom: "8px" }}>Ledger</div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: "#13161e", border: "1px solid #1f2433", borderRadius: "20px", padding: "40px" }}>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.85rem", color: "#f87171", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "8px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1f2433", borderRadius: "10px", color: "#e8e4dc", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "8px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1f2433", borderRadius: "10px", color: "#e8e4dc", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "13px", background: loading ? "#8a7048" : "#c8a96e", border: "none", borderRadius: "10px", color: "#0a0a0f", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: "0.03em" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Divider */}
          <div style={{ textAlign: "center", margin: "24px 0", fontSize: "0.8rem", color: "#374151" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#c8a96e", textDecoration: "none", fontWeight: 600 }}>
              Sign up free
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
