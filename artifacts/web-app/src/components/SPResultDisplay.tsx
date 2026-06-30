// SPResultDisplay.tsx — V5.3 compatible
import { useState } from "react";

// ── Types V5.3 ─────────────────────────────────────────────────────────────
interface CoupsDePouce {
  niveau_1_conceptuel: string;
  niveau_2_procedural: string;
}
interface Question {
  numero: number;
  badge: string;
  question: string;
  objectif?: string;
  metacognition?: string | null;
  indice?: string | null;
  coups_de_pouce?: CoupsDePouce;
}
// New per-séance structure (V5.4+)
interface QuestionsDeLaSeance {
  niveau_socle: Question[];
  niveau_intermediaire: Question[];
  niveau_depassement: Question[];
}
interface PhaseSeance {
  numero_seance: number;
  titre_seance_savoir: string;
  objectif_de_la_seance: string;
  questions_de_la_seance: QuestionsDeLaSeance;
}
interface QuestionsDifferenciees {
  consigne_enseignant: string;
  // Old flat format (V5.3)
  niveau_socle?: Question[];
  niveau_intermediaire?: Question[];
  niveau_depassement?: Question[];
  criteres_reussite?: string[];
  // New per-séance format (V5.4+)
  phases_seances?: PhaseSeance[];
}
interface SimulateurProfil {
  emoji: string;
  profil: string;
  reponse_simulee: string;
  erreur_revelee?: string;
  ce_qui_manque?: string;
  ce_que_cela_revele?: string;
  question_relance?: string;
  comment_canaliser?: string;
  attitude_pedagogique: string;
  mission_bonus?: string;
}
interface SimulateurClasse {
  question_cible: string;
  contexte_simulateur: string;
  eleve_difficulte: SimulateurProfil;
  eleve_moyen: SimulateurProfil;
  eleve_avance: SimulateurProfil;
}
interface Phase {
  numero: number;
  nom: string;
  duree: string;
  role_enseignant: string;
  role_eleve: string;
  consigne_cle: string;
}
interface SyntheseTableau {
  titre_notion: string;
  definition: string;
  regle_essentielle: string;
  exemple_projet: string;
}
interface MiseEnOeuvre {
  organisation: string;
  duree_totale: string;
  phases: Phase[];
  synthese_tableau: SyntheseTableau;
}
interface AutoEval {
  checklist: string[];
  indicateurs_reussite: string[];
}
interface Variante {
  numero: number;
  titre_sp: string;
  contexte_theme: string;
  multimodal: {
    pitch_oral: string;
    image_declenchante: {
      mots_cles_unsplash: string;
      description_pedagogique: string;
    };
    action_kinesthesique: string;
  };
  obstacle_epistemologique: {
    formulation: string;
    erreur_typique: string;
    origine_confusion: string;
    contraintes_pedagogiques: string[];
  };
  situation: {
    texte: string;
    tache_finale: string;
  };
  questions_differenciees: QuestionsDifferenciees;
  simulateur_classe: SimulateurClasse;
  mise_en_oeuvre_classe: MiseEnOeuvre;
  auto_evaluation_enseignant: AutoEval;
}
export interface SPResult {
  mode: string;
  module: string;
  sequence: string;
  savoirs_couverts: string[];
  type_sp: string;
  duree_estimee: string;
  variantes: Variante[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
const PHASE_COLORS = ["var(--accent)", "var(--orange)", "var(--green)", "#8b5cf6"];
const TYPE_COLOR: Record<string, string> = {
  didactique: "var(--accent)",
  formative: "var(--orange)",
  sommative: "var(--red)",
};

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "22px 24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, color = "var(--accent)" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      fontWeight: 700,
      color,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 100,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      fontWeight: 600,
      border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      color,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

// ── Question Card ──────────────────────────────────────────────────────────
function QuestionCard({ q, levelColor }: { q: Question; levelColor: string }) {
  const [showN1, setShowN1] = useState(false);
  const [showN2, setShowN2] = useState(false);
  const isDeseq = q.badge?.includes("Conflit") || q.badge?.includes("Déséquilibre") || q.badge?.includes("⚡");

  return (
    <div style={{
      padding: isDeseq ? "20px 22px" : "14px 18px",
      borderRadius: 12,
      background: isDeseq
        ? "rgba(220,38,38,0.05)"
        : `color-mix(in srgb, ${levelColor} 5%, var(--bg3))`,
      border: `1px solid ${isDeseq ? "rgba(220,38,38,0.3)" : "var(--border)"}`,
      borderLeft: `4px solid ${isDeseq ? "var(--red)" : levelColor}`,
    }}>
      {isDeseq && (
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--red)",
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 10,
        }}>
          ⚡ Point de déséquilibre cognitif
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{
          width: 28, height: 28,
          borderRadius: "50%",
          background: `color-mix(in srgb, ${isDeseq ? "var(--red)" : levelColor} 15%, transparent)`,
          color: isDeseq ? "var(--red)" : levelColor,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `1.5px solid color-mix(in srgb, ${isDeseq ? "var(--red)" : levelColor} 35%, transparent)`,
        }}>
          {q.numero}
        </span>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{
              padding: "2px 10px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              background: `color-mix(in srgb, ${isDeseq ? "var(--red)" : levelColor} 15%, transparent)`,
              color: isDeseq ? "var(--red)" : levelColor,
              border: `1px solid color-mix(in srgb, ${isDeseq ? "var(--red)" : levelColor} 35%, transparent)`,
            }}>
              {q.badge}
            </span>
          </div>

