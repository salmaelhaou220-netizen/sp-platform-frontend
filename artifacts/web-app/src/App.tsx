import { useState, useEffect } from "react";
import Home from "./pages/Home";
import GenerateSP from "./pages/GenerateSP";
import EvaluateSP from "./pages/EvaluateSP";
import Dashboard from "./pages/Dashboard";
import { supabase } from "./lib/supabase";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ErrorBoundary from "./components/ErrorBoundary";

type Page = "home" | "generate" | "evaluate" | "dashboard";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    borderRadius: 100, // Pill-shaped tabs
    border: active ? "1px solid #C7D9FD" : "1px solid transparent",
    background: active ? "#EBF2FF" : "transparent",
    color: active ? "#3B6FF0" : "#4A5568",
    fontFamily: "'Sora', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  });

  if (authLoading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#F7F9FC",
        gap: 20
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "3px solid #DDE3ED",
          borderTopColor: "#3B6FF0",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "#4A5568", fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
          Chargement de la session…
        </p>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return authPage === "login" ? (
      <LoginPage setPage={(p) => setAuthPage(p as "login" | "register")} />
    ) : (
      <RegisterPage setPage={(p) => setAuthPage(p as "login" | "register")} />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F7F9FC" }}>
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#FFFFFF",
          borderBottom: "1px solid #DDE3ED",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          height: 64,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Left Side: Logo + App Name + Badge */}
          <button
            onClick={() => setPage("home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
          >
            {/* Logo: gradient circle (blue to purple) with ⚡ icon, 36px */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3B6FF0, #6B4FD8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "bold",
              flexShrink: 0,
            }}>
              ⚡
            </div>
            
            <span style={{ fontWeight: 800, fontSize: 16, color: "#0F1117", letterSpacing: "-0.01em" }}>
              Plateforme SP
            </span>
            
            {/* Badge Tronc Commun · Maroc */}
            <span style={{
              padding: "4px 12px",
              borderRadius: 100,
              fontFamily: "'Sora', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              background: "#EBF2FF",
              color: "#3B6FF0",
              border: "1px solid #C7D9FD",
              whiteSpace: "nowrap",
            }}>
              Tronc Commun · Maroc
            </span>
          </button>

          {/* Center Navigation Tabs */}
          <nav style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              style={navBtnStyle(page === "generate")}
              onClick={() => setPage("generate")}
              onMouseOver={(e) => {
                if (page !== "generate") {
                  (e.currentTarget as HTMLButtonElement).style.background = "#F0F4FF";
                }
              }}
              onMouseOut={(e) => {
                if (page !== "generate") {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }
              }}
            >
              ✦ Générer SP
            </button>
            <button
              style={navBtnStyle(page === "evaluate")}
              onClick={() => setPage("evaluate")}
              onMouseOver={(e) => {
                if (page !== "evaluate") {
                  (e.currentTarget as HTMLButtonElement).style.background = "#F0F4FF";
                }
              }}
              onMouseOut={(e) => {
                if (page !== "evaluate") {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }
              }}
            >
              ◈ Évaluer SP
            </button>
            <button
              style={navBtnStyle(page === "dashboard")}
              onClick={() => setPage("dashboard")}
              onMouseOver={(e) => {
                if (page !== "dashboard") {
                  (e.currentTarget as HTMLButtonElement).style.background = "#F0F4FF";
                }
              }}
              onMouseOut={(e) => {
                if (page !== "dashboard") {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }
              }}
            >
              📊 Tableau de bord
            </button>
          </nav>

          {/* Right Side: User Dropdown */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px",
                borderRadius: 100,
                border: "1px solid #DDE3ED",
                background: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color: "#0F1117",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: 13,
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B6FF0"; }}
              onMouseOut={(e) => { if (!dropdownOpen) (e.currentTarget as HTMLButtonElement).style.borderColor = "#DDE3ED"; }}
            >
              {/* Avatar circle: gradient blue-purple, white letter, 34px */}
              <div style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3B6FF0, #6B4FD8)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
                textTransform: "uppercase",
              }}>
                {user.email?.charAt(0) || "?"}
              </div>
              <span style={{
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {user.user_metadata?.full_name || (user.email ? (user.email.length > 20 ? user.email.slice(0, 17) + "..." : user.email) : "Profil")}
              </span>
              <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
            </button>

            {dropdownOpen && (
              <>
                <div
                  onClick={() => setDropdownOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 998 }}
                />
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: 8,
                  width: 220,
                  background: "#FFFFFF",
                  border: "1px solid #DDE3ED",
                  borderRadius: 14,
                  padding: "12px 8px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  zIndex: 999,
                }}>
                  <div style={{ padding: "4px 12px 10px", borderBottom: "1px solid #DDE3ED", marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: "#9BA3BB", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Compte</div>
                    <div style={{ fontSize: 12, color: "#4A5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={user.email}>
                      {user.email}
                    </div>
                  </div>

                  {/* Se Déconnecter */}
                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      await supabase.auth.signOut();
                      setUser(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "transparent",
                      color: "#DC2626",
                      cursor: "pointer",
                      fontSize: 13,
                      textAlign: "left",
                      width: "100%",
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 600,
                    }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2"; }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span>🚪</span>
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      {page === "home" && <Home user={user} onNavigate={(p) => setPage(p as Page)} />}
      {page === "generate" && <ErrorBoundary><GenerateSP user={user} /></ErrorBoundary>}
      {page === "evaluate" && <EvaluateSP user={user} />}
      {page === "dashboard" && <Dashboard user={user} onNavigate={(p) => setPage(p as Page)} />}
    </div>
  );
}
