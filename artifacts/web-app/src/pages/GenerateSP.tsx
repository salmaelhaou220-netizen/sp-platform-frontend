import { useState } from "react";

const BACKEND = "https://sp-platform-backend.onrender.com";

const MODULES = [
  "Module 1 — Généralités sur les systèmes informatiques",
  "Module 2 — Les logiciels",
  "Module 3 — Algorithmique et programmation",
  "Module 4 — Réseaux et Internet",
];

const CONTENUS: Record<number, string[]> = {
  0: ["Terminologie de base", "Structure d'un ordinateur", "Types de logiciels", "Domaines d'application"],
  1: ["Système d'exploitation", "Gestion fichiers et dossiers", "Traitement de texte", "Tableur formules et adressage", "Tableur graphiques"],
  2: ["Constantes variables types", "Instructions de base lecture écriture affectation", "Structure séquentielle", "Structure sélective", "Transcription algorithme"],
  3: ["Notion de réseau", "Typologie réseaux LAN MAN WAN", "Internet connexion et services", "Éthique et citoyenneté numérique"],
};

const NIVEAUX = ["débutant", "intermédiaire", "avancé"];
const CONTEXTES = ["vie quotidienne", "monde professionnel", "environnement scolaire", "actualité technologique"];
const LANGUES = ["français", "arabe"];

const TYPE_SP = [
  { id: "didactique", label: "📚 SP Didactique", desc: "Introduire une notion nouvelle" },
  { id: "formative", label: "🔍 SP Évaluation Formative", desc: "Vérifier la progression en cours" },
  { id: "sommative", label: "📋 SP Évaluation Sommative", desc: "Certifier les acquis en fin de module" },
];

const VARK_OPTIONS = [
  { id: "V", label: "V — Visuel" },
  { id: "A", label: "A — Auditif" },
  { id: "R", label: "R — Lecture/Écriture" },
  { id: "K", label: "K — Kinesthésique" },
  { id: "selon_contexte", label: "Selon le contexte (IA choisit)" },
];

const TYPE_COLOR: Record<string, string> = {
  didactique: "var(--accent)",
  formative: "var(--orange)",
  sommative: "var(--red)",
};

const Q_TYPE_COLOR: Record<string, string> = {
  restitution: "var(--accent)",
  application: "var(--orange)",
  transfert: "var(--green)",
};

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid var(--border)", background: "var(--bg3)",
  color: "var(--text)", fontFamily: "'Sora', sans-serif", fontSize: 14,
  outline: "none", cursor: "pointer", transition: "border-color 0.2s",
  appearance: "none", WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b90a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36,
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
  fontWeight: 600, color: "var(--text3)", letterSpacing: "0.08em",
  textTransform: "uppercase", marginBottom: 7,
};

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: 100, fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
      fontWeight: 600,
      border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      color, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

interface VersionVARK {
  profil: string;
  justification: string;
  situation: { contexte: string; declencheur: string; question_centrale: string; supports_fournis: string[] };
  tache: { description: string; produit_attendu: string; criteres_reussite: string[] };
  questions_evaluation?: Array<{ numero: number; question: string; type: string; points: number; element_reponse: string }>;
}

interface SPResult {
  titre: string;
  type_sp: string;
  module: string;
  contenu_vise: string;
  competence_cible: string;
  duree_totale: string;
  ancrage_theorique: { objectif_meirieu: string; obstacle_astolfi: string; sens_de_vecchi: string; devolution_brousseau: string };
  versions_vark: VersionVARK[];
  mise_en_place_classe: {
    organisation: string;
    duree_totale_seance: string;
    etapes: Array<{ numero: number; nom: string; duree: string; role_enseignant: string; role_eleve: string; consigne_cle: string }>;
  };
  auto_evaluation_enseignant: { questions_reflexion: string[]; indicateurs_obstacle_franchi: string[] };
}

const PROFIL_LABEL: Record<string, string> = { V: "Visuel", A: "Auditif", R: "Lecture/Écriture", K: "Kinesthésique" };
const STEP_COLORS = ["var(--accent)", "var(--accent2)", "var(--green)", "var(--orange)", "var(--red)", "var(--accent)", "var(--accent2)"];

