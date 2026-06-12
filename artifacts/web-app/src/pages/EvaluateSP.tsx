import { useState } from "react";

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

interface Critere {
  score: number;
  sur: number;
  suggestion: string;
}

interface EvalData {
  evaluation_globale: {
    note_sur_20: number;
    niveau_qualite: string;
    resume_evaluateur: string;
  };
  criteres: {
    obstacle: Critere;
    sens_motivation: Critere;
    coherence_pedagogique: Critere;
    alignement_programme: Critere;
    dispositif_pedagogique: Critere;
    differenciation: Critere;
  };
  recommandations_prioritaires: Array<{
    priorite: string;
    critere_concerne: string;
    action: string;
  }>;
  verdict_usage: {
    utilisable_en_classe: boolean;
    message_enseignant: string;
  };
}

function getBarColor(pct: number) {
  if (pct < 0.5) return "var(--red)";
  if (pct < 0.75) return "var(--orange)";
  return "var(--green)";
}

function CritereBar({
  label,
  critere,
}: {
  label: string;
  critere: Critere;
}) {
  const pct = critere.score / critere.sur;
  const color = getBarColor(pct);
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{label}</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            color: color,
            fontWeight: 700,
          }}
        >
          {critere.score}/{critere.sur}
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 100,
          background: "var(--bg3)",
          overflow: "hidden",
          marginBottom: 7,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round(pct * 100)}%`,
            background: color,
            borderRadius: 100,
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.55 }}>
        {critere.suggestion}
      </p>
    </div>
  );
}

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
      } else {
        setError(json.message || "Erreur lors de l'évaluation.");
      }
    } catch {
      setError("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const note = result?.evaluation_globale.note_sur_20 ?? 0;
  const noteColor =
    note >= 14
      ? "var(--green)"
      : note >= 10
      ? "var(--orange)"
      : "var(--red)";

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
          <div>
            {/* Score card */}
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: "28px 26px",
                marginBottom: 16,
                display: "flex",
                gap: 24,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: `3px solid ${noteColor}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: `color-mix(in srgb, ${noteColor} 10%, transparent)`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 28,
                    fontWeight: 700,
                    color: noteColor,
                    lineHeight: 1,
                  }}
                >
                  {note}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "var(--text3)",
                  }}
                >
                  /20
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: 100,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    background: `color-mix(in srgb, ${noteColor} 15%, transparent)`,
                    color: noteColor,
                    border: `1px solid color-mix(in srgb, ${noteColor} 35%, transparent)`,
                    marginBottom: 10,
                  }}
                >
                  {result.evaluation_globale.niveau_qualite}
                </span>
                <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.65 }}>
                  {result.evaluation_globale.resume_evaluateur}
                </p>
              </div>
            </div>

            {/* Critères */}
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: "24px 26px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--accent)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: 22,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>📊</span> Critères d'évaluation
              </div>
              <CritereBar label="Obstacle épistémologique" critere={result.criteres.obstacle} />
              <CritereBar label="Sens et motivation" critere={result.criteres.sens_motivation} />
              <CritereBar label="Cohérence pédagogique" critere={result.criteres.coherence_pedagogique} />
              <CritereBar label="Alignement programme" critere={result.criteres.alignement_programme} />
              <CritereBar label="Dispositif pédagogique" critere={result.criteres.dispositif_pedagogique} />
              <CritereBar label="Différenciation" critere={result.criteres.differenciation} />
            </div>

            {/* Recommandations */}
            {result.recommandations_prioritaires?.length > 0 && (
              <div
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: 18,
                  padding: "24px 26px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--accent)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>🎯</span> Recommandations prioritaires
                </div>
                {result.recommandations_prioritaires.map((r, i) => {
                  const prioColor =
                    r.priorite?.toLowerCase() === "haute"
                      ? "var(--red)"
                      : r.priorite?.toLowerCase() === "moyenne"
                      ? "var(--orange)"
                      : "var(--green)";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 14,
                        marginBottom: 14,
                        paddingBottom: 14,
                        borderBottom:
                          i < result.recommandations_prioritaires.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 9px",
                          borderRadius: 100,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          fontWeight: 700,
                          background: `color-mix(in srgb, ${prioColor} 15%, transparent)`,
                          color: prioColor,
                          border: `1px solid color-mix(in srgb, ${prioColor} 35%, transparent)`,
                          height: "fit-content",
                          flexShrink: 0,
                          marginTop: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.priorite}
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "var(--text3)",
                            marginBottom: 4,
                          }}
                        >
                          {r.critere_concerne}
                        </div>
                        <div style={{ fontSize: 14, color: "var(--text2)" }}>{r.action}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Verdict */}
            <div
              style={{
                background: result.verdict_usage.utilisable_en_classe
                  ? "color-mix(in srgb, var(--green) 10%, transparent)"
                  : "color-mix(in srgb, var(--red) 10%, transparent)",
                border: `1px solid ${
                  result.verdict_usage.utilisable_en_classe
                    ? "color-mix(in srgb, var(--green) 35%, transparent)"
                    : "color-mix(in srgb, var(--red) 35%, transparent)"
                }`,
                borderRadius: 18,
                padding: "22px 26px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ fontSize: 32 }}>
                {result.verdict_usage.utilisable_en_classe ? "✅" : "🔄"}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: result.verdict_usage.utilisable_en_classe
                      ? "var(--green)"
                      : "var(--red)",
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {result.verdict_usage.utilisable_en_classe
                    ? "Utilisable en classe"
                    : "À retravailler"}
                </div>
                <p style={{ fontSize: 14, color: "var(--text2)" }}>
                  {result.verdict_usage.message_enseignant}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--bg2); color: var(--text); }
      `}</style>
    </main>
  );
}
