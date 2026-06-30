import { useState } from "react";
import { supabase } from "../lib/supabase";
import SPEvaluationDisplay, { type EvalData } from "../components/SPEvaluationDisplay";

const BACKEND = "https://sp-platform-backend.onrender.com";

const MODULES = [
  "Module 1 — Généralités sur les systèmes informatiques",
  "Module 2 — Les logiciels",
  "Module 3 — Algorithmique et programmation",
  "Module 4 — Réseaux et Internet",
];

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  background: "var(--bg3)",
  color: "var(--text)",
  fontFamily: "'Sora', sans-serif",
  fontSize: 14,
  outline: "none",
  cursor: "pointer",
  transition: "border-color 0.2s",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b90a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 36,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  background: "var(--bg3)",
  color: "var(--text)",
  fontFamily: "'Sora', sans-serif",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text3)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 7,
};



export default function EvaluateSP({ user }: { user: any }) {
  const [moduleIdx, setModuleIdx] = useState(0);
  const [seance, setSeance] = useState("");
  const [situationText, setSituationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalData | null>(null);
  const [error, setError] = useState("");

  const handleEvaluate = async () => {
    if (!situationText.trim()) {
      setError("Veuillez saisir la situation-problème à évaluer.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const body = {
      module: MODULES[moduleIdx],
      seance: seance || undefined,
      situation_probleme: situationText,
    };

    try {
      const res = await fetch(`${BACKEND}/evaluate-sp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        if (user) {
          try {
            await supabase.from("situations_problemes").insert({
              user_id: user.id,
              titre: seance ? `Évaluation — ${seance}` : "Évaluation situation-problème",
              type_sp: "evaluation",
              module: MODULES[moduleIdx],
              contenu_vise: seance || "Sans séance",
              profils_vark: [],
              data: {
                evaluation: json.data,
                situation_probleme: situationText,
              },
            });
          } catch (err) {
            console.error("Erreur sauvegarde Supabase:", err);
          }
        }
      } else {
        setError(json.message || "Erreur lors de l'évaluation.");
      }
    } catch {
      setError("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: 24,
        padding: "32px 24px 60px",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        alignItems: "start",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          padding: "28px 24px",
          position: "sticky",
          top: 24,
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
          ◈ Évaluer une SP
        </h2>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 28 }}>
          Soumettez une SP pour obtenir un rapport pédagogique
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Module */}
          <div>
            <label style={labelStyle}>Module</label>
            <select
              style={selectStyle}
              value={moduleIdx}
              onChange={(e) => setModuleIdx(Number(e.target.value))}
            >
              {MODULES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>

          {/* Séance */}
          <div>
            <label style={labelStyle}>Séance / Séquence</label>
            <input
              type="text"
              style={inputStyle}
              value={seance}
              onChange={(e) => setSeance(e.target.value)}
              placeholder="ex: Séance 3 — Structure sélective"
            />
          </div>

          {/* Situation-problème */}
          <div>
            <label style={labelStyle}>Situation-problème</label>
            <textarea
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 200,
                lineHeight: 1.65,
              }}
              rows={12}
              value={situationText}
              onChange={(e) => setSituationText(e.target.value)}
              placeholder="Collez ici votre situation-problème complète…"
            />
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "13px",
              borderRadius: 12,
              border: "none",
              background: loading
                ? "var(--bg3)"
                : "linear-gradient(135deg, var(--accent2), var(--accent))",
              color: loading ? "var(--text3)" : "#fff",
              fontFamily: "'Sora', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span>
                Évaluation…
              </>
            ) : (
              "◈ Lancer l'évaluation"
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div>
        {error && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: "color-mix(in srgb, var(--red) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)",
              color: "var(--red)",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {!loading && !result && !error && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              gap: 16,
              color: "var(--text3)",
            }}
          >
            <div style={{ fontSize: 56, opacity: 0.4 }}>◈</div>
            <p style={{ fontSize: 15, textAlign: "center" }}>
              Soumettez une SP pour recevoir<br />
              <strong style={{ color: "var(--accent2)" }}>un rapport d'évaluation /20</strong>
            </p>
          </div>
        )}

        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              gap: 20,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid var(--border)",
                borderTopColor: "var(--accent2)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              Analyse pédagogique en cours…
            </p>
          </div>
        )}

        {result && (
          <SPEvaluationDisplay result={result} />
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--bg2); color: var(--text); }
      `}</style>
    </main>
  );
}
