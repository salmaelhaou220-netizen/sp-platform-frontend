import { useState, useEffect } from "react";
import Home from "./pages/Home";
import GenerateSP from "./pages/GenerateSP";
import EvaluateSP from "./pages/EvaluateSP";

type Page = "home" | "generate" | "evaluate";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
    }
  }, [isDark]);

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: 10,
    border: active ? "1px solid var(--accent)" : "1px solid transparent",
    background: active ? "var(--accent-glow)" : "transparent",
    color: active ? "var(--accent)" : "var(--text2)",
    fontFamily: "'Sora', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          transition: "background 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Logo */}
          <button
            onClick={() => setPage("home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 20 }}>⚡</span>
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "var(--text)",
                letterSpacing: "-0.01em",
              }}
            >
              Plateforme SP
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 6,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text3)",
                whiteSpace: "nowrap",
              }}
            >
              Tronc Commun · Maroc
            </span>
          </button>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 6, marginLeft: 12 }}>
            <button
              style={navBtnStyle(page === "generate")}
              onClick={() => setPage("generate")}
            >
              ✦ Générer SP
            </button>
            <button
              style={navBtnStyle(page === "evaluate")}
              onClick={() => setPage("evaluate")}
            >
              ◈ Évaluer SP
            </button>
          </nav>

          <div style={{ flex: 1 }} />

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg3)",
              color: "var(--text)",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            }}
          >
            {isDark ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* PAGE CONTENT */}
      {page === "home" && <Home onNavigate={(p) => setPage(p as Page)} />}
      {page === "generate" && <GenerateSP />}
      {page === "evaluate" && <EvaluateSP />}
    </div>
  );
}
