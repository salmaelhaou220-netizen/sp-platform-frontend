import { useState, useEffect } from "react";
import SPResultDisplay, { type SPResult } from "../components/SPResultDisplay";
import SPEvaluationDisplay from "../components/SPEvaluationDisplay";
import { supabase } from "../lib/supabase";
import { exportAsPDF, exportAsWord } from "../utils/exportSP";

interface SPEntry {
  id: string;
  titre: string;
  type_sp: string;
  module: string;
  contenu_vise: string;
  profils: string[];
  date: string;
  data: SPResult;
}

const TYPE_COLOR: Record<string, string> = {
  didactique: "var(--accent)",
  formative: "var(--orange)",
  sommative: "var(--red)",
  evaluation: "var(--green)",
};
const TYPE_LABEL: Record<string, string> = {
  didactique: "📚 Didactique",
  formative: "🔍 Formative",
  sommative: "📋 Sommative",
  evaluation: "📝 Évaluation",
};
const PROFIL_LABEL: Record<string, string> = { V: "👁 V", A: "👂 A", R: "📖 R", K: "🤸 K" };

// ── Detail Modal ──────────────────────────────────────────────────────────
function DetailModal({ entry, onClose }: { entry: SPEntry; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "24px 16px", overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 20, width: "100%", maxWidth: 880,
          marginTop: 0, position: "relative",
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, background: "var(--bg)", borderRadius: "20px 20px 0 0", zIndex: 10,
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {entry.type_sp === "evaluation" ? "📝 Détail Évaluation" : "📄 Détail SP"}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {entry.type_sp !== "evaluation" && (
              <>
                <button
                  onClick={() => exportAsPDF(entry.data)}
                  style={{
                    padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                    border: "1px solid var(--red)", background: "var(--bg3)",
                    color: "var(--red)", cursor: "pointer", fontFamily: "'Sora', sans-serif",
                  }}
                >🖨️ PDF</button>
                <button
                  onClick={() => exportAsWord(entry.data)}
                  style={{
                    padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                    border: "1px solid var(--accent)", background: "var(--bg3)",
                    color: "var(--accent)", cursor: "pointer", fontFamily: "'Sora', sans-serif",
                  }}
                >📄 Word</button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)",
                background: "var(--bg3)", color: "var(--text2)", fontSize: 18,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
        </div>
        {/* Modal Content */}
        <div style={{ padding: "24px" }}>
          {entry.type_sp === "evaluation" ? (
            <SPEvaluationDisplay
              result={entry.data.evaluation}
              situationText={entry.data.situation_probleme}
            />
          ) : (
            <SPResultDisplay result={entry.data} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard({ user, onNavigate }: { user: any; onNavigate?: (page: string) => void }) {
  const [history, setHistory] = useState<SPEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "generated" | "evaluated">("all");
  const [modalEntry, setModalEntry] = useState<SPEntry | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchSP = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('situations_problemes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching situations_problemes:", error);
        } else if (data) {
          const mapped: SPEntry[] = data.map((dbRow: any) => ({
            id: dbRow.id,
            titre: dbRow.titre,
            type_sp: dbRow.type_sp,
            module: dbRow.module,
            contenu_vise: dbRow.contenu_vise,
            profils: dbRow.profils_vark || [],
            date: dbRow.created_at ? new Date(dbRow.created_at).toLocaleDateString("fr-MA") : "",
            data: dbRow.data
          }));
          setHistory(mapped);
        }
      } catch (err) {
        console.error("Exception fetching situations_problemes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSP();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('situations_problemes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting situation_probleme:", error);
      } else {
        setHistory((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Exception deleting situation_probleme:", err);
    }
  };

  // Stats
  const totalSP = history.filter((e) => e.type_sp !== "evaluation").length;
  const totalEval = history.filter((e) => e.type_sp === "evaluation").length;

  // Unique modules for filter
  const modules = Array.from(new Set(history.map((e) => e.module).filter(Boolean)));

  // Filtered list
  const filtered = history.filter((e) => {
    const moduleOk = !filterModule || e.module === filterModule;
    const tabOk =
      activeTab === "all" ||
      (activeTab === "generated" && e.type_sp !== "evaluation") ||
      (activeTab === "evaluated" && e.type_sp === "evaluation");
    return moduleOk && tabOk;
  });

  const stats = [
    { label: "Situations-problèmes générées", value: totalSP, color: "var(--accent)", icon: "📚" },
    { label: "Situations-problèmes évaluées", value: totalEval, color: "var(--green)", icon: "📝" },
  ];

  return (
    <>
      <main style={{ flex: 1, padding: "32px 24px 60px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>📊 Tableau de bord</h1>
        <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 32 }}>
          Historique de vos situations-problèmes et de vos rapports d'évaluation
        </p>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "22px 24px", borderTop: `3px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text3)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        {history.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            {([
              { id: "all", label: "📁 Tout", count: history.length },
              { id: "generated", label: "📚 Générées", count: totalSP },
              { id: "evaluated", label: "📝 Évaluées", count: totalEval }
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: activeTab === t.id ? "var(--accent-glow)" : "transparent",
                  color: activeTab === t.id ? "var(--accent)" : "var(--text2)",
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s"
                }}
              >
                <span>{t.label}</span>
                <span style={{
                  fontSize: 11, padding: "1px 6px", borderRadius: 100,
                  background: "var(--bg3)", color: "var(--text3)"
                }}>{t.count}</span>
              </button>
            ))}
          </div>
        )}
 
        {/* Filter bar */}
        {history.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            {/* Module dropdown */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              style={{
                padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)",
                background: "var(--bg2)", color: "var(--text)", fontFamily: "'Sora', sans-serif",
                fontSize: 13, outline: "none", cursor: "pointer",
              }}
            >
              <option value="">Tous les modules</option>
              {modules.map((m) => <option key={m} value={m}>{m?.split("—")[0]?.trim()}</option>)}
            </select>
          </div>
        )}

        {/* Loading, Empty, and List states */}
        {loading ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 24px", gap: 16, color: "var(--text3)",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 14 }}>Chargement de l'historique…</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 24px", gap: 16, color: "var(--text3)",
          }}>
            <div style={{ fontSize: 56, opacity: 0.25 }}>📂</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text2)" }}>Aucune SP sauvegardée</p>
            <p style={{ fontSize: 14, textAlign: "center", lineHeight: 1.65, maxWidth: 380 }}>
              Générez votre première situation-problème pour la voir apparaître ici.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate("generate")}
                style={{
                  marginTop: 8, padding: "12px 24px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Sora', sans-serif",
                }}
              >⚡ Générer une SP</button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18,
            padding: "48px 24px", textAlign: "center", color: "var(--text3)", fontSize: 14,
          }}>
            Aucun résultat pour ce filtre.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {filtered.map((entry) => {
              const tc = TYPE_COLOR[entry.type_sp] || "var(--accent)";
              return (
                <div key={entry.id} style={{
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: 16, padding: "20px 22px",
                  borderTop: `3px solid ${tc}`, transition: "box-shadow 0.2s",
                }}
                  onMouseOver={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px var(--shadow)"}
                  onMouseOut={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
                >
                  {/* Title */}
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12, lineHeight: 1.4 }}>
                    {entry.titre}
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {/* Module */}
                    <span style={{
                      padding: "2px 9px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: "var(--bg3)", color: "var(--text3)", border: "1px solid var(--border)",
                    }}>{entry.module?.split("—")[0]?.trim() || "—"}</span>
                    {/* Type */}
                    <span style={{
                      padding: "2px 9px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: `color-mix(in srgb, ${tc} 14%, transparent)`,
                      color: tc, border: `1px solid color-mix(in srgb, ${tc} 35%, transparent)`,
                    }}>{TYPE_LABEL[entry.type_sp] || entry.type_sp}</span>
                    {/* VARK profils or score */}
                    {entry.type_sp === "evaluation" ? (
                      (() => {
                        const note = entry.data?.evaluation?.evaluation_globale?.note_sur_20 ?? 0;
                        const noteColor = note >= 14 ? "var(--green)" : note >= 10 ? "var(--orange)" : "var(--red)";
                        return (
                          <span style={{
                            padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace",
                            background: `color-mix(in srgb, ${noteColor} 14%, transparent)`,
                            color: noteColor, border: `1px solid color-mix(in srgb, ${noteColor} 35%, transparent)`,
                          }}>
                            🎯 {note}/20
                          </span>
                        );
                      })()
                    ) : (
                      (entry.profils || []).map((p) => (
                        <span key={p} style={{
                          padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          background: "var(--bg3)", color: "var(--accent2)", border: "1px solid var(--border)",
                        }}>{PROFIL_LABEL[p] || p}</span>
                      ))
                    )}
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 16 }}>
                    📅 {entry.date}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setModalEntry(entry)}
                      style={{
                        flex: 1, padding: "8px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                        border: "1px solid var(--border)", background: "var(--bg3)",
                        color: "var(--text2)", cursor: "pointer", fontFamily: "'Sora', sans-serif",
                        transition: "all 0.15s",
                      }}
                      onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)"; }}
                      onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
                    >👁 Consulter</button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                        border: "1px solid color-mix(in srgb, var(--red) 35%, transparent)",
                        background: "color-mix(in srgb, var(--red) 8%, transparent)",
                        color: "var(--red)", cursor: "pointer", fontFamily: "'Sora', sans-serif",
                        transition: "all 0.15s",
                      }}
                      onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in srgb, var(--red) 18%, transparent)"; }}
                      onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in srgb, var(--red) 8%, transparent)"; }}
                    >🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {modalEntry && <DetailModal entry={modalEntry} onClose={() => setModalEntry(null)} />}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
