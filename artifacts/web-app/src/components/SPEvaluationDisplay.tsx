import React from "react";

interface Critere {
  score: number;
  sur: number;
  suggestion: string;
}

export interface EvalData {
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

interface SPEvaluationDisplayProps {
  result: EvalData;
  situationText?: string;
}

function getBarColor(pct: number) {
  if (pct < 0.5) return "var(--red)";
  if (pct < 0.75) return "var(--orange)";
  return "var(--green)";
}

function CritereBar({ label, critere }: { label: string; critere: Critere }) {
  if (!critere) return null;
  const pct = critere.score / critere.sur;
  const color = getBarColor(pct);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: color, fontWeight: 700 }}>
          {critere.score}/{critere.sur}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: "var(--bg3)", overflow: "hidden", marginBottom: 7 }}>
        <div style={{ height: "100%", width: `${Math.round(pct * 100)}%`, background: color, borderRadius: 100, transition: "width 0.8s ease" }} />
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.55 }}>
        {critere.suggestion}
      </p>
    </div>
  );
}

export default function SPEvaluationDisplay({ result, situationText }: SPEvaluationDisplayProps) {
  const note = result.evaluation_globale.note_sur_20 ?? 0;
  const noteColor = note >= 14 ? "var(--green)" : note >= 10 ? "var(--orange)" : "var(--red)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      
      {/* Original Situation (Collapsible or Card) */}
      {situationText && (
        <div style={{
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "18px 20px"
        }}>
          <details>
            <summary style={{
              cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12, fontWeight: 700, color: "var(--text2)",
              userSelect: "none", outline: "none"
            }}>
              📄 Voir la situation-problème évaluée
            </summary>
            <p style={{
              marginTop: 14, fontSize: 13.5, color: "var(--text2)",
              lineHeight: 1.65, whiteSpace: "pre-wrap",
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 8, padding: 14, maxHeight: 250, overflowY: "auto"
            }}>
              {situationText}
            </p>
          </details>
        </div>
      )}

      {/* Global Score Card */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 18, padding: "28px 26px",
        display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
      }}>
        <div style={{
          width: 90, height: 90, borderRadius: "50%",
          border: `3px solid ${noteColor}`, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContext: "center",
          justifyContent: "center", flexShrink: 0,
          background: `color-mix(in srgb, ${noteColor} 10%, transparent)`,
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: noteColor, lineHeight: 1 }}>
            {note}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text3)" }}>
            /20
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{
            display: "inline-block", padding: "4px 12px", borderRadius: 100,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
            background: `color-mix(in srgb, ${noteColor} 15%, transparent)`,
            color: noteColor, border: `1px solid color-mix(in srgb, ${noteColor} 35%, transparent)`,
            marginBottom: 10,
          }}>
            {result.evaluation_globale.niveau_qualite}
          </span>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.65 }}>
            {result.evaluation_globale.resume_evaluateur}
          </p>
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 18, padding: "24px 26px",
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
          color: "var(--accent)", letterSpacing: "0.05em", textTransform: "uppercase",
          marginBottom: 22, display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>📊</span> Critères d'évaluation
        </div>
        <CritereBar label="Obstacle épistémologique" critere={result.criteres.obstacle} />
        <CritereBar label="Sens et motivation" critere={result.criteres.sens_motivation} />
        <CritereBar label="Cohérence pédagogique" critere={result.criteres.coherence_pedagogique} />
        <CritereBar label="Alignement programme" critere={result.criteres.alignement_programme} />
        <CritereBar label="Dispositif pédagogique" critere={result.criteres.dispositif_pedagogique} />
        <CritereBar label="Différenciation" critere={result.criteres.differenciation} />
      </div>

      {/* Recommendations */}
      {result.recommandations_prioritaires?.length > 0 && (
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 18, padding: "24px 26px",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
            color: "var(--accent)", letterSpacing: "0.05em", textTransform: "uppercase",
            marginBottom: 18, display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>🎯</span> Recommandations prioritaires
          </div>
          {result.recommandations_prioritaires.map((r, i) => {
            const prioriteStr = r.priorite ? String(r.priorite).toLowerCase() : "";
            const prioColor =
              prioriteStr === "haute" || prioriteStr === "1"
                ? "var(--red)"
                : prioriteStr === "moyenne" || prioriteStr === "2"
                ? "var(--orange)"
                : "var(--green)";
            return (
              <div key={i} style={{
                display: "flex", gap: 14, marginBottom: 14, paddingBottom: 14,
                borderBottom: i < result.recommandations_prioritaires.length - 1 ? "1px solid var(--border)" : "none"
              }}>
                <span style={{
                  padding: "2px 9px", borderRadius: 100,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                  background: `color-mix(in srgb, ${prioColor} 15%, transparent)`,
                  color: prioColor, border: `1px solid color-mix(in srgb, ${prioColor} 35%, transparent)`,
                  height: "fit-content", flexShrink: 0, marginTop: 2, whiteSpace: "nowrap"
                }}>
                  {r.priorite}
                </span>
                <div>
                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--text3)", marginBottom: 4 }}>
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
      <div style={{
        background: result.verdict_usage.utilisable_en_classe
          ? "color-mix(in srgb, var(--green) 10%, transparent)"
          : "color-mix(in srgb, var(--red) 10%, transparent)",
        border: `1px solid ${
          result.verdict_usage.utilisable_en_classe
            ? "color-mix(in srgb, var(--green) 35%, transparent)"
            : "color-mix(in srgb, var(--red) 35%, transparent)"
        }`,
        borderRadius: 18, padding: "22px 26px", display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{ fontSize: 32 }}>
          {result.verdict_usage.utilisable_en_classe ? "✅" : "🔄"}
        </span>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700,
            color: result.verdict_usage.utilisable_en_classe ? "var(--green)" : "var(--red)",
            marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {result.verdict_usage.utilisable_en_classe ? "Utilisable en classe" : "À retravailler"}
          </div>
          <p style={{ fontSize: 14, color: "var(--text2)" }}>
            {result.verdict_usage.message_enseignant}
          </p>
        </div>
      </div>

    </div>
  );
}
