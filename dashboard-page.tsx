"use client";
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  PayerName: string;
  issuer: string;
  amount: string;
  saldo_akhir: number;
  timestamp: string;
  tr_id: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState("");
  const [inputSecret, setInputSecret] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [totalToday, setTotalToday] = useState(0);

  const login = () => {
    setSecret(inputSecret);
    setLoggedIn(true);
    fetchTransactions(inputSecret);
  };

  const fetchTransactions = async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/callback-qris/${s}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        // Hitung total hari ini
        const today = new Date().toDateString();
        const todayTotal = (data.transactions || [])
          .filter((t: Transaction) => new Date(t.timestamp).toDateString() === today)
          .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);
        setTotalToday(todayTotal);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      const interval = setInterval(() => fetchTransactions(secret), 10000);
      return () => clearInterval(interval);
    }
  }, [loggedIn, secret]);

  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.logo}>💳</div>
          <h1 style={styles.loginTitle}>QRIS Dashboard</h1>
          <p style={styles.loginSub}>Market Phone NanoJS</p>
          <input
            type="password"
            placeholder="Masukkan secret key..."
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={styles.input}
          />
          <button onClick={login} style={styles.loginBtn}>
            Masuk →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.headerTitle}>💳 QRIS Dashboard</h1>
            <p style={styles.headerSub}>Market Phone NanoJS</p>
          </div>
          <div style={styles.liveTag}>● LIVE</div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Transaksi</div>
            <div style={styles.statValue}>{transactions.length}</div>
          </div>
          <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #00c853, #00e676)" }}>
            <div style={styles.statLabel}>Masuk Hari Ini</div>
            <div style={styles.statValue}>
              Rp {totalToday.toLocaleString("id-ID")}
            </div>
          </div>
          <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #ff6f00, #ffa000)" }}>
            <div style={styles.statLabel}>Saldo Terakhir</div>
            <div style={styles.statValue}>
              {transactions.length > 0
                ? `Rp ${transactions[0].saldo_akhir.toLocaleString("id-ID")}`
                : "-"}
            </div>
          </div>
        </div>

        {/* Setup Info */}
        <div style={styles.infoBox}>
          <strong>📋 URL Callback Anda:</strong>
          <code style={styles.code}>
            https://domain-anda.vercel.app/api/callback-qris/<span style={{ color: "#ff6f00" }}>{secret}</span>
          </code>
          <p style={styles.infoNote}>
            Daftarkan URL ini di pengaturan H2H QRIS SMP Payment sebagai Report URL.
          </p>
        </div>

        {/* Transactions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Riwayat Transaksi</h2>
          {loading ? (
            <div style={styles.empty}>Memuat...</div>
          ) : transactions.length === 0 ? (
            <div style={styles.empty}>
              Belum ada transaksi masuk. Coba scan QRIS untuk test!
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Waktu</th>
                    <th style={styles.th}>Pengirim</th>
                    <th style={styles.th}>Bank/Dompet</th>
                    <th style={styles.th}>Nominal</th>
                    <th style={styles.th}>Saldo Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.tr_id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.td}>{new Date(t.timestamp).toLocaleString("id-ID")}</td>
                      <td style={styles.td}>{t.PayerName}</td>
                      <td style={styles.td}>{t.issuer}</td>
                      <td style={{ ...styles.td, color: "#00c853", fontWeight: "700" }}>
                        Rp {parseFloat(t.amount).toLocaleString("id-ID")}
                      </td>
                      <td style={styles.td}>Rp {t.saldo_akhir.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={styles.refresh}>Auto-refresh setiap 10 detik</p>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loginPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0a",
    fontFamily: "'Segoe UI', sans-serif",
  },
  loginCard: {
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 20,
    padding: "48px 40px",
    textAlign: "center",
    width: "100%",
    maxWidth: 380,
  },
  logo: { fontSize: 52, marginBottom: 12 },
  loginTitle: { color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px" },
  loginSub: { color: "#666", fontSize: 14, marginBottom: 32 },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid #333",
    background: "#0a0a0a",
    color: "#fff",
    fontSize: 16,
    boxSizing: "border-box",
    outline: "none",
    marginBottom: 16,
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  page: { minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Segoe UI', sans-serif", color: "#fff" },
  header: { background: "#111", borderBottom: "1px solid #222", padding: "16px 24px" },
  headerInner: { maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: 800, margin: 0 },
  headerSub: { color: "#555", fontSize: 13, margin: "4px 0 0" },
  liveTag: { background: "#00c853", color: "#000", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  main: { maxWidth: 1100, margin: "0 auto", padding: "24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: {
    background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
    borderRadius: 16,
    padding: "20px 24px",
  },
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 6 },
  statValue: { color: "#fff", fontSize: 22, fontWeight: 800 },
  infoBox: {
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 24,
  },
  code: {
    display: "block",
    background: "#0a0a0a",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    margin: "10px 0 8px",
    wordBreak: "break-all",
    color: "#7ec8e3",
  },
  infoNote: { color: "#666", fontSize: 13, margin: 0 },
  section: { background: "#111", border: "1px solid #222", borderRadius: 16, padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 20 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 14px", color: "#666", fontSize: 13, fontWeight: 600, borderBottom: "1px solid #222" },
  td: { padding: "12px 14px", fontSize: 14, color: "#ddd" },
  rowEven: { background: "transparent" },
  rowOdd: { background: "#161616" },
  empty: { textAlign: "center", color: "#555", padding: "40px 0", fontSize: 15 },
  refresh: { textAlign: "center", color: "#333", fontSize: 12, marginTop: 16 },
};
