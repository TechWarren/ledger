import Link from "next/link";

const stack = [
  { name: "Next.js 15", color: "#ffffff" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Supabase", color: "#3ecf8e" },
  { name: "Tailwind CSS", color: "#38bdf8" },
  { name: "Recharts", color: "#ff6b6b" },
  { name: "Vercel", color: "#ffffff" },
];

const features = [
  { icon: "📊", title: "Income vs Expense Charts", desc: "Interactive bar and pie charts with adjustable time ranges, monthly, quarterly, and yearly." },
  { icon: "🗂️", title: "Category Breakdown", desc: "See exactly where money goes. Every transaction tagged and visualized by category." },
  { icon: "🎯", title: "Budget Limits", desc: "Set monthly limits per category. Live progress bars show how close you are to each cap." },
  { icon: "🔍", title: "Transaction History", desc: "Full searchable, filterable transaction log. Add, edit, and delete with instant updates." },
  { icon: "🔒", title: "Secure by Default", desc: "Row-level security means your data is only ever accessible to you, enforced at the database level." },
  { icon: "📱", title: "Fully Responsive", desc: "Works cleanly on desktop, tablet, and mobile without compromising on detail." },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e4dc", width: "100%", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)" }}>
        <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#c8a96e", letterSpacing: "-0.02em" }}>Ledger</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/demo" style={{ fontSize: "0.875rem", color: "#9ca3af", textDecoration: "none" }}>Live Demo</Link>
          <Link href="/login" style={{ fontSize: "0.875rem", padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e4dc", textDecoration: "none" }}>Sign In</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px 40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 14px", borderRadius: "999px", border: "1px solid rgba(200,169,110,0.3)", background: "rgba(200,169,110,0.05)", color: "#c8a96e", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "32px" }}>
          Full-Stack Project
        </div>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "24px", maxWidth: "800px" }}>
          Personal finance,{" "}
          <span style={{ color: "#c8a96e" }}>finally clear.</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#9ca3af", maxWidth: "520px", lineHeight: 1.7, marginBottom: "40px" }}>
          Ledger is a full-stack budgeting app with real authentication, a live Postgres database, and interactive charts.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/demo" style={{ padding: "12px 24px", borderRadius: "12px", background: "#c8a96e", color: "#0a0a0f", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Try Live Demo</Link>
          <Link href="/login" style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e4dc", fontSize: "0.875rem", textDecoration: "none" }}>Sign In</Link>
          <a href="https://github.com/TechWarren/ledger" target="_blank" rel="noopener noreferrer" style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e4dc", fontSize: "0.875rem", textDecoration: "none" }}>View Source</a>
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ width: "100%", padding: "60px 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", marginBottom: "32px" }}>Built with</p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "12px", maxWidth: "600px", margin: "0 auto" }}>
          {stack.map((tech) => (
            <span key={tech.name} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.875rem", fontWeight: 500, color: tech.color }}>
              {tech.name}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ width: "100%", padding: "80px 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: "16px" }}>Everything you need to track your money</h2>
          <p style={{ textAlign: "center", color: "#9ca3af", marginBottom: "60px", maxWidth: "500px", margin: "0 auto 60px" }}>Built with real-world patterns used by modern product teams.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {features.map((f) => (
              <div key={f.title} style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "16px" }}>{f.icon}</div>
                <h3 style={{ fontWeight: 600, marginBottom: "8px", fontSize: "0.95rem" }}>{f.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ width: "100%", padding: "80px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px" }}>See it working live</h2>
        <p style={{ color: "#9ca3af", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>No account needed. Try the demo with sample data or sign up to track your own finances.</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/demo" style={{ padding: "12px 24px", borderRadius: "12px", background: "#c8a96e", color: "#0a0a0f", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Try Live Demo</Link>
          <Link href="/signup" style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e4dc", fontSize: "0.875rem", textDecoration: "none" }}>Create Free Account</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ width: "100%", padding: "24px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280" }}>
        <span>Ledger - Built by TechWarren</span>
        <a href="https://github.com/TechWarren/ledger" target="_blank" rel="noopener noreferrer" style={{ color: "#6b7280", textDecoration: "none" }}>GitHub</a>
      </footer>

    </main>
  );
}