export default function GenerateSP() {
  const [moduleIdx, setModuleIdx] = useState(0);
  const [contenuIdx, setContenuIdx] = useState(0);
  const [typeSP, setTypeSP] = useState("didactique");
  const [selectedVARK, setSelectedVARK] = useState<string[]>(["V"]);
  const [niveauIdx, setNiveauIdx] = useState(0);
  const [contexteIdx, setContexteIdx] = useState(0);
  const [langueIdx, setLangueIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SPResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [checkedReflections, setCheckedReflections] = useState<Record<number, boolean>>({});

  const handleModuleChange = (idx: number) => { setModuleIdx(idx); setContenuIdx(0); };

  const toggleVARK = (id: string) => {
    if (id === "selon_contexte") {
      setSelectedVARK(["selon_contexte"]);
      return;
    }
    setSelectedVARK(prev => {
      const filtered = prev.filter(v => v !== "selon_contexte");
      if (filtered.includes(id)) {
        const next = filtered.filter(v => v !== id);
        return next.length === 0 ? [id] : next;
      }
      return [...filtered, id];
    });
  };

  const handleGenerate = async () => {
    if (selectedVARK.length === 0) { setError("Sélectionnez au moins un profil VARK."); return; }
    setLoading(true); setError(""); setResult(null); setActiveTab(0);

    const body = {
      module: MODULES[moduleIdx],
      contenu: CONTENUS[moduleIdx][contenuIdx],
      type_sp: typeSP,
      profils_vark: selectedVARK,
      niveau_difficulte: NIVEAUX[niveauIdx],
      contexte_souhaite: CONTEXTES[contexteIdx],
      langue: LANGUES[langueIdx],
    };

    try {
      const res = await fetch(`${BACKEND}/generate-sp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        saveToLocalStorage(json.data);
      } else {
        setError(json.message || "Erreur lors de la génération.");
      }
    } catch {
      setError("Impossible de joindre le serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (data: SPResult) => {
    try {
      const existing = JSON.parse(localStorage.getItem("sp_history") || "[]");
      const entry = {
        id: Date.now(),
        titre: data.titre,
        module: data.module,
        type_sp: data.type_sp,
        profils_vark: data.versions_vark?.map((v: VersionVARK) => v.profil).join(", ") || "",
        date: new Date().toLocaleDateString("fr-FR"),
        data,
      };
      existing.unshift(entry);
      localStorage.setItem("sp_history", JSON.stringify(existing.slice(0, 50)));
    } catch { /* ignore */ }
  };

  const typeColor = TYPE_COLOR[typeSP] || "var(--accent)";
  const activeVersion = result?.versions_vark?.[activeTab];

  return (
    <main style={{
      flex: 1, display: "grid", gridTemplateColumns: "340px 1fr", gap: 24,
      padding: "32px 24px 60px", maxWidth: 1200, margin: "0 auto",
      width: "100%", alignItems: "start",
    }}>
      {/* LEFT PANEL */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 18, padding: "28px 24px", position: "sticky", top: 24,
        maxHeight: "calc(100vh - 40px)", overflowY: "auto",
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>✦ Générer une SP</h2>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24 }}>Paramètres pédagogiques</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* TYPE DE SP */}
          <div>
            <label style={labelStyle}>Type de SP</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TYPE_SP.map((t) => {
                const active = typeSP === t.id;
                const c = TYPE_COLOR[t.id];
                return (
                  <label key={t.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                    border: `1.5px solid ${active ? c : "var(--border)"}`,
                    background: active ? `color-mix(in srgb, ${c} 10%, transparent)` : "var(--bg3)",
                    transition: "all 0.2s",
                  }}>
                    <input type="radio" name="type_sp" value={t.id}
                      checked={active} onChange={() => setTypeSP(t.id)}
                      style={{ marginTop: 3, accentColor: c, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? c : "var(--text)" }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{t.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* MODULE */}
          <div>
            <label style={labelStyle}>Module</label>
            <select style={selectStyle} value={moduleIdx} onChange={(e) => handleModuleChange(Number(e.target.value))}>
              {MODULES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>

          {/* CONTENU */}
          <div>
            <label style={labelStyle}>Contenu visé</label>
            <select style={selectStyle} value={contenuIdx} onChange={(e) => setContenuIdx(Number(e.target.value))}>
              {CONTENUS[moduleIdx].map((c, i) => <option key={i} value={i}>{c}</option>)}
            </select>
          </div>

          {/* VARK MULTI-SELECT */}
          <div>
            <label style={labelStyle}>Profils VARK</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {VARK_OPTIONS.map((v) => {
                const isContexte = v.id === "selon_contexte";
                const checked = selectedVARK.includes(v.id);
                const disabled = !isContexte && selectedVARK.includes("selon_contexte");
                return (
                  <label key={v.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
                    border: `1.5px solid ${checked ? "var(--accent)" : "var(--border)"}`,
                    background: checked ? "var(--accent-glow)" : "var(--bg3)",
                    opacity: disabled ? 0.4 : 1, transition: "all 0.18s",
                  }}>
                    <input type="checkbox" checked={checked} disabled={disabled}
                      onChange={() => toggleVARK(v.id)}
                      style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: checked ? "var(--accent)" : "var(--text2)", fontWeight: checked ? 600 : 400 }}>{v.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* NIVEAU */}
          <div>
            <label style={labelStyle}>Niveau</label>
            <select style={selectStyle} value={niveauIdx} onChange={(e) => setNiveauIdx(Number(e.target.value))}>
              {NIVEAUX.map((n, i) => <option key={i} value={i}>{n}</option>)}
            </select>
          </div>

          {/* CONTEXTE */}
          <div>
            <label style={labelStyle}>Contexte</label>
            <select style={selectStyle} value={contexteIdx} onChange={(e) => setContexteIdx(Number(e.target.value))}>
              {CONTEXTES.map((c, i) => <option key={i} value={i}>{c}</option>)}
            </select>
          </div>

          {/* LANGUE */}
          <div>
            <label style={labelStyle}>Langue</label>
            <select style={selectStyle} value={langueIdx} onChange={(e) => setLangueIdx(Number(e.target.value))}>
              {LANGUES.map((l, i) => <option key={i} value={i}>{l}</option>)}
            </select>
          </div>

          <button onClick={handleGenerate} disabled={loading} style={{
            marginTop: 4, padding: "13px", borderRadius: 12, border: "none",
            background: loading ? "var(--bg3)" : "linear-gradient(135deg, var(--accent), var(--accent2))",
            color: loading ? "var(--text3)" : "#fff",
            fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? (<><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span>Génération…</>) : "⚡ Générer la SP"}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div>
        {error && (
          <div style={{
            padding: "14px 18px", borderRadius: 12, marginBottom: 20,
            background: "color-mix(in srgb, var(--red) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)",
            color: "var(--red)", fontSize: 14,
          }}>⚠ {error}</div>
        )}

        {!loading && !result && !error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, color: "var(--text3)" }}>
            <div style={{ fontSize: 56, opacity: 0.4 }}>✦</div>
            <p style={{ fontSize: 15, textAlign: "center" }}>
              Configurez les paramètres et cliquez sur<br />
              <strong style={{ color: "var(--accent)" }}>⚡ Générer la SP</strong>
            </p>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "var(--text2)", fontSize: 14 }}>Génération en cours…</p>
          </div>
        )}

        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* SECTION 1 — HEADER */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18, padding: "26px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                <Badge color={typeColor}>{TYPE_SP.find(t => t.id === result.type_sp)?.label || result.type_sp}</Badge>
                <Badge color="var(--accent)">{result.module?.split("—")[0]?.trim()}</Badge>
                <Badge color="var(--text2)">⏱ {result.duree_totale}</Badge>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{result.titre}</h2>
              <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 20 }}>{result.competence_cible}</p>

              {/* Ancrage théorique — 4 cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {[
                  { label: "Objectif (Meirieu)", value: result.ancrage_theorique?.objectif_meirieu, color: "var(--accent)" },
                  { label: "Obstacle (Astolfi)", value: result.ancrage_theorique?.obstacle_astolfi, color: "var(--accent2)" },
                  { label: "Sens (De Vecchi)", value: result.ancrage_theorique?.sens_de_vecchi, color: "var(--green)" },
                  { label: "Dévolution (Brousseau)", value: result.ancrage_theorique?.devolution_brousseau, color: "var(--orange)" },
                ].map((card) => (
                  <div key={card.label} style={{
                    padding: "14px 16px", borderRadius: 12,
                    border: `1px solid color-mix(in srgb, ${card.color} 30%, transparent)`,
                    background: `color-mix(in srgb, ${card.color} 8%, transparent)`,
                  }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: card.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{card.label}</div>
                    <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{card.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2 — VERSIONS VARK */}
            {result.versions_vark?.length > 0 && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18, padding: "24px 26px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>◉</span> Versions VARK
                </div>

                {/* Tabs */}
                {result.versions_vark.length > 1 && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                    {result.versions_vark.map((v, i) => (
                      <button key={i} onClick={() => setActiveTab(i)} style={{
                        padding: "7px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        border: `1.5px solid ${activeTab === i ? "var(--accent)" : "var(--border)"}`,
                        background: activeTab === i ? "var(--accent-glow)" : "var(--bg3)",
                        color: activeTab === i ? "var(--accent)" : "var(--text2)",
                        fontFamily: "'Sora', sans-serif", transition: "all 0.15s",
                      }}>
                        {PROFIL_LABEL[v.profil] || v.profil}
                      </button>
                    ))}
                  </div>
                )}

                {activeVersion && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Justification */}
                    <div style={{ padding: "12px 16px", borderRadius: 10, background: "var(--bg3)", border: "1px solid var(--border)", fontSize: 13.5, color: "var(--text2)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>Justification VARK</span>
                      {activeVersion.justification}
                    </div>

                    {/* Situation */}
                    <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--bg3)", border: "1px solid var(--border)" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>🎯 Situation</div>
                      {[["Contexte", activeVersion.situation?.contexte], ["Déclencheur", activeVersion.situation?.declencheur], ["Question centrale", activeVersion.situation?.question_centrale]].map(([l, v]) => (
                        <div key={l as string} style={{ marginBottom: 10 }}>
                          <span style={{ ...labelStyle, display: "inline", marginBottom: 0 }}>{l} </span>
                          <span style={{ fontSize: 14, color: "var(--text2)" }}>{v as string}</span>
                        </div>
                      ))}
                      {activeVersion.situation?.supports_fournis?.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <span style={{ ...labelStyle, display: "block" }}>Supports fournis</span>
                          <ul style={{ paddingLeft: 18, color: "var(--text2)", fontSize: 14 }}>
                            {activeVersion.situation.supports_fournis.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Tâche */}
                    <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--bg3)", border: "1px solid var(--border)" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>✏️ Tâche</div>
                      <div style={{ marginBottom: 10 }}>
                        <span style={{ ...labelStyle, display: "inline", marginBottom: 0 }}>Description </span>
                        <span style={{ fontSize: 14, color: "var(--text2)" }}>{activeVersion.tache?.description}</span>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ ...labelStyle, display: "inline", marginBottom: 0 }}>Produit attendu </span>
                        <span style={{ fontSize: 14, color: "var(--text2)" }}>{activeVersion.tache?.produit_attendu}</span>
                      </div>
                      {activeVersion.tache?.criteres_reussite?.length > 0 && (
                        <>
                          <span style={{ ...labelStyle, display: "block" }}>Critères de réussite</span>
                          {activeVersion.tache.criteres_reussite.map((c, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7, fontSize: 14, color: "var(--text2)" }}>
                              <span style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }}>✓</span>
                              <span>{c}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Questions d'évaluation (formative/sommative only) */}
                    {activeVersion.questions_evaluation?.length > 0 && (
                      <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--bg3)", border: "1px solid var(--border)" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>❓ Questions d'évaluation</div>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                              <tr>
                                {["N°", "Question", "Type", "Pts", "Réponse attendue"].map((h) => (
                                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {activeVersion.questions_evaluation.map((q, i) => {
                                const qc = Q_TYPE_COLOR[q.type?.toLowerCase()] || "var(--text2)";
                                return (
                                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "10px 10px", color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace" }}>{q.numero}</td>
                                    <td style={{ padding: "10px 10px", color: "var(--text2)", lineHeight: 1.5 }}>{q.question}</td>
                                    <td style={{ padding: "10px 10px" }}>
                                      <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", background: `color-mix(in srgb, ${qc} 15%, transparent)`, color: qc, border: `1px solid color-mix(in srgb, ${qc} 35%, transparent)`, whiteSpace: "nowrap" }}>{q.type}</span>
                                    </td>
                                    <td style={{ padding: "10px 10px", color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{q.points}</td>
                                    <td style={{ padding: "10px 10px", color: "var(--text2)", lineHeight: 1.5 }}>{q.element_reponse}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3 — MISE EN PLACE */}
            {result.mise_en_place_classe && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18, padding: "24px 26px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🏫</span> Mise en place en classe
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>
                  {result.mise_en_place_classe.organisation} · <span style={{ color: "var(--accent)" }}>{result.mise_en_place_classe.duree_totale_seance}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.mise_en_place_classe.etapes?.map((etape, i) => {
                    const c = STEP_COLORS[i % STEP_COLORS.length];
                    return (
                      <div key={i} style={{ padding: "18px 20px", borderRadius: 14, background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: `3px solid ${c}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                          <span style={{ width: 28, height: 28, borderRadius: "50%", background: `color-mix(in srgb, ${c} 20%, transparent)`, color: c, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid color-mix(in srgb, ${c} 40%, transparent)` }}>{etape.numero}</span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", flex: 1 }}>{etape.nom}</span>
                          <span style={{ padding: "3px 10px", borderRadius: 100, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, background: "var(--bg)", color: "var(--text3)", border: "1px solid var(--border)", whiteSpace: "nowrap" }}>{etape.duree}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                          {[["🎓 Rôle enseignant", etape.role_enseignant], ["👤 Rôle élève", etape.role_eleve]].map(([label, value]) => (
                            <div key={label as string} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{label}</div>
                              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{value}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: "10px 14px", borderRadius: 10, background: `color-mix(in srgb, ${c} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 25%, transparent)` }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>💬 Consigne clé</span>
                          <span style={{ fontSize: 13, color: "var(--text)", fontStyle: "italic" }}>"{etape.consigne_cle}"</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 4 — AUTO-ÉVALUATION */}
            {result.auto_evaluation_enseignant && (
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18, padding: "24px 26px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔎</span> Auto-évaluation enseignant
                </div>

                {result.auto_evaluation_enseignant.questions_reflexion?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Questions de réflexion</div>
                    {result.auto_evaluation_enseignant.questions_reflexion.map((q, i) => (
                      <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, cursor: "pointer" }}>
                        <input type="checkbox" checked={!!checkedReflections[i]}
                          onChange={() => setCheckedReflections(prev => ({ ...prev, [i]: !prev[i] }))}
                          style={{ marginTop: 3, accentColor: "var(--green)", width: 15, height: 15, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: checkedReflections[i] ? "var(--text3)" : "var(--text2)", textDecoration: checkedReflections[i] ? "line-through" : "none", lineHeight: 1.55 }}>{q}</span>
                      </label>
                    ))}
                  </div>
                )}

                {result.auto_evaluation_enseignant.indicateurs_obstacle_franchi?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Indicateurs : obstacle franchi</div>
                    {result.auto_evaluation_enseignant.indicateurs_obstacle_franchi.map((ind, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--text2)" }}>
                        <span style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }}>◆</span>
                        <span style={{ lineHeight: 1.55 }}>{ind}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
