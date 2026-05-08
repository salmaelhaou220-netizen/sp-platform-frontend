import { useState, useEffect } from "react";

interface SPEntry {
  id: number;
  titre: string;
  module: string;
  type_sp: string;
  profils_vark: string;
  date: string;
}

const TYPE_COLOR: Record<string, string> = {
  didactique: "var(--accent)",
  formative: "var(--orange)",
  sommative: "var(--red)",
};

const TYPE_LABEL: Record<string, string> = {
  didactique: "📚 Didactique",
  formative: "🔍 Formative",
  sommative: "📋 Sommative",
};

function getThisWeekCount(entries: SPEntry[]) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return entries.filter((e) => {
    const [day, month, year] = e.date.split("/").map(Number);
    const d = new Date(year, month - 1, day);
    return d >= startOfWeek;
  }).length;
}

export default function Dashboard() {
  const [history, setHistory] = useState<SPEntry[]>([]);
  const [evalCount] = useState(() => {
    try { return Number(localStorage.getItem("sp_eval_count") || "0"); } catch { return 0; }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sp_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleDelete = (id: number) => {
    const updated = history.filter((e) => e.id !== id);
    setHistory(updated);
    try { localStorage.setItem("sp_history", JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const thisWeek = getThisWeekCount(history);

  const stats = [
    { label: "SP générées", value: history.length, color: "var(--accent)", icon: "✦" },
    { label: "SP évaluées", value: evalCount, color: "var(--accent2)", icon: "◈" },
    { label: "Cette semaine", value: thisWeek, color: "var(--green)", icon: "📅" },
  ];

  return (
    <main style={{ flex: 1, padding: "32px 24px 60px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>📊 Tableau de bord</h1>
      <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 32 }}>
        Historique de vos situations-problèmes générées
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "22px 24px",
            borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 34,
              fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 6,
            }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--text3)", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Historique des SP
          </span>
          {history.length > 0 && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text3)" }}>
              {history.length} entrée{history.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 14, color: "var(--text3)" }}>
            <div style={{ fontSize: 52, opacity: 0.3 }}>✦</div>
            <p style={{ fontSize: 15, textAlign: "center", lineHeight: 1.65 }}>
              Aucune SP générée pour l'instant.<br />
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>Générez votre première situation-problème</span> pour la voir apparaître ici.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Titre", "Module", "Type", "Profil VARK", "Date", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                      fontWeight: 700, color: "var(--text3)", textTransform: "uppercase",
                      letterSpacing: "0.06em", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((entry, i) => {
                  const tc = TYPE_COLOR[entry.type_sp] || "var(--accent)";
                  return (
                    <tr key={entry.id} style={{
                      borderBottom: i < history.length - 1 ? "1px solid var(--border)" : "none",
                      transition: "background 0.15s",
                    }}
                      onMouseOver={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg3)"}
                      onMouseOut={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)", maxWidth: 240 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.titre}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text2)", maxWidth: 200 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.module?.replace(/Module \d+ — /, "M") || "—"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 100,
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
                          background: `color-mix(in srgb, ${tc} 14%, transparent)`,
                          color: tc, border: `1px solid color-mix(in srgb, ${tc} 35%, transparent)`,
                          whiteSpace: "nowrap",
                        }}>
                          {TYPE_LABEL[entry.type_sp] || entry.type_sp}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {(entry.profils_vark || "").split(", ").filter(Boolean).map((p) => (
                            <span key={p} style={{
                              padding: "2px 8px", borderRadius: 100,
                              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                              background: "var(--bg3)", color: "var(--accent2)",
                              border: "1px solid var(--border)",
                            }}>{p}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>
                        {entry.date}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            title="Supprimer"
                            style={{
                              padding: "5px 12px", borderRadius: 8, fontSize: 12,
                              border: "1px solid color-mix(in srgb, var(--red) 35%, transparent)",
                              background: "color-mix(in srgb, var(--red) 10%, transparent)",
                              color: "var(--red)", fontFamily: "'Sora', sans-serif",
                              fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                            }}
                            onMouseOver={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in srgb, var(--red) 20%, transparent)";
                            }}
                            onMouseOut={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in srgb, var(--red) 10%, transparent)";
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