          <p style={{
            fontSize: isDeseq ? 15 : 14,
            fontWeight: isDeseq ? 700 : 400,
            color: "var(--text)",
            lineHeight: 1.65,
            marginBottom: q.metacognition || q.indice || q.coups_de_pouce ? 10 : 0,
          }}>
            {q.question}
          </p>

          {q.objectif && (
            <p style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", marginBottom: 8 }}>
              Objectif : {q.objectif}
            </p>
          )}

          {q.metacognition && (
            <div style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              fontSize: 12,
              color: "var(--text2)",
              marginBottom: 8,
            }}>
              🧠 <em>{q.metacognition}</em>
            </div>
          )}

          {q.indice && (
            <div style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              fontSize: 13,
              color: "var(--text2)",
              marginBottom: 8,
            }}>
              💡 <em>Indice :</em> {q.indice}
            </div>
          )}

          {/* COUPS DE POUCE — Q3 only */}
          {q.coups_de_pouce && (
            <div style={{ marginTop: 12 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}>
                🆘 Coups de pouce — à distribuer progressivement
              </div>

              {/* N1 */}
              <div style={{ marginBottom: 8 }}>
                <button
                  onClick={() => setShowN1(!showN1)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: 8,
                    border: "1.5px solid var(--border)",
                    background: showN1 ? "rgba(34,197,94,0.08)" : "var(--bg3)",
                    color: showN1 ? "var(--green)" : "var(--text2)",
                    cursor: "pointer",
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <span>💡 Coup de pouce N°1 — Conceptuel</span>
                  <span>{showN1 ? "▲" : "▼"}</span>
                </button>
                {showN1 && (
                  <div style={{
                    padding: "12px 14px",
                    borderRadius: "0 0 8px 8px",
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    borderTop: "none",
                    fontSize: 13,
                    color: "var(--text2)",
                    lineHeight: 1.6,
                  }}>
                    {q.coups_de_pouce.niveau_1_conceptuel}
                    <div style={{ fontSize: 11, color: "var(--green)", marginTop: 6, fontStyle: "italic" }}>
                      → Distribuez ce coup de pouce en premier
                    </div>
                  </div>
                )}
              </div>

              {/* N2 */}
              <div>
                <button
                  onClick={() => setShowN2(!showN2)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: 8,
                    border: "1.5px solid var(--border)",
                    background: showN2 ? "rgba(59,111,240,0.08)" : "var(--bg3)",
                    color: showN2 ? "var(--accent)" : "var(--text2)",
                    cursor: "pointer",
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <span>🔧 Coup de pouce N°2 — Procédural</span>
                  <span>{showN2 ? "▲" : "▼"}</span>
                </button>
                {showN2 && (
                  <div style={{
                    padding: "12px 14px",
                    borderRadius: "0 0 8px 8px",
                    background: "rgba(59,111,240,0.06)",
                    border: "1px solid rgba(59,111,240,0.25)",
                    borderTop: "none",
                    fontSize: 13,
                    color: "var(--text2)",
                    lineHeight: 1.6,
                  }}>
                    {q.coups_de_pouce.niveau_2_procedural}
                    <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 6, fontStyle: "italic" }}>
                      → Distribuez uniquement si l'élève reste bloqué après N°1
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Simulateur Profil Card ─────────────────────────────────────────────────
function SimulateurCard({ profil, color }: { profil: SimulateurProfil; color: string }) {
  return (
    <div style={{
      border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      borderRadius: 14,
      overflow: "hidden",
      flex: 1,
      minWidth: 240,
    }}>
      <div style={{
        padding: "12px 16px",
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        borderBottom: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
        fontWeight: 700,
        fontSize: 13,
        color,
      }}>
        {profil.emoji} {profil.profil}
      </div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "var(--text3)", textTransform: "uppercase", marginBottom: 4 }}>
            💬 Réponse typique
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", fontStyle: "italic", lineHeight: 1.55 }}>
            "{profil.reponse_simulee}"
          </div>
        </div>

        {profil.erreur_revelee && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "var(--text3)", textTransform: "uppercase", marginBottom: 4 }}>
              🔍 Erreur révélée
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{profil.erreur_revelee}</div>
          </div>
        )}

        {profil.ce_qui_manque && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "var(--text3)", textTransform: "uppercase", marginBottom: 4 }}>
              ❌ Ce qui manque
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{profil.ce_qui_manque}</div>
          </div>
        )}

        {profil.ce_que_cela_revele && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "var(--text3)", textTransform: "uppercase", marginBottom: 4 }}>
              ✨ Ce que ça révèle
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{profil.ce_que_cela_revele}</div>
          </div>
        )}

        {profil.question_relance && (
          <div style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "var(--green)", textTransform: "uppercase", marginBottom: 4 }}>
              ↩️ Question de relance
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>{profil.question_relance}</div>
          </div>
        )}

        {profil.comment_canaliser && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "var(--text3)", textTransform: "uppercase", marginBottom: 4 }}>
              🎯 Comment canaliser
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{profil.comment_canaliser}</div>
          </div>
        )}

        {profil.attitude_pedagogique && (
          <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", lineHeight: 1.5 }}>
            🎯 {profil.attitude_pedagogique}
          </div>
        )}

        {profil.mission_bonus && (
          <div style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#8b5cf6", textTransform: "uppercase", marginBottom: 4 }}>
              🚀 Mission bonus
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>{profil.mission_bonus}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── QuestionsFlat — backward compat (V5.3 flat format) ────────────────────
function QuestionsFlat({ qd }: { qd: QuestionsDifferenciees }) {
  return (
    <>
      {/* SOCLE */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          padding: "8px 14px", borderRadius: 8,
          background: "rgba(26,158,104,0.1)", border: "1px solid rgba(26,158,104,0.25)",
          fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 10,
        }}>
          🟢 SOCLE COMMUN — Accessible à tous les élèves
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {qd?.niveau_socle?.map((q, i) => <QuestionCard key={i} q={q} levelColor="var(--green)" />)}
        </div>
      </div>

      {/* INTERMÉDIAIRE */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          padding: "8px 14px", borderRadius: 8,
          background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
          fontSize: 12, fontWeight: 700, color: "var(--red)", marginBottom: 10,
        }}>
          ⚡ APPROFONDISSEMENT — Conflit cognitif
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {qd?.niveau_intermediaire?.map((q, i) => <QuestionCard key={i} q={q} levelColor="var(--orange)" />)}
        </div>
      </div>

      {/* DÉPASSEMENT */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          padding: "8px 14px", borderRadius: 8,
          background: "rgba(59,111,240,0.08)", border: "1px solid rgba(59,111,240,0.2)",
          fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 10,
        }}>
          🔵 DÉPASSEMENT — Pour les élèves avancés
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {qd?.niveau_depassement?.map((q, i) => <QuestionCard key={i} q={q} levelColor="var(--accent)" />)}
        </div>
      </div>

      {/* CRITÈRES DE RÉUSSITE */}
      {(qd?.criteres_reussite?.length ?? 0) > 0 && (
        <div style={{ padding: "14px 18px", borderRadius: 10, background: "var(--bg3)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", marginBottom: 10 }}>
            📏 Critères de réussite
          </div>
          {qd.criteres_reussite!.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "var(--text2)" }}>
              <span style={{ color: "var(--green)" }}>✓</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── SeanceBlock — renders one séance's 3 levels ───────────────────────────
function SeanceBlock({ phase, index }: { phase: PhaseSeance; index: number }) {
  const [open, setOpen] = useState(index === 0); // first séance open by default
  const SEANCE_COLORS = ["var(--accent)", "var(--orange)", "var(--green)", "#8b5cf6", "var(--red)"];
  const color = SEANCE_COLORS[index % SEANCE_COLORS.length];
  const qds = phase.questions_de_la_seance;

  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid color-mix(in srgb, ${color} 30%, var(--border))`,
      overflow: "hidden",
      marginBottom: 16,
    }}>
      {/* ── Accordion Header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: open
            ? `color-mix(in srgb, ${color} 10%, var(--bg3))`
            : "var(--bg3)",
          border: "none",
          borderBottom: open ? `1px solid color-mix(in srgb, ${color} 20%, var(--border))` : "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 14,
          textAlign: "left",
          transition: "background 0.2s",
        }}
      >
        {/* Séance Number Badge */}
        <span style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: `color-mix(in srgb, ${color} 18%, transparent)`,
          border: `2px solid color-mix(in srgb, ${color} 45%, transparent)`,
          color, fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {phase.numero_seance}
        </span>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", lineHeight: 1.3, marginBottom: 4 }}>
            {phase.titre_seance_savoir}
          </div>
          {phase.objectif_de_la_seance && (
            <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>
              🎯 {phase.objectif_de_la_seance}
            </div>
          )}
        </div>

        {/* Question count pills */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0, marginRight: 8 }}>
          {[
            { count: qds?.niveau_socle?.length, color: "var(--green)", label: "🟢" },
            { count: qds?.niveau_intermediaire?.length, color: "var(--red)", label: "⚡" },
            { count: qds?.niveau_depassement?.length, color: "var(--accent)", label: "🔵" },
          ].map(({ count, color: c, label }) =>
            count ? (
              <span key={label} style={{
                padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                background: `color-mix(in srgb, ${c} 14%, transparent)`,
                color: c, border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`,
              }}>
                {label} {count}
              </span>
            ) : null
          )}
        </div>

        <span style={{ color: "var(--text3)", fontSize: 13, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* ── Accordion Body ── */}
      {open && (
        <div style={{ padding: "20px 20px 16px" }}>

          {/* SOCLE */}
          {(qds?.niveau_socle?.length ?? 0) > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                padding: "8px 14px", borderRadius: 8,
                background: "rgba(26,158,104,0.1)", border: "1px solid rgba(26,158,104,0.25)",
                fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 10,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                🟢 SOCLE COMMUN — Accessible à tous les élèves
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {qds.niveau_socle.map((q, i) => (
                  <QuestionCard key={i} q={q} levelColor="var(--green)" />
                ))}
              </div>
            </div>
          )}

          {/* CONFLIT COGNITIF */}
          {(qds?.niveau_intermediaire?.length ?? 0) > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                padding: "8px 14px", borderRadius: 8,
                background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
                fontSize: 12, fontWeight: 700, color: "var(--red)", marginBottom: 10,
              }}>
                ⚡ CONFLIT COGNITIF — Approfondissement
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {qds.niveau_intermediaire.map((q, i) => (
                  <QuestionCard key={i} q={q} levelColor="var(--orange)" />
                ))}
              </div>
            </div>
          )}

          {/* INSTITUTIONNALISATION / DÉPASSEMENT */}
          {(qds?.niveau_depassement?.length ?? 0) > 0 && (
            <div>
              <div style={{
                padding: "8px 14px", borderRadius: 8,
                background: "rgba(59,111,240,0.08)", border: "1px solid rgba(59,111,240,0.2)",
                fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 10,
              }}>
                🔵 INSTITUTIONNALISATION — Pour les élèves avancés
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {qds.niveau_depassement.map((q, i) => (
                  <QuestionCard key={i} q={q} levelColor="var(--accent)" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── PhasesSeancesDisplay — new V5.4 format ─────────────────────────────────
function PhasesSeancesDisplay({ phases }: { phases: PhaseSeance[] }) {
  return (
    <div>
      {/* Progress timeline header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        overflowX: "auto",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
          📅 Progression
        </span>
        {phases.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span style={{ color: "var(--border)", fontSize: 16 }}>›</span>}
            <span style={{
              padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
              background: "var(--bg2)", color: "var(--text2)",
              border: "1px solid var(--border)",
            }}>
              S{p.numero_seance}
            </span>
          </div>
        ))}
      </div>

      {/* Séances accordion list */}
      {phases.map((phase, i) => (
        <SeanceBlock key={phase.numero_seance} phase={phase} index={i} />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function SPResultDisplay({ result }: { result: SPResult }) {
  const [activeTab, setActiveTab] = useState(0);
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});

  if (!result?.variantes?.length) {
    return (
      <div style={{ padding: 24, color: "var(--text2)", textAlign: "center" }}>
        Aucune variante à afficher.
      </div>
    );
  }

  const variante = result.variantes[activeTab];
  const typeColor = TYPE_COLOR[result.type_sp] || "var(--accent)";
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalChecklist = variante?.auto_evaluation_enseignant?.checklist?.length || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          <Badge color={typeColor}>
            {result.type_sp === "didactique" ? "📚 SP Didactique"
              : result.type_sp === "formative" ? "🔍 Formative"
                : "📋 Sommative"}
          </Badge>
          <Badge color="var(--accent)">{result.module?.split("—")[0]?.trim()}</Badge>
          {result.duree_estimee && <Badge color="var(--text2)">⏱ {result.duree_estimee}</Badge>}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>
          {variante.titre_sp || result.sequence}
        </h2>

        <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 10 }}>
          📚 {result.sequence}
        </p>

        {result.savoirs_couverts?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {result.savoirs_couverts.map((s, i) => (
              <Badge key={i} color="var(--accent2)">{s}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* ── VARIANTES TABS ──────────────────────────────────── */}
      {result.variantes.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {result.variantes.map((v, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                border: `1.5px solid ${activeTab === i ? "var(--accent)" : "var(--border)"}`,
                background: activeTab === i ? "var(--accent-glow)" : "var(--bg2)",
                color: activeTab === i ? "var(--accent)" : "var(--text2)",
                cursor: "pointer",
                fontFamily: "'Sora', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              Variante {v.numero} — {v.contexte_theme}
            </button>
          ))}
        </div>
      )}

      {/* ── SECTION A : MULTIMODAL ──────────────────────────── */}
      <Card>
        <SectionTitle>🎙️ Lancement multimodal</SectionTitle>

        {/* Pitch oral */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 8 }}>
            🎤 Pitch oral — à lire à voix haute avant de distribuer la feuille
          </div>
          <div style={{
            padding: "14px 18px",
            borderRadius: 10,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            fontSize: 14,
            color: "var(--text)",
            fontStyle: "italic",
            lineHeight: 1.7,
          }}>
            "{variante.multimodal?.pitch_oral}"
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6, fontStyle: "italic" }}>
            Lisez ce texte de manière théâtrale pour créer la curiosité
          </div>
        </div>

        {/* Image déclenchante */}
        {variante.multimodal?.image_declenchante?.mots_cles_unsplash && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 8 }}>
              🖼️ Image déclenchante
            </div>
            <img
              src={`https://source.unsplash.com/800x300/?${encodeURIComponent(variante.multimodal.image_declenchante.mots_cles_unsplash)}`}
              alt={variante.multimodal.image_declenchante.mots_cles_unsplash}
              style={{
                width: "100%",
                height: 220,
                objectFit: "cover",
                borderRadius: 10,
                display: "block",
                marginBottom: 8,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>
              {variante.multimodal.image_declenchante.description_pedagogique}
            </div>
          </div>
        )}

        {/* Action kinesthésique */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 8 }}>
            🖱️ Action kinesthésique
          </div>
          <div style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            fontSize: 13,
            color: "var(--text)",
            lineHeight: 1.6,
          }}>
            {variante.multimodal?.action_kinesthesique}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6, fontStyle: "italic" }}>
            Donnez cette consigne dès le début de l'investigation
          </div>
        </div>
      </Card>

      {/* ── SECTION B : OBSTACLE ────────────────────────────── */}
      <Card style={{ borderLeft: "4px solid var(--orange)" }}>
        <SectionTitle color="var(--orange)">⚠️ Obstacle épistémologique identifié</SectionTitle>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
          {variante.obstacle_epistemologique?.formulation}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>
            <strong>Erreur typique :</strong> {variante.obstacle_epistemologique?.erreur_typique}
          </div>
          {variante.obstacle_epistemologique?.origine_confusion && (
            <div style={{ fontSize: 13, color: "var(--text2)" }}>
              <strong>Origine :</strong> {variante.obstacle_epistemologique.origine_confusion}
            </div>
          )}
        </div>
        {variante.obstacle_epistemologique?.contraintes_pedagogiques?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {variante.obstacle_epistemologique.contraintes_pedagogiques.map((c, i) => (
              <span key={i} style={{
                padding: "4px 12px",
                borderRadius: 100,
                fontSize: 12,
                background: "rgba(245,158,11,0.1)",
                color: "var(--orange)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}>
                🔒 {c}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* ── SECTION C : SITUATION ───────────────────────────── */}
      <Card>
        <SectionTitle>📋 La situation-problème</SectionTitle>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8, marginBottom: 14 }}>
          {variante.situation?.texte}
        </p>
        <div style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: "var(--blue-bg)",
          border: "1px solid rgba(59,111,240,0.25)",
          fontSize: 13,
          color: "var(--text)",
        }}>
          <strong style={{ color: "var(--accent)" }}>🎯 Tâche finale :</strong> {variante.situation?.tache_finale}
        </div>
      </Card>

      {/* ── SECTION D : QUESTIONS ───────────────────────────── */}
      <Card>
        <SectionTitle>❓ Questions de guidage différenciées</SectionTitle>

        {variante.questions_differenciees?.consigne_enseignant && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            fontSize: 13,
            color: "var(--text2)",
            fontStyle: "italic",
            marginBottom: 20,
          }}>
            📌 {variante.questions_differenciees.consigne_enseignant}
          </div>
        )}

        {/* ── NEW FORMAT: phases_seances ─────────────────────── */}
        {variante.questions_differenciees?.phases_seances?.length
          ? <PhasesSeancesDisplay phases={variante.questions_differenciees.phases_seances} />
          : <QuestionsFlat qd={variante.questions_differenciees} />
        }
      </Card>

      {/* ── SECTION E : SIMULATEUR ──────────────────────────── */}
      <Card>
        <SectionTitle>🎭 Simulateur de classe — Phase de confrontation</SectionTitle>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>
          {variante.simulateur_classe?.contexte_simulateur}
        </p>
        {variante.simulateur_classe?.question_cible && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            fontSize: 13,
            color: "var(--text2)",
            marginBottom: 16,
            fontStyle: "italic",
          }}>
            Question ciblée : <strong>{variante.simulateur_classe.question_cible}</strong>
          </div>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {variante.simulateur_classe?.eleve_difficulte && (
            <SimulateurCard profil={variante.simulateur_classe.eleve_difficulte} color="var(--red)" />
          )}
          {variante.simulateur_classe?.eleve_moyen && (
            <SimulateurCard profil={variante.simulateur_classe.eleve_moyen} color="var(--orange)" />
          )}
          {variante.simulateur_classe?.eleve_avance && (
            <SimulateurCard profil={variante.simulateur_classe.eleve_avance} color="var(--green)" />
          )}
        </div>
      </Card>

      {/* ── SECTION F : MISE EN ŒUVRE ───────────────────────── */}
      {variante.mise_en_oeuvre_classe && (
        <Card>
          <SectionTitle>🏫 Mise en œuvre en classe</SectionTitle>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {variante.mise_en_oeuvre_classe.organisation && (
              <Badge color="var(--accent2)">{variante.mise_en_oeuvre_classe.organisation}</Badge>
            )}
            {variante.mise_en_oeuvre_classe.duree_totale && (
              <Badge color="var(--text2)">⏱ {variante.mise_en_oeuvre_classe.duree_totale}</Badge>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {variante.mise_en_oeuvre_classe.phases?.map((phase, i) => {
              const c = PHASE_COLORS[i % PHASE_COLORS.length];
              return (
                <div key={i} style={{
                  padding: "18px 20px",
                  borderRadius: 14,
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${c}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: `color-mix(in srgb, ${c} 15%, transparent)`,
                      color: c,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      border: `2px solid color-mix(in srgb, ${c} 35%, transparent)`,
                    }}>
                      {phase.numero}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", flex: 1 }}>
                      {phase.nom}
                    </span>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 100,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      background: "var(--bg)",
                      color: "var(--text3)",
                      border: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}>
                      {phase.duree}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    {[
                      ["👨‍🏫 Enseignant", phase.role_enseignant],
                      ["👨‍🎓 Élève", phase.role_eleve],
                    ].map(([label, value]) => (
                      <div key={label} style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "var(--bg2)",
                        border: "1px solid var(--border)",
                      }}>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10, fontWeight: 700,
                          color: "var(--text3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 5,
                        }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: `color-mix(in srgb, ${c} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${c} 25%, transparent)`,
                  }}>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, fontWeight: 700,
                      color: c, textTransform: "uppercase",
                      letterSpacing: "0.06em", marginBottom: 4,
                    }}>
                      💬 Consigne clé
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text)", fontStyle: "italic" }}>
                      "{phase.consigne_cle}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SYNTHÈSE TABLEAU */}
          {variante.mise_en_oeuvre_classe.synthese_tableau && (
            <div style={{
              marginTop: 20,
              padding: "22px 24px",
              borderRadius: 14,
              background: "#1F3864",
              color: "#fff",
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 14,
              }}>
                📝 Synthèse officielle — à écrire au tableau
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
                {variante.mise_en_oeuvre_classe.synthese_tableau.titre_notion}
              </div>
              <div style={{ fontSize: 14, marginBottom: 10, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }}>
                <strong>Définition :</strong> {variante.mise_en_oeuvre_classe.synthese_tableau.definition}
              </div>
              <div style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(255,215,0,0.15)",
                border: "1px solid rgba(255,215,0,0.3)",
                fontSize: 13,
                color: "#FFD700",
                marginBottom: 10,
                lineHeight: 1.6,
              }}>
                <strong>Règle essentielle :</strong> {variante.mise_en_oeuvre_classe.synthese_tableau.regle_essentielle}
              </div>
              <div style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(100,200,255,0.1)",
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(100,200,255,0.9)",
                lineHeight: 1.6,
              }}>
                Exemple : {variante.mise_en_oeuvre_classe.synthese_tableau.exemple_projet}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── SECTION G : AUTO-ÉVALUATION ─────────────────────── */}
      {variante.auto_evaluation_enseignant && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionTitle>✅ Auto-évaluation avant usage</SectionTitle>
            <span style={{
              padding: "4px 12px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              background: checkedCount === totalChecklist
                ? "rgba(34,197,94,0.15)"
                : "var(--bg3)",
              color: checkedCount === totalChecklist ? "var(--green)" : "var(--text3)",
              border: `1px solid ${checkedCount === totalChecklist ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
            }}>
              {checkedCount}/{totalChecklist} validés
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            {variante.auto_evaluation_enseignant.checklist?.map((item, i) => (
              <label key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 10,
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={!!checklist[i]}
                  onChange={() => setChecklist(prev => ({ ...prev, [i]: !prev[i] }))}
                  style={{
                    marginTop: 3,
                    accentColor: "var(--green)",
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                  }}
                />
                <span style={{
                  fontSize: 13,
                  color: checklist[i] ? "var(--text3)" : "var(--text2)",
                  textDecoration: checklist[i] ? "line-through" : "none",
                  lineHeight: 1.55,
                }}>
                  {item}
                </span>
              </label>
            ))}
          </div>

          {variante.auto_evaluation_enseignant.indicateurs_reussite?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                Indicateurs de réussite attendus
              </div>
              {variante.auto_evaluation_enseignant.indicateurs_reussite.map((ind, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 13,
                  color: "var(--text2)",
                }}>
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>★</span>
                  <span style={{ lineHeight: 1.55 }}>{ind}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}